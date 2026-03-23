const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname, "..");

function readArg(name) {
  const direct = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (direct) return direct.slice(name.length + 3);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return "";
}

const host = readArg("host") || process.env.HOST || "127.0.0.1";
const port = Number(readArg("port") || process.env.PORT || 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function resolvePath(urlPath) {
  const normalized = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const target = normalized || "index.html";
  const fullPath = path.normalize(path.join(root, target));
  if (!fullPath.startsWith(root)) return null;
  return fullPath;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let filePath = resolvePath(requestUrl.pathname);

  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  try {
    let stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    }

    if (!stat) {
      send(res, 404, "Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    send(res, 500, `Server Error\n${error.message}`, { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(port, host, () => {
  console.log(`Static server running at http://${host}:${port}`);
  console.log(`Project root: ${root}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down static server...`);
  server.close(() => {
    console.log("Static server stopped.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
