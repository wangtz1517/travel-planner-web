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
  if (els.profileHubArchivedCount) {
    els.profileHubArchivedCount.textContent = String(archivedCount);
  }
}

function setActivePage(nextPage) {
  if (nextPage === PAGES.planner) {
    activePage = PAGES.planner;
  } else if (nextPage === PAGES.placeLibrary) {
    activePage = PAGES.placeLibrary;
  } else if (nextPage === PAGES.community) {
    activePage = PAGES.community;
  } else if (nextPage === PAGES.profile) {
    activePage = PAGES.profile;
  } else {
    activePage = PAGES.home;
  }
  persistStoredValue(PAGE_STORAGE_KEY, activePage);
  const isHome = activePage === PAGES.home;
  const isPlaceLibrary = activePage === PAGES.placeLibrary;
  const isPlanner = activePage === PAGES.planner;
  const isCommunity = activePage === PAGES.community;
  const isProfile = activePage === PAGES.profile;
  els.homePage.hidden = !isHome;
  els.placeLibraryPage.hidden = !isPlaceLibrary;
  els.plannerPage.hidden = !isPlanner;
  els.communityPage.hidden = !isCommunity;
  els.profilePage.hidden = !isProfile;
  els.navHomeBtn.classList.toggle("active", isHome);
  els.navPlaceLibraryBtn.classList.toggle("active", isPlaceLibrary);
  els.navPlannerBtn.classList.toggle("active", isPlanner);
  els.navCommunityBtn.classList.toggle("active", isCommunity);
  els.navProfileBtn.classList.toggle("active", isProfile);
  if (isPlanner) {
    renderAll();
    ensureMapReady().catch(() => renderMap());
  } else if (isPlaceLibrary) {
    schedulePlaceLibraryMasonry();
  } else if (isProfile) {
    schedulePlanCardMasonry();
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
  els.homeGrid.classList.toggle("guest-focus", !signedIn);
  els.accountCard.hidden = signedIn;
  if (els.homeOverviewCard) {
    els.homeOverviewCard.hidden = !signedIn;
  }
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
    els.brandOpenPlannerBtn.textContent = "进入规划页";
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
  els.brandOpenPlannerBtn.textContent = "进入规划页";
}

function renderHomeOverview() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  const activeCount = myPlans.filter((plan) => plan.status !== "archived").length;
  const archivedCount = myPlans.filter((plan) => plan.status === "archived").length;
  const currentPlan = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId) || null) : null;
  if (!signedIn) {
    els.homeOverviewBadge.textContent = configured ? "访客模式" : "待配置";
    els.homeOverviewText.textContent = configured
      ? "登录后，首页会自动聚合当前计划、最近更新和旅行足迹，并把地点库、规划页、个人页串成完整入口。"
      : "先完成 Supabase 配置，随后即可启用注册登录、云端保存、个人页和足迹地图。";
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
  els.homeOverviewBadge.textContent = "云端已连接";
  els.homeOverviewText.textContent = currentPlan
    ? `你现在有 ${activeCount} 条进行中计划和 ${archivedCount} 条归档足迹，最适合先从「${currentPlan.title || "未命名旅行"}」继续推进。`
    : `你现在有 ${activeCount} 条进行中计划和 ${archivedCount} 条归档足迹，可以从规划页开启新旅程，或去个人页挑一条继续编辑。`;
  if (currentPlan && els.homeSpotlightStatus) {
    const summary = getPlanSnapshotSummary(currentPlan);
    els.homeSpotlightStatus.textContent = currentPlan.status === "archived" ? "已归档" : "当前绑定";
    els.homeSpotlightStatus.classList.toggle("archived", currentPlan.status === "archived");
    els.homeSpotlightTitle.textContent = currentPlan.title || "未命名旅行";
    if (currentPlan.status === "archived") {
      els.homeSpotlightText.textContent = "这条路线已经沉淀为足迹，你仍然可以重新打开、复制为新计划，或在个人页里恢复继续编辑。";
    } else if (summary.itemCount) {
      els.homeSpotlightText.textContent = `这条行程已经串起 ${summary.placeCount || 0} 个地点和 ${summary.itemCount} 个节点，继续补充交通和时间会更完整。`;
    } else if (summary.placeCount) {
      els.homeSpotlightText.textContent = `当前已经收集 ${summary.placeCount} 个地点，下一步可以把它们安排进每天的路线。`;
    } else {
      els.homeSpotlightText.textContent = "当前计划已经绑定，但还没有加入地点；先去地点库收集几个想去的地方会更有推进感。";
    }
    els.homeSpotlightMeta.innerHTML = buildHomeSpotlightMeta(currentPlan, summary)
      .map((text) => `<span>${escapeHtml(text)}</span>`)
      .join("");
  } else if (els.homeSpotlightStatus) {
    els.homeSpotlightStatus.textContent = "未绑定";
    els.homeSpotlightStatus.classList.remove("archived");
    els.homeSpotlightTitle.textContent = "还没有当前计划";
      els.homeSpotlightText.textContent = activeCount
      ? "你已经有进行中的计划了，可以从个人页选一条载入，作为当前推进中的旅程。"
      : "可以去规划页新建一条计划，或者从个人页载入一条已有计划。";
    els.homeSpotlightMeta.innerHTML = `<span>${activeCount} 条进行中</span><span>${archivedCount} 条已归档</span>`;
  }
  if (!els.profilePage.hidden) schedulePlanCardMasonry();
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
    ? "当前筛选条件下没有匹配的旅行计划。你可以切换状态、搜索关键词，或者从规划页继续保存新的计划。"
    : "当前还没有任何旅行计划。你可以先去规划页规划，再保存到云端。";
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
      <p class="plan-card-notes">${escapeHtml(isCurrent ? "这条计划当前已经与规划页绑定，你可以直接继续编辑并再次保存到云端。" : "可以把这条计划重新载入到规划页继续编辑，也可以复制、归档或删除。")}</p>
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
      setAccountFeedback(pinned ? "已置顶到个人页计划列表顶部。" : "已取消置顶。");
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
  if (!els.profilePage.hidden) schedulePlanCardMasonry();
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
    row.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".add-inline")) return;
      event.preventDefault();
      event.stopPropagation();
      activeSuggestionIndex = index;
      addPlaceFromSuggestion(item);
    });
    row.querySelector(".add-inline").addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      addPlaceFromSuggestion(item);
    });
    row.querySelector(".add-inline").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    els.suggestions.appendChild(row);
  });
}

function renderPlaces() {
  els.placePool.innerHTML = "";
  if (els.plannerPlaceCategorySelect) {
    els.plannerPlaceCategorySelect.value = plannerPlaceFilter;
  }
  if (els.plannerPlaceSearchInput) {
    els.plannerPlaceSearchInput.value = plannerPlaceSearchQuery;
  }
  const visiblePlaces = getFilteredPlannerPlaces();
  els.placeCount.textContent = `${visiblePlaces.length} / ${placeLibraryState.length} 个地点`;
  visiblePlaces.forEach((place) => {
    const node = els.placeCardTemplate.content.firstElementChild.cloneNode(true);
    const category = place.category || "other";
    node.dataset.placeId = place.id;
    node.className = `place-card planner-place-card place-library-item tone-${category}`;
    node.querySelector(".place-name").textContent = place.name;
    node.querySelector(".place-type-pill").textContent = getPlaceCategoryLabel(category);
    node.querySelector(".place-meta").textContent = [
      getPlaceCategoryLabel(place.category),
      getResolvedPlaceProvince(place),
      place.address || "无详细地址"
    ].filter(Boolean).join(" · ");
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
  if (visiblePlaces.length) schedulePlannerPlaceMasonry();
  if (!visiblePlaces.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = placeLibraryState.length ? "当前筛选条件下没有地点，换个关键词或分类试试。" : "地点库还是空的，先去地点库添加几个地点。";
    els.placePool.appendChild(empty);
  }
}

function getPlaceCategoryLabel(category) {
  return PLACE_LIBRARY_CATEGORIES.find((item) => item.value === category)?.label || "其他";
}

function getResolvedPlaceProvince(place) {
  if (place?.province?.trim()) return place.province.trim();
  const source = `${place?.city || ""} ${place?.district || ""} ${place?.address || ""}`;
  const provinceEntries = [
    ["北京市", ["北京"]],
    ["天津市", ["天津"]],
    ["上海市", ["上海"]],
    ["重庆市", ["重庆"]],
    ["河北省", ["河北"]],
    ["山西省", ["山西"]],
    ["辽宁省", ["辽宁"]],
    ["吉林省", ["吉林"]],
    ["黑龙江省", ["黑龙江"]],
    ["江苏省", ["江苏"]],
    ["浙江省", ["浙江"]],
    ["安徽省", ["安徽"]],
    ["福建省", ["福建"]],
    ["江西省", ["江西"]],
    ["山东省", ["山东"]],
    ["河南省", ["河南"]],
    ["湖北省", ["湖北"]],
    ["湖南省", ["湖南"]],
    ["广东省", ["广东"]],
    ["海南省", ["海南"]],
    ["四川省", ["四川"]],
    ["贵州省", ["贵州"]],
    ["云南省", ["云南"]],
    ["陕西省", ["陕西", "陕"]],
    ["甘肃省", ["甘肃"]],
    ["青海省", ["青海"]],
    ["台湾省", ["台湾"]],
    ["内蒙古自治区", ["内蒙古"]],
    ["广西壮族自治区", ["广西"]],
    ["西藏自治区", ["西藏"]],
    ["宁夏回族自治区", ["宁夏"]],
    ["新疆维吾尔自治区", ["新疆"]],
    ["香港特别行政区", ["香港"]],
    ["澳门特别行政区", ["澳门"]]
  ];
  const hit = provinceEntries.find(([, aliases]) => aliases.some((alias) => source.includes(alias)));
  return hit?.[0] || place?.city || "";
}

function matchPlaceKeyword(place, keyword) {
  const normalized = normalizePlanText(keyword || "");
  if (!normalized) return true;
  return normalizePlanText([
    place.name || "",
    getResolvedPlaceProvince(place),
    place.city || "",
    place.district || "",
    place.address || ""
  ].join(" ")).includes(normalized);
}

function getFilteredPlaceLibraryPlaces() {
  return placeLibraryState.filter((place) => {
    const matchCategory = placeLibraryFilter === "all" || place.category === placeLibraryFilter;
    return matchCategory && matchPlaceKeyword(place, placeLibrarySearchQuery);
  });
}

function getFilteredPlannerPlaces() {
  return placeLibraryState.filter((place) => {
    const matchCategory = plannerPlaceFilter === "all" || place.category === plannerPlaceFilter;
    return matchCategory && matchPlaceKeyword(place, plannerPlaceSearchQuery);
  });
}

function renderPlaceLibraryFilters() {
  const stats = {
    all: placeLibraryState.length,
    play: placeLibraryState.filter((place) => place.category === "play").length,
    food: placeLibraryState.filter((place) => place.category === "food").length,
    stay: placeLibraryState.filter((place) => place.category === "stay").length,
    other: placeLibraryState.filter((place) => place.category === "other").length
  };
  [
    [els.placeFilterAllBtn, "all", "全部"],
    [els.placeFilterPlayBtn, "play", "玩"],
    [els.placeFilterFoodBtn, "food", "吃"],
    [els.placeFilterStayBtn, "stay", "住"],
    [els.placeFilterOtherBtn, "other", "其他"]
  ].forEach(([button, value, label]) => {
    if (!button) return;
    button.classList.toggle("active", placeLibraryFilter === value);
    button.dataset.count = String(stats[value] || 0);
    button.setAttribute("aria-label", `${label} ${stats[value] || 0} 个地点`);
  });
  if (els.placeLibrarySearchInput) {
    els.placeLibrarySearchInput.value = placeLibrarySearchQuery;
  }
}

function renderPlaceLibraryStats() {
  const playCount = placeLibraryState.filter((place) => place.category === "play").length;
  const foodCount = placeLibraryState.filter((place) => place.category === "food").length;
  const stayCount = placeLibraryState.filter((place) => place.category === "stay").length;
  els.placeLibraryStatAll.textContent = String(placeLibraryState.length);
  els.placeLibraryStatPlay.textContent = String(playCount);
  els.placeLibraryStatFood.textContent = String(foodCount);
  els.placeLibraryStatStay.textContent = String(stayCount);
  els.placeLibraryCount.textContent = `${placeLibraryState.length} 个地点`;
  if (els.profileHubPlaceCount) {
    els.profileHubPlaceCount.textContent = String(placeLibraryState.length);
  }
}

function renderPlaceLibraryList() {
  els.placeLibraryList.innerHTML = "";
  renderPlaceLibraryFilters();
  renderPlaceLibraryStats();
  const places = getFilteredPlaceLibraryPlaces();
  els.placeLibraryEmpty.hidden = places.length > 0;
  els.placeLibrarySummary.textContent = placeLibraryNotice
    ? `当前显示 ${places.length} 个地点，共 ${placeLibraryState.length} 个 · ${placeLibraryNotice}`
    : `当前显示 ${places.length} 个地点，共 ${placeLibraryState.length} 个`;
  if (!places.length) return;
  places.forEach((place) => {
    const article = document.createElement("article");
    article.className = `place-library-item tone-${place.category || "other"}`;
    article.innerHTML = `
      <div class="place-library-item-top">
        <div class="place-library-title-block">
          <div class="place-library-headline">
            <h3>${escapeHtml(place.name || "未命名地点")}</h3>
            <span class="place-library-type-pill">${escapeHtml(getPlaceCategoryLabel(place.category))}</span>
          </div>
          <p class="mini">${escapeHtml([getResolvedPlaceProvince(place), place.city || "", place.district || "", place.address || "无详细地址"].filter(Boolean).join(" · "))}</p>
        </div>
        <button type="button" class="place-library-delete" aria-label="删除地点" title="删除地点">×</button>
      </div>
      <div class="place-library-fields">
        <div class="place-library-field-group">
          <span class="place-library-field-label">调整分类</span>
          <select class="place-library-category chip-select">
            ${PLACE_LIBRARY_CATEGORIES.filter((item) => item.value !== "all").map((item) => `<option value="${item.value}">${item.label}</option>`).join("")}
          </select>
        </div>
        <div class="place-library-field-group">
          <span class="place-library-field-label">省份自动识别</span>
          <div class="place-library-meta-chip">
            <strong>${escapeHtml(getResolvedPlaceProvince(place) || "识别中")}</strong>
          </div>
        </div>
      </div>
    `;
    article.querySelector(".place-library-category").value = place.category || "other";
    article.querySelector(".place-library-category").addEventListener("change", (event) => {
      updatePlaceLibraryEntry(place.id, { category: event.target.value });
    });
    article.querySelector(".place-library-delete").addEventListener("click", () => removePlace(place.id));
    els.placeLibraryList.appendChild(article);
  });
  schedulePlaceLibraryMasonry();
}

function layoutMasonryGrid(container) {
  if (!container || !container.children.length) return;
  const styles = window.getComputedStyle(container);
  const rowSize = Number.parseFloat(styles.gridAutoRows);
  const rowGap = Number.parseFloat(styles.rowGap || styles.gap);
  if (!rowSize || Number.isNaN(rowSize)) return;
  [...container.children].forEach((item) => {
    item.style.setProperty("--place-card-span", "1");
    const contentHeight = item.scrollHeight;
    const span = Math.max(1, Math.ceil((contentHeight + rowGap) / (rowSize + rowGap)));
    item.style.setProperty("--place-card-span", String(span));
  });
}

function scheduleMasonryGrid(container) {
  if (!container) return;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      layoutMasonryGrid(container);
    });
  });
}

function layoutPlaceLibraryMasonry() {
  layoutMasonryGrid(els.placeLibraryList);
}

function schedulePlaceLibraryMasonry() {
  scheduleMasonryGrid(els.placeLibraryList);
}

function schedulePlannerPlaceMasonry() {
  scheduleMasonryGrid(els.placePool);
}

function schedulePlanCardMasonry() {
  scheduleMasonryGrid(els.libraryPlanList);
}

function renderProfileHub() {
  const signedIn = Boolean(authSession?.user);
  const displayName = authProfile?.display_name || authSession?.user?.user_metadata?.display_name || authSession?.user?.email?.split("@")[0] || "-";
  els.profileHubAuthBadge.textContent = signedIn ? "已登录" : "未登录";
  els.profileHubName.textContent = signedIn ? displayName : "-";
  els.profileHubEmail.textContent = signedIn ? (authSession?.user?.email || "-") : "-";
  els.profileHubPlaceCount.textContent = String(placeLibraryState.length);
}

function formatSocialTime(value) {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} 分钟前`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} 小时前`;
  if (diff < 7 * day) return `${Math.max(1, Math.round(diff / day))} 天前`;
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderSocialHub() {
  syncSocialStateScope();
  const signedIn = Boolean(authSession?.user);
  const discovery = getSocialDiscoveryResults();
  const incomingRequests = getSocialRequests("incoming");
  const outgoingRequests = getSocialRequests("outgoing");
  const pendingRequests = [...incomingRequests, ...outgoingRequests]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  const friends = getSocialFriends();
  const conversations = getSocialConversations();
  const shares = getSocialShares();
  const selectedConversation = getSelectedSocialConversation();
  const selectedProfile = selectedConversation ? getSocialProfile(selectedConversation.participantId) : null;
  const unreadCount = conversations.reduce((sum, conversation) => sum + Number(conversation.unreadCount || 0), 0);

  els.socialModeBadge.textContent = signedIn ? "账号本地版" : "本地预览";
  els.socialFriendCount.textContent = String(friends.length);
  els.socialRequestCount.textContent = String(pendingRequests.length);
  els.socialUnreadCount.textContent = String(unreadCount);
  els.socialShareCount.textContent = String(shares.length);
  els.socialNetworkHint.textContent = signedIn
    ? "先在这里验证加好友、私信和行程分享链路；当前按账号做本地持久化，后续再接云端同步。"
    : "当前展示的是社交模块预览态，登录后会按账号维度保留好友和私信数据。";
  if (els.socialSearchInput.value !== socialSearchQuery) {
    els.socialSearchInput.value = socialSearchQuery;
  }
  els.socialQuickAddBtn.disabled = discovery.length === 0;

  els.socialDiscoveryList.innerHTML = "";
  if (!discovery.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = socialSearchQuery
      ? "没找到新的旅行搭子，试试换个关键词，或者先处理下面已有的好友申请。"
      : "当前没有新的推荐对象了，先从下面的申请和好友列表继续推进。";
    els.socialDiscoveryList.appendChild(empty);
  } else {
    discovery.forEach((profile) => {
      const article = document.createElement("article");
      article.className = "social-card";
      article.innerHTML = `
        <div class="social-card-top">
          <div>
            <h4>${escapeHtml(profile.name)}</h4>
            <p class="muted">${escapeHtml(profile.handle)}${profile.city ? ` · ${escapeHtml(profile.city)}` : ""}</p>
          </div>
          <span class="social-chip">推荐</span>
        </div>
        <p class="panel-note social-card-note">${escapeHtml(profile.note || "适合进一步扩展成你的旅行好友网络。")}</p>
        <div class="social-tag-list">
          ${(profile.tags || []).map((tag) => `<span class="social-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      `;
      const actions = document.createElement("div");
      actions.className = "social-card-actions";
      const requestBtn = document.createElement("button");
      requestBtn.type = "button";
      requestBtn.className = "small";
      requestBtn.textContent = "发送申请";
      requestBtn.addEventListener("click", () => {
        if (!sendFriendRequest(profile.id)) {
          setAccountFeedback(`暂时无法向 ${profile.name} 发起好友申请。`, true);
          return;
        }
        setAccountFeedback(`已向 ${profile.name} 发送好友申请。`);
        renderSocialHub();
      });
      actions.append(requestBtn);
      article.append(actions);
      els.socialDiscoveryList.appendChild(article);
    });
  }

  els.socialRequestList.innerHTML = "";
  if (!pendingRequests.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = "当前没有待处理的好友申请，你可以直接添加新的旅行搭子。";
    els.socialRequestList.appendChild(empty);
  } else {
    pendingRequests.forEach((request) => {
      const isIncoming = request.direction === "incoming";
      const article = document.createElement("article");
      article.className = "social-card";
      article.innerHTML = `
        <div class="social-card-top">
          <div>
            <h4>${escapeHtml(request.profile.name)}</h4>
            <p class="muted">${escapeHtml(request.profile.handle)}${request.profile.city ? ` · ${escapeHtml(request.profile.city)}` : ""}</p>
          </div>
          <span class="social-chip ${isIncoming ? "tone-positive" : ""}">${isIncoming ? "收到申请" : "已发申请"}</span>
        </div>
        <p class="panel-note social-card-note">${escapeHtml(request.message || (isIncoming ? "对方希望先建立好友关系，再一起分享行程。" : "你已经发出好友申请，等待对方回应。"))}</p>
        <div class="social-inline-meta">
          <span>${escapeHtml(formatSocialTime(request.createdAt))}</span>
        </div>
      `;
      const actions = document.createElement("div");
      actions.className = "social-card-actions";
      if (isIncoming) {
        const acceptBtn = document.createElement("button");
        acceptBtn.type = "button";
        acceptBtn.className = "small";
        acceptBtn.textContent = "接受";
        acceptBtn.addEventListener("click", () => {
          const profileId = acceptFriendRequest(request.id);
          if (!profileId) return;
          setAccountFeedback(`已通过 ${request.profile.name} 的好友申请。`);
          renderSocialHub();
        });
        const declineBtn = document.createElement("button");
        declineBtn.type = "button";
        declineBtn.className = "ghost small";
        declineBtn.textContent = "忽略";
        declineBtn.addEventListener("click", () => {
          declineFriendRequest(request.id);
          setAccountFeedback(`已忽略 ${request.profile.name} 的好友申请。`);
          renderSocialHub();
        });
        actions.append(acceptBtn, declineBtn);
      } else {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "ghost small";
        cancelBtn.textContent = "撤回申请";
        cancelBtn.addEventListener("click", () => {
          declineFriendRequest(request.id);
          setAccountFeedback(`已撤回发给 ${request.profile.name} 的好友申请。`);
          renderSocialHub();
        });
        actions.append(cancelBtn);
      }
      article.append(actions);
      els.socialRequestList.appendChild(article);
    });
  }

  els.socialFriendList.innerHTML = "";
  if (!friends.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = "还没有好友，先从上面的推荐中加几个常用搭子，再开始分享你的行程。";
    els.socialFriendList.appendChild(empty);
  } else {
    friends.forEach((friend) => {
      const lastMessage = friend.conversation?.messages?.slice(-1)[0] || null;
      const article = document.createElement("article");
      article.className = "social-card";
      article.innerHTML = `
        <div class="social-card-top">
          <div>
            <h4>${escapeHtml(friend.profile.name)}</h4>
            <p class="muted">${escapeHtml(friend.profile.handle)}${friend.profile.city ? ` · ${escapeHtml(friend.profile.city)}` : ""}</p>
          </div>
          ${friend.conversation?.unreadCount ? `<span class="social-chip tone-unread">${escapeHtml(String(friend.conversation.unreadCount))} 未读</span>` : `<span class="social-chip">好友</span>`}
        </div>
        <p class="panel-note social-card-note">${escapeHtml(lastMessage?.text || friend.profile.note || "已经建立好友关系，可以直接开聊。")}</p>
        <div class="social-tag-list">
          ${(friend.profile.tags || []).map((tag) => `<span class="social-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="social-inline-meta">
          <span>${lastMessage ? `最近互动 ${escapeHtml(formatSocialTime(lastMessage.createdAt))}` : `成为好友 ${escapeHtml(formatSocialTime(friend.connectedAt))}`}</span>
        </div>
      `;
      const actions = document.createElement("div");
      actions.className = "social-card-actions";
      const chatBtn = document.createElement("button");
      chatBtn.type = "button";
      chatBtn.className = "small";
      chatBtn.textContent = "打开私信";
      chatBtn.addEventListener("click", () => {
        openSocialConversation(friend.profileId);
        renderSocialHub();
      });
      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.className = "ghost small";
      shareBtn.textContent = "分享当前行程";
      shareBtn.addEventListener("click", () => {
        const result = sharePlanWithFriend(friend.profileId);
        if (!result.ok) {
          setAccountFeedback(result.message, true);
          return;
        }
        setAccountFeedback(`已把《${result.planTitle}》分享给 ${friend.profile.name}。`);
        renderSocialHub();
      });
      actions.append(chatBtn, shareBtn);
      article.append(actions);
      els.socialFriendList.appendChild(article);
    });
  }

  els.socialConversationTabs.innerHTML = "";
  if (!conversations.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block social-tabs-empty";
    empty.textContent = "好友通过后，会在这里自动生成私信会话。";
    els.socialConversationTabs.appendChild(empty);
  } else {
    conversations.forEach((conversation) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `social-conversation-tab${selectedConversation?.id === conversation.id ? " active" : ""}`;
      button.innerHTML = `
        <span>${escapeHtml(conversation.profile.name)}</span>
        ${conversation.unreadCount ? `<span class="social-tab-count">${escapeHtml(String(conversation.unreadCount))}</span>` : ""}
      `;
      button.addEventListener("click", () => {
        openSocialConversation(conversation.participantId);
        renderSocialHub();
      });
      els.socialConversationTabs.appendChild(button);
    });
  }

  els.socialConversationTitle.textContent = selectedProfile?.name || "先选择一个好友";
  els.socialConversationMeta.textContent = selectedConversation
    ? [selectedProfile?.handle || "", selectedProfile?.city || "", selectedConversation.messages.length ? `最后互动 ${formatSocialTime(selectedConversation.messages.slice(-1)[0].createdAt)}` : ""]
        .filter(Boolean)
        .join(" · ")
    : "好友通过申请后，就能在这里持续沟通和分享路线。";
  els.socialConversationFeed.innerHTML = "";
  if (!selectedConversation) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = "左侧选择一个好友，或者先接受新的好友申请，就能开始私信对话。";
    els.socialConversationFeed.appendChild(empty);
  } else if (!selectedConversation.messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = "这段会话还没有消息，先发一句开场白，或者直接分享当前行程。";
    els.socialConversationFeed.appendChild(empty);
  } else {
    selectedConversation.messages.forEach((message) => {
      const senderName = message.sender === "me"
        ? "我"
        : message.sender === "system"
          ? "系统"
          : selectedProfile?.name || "好友";
      const tone = message.sender === "me"
        ? "outgoing"
        : message.sender === "system"
          ? "system"
          : "incoming";
      const article = document.createElement("article");
      article.className = `social-message social-message-${tone}${message.type === "share" ? " is-share" : ""}`;
      article.innerHTML = `
        <div class="social-message-meta">
          <strong>${escapeHtml(senderName)}</strong>
          <span>${escapeHtml(formatSocialTime(message.createdAt))}</span>
        </div>
        <p>${escapeHtml(message.text || "")}</p>
        ${message.planTitle ? `<div class="social-share-chip">《${escapeHtml(message.planTitle)}》</div>` : ""}
      `;
      els.socialConversationFeed.appendChild(article);
    });
  }

  els.socialMessageInput.disabled = !selectedConversation;
  els.socialSendMessageBtn.disabled = !selectedConversation;
  els.socialSharePlanBtn.disabled = !selectedConversation;
  if (!selectedConversation) {
    els.socialMessageInput.placeholder = "先在左侧打开一个好友会话";
  } else {
    els.socialMessageInput.placeholder = `发给 ${selectedProfile?.name || "好友"} 的消息`;
  }

  els.socialShareFeed.innerHTML = "";
  if (!shares.length) {
    const empty = document.createElement("div");
    empty.className = "empty-block";
    empty.textContent = "还没有分享动态，等你把第一条行程发给好友后，这里会开始沉淀记录。";
    els.socialShareFeed.appendChild(empty);
  } else {
    shares.forEach((share) => {
      const article = document.createElement("article");
      article.className = "social-share-item";
      article.innerHTML = `
        <div class="social-share-top">
          <strong>${escapeHtml(share.direction === "received" ? `${share.profile.name} 分享给你` : `你分享给 ${share.profile.name}`)}</strong>
          <span class="muted">${escapeHtml(formatSocialTime(share.createdAt))}</span>
        </div>
        <p class="social-share-title">《${escapeHtml(share.planTitle || "未命名旅行")}》</p>
        <p class="panel-note social-card-note">${escapeHtml(share.note || "这条分享还没有附加说明。")}</p>
      `;
      els.socialShareFeed.appendChild(article);
    });
  }
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
      renderPlannerDayView();
    });
    els.dayTabs.appendChild(btn);
  });
}

function renderPlannerDayView() {
  renderDays();
  if (activePage === PAGES.planner) renderMap();
}

function renderDays() {
  els.daysContainer.innerHTML = "";
  renderDayTabs();
  if (!state.days.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "先选择行程日期，系统会自动生成天数。";
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
  const primaryDiagnostic = stats.diagnostics?.[0] || null;
  if (primaryDiagnostic && primaryDiagnostic.label !== "待开始") {
    const diagnostic = document.createElement("div");
    diagnostic.className = `day-diagnostic tone-${primaryDiagnostic.tone || "calm"}`;
    diagnostic.innerHTML = `<strong>${escapeHtml(primaryDiagnostic.label)}</strong><span>${escapeHtml(primaryDiagnostic.message)}</span>`;
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
  renderProfileHub();
  renderSocialHub();
  renderPlanList();
  renderPlannerMeta();
  renderPlaces();
  renderPlaceLibraryList();
  renderPlannerDayView();
  saveState(false);
}
