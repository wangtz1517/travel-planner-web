// Bootstrap entry for GoPace frontend.

const originalRenderAuthPanels = renderAuthPanels;
renderAuthPanels = function wrappedRenderAuthPanels() {
  originalRenderAuthPanels();
  const signedIn = Boolean(authSession?.user);
  els.authBadge.textContent = signedIn ? "退出登录" : "游客模式";
  els.authBadge.disabled = !signedIn;
  els.authBadge.classList.toggle("is-actionable", signedIn);
  els.authBadge.title = signedIn ? "点击退出当前账号" : "当前未登录";
  if (!signedIn && hasSupabaseConfig()) {
    els.homeOverviewText.textContent = "现在可以直接以游客模式进入功能页体验路线规划和本地保存；如果需要云端保存、同步和行程库管理，再登录账号即可。";
  }
};

function handleGuestAccess() {
  setAuthFeedback("当前为游客模式。你可以直接体验规划功能并保存到本地，云端保存与行程库功能需要登录后使用。");
  setAccountFeedback("");
  setActivePage(PAGES.planner);
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.authBadge.addEventListener("click", () => {
    if (authSession?.user) handleLogout();
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
      setAccountFeedback("请先登录后再保存新的云端计划。", true);
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
      setAccountFeedback("请先登录后再刷新云端计划。", true);
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
  els.homeOpenLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
  els.homeMiniLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
  els.openLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
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
    if (!window.confirm("确认要清空当前功能页中的规划内容吗？")) return;
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
