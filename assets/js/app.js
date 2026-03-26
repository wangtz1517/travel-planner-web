// Bootstrap entry for GoPace frontend.

const originalRenderAuthPanels = renderAuthPanels;
renderAuthPanels = function wrappedRenderAuthPanels() {
  originalRenderAuthPanels();
  const signedIn = Boolean(authSession?.user);
  els.authBadge.textContent = signedIn ? "退出登录" : "游客模式";
  els.authBadge.disabled = !signedIn;
  els.authBadge.classList.toggle("is-actionable", signedIn);
  els.authBadge.title = signedIn ? "点击退出当前账号" : "当前正在游客模式";
  if (!signedIn && hasSupabaseConfig()) {
    els.homeOverviewText.textContent = "游客模式下可以先整理地点库、体验规划和本地保存；登录后可自动同步草稿到云端，并解锁个人页、归档和跨设备管理。";
  }
};

function handleGuestAccess() {
  setAuthFeedback("已进入游客模式。你可以先做路线规划并保存在本机，登录后会自动把当前草稿同步到云端。");
  setAccountFeedback("");
  setActivePage(PAGES.placeLibrary);
}

function guideGuestToLogin(featureName) {
  setAuthView(AUTH_VIEWS.login);
  setActivePage(PAGES.home);
  setAuthFeedback(`游客模式下可先体验路线规划和本地保存，${featureName}需要登录后使用；登录后会自动同步当前草稿。`);
  setAccountFeedback(`要使用${featureName}，请先登录账号。`);
}

function openProfileOrPromptLogin() {
  if (!authSession?.user) {
    guideGuestToLogin("个人信息页");
    return;
  }
  setActivePage(PAGES.profile);
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navPlaceLibraryBtn.addEventListener("click", () => setActivePage(PAGES.placeLibrary));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.navProfileBtn.addEventListener("click", openProfileOrPromptLogin);
  els.authBadge.addEventListener("click", () => {
    if (authSession?.user) handleLogout();
  });
  els.placeLibraryOpenPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.placeLibraryOpenProfileBtn.addEventListener("click", openProfileOrPromptLogin);
  els.placeFilterAllBtn.addEventListener("click", () => {
    placeLibraryFilter = "all";
    renderPlaceLibraryList();
  });
  els.placeFilterPlayBtn.addEventListener("click", () => {
    placeLibraryFilter = "play";
    renderPlaceLibraryList();
  });
  els.placeFilterFoodBtn.addEventListener("click", () => {
    placeLibraryFilter = "food";
    renderPlaceLibraryList();
  });
  els.placeFilterStayBtn.addEventListener("click", () => {
    placeLibraryFilter = "stay";
    renderPlaceLibraryList();
  });
  els.placeFilterOtherBtn.addEventListener("click", () => {
    placeLibraryFilter = "other";
    renderPlaceLibraryList();
  });
  els.placeLibrarySearchInput.addEventListener("input", () => {
    placeLibrarySearchQuery = els.placeLibrarySearchInput.value.trim();
    renderPlaceLibraryList();
  });
  els.showRegisterBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.register));
  els.showLoginBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.login));
  els.registerForm.addEventListener("submit", handleRegister);
  els.loginForm.addEventListener("submit", handleLogin);
  els.enterGuestModeBtn.addEventListener("click", handleGuestAccess);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.createBlankPlanBtn.addEventListener("click", createBlankPlan);
  els.saveCurrentAsNewBtn.addEventListener("click", () => {
    if (!authSession?.user) {
      guideGuestToLogin("云端另存为新计划");
      return;
    }
    saveCurrentAsNewPlan().catch((error) => {
      setAccountFeedback(`另存为新计划失败：${error.message}`, true);
    });
  });
  els.planSearchInput.addEventListener("input", () => {
    planSearchQuery = els.planSearchInput.value.trim();
    renderPlanList();
  });
  els.planSortSelect.addEventListener("change", () => {
    planSort = els.planSortSelect.value;
    renderPlanList();
  });
  els.planFilterAllBtn.addEventListener("click", () => {
    planFilter = "all";
    renderPlanList();
  });
  els.planFilterActiveBtn.addEventListener("click", () => {
    planFilter = "active";
    renderPlanList();
  });
  els.planFilterArchivedBtn.addEventListener("click", () => {
    planFilter = "archived";
    renderPlanList();
  });
  els.planFilterCurrentBtn.addEventListener("click", () => {
    planFilter = "current";
    renderPlanList();
  });
  els.refreshPlansBtn.addEventListener("click", async () => {
    if (!authSession?.user) {
      guideGuestToLogin("云端计划刷新");
      return;
    }
    setAccountFeedback("正在刷新云端计划...");
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("云端计划已刷新。");
  });
  els.goPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.homeOpenPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.homeOpenProfileBtn.addEventListener("click", openProfileOrPromptLogin);
  els.homeMiniLibraryBtn.addEventListener("click", openProfileOrPromptLogin);
  els.openPlaceLibraryBtn.addEventListener("click", () => setActivePage(PAGES.placeLibrary));
  els.openProfileBtn.addEventListener("click", openProfileOrPromptLogin);
  els.plannerOpenPlaceLibraryBtn.addEventListener("click", () => setActivePage(PAGES.placeLibrary));
  els.plannerPlaceSearchInput.addEventListener("input", () => {
    plannerPlaceSearchQuery = els.plannerPlaceSearchInput.value.trim();
    renderPlaces();
  });
  els.plannerPlaceCategorySelect.addEventListener("change", () => {
    plannerPlaceFilter = els.plannerPlaceCategorySelect.value;
    renderPlaces();
  });
  [els.tripName, els.travelerCount, els.startDate, els.endDate].forEach((input) => {
    input.addEventListener("change", () => {
      syncTripInputsToState();
      saveState();
      renderPlannerMeta();
    });
  });
  els.generateDaysBtn.addEventListener("click", generateDays);
  els.saveBtn.addEventListener("click", () => saveState());
  els.saveCloudBtn.addEventListener("click", savePlanToCloud);
  els.exportBtn.addEventListener("click", () => window.print());
  els.resetBtn.addEventListener("click", () => {
    if (!window.confirm("确认要清空当前规划页中的内容吗？")) return;
    state = createDefaultState();
    selectedDayId = "";
    setCurrentPlanMeta("", "");
    saveState(false);
    renderAll();
  });
  els.mapDaySelect.addEventListener("change", () => renderMap());
  els.refreshMapBtn.addEventListener("click", () => renderMap());
  els.searchKeyword.addEventListener("input", debounceSearch);
  els.searchKeyword.addEventListener("focus", () => {
    if (suggestions.length) renderSuggestions();
  });
  els.searchKeyword.addEventListener("keydown", (event) => {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
      renderSuggestions();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
      renderSuggestions();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = suggestions[Math.max(0, activeSuggestionIndex)] || suggestions[0];
      addPlaceFromSuggestion(target);
    }
    if (event.key === "Escape") clearSuggestions();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-input-wrap")) clearSuggestions();
  });
  window.addEventListener("resize", () => {
    schedulePlaceLibraryMasonry();
  });
}

async function bootstrap() {
  bindEvents();
  renderLocalOpenNotice();
  recalculateAllDays(false);
  setAuthView(authView);
  renderAll();
  setActivePage(activePage);
  await initializeSupabase();
}

bootstrap().catch((error) => {
  console.error(error);
  setAuthFeedback(`初始化失败：${error.message}`, true);
});
