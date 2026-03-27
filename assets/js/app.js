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

const HOME_MASTHEAD_CONDENSE_ENTER = 112;
const HOME_MASTHEAD_RESTORE_TRIGGER = 84;
const HOME_MASTHEAD_RESTORE_INTENT_RANGE = 168;
const HOME_MASTHEAD_ANIMATION_MS = 320;
let homeMastheadCondensed = false;
let homeMastheadScrollFrame = 0;
let homeMastheadAnimationTimer = 0;
let homeMastheadAnimating = false;
let homeMastheadLastScrollTop = 0;

function setHomeMastheadCondensed(shouldCondense, options = {}) {
  if (!els.homeMasthead || !els.homePage) return;
  const immediate = Boolean(options.immediate);
  const snapToTop = Boolean(options.snapToTop);
  if (homeMastheadAnimationTimer) {
    window.clearTimeout(homeMastheadAnimationTimer);
    homeMastheadAnimationTimer = 0;
  }
  if (homeMastheadCondensed === shouldCondense) {
    homeMastheadAnimating = false;
    homeMastheadLastScrollTop = els.homePage.scrollTop;
    return;
  }
  homeMastheadCondensed = shouldCondense;
  homeMastheadAnimating = !immediate;
  els.homeMasthead.classList.toggle("is-condensed", shouldCondense);
  if (!shouldCondense && snapToTop) {
    els.homePage.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
  }
  homeMastheadLastScrollTop = els.homePage.scrollTop;
  if (immediate) return;
  homeMastheadAnimationTimer = window.setTimeout(() => {
    homeMastheadAnimating = false;
    homeMastheadAnimationTimer = 0;
    homeMastheadLastScrollTop = els.homePage.scrollTop;
  }, HOME_MASTHEAD_ANIMATION_MS);
}

function syncHomeMastheadScrollState(force = false) {
  if (!els.homeMasthead || !els.homePage) return;
  if (activePage !== PAGES.home) {
    setHomeMastheadCondensed(false, { immediate: true });
    return;
  }
  const scrollTop = els.homePage.scrollTop;
  const delta = scrollTop - homeMastheadLastScrollTop;
  homeMastheadLastScrollTop = scrollTop;

  if (force) {
    setHomeMastheadCondensed(scrollTop > HOME_MASTHEAD_CONDENSE_ENTER, { immediate: true });
    return;
  }

  if (homeMastheadAnimating) return;

  if (!homeMastheadCondensed) {
    if (delta > 0 && scrollTop > HOME_MASTHEAD_CONDENSE_ENTER) {
      setHomeMastheadCondensed(true);
    }
    return;
  }

  if (delta < 0 && scrollTop <= HOME_MASTHEAD_RESTORE_TRIGGER) {
    setHomeMastheadCondensed(false, { snapToTop: true });
  }
}

function scheduleHomeMastheadScrollState() {
  if (homeMastheadScrollFrame) return;
  homeMastheadScrollFrame = window.requestAnimationFrame(() => {
    homeMastheadScrollFrame = 0;
    syncHomeMastheadScrollState();
  });
}

function handleHomePageWheel(event) {
  if (!els.homePage || activePage !== PAGES.home) return;
  if (!homeMastheadCondensed || homeMastheadAnimating) return;
  if (event.deltaY >= -6) return;
  if (els.homePage.scrollTop > HOME_MASTHEAD_RESTORE_INTENT_RANGE) return;
  setHomeMastheadCondensed(false, { snapToTop: true });
}

const originalSetActivePage = setActivePage;
setActivePage = function wrappedSetActivePage(nextPage) {
  originalSetActivePage(nextPage);
  syncHomeMastheadScrollState(true);
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

function openProtectedPageOrPromptLogin(targetPage, featureName) {
  if (!authSession?.user) {
    guideGuestToLogin(featureName);
    return;
  }
  setActivePage(targetPage);
}

function openCommunityOrPromptLogin() {
  openProtectedPageOrPromptLogin(PAGES.community, "社区页");
}

function openProfileOrPromptLogin() {
  openProtectedPageOrPromptLogin(PAGES.profile, "个人信息页");
}

function scrollHomeSectionIntoView(element) {
  if (!element || !els.homePage) return;
  const pageRect = els.homePage.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  const nextScrollTop = els.homePage.scrollTop + (targetRect.top - pageRect.top) - 14;
  els.homePage.scrollTo({
    top: Math.max(0, nextScrollTop),
    behavior: "smooth"
  });
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navPlaceLibraryBtn.addEventListener("click", () => setActivePage(PAGES.placeLibrary));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.navCommunityBtn.addEventListener("click", openCommunityOrPromptLogin);
  els.navProfileBtn.addEventListener("click", openProfileOrPromptLogin);
  els.authBadge.addEventListener("click", () => {
    if (authSession?.user) handleLogout();
  });
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
  els.socialSearchInput.addEventListener("input", () => {
    setSocialSearchQuery(els.socialSearchInput.value);
    renderSocialHub();
  });
  els.socialShowDiscoveryBtn.addEventListener("click", () => {
    socialOperationsTab = "discovery";
    renderSocialHub();
  });
  els.socialShowRequestsBtn.addEventListener("click", () => {
    socialOperationsTab = "requests";
    renderSocialHub();
  });
  els.socialQuickAddBtn.addEventListener("click", () => {
    const nextProfile = getSocialDiscoveryResults()[0];
    if (!nextProfile) {
      setAccountFeedback("当前没有可发送的新好友申请。", true);
      return;
    }
    if (!sendFriendRequest(nextProfile.id)) {
      setAccountFeedback(`暂时无法向 ${nextProfile.name} 发起好友申请。`, true);
      return;
    }
    setAccountFeedback(`已向 ${nextProfile.name} 发送好友申请。`);
    renderSocialHub();
  });
  els.socialSendMessageBtn.addEventListener("click", () => {
    const content = els.socialMessageInput.value.trim();
    if (!content) {
      setAccountFeedback("先输入一条私信内容。", true);
      return;
    }
    if (!sendSocialMessage(content)) {
      setAccountFeedback("先选择一个好友会话，再发送私信。", true);
      return;
    }
    els.socialMessageInput.value = "";
    setAccountFeedback("私信已发送。");
    renderSocialHub();
  });
  els.socialMessageInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    els.socialSendMessageBtn.click();
  });
  els.socialSharePlanBtn.addEventListener("click", () => {
    const conversation = getSelectedSocialConversation();
    if (!conversation) {
      setAccountFeedback("先选择一个好友会话，再分享当前行程。", true);
      return;
    }
    const profile = getSocialProfile(conversation.participantId);
    const result = sharePlanWithFriend(conversation.participantId);
    if (!result.ok) {
      setAccountFeedback(result.message, true);
      return;
    }
    setAccountFeedback(`已把《${result.planTitle}》分享给 ${profile.name}。`);
    renderSocialHub();
  });
  els.goPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.homeStageLibraryAction.addEventListener("click", () => setActivePage(PAGES.placeLibrary));
  els.homeStagePlannerAction.addEventListener("click", () => setActivePage(PAGES.planner));
  els.homeStageFootprintAction.addEventListener("click", () => scrollHomeSectionIntoView(els.footprintCard));
  els.homeMiniLibraryBtn.addEventListener("click", openProfileOrPromptLogin);
  els.homePage.addEventListener("scroll", scheduleHomeMastheadScrollState, { passive: true });
  els.homePage.addEventListener("wheel", handleHomePageWheel, { passive: true });
  els.plannerPlaceSearchInput.addEventListener("input", () => {
    plannerPlaceSearchQuery = els.plannerPlaceSearchInput.value.trim();
    renderPlaces();
  });
  els.plannerPlaceCategorySelect.addEventListener("change", () => {
    plannerPlaceFilter = els.plannerPlaceCategorySelect.value;
    renderPlaces();
  });
  [els.tripName, els.travelerCount].forEach((input) => {
    input.addEventListener("change", () => {
      syncTripInputsToState();
      saveState();
      renderPlannerMeta();
    });
  });
  els.tripDateRangeBtn.addEventListener("click", openTripDateRangePicker);
  els.tripDatePicker.addEventListener("change", handleTripDateRangePick);
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
    schedulePlannerPlaceMasonry();
    schedulePlanCardMasonry();
  });
}

async function bootstrap() {
  bindEvents();
  renderLocalOpenNotice();
  recalculateAllDays(false);
  setAuthView(authView);
  renderAll();
  setActivePage(activePage);
  syncHomeMastheadScrollState(true);
  await initializeSupabase();
}

bootstrap().catch((error) => {
  console.error(error);
  setAuthFeedback(`初始化失败：${error.message}`, true);
});
