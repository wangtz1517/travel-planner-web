function getFilteredPlans() {
  let plans = [...myPlans];
  const query = normalizePlanText(planSearchQuery);
  if (planFilter === "active") plans = plans.filter((plan) => plan.status !== "archived");
  if (planFilter === "archived") plans = plans.filter((plan) => plan.status === "archived");
  if (planFilter === "current") plans = plans.filter((plan) => plan.id === currentPlanId);
  if (query) {
    plans = plans.filter((plan) => normalizePlanText(plan.title).includes(query));
  }
  plans.sort((a, b) => {
    const pinDelta = Number(isPlanPinned(b.id)) - Number(isPlanPinned(a.id));
    if (pinDelta) return pinDelta;
    const recentA = getRecentPlanRank(a.id);
    const recentB = getRecentPlanRank(b.id);
    if (recentA !== recentB) {
      if (recentA === -1) return 1;
      if (recentB === -1) return -1;
      return recentA - recentB;
    }
    if (planSort === "updated_asc") return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    if (planSort === "title_asc") return String(a.title || "").localeCompare(String(b.title || ""), "zh-CN");
    if (planSort === "title_desc") return String(b.title || "").localeCompare(String(a.title || ""), "zh-CN");
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  return plans;
}

function renderPlanFilters() {
  const states = [
    [els.planFilterAllBtn, "all"],
    [els.planFilterActiveBtn, "active"],
    [els.planFilterArchivedBtn, "archived"],
    [els.planFilterCurrentBtn, "current"]
  ];
  states.forEach(([button, value]) => button.classList.toggle("active", planFilter === value));
  els.planSortSelect.value = planSort;
  els.planSearchInput.value = planSearchQuery;
}

function renderPlanStats() {
  const allCount = myPlans.length;
  const activeCount = myPlans.filter((plan) => plan.status !== "archived").length;
  const archivedCount = myPlans.filter((plan) => plan.status === "archived").length;
  const currentTitle = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId)?.title || "未绑定") : "无";
  els.planStatAll.textContent = String(allCount);
  els.planStatActive.textContent = String(activeCount);
  els.planStatArchived.textContent = String(archivedCount);
  els.planStatCurrent.textContent = currentTitle;
  els.homeMetricPlans.textContent = String(allCount);
  els.homeMetricArchived.textContent = String(archivedCount);
  els.homeMetricCurrent.textContent = String(activeCount);
}

function setActivePage(nextPage) {
  if (nextPage === PAGES.planner) {
    activePage = PAGES.planner;
  } else if (nextPage === PAGES.library) {
    activePage = PAGES.library;
  } else {
    activePage = PAGES.home;
  }
  persistStoredValue(PAGE_STORAGE_KEY, activePage);
  const isHome = activePage === PAGES.home;
  const isLibrary = activePage === PAGES.library;
  const isPlanner = activePage === PAGES.planner;
  els.homePage.hidden = !isHome;
  els.libraryPage.hidden = !isLibrary;
  els.plannerPage.hidden = !isPlanner;
  els.navHomeBtn.classList.toggle("active", isHome);
  els.navLibraryBtn.classList.toggle("active", isLibrary);
  els.navPlannerBtn.classList.toggle("active", isPlanner);
  if (isPlanner) {
    renderAll();
    ensureMapReady().catch(() => renderMap());
  }
}

function setAuthView(nextView) {
  authView = nextView === AUTH_VIEWS.login ? AUTH_VIEWS.login : AUTH_VIEWS.register;
  persistStoredValue(AUTH_VIEW_STORAGE_KEY, authView);
  const isRegister = authView === AUTH_VIEWS.register;
  els.registerForm.hidden = !isRegister;
  els.loginForm.hidden = isRegister;
  els.showRegisterBtn.classList.toggle("active", isRegister);
  els.showLoginBtn.classList.toggle("active", !isRegister);
}

function renderPlannerMeta() {
  const title = state.trip?.name?.trim() || "未命名旅行";
  const binding = currentPlanId ? `已关联云端计划 · ${title}` : "未绑定";
  const statusText = currentPlanStatus ? ` · 状态：${formatPlanStatus(currentPlanStatus)}` : "";
  els.currentPlanLabel.textContent = `当前云端计划：${binding}${statusText}`;
  if (!hasSupabaseConfig()) {
    setCloudStatus("请先在 config.local.js 中配置 Supabase", true);
  } else if (!authSession) {
    setCloudStatus("登录后可保存到云端");
  } else if (currentPlanId) {
    setCloudStatus(`云端已连接${currentPlanStatus ? ` · ${formatPlanStatus(currentPlanStatus)}` : ""}`);
  } else {
    setCloudStatus("已登录，可新建云端计划");
  }
}

function renderAuthPanels() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  els.homePage.classList.toggle("signed-in", signedIn);
  els.homeGrid.classList.toggle("signed-in", signedIn);
  els.accountCard.hidden = signedIn;
  els.supabaseConfigNotice.hidden = configured;
  els.supabaseConfigNotice.textContent = configured
    ? ""
    : "请先在 assets/js/config.local.js 中填写 supabaseUrl 和 supabaseAnonKey。";
  els.authGuestPanel.hidden = signedIn;
  els.authUserPanel.hidden = !signedIn;
  renderHomeOverview();
  els.authBadge.textContent = signedIn ? "已登录" : "未登录";
  els.homeAuthBadge.textContent = signedIn ? "账号在线" : (configured ? "未登录" : "待配置");
  els.brandLogoutBtn.hidden = !signedIn;
  if (!signedIn) {
    setAuthView(authView);
    els.profileDisplayName.textContent = "-";
    els.profileEmail.textContent = "-";
    els.profilePlanCount.textContent = "0";
    els.profileState.textContent = configured ? "待登录" : "待配置";
    els.brandProfileName.textContent = "未登录";
    els.brandProfileStatus.textContent = configured ? "待登录" : "待配置";
    els.brandProfileStatus.classList.remove("archived");
    els.brandProfileEmail.textContent = configured ? "登录后可查看账号信息" : "请先完成 Supabase 配置";
    els.brandProfilePlanCount.textContent = "0";
    els.brandOpenPlannerBtn.textContent = "进入功能页";
    return;
  }
  const displayName = authProfile?.display_name || authSession.user.user_metadata?.display_name || authSession.user.email?.split("@")[0] || "旅行用户";
  els.profileDisplayName.textContent = displayName;
  els.profileEmail.textContent = authSession.user.email || "-";
  els.profilePlanCount.textContent = String(myPlans.length);
  els.profileState.textContent = "已登录";
  els.brandProfileName.textContent = displayName;
  els.brandProfileStatus.textContent = "已登录";
  els.brandProfileStatus.classList.remove("archived");
  els.brandProfileEmail.textContent = authSession.user.email || "-";
  els.brandProfilePlanCount.textContent = String(myPlans.length);
  els.brandOpenPlannerBtn.textContent = "进入功能页";
}

function renderHomeOverview() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  const activeCount = myPlans.filter((plan) => plan.status !== "archived").length;
  const archivedCount = myPlans.filter((plan) => plan.status === "archived").length;
  if (!signedIn) {
    els.homeOverviewBadge.textContent = configured ? "访客模式" : "待配置";
    els.homeOverviewText.textContent = configured
      ? "登录后，首页会自动聚合当前计划、最近更新和旅行足迹，让这里成为你继续推进旅程的入口。"
      : "先完成 Supabase 配置，随后即可启用注册登录、云端保存、行程库和足迹地图。";
    if (els.homeSpotlightStatus) {
      els.homeSpotlightStatus.textContent = "未绑定";
      els.homeSpotlightStatus.classList.remove("archived");
      els.homeSpotlightTitle.textContent = "还没有当前计划";
      els.homeSpotlightText.textContent = "先登录并创建一条计划，首页就会在这里显示你当前正在推进的旅程摘要。";
      els.homeSpotlightMeta.innerHTML = "<span>等待绑定</span><span>登录后解锁</span>";
    }
    renderHomeRecentPlans();
    renderFootprintMap().catch(() => {});
    return;
  }
  const currentPlan = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId) || null) : null;
  els.homeOverviewBadge.textContent = "云端已连接";
  els.homeOverviewText.textContent = currentPlan
    ? `你现在有 ${activeCount} 条进行中计划和 ${archivedCount} 条归档足迹，最适合先从「${currentPlan.title || "未命名旅行"}」继续推进。`
    : `你现在有 ${activeCount} 条进行中计划和 ${archivedCount} 条归档足迹，可以从功能页开启新旅程，或去行程库挑一条继续编辑。`;
  if (currentPlan && els.homeSpotlightStatus) {
    const summary = getPlanSnapshotSummary(currentPlan);
    els.homeSpotlightStatus.textContent = currentPlan.status === "archived" ? "已归档" : "当前绑定";
    els.homeSpotlightStatus.classList.toggle("archived", currentPlan.status === "archived");
    els.homeSpotlightTitle.textContent = currentPlan.title || "未命名旅行";
    if (currentPlan.status === "archived") {
      els.homeSpotlightText.textContent = "这条路线已经沉淀为足迹，你仍然可以重新打开、复制为新计划，或在行程库里恢复继续编辑。";
    } else if (summary.itemCount) {
      els.homeSpotlightText.textContent = `这条行程已经串起 ${summary.placeCount || 0} 个地点和 ${summary.itemCount} 个节点，继续补充交通和时间会更完整。`;
    } else if (summary.placeCount) {
      els.homeSpotlightText.textContent = `当前已经收集 ${summary.placeCount} 个地点，下一步可以把它们安排进每天的路线。`;
    } else {
      els.homeSpotlightText.textContent = "当前计划已经绑定，但还没有加入地点；先去功能页挑几个想去的地方会更有推进感。";
    }
    els.homeSpotlightMeta.innerHTML = buildHomeSpotlightMeta(currentPlan, summary)
      .map((text) => `<span>${escapeHtml(text)}</span>`)
      .join("");
  } else if (els.homeSpotlightStatus) {
    els.homeSpotlightStatus.textContent = "未绑定";
    els.homeSpotlightStatus.classList.remove("archived");
    els.homeSpotlightTitle.textContent = "还没有当前计划";
    els.homeSpotlightText.textContent = activeCount
      ? "你已经有进行中的计划了，可以从行程库选一条载入到首页，作为当前推进中的旅程。"
      : "可以去功能页新建一条计划，或者从行程库载入一条已有计划。";
    els.homeSpotlightMeta.innerHTML = `<span>${activeCount} 条进行中</span><span>${archivedCount} 条已归档</span>`;
  }
  renderHomeRecentPlans();
  renderFootprintMap().catch(() => {});
}

function renderHomeRecentPlans() {
  if (!els.homeRecentPlans) return;
  els.homeRecentPlans.innerHTML = "";
  const plans = [...myPlans]
    .sort((a, b) => {
      const recentA = getRecentPlanRank(a.id);
      const recentB = getRecentPlanRank(b.id);
      if (recentA !== recentB) {
        if (recentA === -1) return 1;
        if (recentB === -1) return -1;
        return recentA - recentB;
      }
      const pinDelta = Number(isPlanPinned(b.id)) - Number(isPlanPinned(a.id));
      if (pinDelta) return pinDelta;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 3);
  els.homeRecentPlansEmpty.hidden = plans.length > 0;
  if (!plans.length) return;
  plans.forEach((plan) => {
    const summary = getPlanSnapshotSummary(plan);
    const recentRank = getRecentPlanRank(plan.id);
    const isPinned = isPlanPinned(plan.id);
    const item = document.createElement("article");
    item.className = `mini-plan-item${currentPlanId === plan.id ? " is-current" : ""}`;
    item.innerHTML = `
      <div class="mini-plan-top">
        <strong class="mini-plan-title">${escapeHtml(plan.title || "未命名旅行")}</strong>
        <span class="plan-status${plan.status === "archived" ? " archived" : ""}">${escapeHtml(currentPlanId === plan.id ? "当前绑定" : formatPlanStatus(plan.status))}</span>
      </div>
      <div class="plan-card-flags"></div>
      <div class="plan-card-meta">
        <span>${escapeHtml(formatPlanDateRange(plan.start_date, plan.end_date))}</span>
        <span>${escapeHtml(`${summary.dayCount || 0} 天`)}</span>
        <span>${escapeHtml(`${summary.placeCount || 0} 个地点`)}</span>
      </div>
    `;
    const flags = item.querySelector(".plan-card-flags");
    if (recentRank === 0) {
      const recentChip = document.createElement("span");
      recentChip.className = "plan-flag tone-recent";
      recentChip.textContent = "最近打开";
      flags.append(recentChip);
    } else if (recentRank > 0) {
      const viewedChip = document.createElement("span");
      viewedChip.className = "plan-flag tone-recent";
      viewedChip.textContent = "近期查看";
      flags.append(viewedChip);
    }
    if (isPinned) {
      const pinChip = document.createElement("span");
      pinChip.className = "plan-flag tone-pin";
      pinChip.textContent = "已置顶";
      flags.append(pinChip);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost small";
    button.textContent = "继续编辑";
    button.addEventListener("click", () => loadPlanFromCloud(plan.id));
    item.append(button);
    els.homeRecentPlans.append(item);
  });
}

function renderPlanList() {
  els.libraryPlanList.innerHTML = "";
  renderPlanStats();
  renderPlanFilters();
  const plans = getFilteredPlans();
  const hasPlans = Array.isArray(plans) && plans.length > 0;
  els.libraryPlanEmpty.hidden = hasPlans;
  els.libraryPlanEmpty.textContent = myPlans.length
    ? "当前筛选条件下没有匹配的旅行计划。你可以切换状态、搜索关键词，或者从功能页继续保存新的计划。"
    : "当前还没有任何旅行计划。你可以先去功能页规划，再保存到云端。";
  els.planManagerSummary.textContent = `当前显示 ${plans.length} 条计划，共 ${myPlans.length} 条`;
  if (!hasPlans) {
    renderHomeRecentPlans();
    renderFootprintMap().catch(() => {});
    return;
  }
  plans.forEach((plan) => {
    const summary = getPlanSnapshotSummary(plan);
    const metaList = buildPlanMetaList(plan);
    const completion = getPlanCompletionState(plan);
    const isCurrent = currentPlanId === plan.id;
    const isPinned = isPlanPinned(plan.id);
    const recentRank = getRecentPlanRank(plan.id);
    const article = document.createElement("article");
    article.className = `plan-card${plan.status === "archived" ? " archived" : ""}${isCurrent ? " current" : ""}${isPinned ? " pinned" : ""}`;
    article.innerHTML = `
      <div class="plan-card-top">
        <div class="plan-main">
          <h3>${escapeHtml(plan.title || "未命名旅行")}</h3>
          <div class="plan-card-meta">
            ${metaList.map((text) => `<span>${escapeHtml(text)}</span>`).join("")}
          </div>
        </div>
        <span class="plan-status${plan.status === "archived" ? " archived" : ""}">${escapeHtml(isCurrent ? "当前绑定" : formatPlanStatus(plan.status))}</span>
      </div>
      <div class="plan-card-flags"></div>
      <div class="plan-card-summary">
        <article class="plan-summary-chip">
          <span>行程天数</span>
          <strong>${escapeHtml(`${summary.dayCount || 0} 天`)}</strong>
        </article>
        <article class="plan-summary-chip">
          <span>地点数量</span>
          <strong>${escapeHtml(`${summary.placeCount || 0} 个`)}</strong>
        </article>
        <article class="plan-summary-chip">
          <span>节点数量</span>
          <strong>${escapeHtml(`${summary.itemCount || 0} 个`)}</strong>
        </article>
        <article class="plan-summary-chip">
          <span>状态</span>
          <strong>${escapeHtml(isCurrent ? "编辑中" : formatPlanStatus(plan.status))}</strong>
        </article>
      </div>
      <p class="plan-card-notes">${escapeHtml(isCurrent ? "这条计划当前已经与功能页绑定，你可以直接继续编辑并再次保存到云端。" : "可以把这条计划重新载入到功能页继续编辑，也可以复制、归档或删除。")}</p>
      <div class="plan-actions"></div>
    `;
    const flags = article.querySelector(".plan-card-flags");
    const completionChip = document.createElement("span");
    completionChip.className = `plan-flag tone-${completion.tone}`;
    completionChip.textContent = completion.label;
    flags.append(completionChip);
    if (isPinned) {
      const pinChip = document.createElement("span");
      pinChip.className = "plan-flag tone-pin";
      pinChip.textContent = "已置顶";
      flags.append(pinChip);
    }
    if (recentRank > -1 && recentRank < 3) {
      const recentChip = document.createElement("span");
      recentChip.className = "plan-flag tone-recent";
      recentChip.textContent = recentRank === 0 ? "最近打开" : "近期查看";
      flags.append(recentChip);
    }
    const actions = article.querySelector(".plan-actions");
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "small";
    openBtn.textContent = "继续编辑";
    openBtn.addEventListener("click", () => loadPlanFromCloud(plan.id));
    actions.append(openBtn);
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "small ghost";
    copyBtn.textContent = "复制为新计划";
    copyBtn.addEventListener("click", () => duplicatePlan(plan.id));
    actions.append(copyBtn);
    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = "small ghost";
    pinBtn.textContent = isPinned ? "取消置顶" : "置顶";
    pinBtn.addEventListener("click", () => {
      const pinned = togglePinnedPlan(plan.id);
      renderPlanList();
      setAccountFeedback(pinned ? "已置顶到行程库顶部。" : "已取消置顶。");
    });
    actions.append(pinBtn);
    if (plan.status !== "archived") {
      const archiveBtn = document.createElement("button");
      archiveBtn.type = "button";
      archiveBtn.className = "small ghost";
      archiveBtn.textContent = "归档";
      archiveBtn.addEventListener("click", () => archivePlan(plan.id));
      actions.append(archiveBtn);
    } else {
      const restoreBtn = document.createElement("button");
      restoreBtn.type = "button";
      restoreBtn.className = "small ghost";
      restoreBtn.textContent = "取消归档";
      restoreBtn.addEventListener("click", () => restorePlan(plan.id));
      actions.append(restoreBtn);
    }
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "small ghost";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", () => deletePlan(plan.id));
    actions.append(deleteBtn);
    els.libraryPlanList.append(article);
  });
  renderHomeRecentPlans();
  renderFootprintMap().catch(() => {});
}

function renderSuggestions() {
  els.suggestions.innerHTML = "";
  els.suggestions.classList.toggle("has-items", suggestions.length > 0);
  if (!suggestions.length) return;
  suggestions.slice(0, SUGGESTION_LIMIT).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `suggestion-row${index === activeSuggestionIndex ? " active" : ""}`;
    row.innerHTML = `
      <div class="suggestion-main">
        <div class="suggestion-top"><strong>${escapeHtml(item.name || item.keyword || "未命名地点")}</strong><span class="suggestion-tag">${escapeHtml(item.type || "地点")}</span></div>
        <div class="mini">${escapeHtml([item.city || "", item.district || "", item.address || ""].filter(Boolean).join(" · ") || "无详细地址")}</div>
      </div>
      <button type="button" class="small add-inline">+</button>
    `;
    row.addEventListener("mouseenter", () => {
      activeSuggestionIndex = index;
    });
    row.addEventListener("click", () => {
      activeSuggestionIndex = index;
      els.searchKeyword.value = item.name || item.keyword || "";
    });
    row.querySelector(".add-inline").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      addPlaceFromSuggestion(item);
    });
    els.suggestions.appendChild(row);
  });
}

function renderPlaces() {
  els.placePool.innerHTML = "";
  els.placeCount.textContent = `${state.places.length} 个地点`;
  state.places.forEach((place) => {
    const node = els.placeCardTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.placeId = place.id;
    node.querySelector(".place-name").textContent = place.name;
    node.querySelector(".place-meta").textContent = [place.city || "", place.address || "无详细地址"].filter(Boolean).join(" · ");
    node.querySelector(".delete-place").addEventListener("click", () => removePlace(place.id));
    node.addEventListener("dragstart", () => {
      dragState = { type: "place", placeId: place.id };
      node.classList.add("dragging");
    });
    node.addEventListener("dragend", () => {
      dragState = null;
      node.classList.remove("dragging");
      clearDropMarkers();
    });
    els.placePool.appendChild(node);
  });
}

function buildPlaceTypeOptions(select, value) {
  PLACE_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });
  select.value = value;
}

function buildStayOptions(select, value) {
  STAY_OPTIONS.forEach((minutes) => {
    const option = document.createElement("option");
    option.value = String(minutes);
    option.textContent = minutes === 0 ? "0 分钟" : formatMinutes(minutes);
    select.appendChild(option);
  });
  select.value = String(value || 0);
}

function buildTransportOptions(select, value) {
  TRANSPORT_MODES.filter((mode) => mode.value !== "none").forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode.value;
    option.textContent = mode.label;
    select.appendChild(option);
  });
  select.value = value === "none" ? "walk" : value;
}

function renderDayTabs() {
  els.dayTabs.innerHTML = "";
  if (!state.days.length) return;
  if (!state.days.some((day) => day.id === selectedDayId)) selectedDayId = state.days[0].id;
  state.days.forEach((day, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `day-tab${day.id === selectedDayId ? " active" : ""}`;
    btn.textContent = day.title || `Day ${index + 1}`;
    btn.addEventListener("click", () => {
      selectedDayId = day.id;
      els.mapDaySelect.value = day.id;
      renderAll();
    });
    els.dayTabs.appendChild(btn);
  });
}

function renderDays() {
  els.daysContainer.innerHTML = "";
  renderDayTabs();
  if (!state.days.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "先填写日期，并点击“生成天数”。";
    els.daysContainer.appendChild(empty);
    updateMapDayOptions();
    return;
  }
  const day = state.days.find((entry) => entry.id === selectedDayId) || state.days[0];
  selectedDayId = day.id;
  const dayIndex = state.days.findIndex((entry) => entry.id === day.id);
  const node = els.dayCardTemplate.content.firstElementChild.cloneNode(true);
  const dropZone = node.querySelector(".drop-zone");
  const stats = getDayStats(day);
  node.querySelector(".day-title").textContent = day.title || `Day ${dayIndex + 1}`;
  node.querySelector(".day-date").textContent = formatDate(day.date);
  node.querySelector(".day-stats").textContent = `停留 ${formatMinutes(stats.stayMinutes)} / 出行 ${formatMinutes(stats.travelMinutes)} / 里程 ${formatDistance(stats.distanceKm)}`;
  if (stats.diagnostics?.length) {
    const diagnostic = document.createElement("div");
    diagnostic.className = `day-diagnostic tone-${stats.diagnostics[0].tone || "calm"}`;
    diagnostic.innerHTML = `<strong>${escapeHtml(stats.diagnostics[0].label)}</strong><span>${escapeHtml(stats.diagnostics[0].message)}</span>`;
    node.querySelector(".day-header").appendChild(diagnostic);
  }
  dropZone.classList.toggle("empty", day.items.length === 0);
  attachDropZoneEvents(dropZone, day.id);

  day.items.forEach((item, itemIndex) => {
    const place = getPlaceById(item.placeId);
    if (!place) return;
    const itemNode = els.itineraryItemTemplate.content.firstElementChild.cloneNode(true);
    const isFirst = itemIndex === 0;
    const isLast = itemIndex === day.items.length - 1;

    itemNode.dataset.itemId = item.id;
    itemNode.classList.toggle("edge-item", isFirst || isLast);
    itemNode.querySelector(".item-order").textContent = `${itemIndex + 1}. ${item.type}`;
    itemNode.querySelector(".item-name").textContent = place.name;
    itemNode.querySelector(".item-address").textContent = place.address || "无详细地址";
    itemNode.querySelector(".arrival-time").textContent = formatClock(item.arrivalTime);
    itemNode.querySelector(".leave-time").textContent = formatClock(item.leaveTime);

    const typeSelect = itemNode.querySelector(".place-type");
    buildPlaceTypeOptions(typeSelect, item.type);
    typeSelect.addEventListener("change", () => updateItem(day.id, item.id, { type: typeSelect.value }));

    const stayField = itemNode.querySelector(".stay-field");
    const staySelect = itemNode.querySelector(".stay-duration");
    buildStayOptions(staySelect, item.stayMinutes);
    staySelect.addEventListener("change", () => updateItem(day.id, item.id, { stayMinutes: Number(staySelect.value) }));

    const startField = itemNode.querySelector(".depart-field");
    const startInput = itemNode.querySelector(".start-time");
    startInput.value = item.startTime || "";
    startInput.addEventListener("change", () => updateItem(day.id, item.id, { startTime: startInput.value }));

    const arrivalBlock = itemNode.querySelector(".arrival-block");
    const leaveBlock = itemNode.querySelector(".leave-block");
    if (isFirst) {
      arrivalBlock.classList.add("field-hidden");
      leaveBlock.classList.add("field-hidden");
      stayField.classList.add("field-hidden");
    } else if (isLast) {
      startField.classList.add("field-hidden");
      leaveBlock.classList.add("field-hidden");
      stayField.classList.add("field-hidden");
    } else {
      startField.classList.add("field-hidden");
    }

    const notesInput = itemNode.querySelector(".item-notes");
    notesInput.value = item.notes || "";
    notesInput.addEventListener("change", () => updateItem(day.id, item.id, { notes: notesInput.value.trim() }));

    itemNode.querySelector(".remove-item").addEventListener("click", () => removeItem(day.id, item.id));
    itemNode.addEventListener("dragstart", () => {
      dragState = { type: "itinerary-item", fromDayId: day.id, itemId: item.id };
      itemNode.classList.add("dragging");
    });
    itemNode.addEventListener("dragend", () => {
      dragState = null;
      itemNode.classList.remove("dragging");
      clearDropMarkers();
      document.querySelectorAll(".drop-zone").forEach((zone) => zone.classList.remove("drag-over"));
    });

    dropZone.appendChild(itemNode);

    if (itemIndex < day.items.length - 1) {
      const nextItem = day.items[itemIndex + 1];
      const nextPlace = getPlaceById(nextItem.placeId);
      const segmentNode = els.segmentTemplate.content.firstElementChild.cloneNode(true);
      segmentNode.querySelector(".segment-label").textContent = `${place.name} → ${nextPlace?.name || "下一站"}`;
      segmentNode.querySelector(".segment-metrics").textContent = nextItem.segment ? `${formatDistance(nextItem.segment.distanceKm)} / 约 ${formatMinutes(nextItem.segment.minutes)}` : "等待计算";
      const modeSelect = segmentNode.querySelector(".transport-mode");
      buildTransportOptions(modeSelect, nextItem.transportFromPrev || "walk");
      modeSelect.addEventListener("change", () => updateItem(day.id, nextItem.id, { transportFromPrev: modeSelect.value }));
      dropZone.appendChild(segmentNode);
    }
  });

  els.daysContainer.appendChild(node);
  updateMapDayOptions();
}

function updateMapDayOptions() {
  const current = els.mapDaySelect.value || selectedDayId;
  els.mapDaySelect.innerHTML = "";
  state.days.forEach((day, index) => {
    const option = document.createElement("option");
    option.value = day.id;
    option.textContent = `${day.title || `Day ${index + 1}`} · ${formatDate(day.date)}`;
    els.mapDaySelect.appendChild(option);
  });
  if (!state.days.length) return;
  els.mapDaySelect.value = state.days.some((day) => day.id === current) ? current : selectedDayId || state.days[0].id;
}

function renderLegend() {
  els.mapLegend.innerHTML = "";
  TRANSPORT_MODES.filter((mode) => mode.value !== "none").forEach((mode) => {
    const chip = document.createElement("div");
    chip.className = "legend-item";
    chip.innerHTML = `<span class="legend-line" style="background:${mode.color}"></span><span>${mode.label}</span>`;
    els.mapLegend.appendChild(chip);
  });
}

function renderRouteSummary() {
  els.routeSummary.innerHTML = "";
  if (!state.days.length) return;
  state.days.forEach((day) => {
    const card = document.createElement("article");
    card.className = `summary-card${day.id === els.mapDaySelect.value ? " day-focus" : ""}`;
    const stats = getDayStats(day);
    card.innerHTML = `<strong>${day.title} · ${formatDate(day.date)}</strong><div class="mini">停留 ${formatMinutes(stats.stayMinutes)} / 出行 ${formatMinutes(stats.travelMinutes)} / 里程 ${formatDistance(stats.distanceKm)}</div>`;
    if (stats.diagnostics?.length) {
      const diagnosticList = document.createElement("div");
      diagnosticList.className = "diagnostic-list";
      stats.diagnostics.forEach((entry) => {
        const chip = document.createElement("div");
        chip.className = `diagnostic-chip tone-${entry.tone || "calm"}`;
        chip.innerHTML = `<strong>${escapeHtml(entry.label)}</strong><span>${escapeHtml(entry.message)}</span>`;
        diagnosticList.appendChild(chip);
      });
      card.appendChild(diagnosticList);
    }
    const list = document.createElement("div");
    list.className = "segment-list";
    day.items.forEach((item, index) => {
      if (index === 0) return;
      const prevPlace = getPlaceById(day.items[index - 1].placeId);
      const nextPlace = getPlaceById(item.placeId);
      const mode = getModeConfig(item.transportFromPrev);
      const row = document.createElement("div");
      row.className = "segment-row";
      row.innerHTML = `<span class="mode-badge" style="background:${mode.color}">${mode.label}</span><span>${prevPlace?.name || "上一站"} → ${nextPlace?.name || "下一站"}</span><span>${formatDistance(item.segment?.distanceKm)} / 约 ${formatMinutes(item.segment?.minutes)}</span>`;
      list.appendChild(row);
    });
    if (!list.children.length) {
      const empty = document.createElement("div");
      empty.className = "segment-row";
      empty.textContent = "这一天还没有形成完整路线。";
      list.appendChild(empty);
    }
    card.appendChild(list);
    els.routeSummary.appendChild(card);
  });
}

function renderAll() {
  syncStateToTripInputs();
  renderAuthPanels();
  renderPlanList();
  renderPlannerMeta();
  renderPlaces();
  renderDays();
  if (activePage === PAGES.planner) renderMap();
  saveState(false);
}
