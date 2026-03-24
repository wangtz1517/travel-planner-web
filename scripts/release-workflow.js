#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const CHANGELOG_PATH = path.join(ROOT, "docs", "product", "changelog.md");
const RELEASE_NOTES_PATH = path.join(ROOT, "docs", "product", "release-notes.md");

function resolveGitExecutable() {
  if (process.platform !== "win32") return "git";
  const candidates = [
    process.env.GIT_EXE,
    path.join(process.env["ProgramFiles"] || "", "Git", "cmd", "git.exe"),
    path.join(process.env["ProgramW6432"] || "", "Git", "cmd", "git.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Git", "cmd", "git.exe"),
    path.join(process.env["ProgramFiles"] || "", "Git", "bin", "git.exe")
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || "git";
}

function runGit(args) {
  try {
    return execFileSync(resolveGitExecutable(), args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    const reason = error?.code || error?.message || "未知错误";
    throw new Error(`无法调用 Git（${reason}）。请在有 Git 访问权限的本地终端中运行该脚本。`);
  }
}

function parseArgs(argv) {
  const [command = "check", ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    i += 1;
  }
  return { command, options };
}

function getChangedFiles() {
  const changed = new Set();
  const tracked = runGit(["diff", "--name-only", "HEAD"]).split(/\r?\n/).filter(Boolean);
  const staged = runGit(["diff", "--cached", "--name-only"]).split(/\r?\n/).filter(Boolean);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]).split(/\r?\n/).filter(Boolean);
  [...tracked, ...staged, ...untracked].forEach((item) => changed.add(item));
  return [...changed];
}

function hasActualProjectChanges(files) {
  return files.some((file) => ![
    "docs/product/changelog.md",
    "docs/product/release-notes.md"
  ].includes(file));
}

function fileTouched(files, target) {
  return files.includes(target);
}

function collectDocHints(files) {
  const hints = new Set();
  if (files.some((file) => file.startsWith("assets/") || file === "index.html")) {
    hints.add("docs/product/changelog.md");
  }
  if (files.some((file) => file.startsWith(".github/") || file.includes("github-pages") || file.includes("domain"))) {
    hints.add("docs/deployment/github-pages.md");
  }
  if (files.some((file) => file.includes("supabase") || file.startsWith("docs/backend/") || file.endsWith(".sql"))) {
    hints.add("docs/backend/supabase.md");
  }
  if (files.some((file) => file.includes("requirements") || file.includes("AGENTS.md"))) {
    hints.add("docs/product/requirements.md");
  }
  return [...hints];
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function ensureVersionAbsent(content, version) {
  return !content.includes(`## ${version}`);
}

function appendChangelogTemplate(version) {
  const content = readFile(CHANGELOG_PATH).trimEnd();
  if (!ensureVersionAbsent(content, version)) {
    throw new Error(`changelog 中已经存在 ${version}`);
  }
  const block = [
    "",
    `## ${version}`,
    "",
    "- 新增：",
    "- 优化：",
    "- 修复：",
    ""
  ].join("\n");
  writeFile(CHANGELOG_PATH, `${content}${block}`);
}

function prependReleaseNotesTemplate(version, releaseDate, commitHash) {
  const content = readFile(RELEASE_NOTES_PATH);
  if (!ensureVersionAbsent(content, version)) {
    throw new Error(`release-notes 中已经存在 ${version}`);
  }
  const marker = "\n## V";
  const insertAt = content.indexOf(marker);
  const template = [
    `## ${version}`,
    "",
    `- 发布时间：${releaseDate}`,
    `- 发布提交：\`${commitHash || "<commit>"}\``,
    "- 发布分支：`main`",
    "",
    "### 本次版本重点",
    "",
    "- ",
    "",
    "### 主要更新说明",
    "",
    "#### 1. ",
    "",
    "- ",
    "",
    "### 当前可用能力",
    "",
    "- ",
    "",
    "### 下一步建议",
    "",
    "- ",
    "",
    ""
  ].join("\n");
  if (insertAt === -1) {
    writeFile(RELEASE_NOTES_PATH, `${content.trimEnd()}\n\n${template}`);
    return;
  }
  const nextContent = `${content.slice(0, insertAt)}\n${template}${content.slice(insertAt + 1)}`;
  writeFile(RELEASE_NOTES_PATH, nextContent);
}

function cmdCheck({ release = false }) {
  const files = getChangedFiles();
  const actualChanges = hasActualProjectChanges(files);
  const changelogTouched = fileTouched(files, "docs/product/changelog.md");
  const releaseNotesTouched = fileTouched(files, "docs/product/release-notes.md");

  console.log(`检测到 ${files.length} 个变动文件。`);
  if (files.length) {
    files.forEach((file) => console.log(`- ${file}`));
  }

  if (!actualChanges) {
    console.log("当前没有检测到需要同步版本文档的项目改动。");
    return;
  }

  if (!changelogTouched) {
    console.error("检查失败：检测到实际项目改动，但 docs/product/changelog.md 未更新。");
    process.exit(1);
  }

  if (release && !releaseNotesTouched) {
    console.error("检查失败：当前按正式发布检查，但 docs/product/release-notes.md 未更新。");
    process.exit(1);
  }

  const hints = collectDocHints(files);
  console.log("检查通过：版本文档更新规则满足要求。");
  if (hints.length) {
    console.log("建议顺手复核这些文档是否也需要同步：");
    hints.forEach((item) => console.log(`- ${item}`));
  }
}

function cmdScaffold(options) {
  const version = options.version;
  if (!version) {
    console.error("请通过 --version 传入版本号，例如：--version V21");
    process.exit(1);
  }
  appendChangelogTemplate(version);
  console.log(`已在 changelog 中创建 ${version} 模板。`);

  if (options.release) {
    const today = options.date || new Date().toISOString().slice(0, 10);
    prependReleaseNotesTemplate(version, today, options.commit || "");
    console.log(`已在 release-notes 中创建 ${version} 模板。`);
  }
}

function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "check") {
    cmdCheck({ release: Boolean(options.release) });
    return;
  }
  if (command === "scaffold") {
    cmdScaffold(options);
    return;
  }
  console.error(`不支持的命令：${command}`);
  console.error("可用命令：check, scaffold");
  process.exit(1);
}

main();
