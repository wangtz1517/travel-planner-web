const STORAGE_KEY = "travel_planner_v9";
const PAGE_STORAGE_KEY = "gopace_active_page";
const AUTH_VIEW_STORAGE_KEY = "gopace_auth_view";
const CURRENT_PLAN_STORAGE_KEY = "gopace_current_plan_id";

const PLACE_TYPES = ["起点", "终点", "景点", "途径点", "饭店", "酒店", "交通枢纽", "购物", "休闲", "备用"];
const TRANSPORT_MODES = [
  { value: "none", label: "无 / 同地点", color: "#8a8f98", speed: 0 },
  { value: "walk", label: "步行", color: "#2f7f6d", speed: 5 },
  { value: "taxi", label: "打车", color: "#d94841", speed: 28 },
  { value: "drive", label: "自驾", color: "#ef8f00", speed: 40 },
  { value: "transit", label: "公交 / 地铁", color: "#3b82f6", speed: 22 },
  { value: "bike", label: "骑行", color: "#8b5cf6", speed: 14 },
  { value: "train", label: "火车", color: "#4d6bfe", speed: 180 },
  { value: "flight", label: "飞机", color: "#0f766e", speed: 650 },
  { value: "ship", label: "轮船", color: "#2563eb", speed: 35 },
  { value: "other", label: "其他", color: "#64748b", speed: 20 }
];
const STAY_OPTIONS = [0, 15, 30, 45, 60, 90, 120, 180, 240, 360, 480];
const ROUTE_SERVICE_MODES = new Set(["walk", "taxi", "drive", "transit", "bike"]);
const SUGGESTION_LIMIT = 10;
const PAGES = { home: "home", library: "library", planner: "planner" };
const AUTH_VIEWS = { register: "register", login: "login" };

const els = {
  homeGrid: document.getElementById("homeGrid"),
  accountCard: document.getElementById("accountCard"),
  brandBlock: document.getElementById("brandBlock"),
  brandPopover: document.getElementById("brandPopover"),
  brandProfileName: document.getElementById("brandProfileName"),
  brandProfileStatus: document.getElementById("brandProfileStatus"),
  brandProfileEmail: document.getElementById("brandProfileEmail"),
  brandProfilePlanCount: document.getElementById("brandProfilePlanCount"),
  brandOpenPlannerBtn: document.getElementById("brandOpenPlannerBtn"),
  brandLogoutBtn: document.getElementById("brandLogoutBtn"),
  navHomeBtn: document.getElementById("navHomeBtn"),
  navLibraryBtn: document.getElementById("navLibraryBtn"),
  navPlannerBtn: document.getElementById("navPlannerBtn"),
  authBadge: document.getElementById("authBadge"),
  homeAuthBadge: document.getElementById("homeAuthBadge"),
  homePage: document.getElementById("homePage"),
  libraryPage: document.getElementById("libraryPage"),
  plannerPage: document.getElementById("plannerPage"),
  supabaseConfigNotice: document.getElementById("supabaseConfigNotice"),
  authGuestPanel: document.getElementById("authGuestPanel"),
  authUserPanel: document.getElementById("authUserPanel"),
  showRegisterBtn: document.getElementById("showRegisterBtn"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  registerForm: document.getElementById("registerForm"),
  loginForm: document.getElementById("loginForm"),
  registerDisplayName: document.getElementById("registerDisplayName"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  registerSubmitBtn: document.getElementById("registerSubmitBtn"),
  loginSubmitBtn: document.getElementById("loginSubmitBtn"),
  authFeedback: document.getElementById("authFeedback"),
  accountFeedback: document.getElementById("accountFeedback"),
  profileDisplayName: document.getElementById("profileDisplayName"),
  profileEmail: document.getElementById("profileEmail"),
  profilePlanCount: document.getElementById("profilePlanCount"),
  profileState: document.getElementById("profileState"),
  goPlannerBtn: document.getElementById("goPlannerBtn"),
  homeOverviewBadge: document.getElementById("homeOverviewBadge"),
  homeOverviewText: document.getElementById("homeOverviewText"),
  homeOpenPlannerBtn: document.getElementById("homeOpenPlannerBtn"),
  homeOpenLibraryBtn: document.getElementById("homeOpenLibraryBtn"),
  homeMiniLibraryBtn: document.getElementById("homeMiniLibraryBtn"),
  homeMetricPlans: document.getElementById("homeMetricPlans"),
  homeMetricArchived: document.getElementById("homeMetricArchived"),
  homeMetricCurrent: document.getElementById("homeMetricCurrent"),
  homePlanSpotlight: document.getElementById("homePlanSpotlight"),
  homeSpotlightStatus: document.getElementById("homeSpotlightStatus"),
  homeSpotlightTitle: document.getElementById("homeSpotlightTitle"),
  homeSpotlightText: document.getElementById("homeSpotlightText"),
  homeSpotlightMeta: document.getElementById("homeSpotlightMeta"),
  homeRecentPlans: document.getElementById("homeRecentPlans"),
  homeRecentPlansEmpty: document.getElementById("homeRecentPlansEmpty"),
  footprintCard: document.getElementById("footprintCard"),
  footprintBadge: document.getElementById("footprintBadge"),
  footprintIntro: document.getElementById("footprintIntro"),
  footprintPlanCount: document.getElementById("footprintPlanCount"),
  footprintProvinceCount: document.getElementById("footprintProvinceCount"),
  footprintCityCount: document.getElementById("footprintCityCount"),
  footprintMapStage: document.getElementById("footprintMapStage"),
  footprintMapEmpty: document.getElementById("footprintMapEmpty"),
  footprintProvinceMeta: document.getElementById("footprintProvinceMeta"),
  footprintProvinceTitle: document.getElementById("footprintProvinceTitle"),
  footprintProvinceList: document.getElementById("footprintProvinceList"),
  footprintProvinceEmpty: document.getElementById("footprintProvinceEmpty"),
  footprintRankingList: document.getElementById("footprintRankingList"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshPlansBtn: document.getElementById("refreshPlansBtn"),
  createBlankPlanBtn: document.getElementById("createBlankPlanBtn"),
  saveCurrentAsNewBtn: document.getElementById("saveCurrentAsNewBtn"),
  planSearchInput: document.getElementById("planSearchInput"),
  planSortSelect: document.getElementById("planSortSelect"),
  planFilterAllBtn: document.getElementById("planFilterAllBtn"),
  planFilterActiveBtn: document.getElementById("planFilterActiveBtn"),
  planFilterArchivedBtn: document.getElementById("planFilterArchivedBtn"),
  planFilterCurrentBtn: document.getElementById("planFilterCurrentBtn"),
  planManagerSummary: document.getElementById("planManagerSummary"),
  planStatAll: document.getElementById("planStatAll"),
  planStatActive: document.getElementById("planStatActive"),
  planStatArchived: document.getElementById("planStatArchived"),
  planStatCurrent: document.getElementById("planStatCurrent"),
  libraryPlanList: document.getElementById("libraryPlanList"),
  libraryPlanEmpty: document.getElementById("libraryPlanEmpty"),
  homePlanList: document.getElementById("libraryPlanList"),
  homePlanEmpty: document.getElementById("libraryPlanEmpty"),
  currentPlanLabel: document.getElementById("currentPlanLabel"),
  saveCloudBtn: document.getElementById("saveCloudBtn"),
  openLibraryBtn: document.getElementById("openLibraryBtn"),
  openHomeBtn: document.getElementById("openLibraryBtn"),
  cloudStatus: document.getElementById("cloudStatus"),
  tripName: document.getElementById("tripName"),
  travelerCount: document.getElementById("travelerCount"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  generateDaysBtn: document.getElementById("generateDaysBtn"),
  saveBtn: document.getElementById("saveBtn"),
  exportBtn: document.getElementById("exportBtn"),
  resetBtn: document.getElementById("resetBtn"),
  saveStatus: document.getElementById("saveStatus"),
  searchKeyword: document.getElementById("searchKeyword"),
  suggestions: document.getElementById("suggestions"),
  placeCount: document.getElementById("placeCount"),
  placePool: document.getElementById("placePool"),
  dayTabs: document.getElementById("dayTabs"),
  daysContainer: document.getElementById("daysContainer"),
  mapDaySelect: document.getElementById("mapDaySelect"),
  refreshMapBtn: document.getElementById("refreshMapBtn"),
  mapLegend: document.getElementById("mapLegend"),
  mapStage: document.getElementById("mapStage"),
  mapEmptyState: document.getElementById("mapEmptyState"),
  localOpenNotice: document.getElementById("localOpenNotice"),
  routeSummary: document.getElementById("routeSummary"),
  placeCardTemplate: document.getElementById("placeCardTemplate"),
  dayCardTemplate: document.getElementById("dayCardTemplate"),
  itineraryItemTemplate: document.getElementById("itineraryItemTemplate"),
  segmentTemplate: document.getElementById("segmentTemplate")
};

let state = loadState();
let selectedDayId = state.days[0]?.id || "";
let activePage = loadStoredValue(PAGE_STORAGE_KEY, PAGES.home);
let authView = loadStoredValue(AUTH_VIEW_STORAGE_KEY, AUTH_VIEWS.register);
let currentPlanId = loadStoredValue(CURRENT_PLAN_STORAGE_KEY, "");
let suggestions = [];
let activeSuggestionIndex = -1;
let autocompleteTimer = null;
let dragState = null;
let mapInstance = null;
let mapLoadedKey = "";
let mapOverlays = [];
let autocompleteService = null;
let placeSearchService = null;
let districtSearchService = null;
let routeServices = {};
let footprintMapInstance = null;
let footprintProvinceLayer = null;
let footprintMarkers = [];
let footprintRenderToken = 0;
const districtLookupCache = new Map();
let footprintInfoWindow = null;
let activeFootprintProvinceCode = "";
let hoveredFootprintProvinceCode = "";
let footprintProvinceDataMap = new Map();
let footprintProvinceCodes = new Set();
let footprintLayerClickHandler = null;
let footprintLayerHoverHandler = null;
let footprintLayerMouseOutHandler = null;
const PROVINCE_NAME_MAP = {
  "110000": "北京市",
  "120000": "天津市",
  "130000": "河北省",
  "140000": "山西省",
  "150000": "内蒙古自治区",
  "210000": "辽宁省",
  "220000": "吉林省",
  "230000": "黑龙江省",
  "310000": "上海市",
  "320000": "江苏省",
  "330000": "浙江省",
  "340000": "安徽省",
  "350000": "福建省",
  "360000": "江西省",
  "370000": "山东省",
  "410000": "河南省",
  "420000": "湖北省",
  "430000": "湖南省",
  "440000": "广东省",
  "450000": "广西壮族自治区",
  "460000": "海南省",
  "500000": "重庆市",
  "510000": "四川省",
  "520000": "贵州省",
  "530000": "云南省",
  "540000": "西藏自治区",
  "610000": "陕西省",
  "620000": "甘肃省",
  "630000": "青海省",
  "640000": "宁夏回族自治区",
  "650000": "新疆维吾尔自治区",
  "710000": "台湾省",
  "810000": "香港特别行政区",
  "820000": "澳门特别行政区"
};
let supabaseClient = null;
let authSession = null;
let authProfile = null;
let myPlans = [];
let currentPlanStatus = "";
let planSearchQuery = "";
let planFilter = "all";
let planSort = "updated_desc";

function loadStoredValue(key, fallback = "") {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
}

function persistStoredValue(key, value) {
  try {
    if (value === "" || value == null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures and keep the app usable.
  }
}

function getTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultState() {
  const today = getTodayIso();
  return {
    trip: { name: "", travelers: 2, startDate: today, endDate: today },
    places: [],
    days: []
  };
}

function renderLocalOpenNotice() {
  if (window.location.protocol !== "file:") {
    els.localOpenNotice.hidden = true;
    els.localOpenNotice.innerHTML = "";
    return;
  }
  els.localOpenNotice.hidden = false;
  els.localOpenNotice.innerHTML = '<strong>当前是直接打开 index.html。</strong> 地图、地点搜索和路线服务可能无法正常使用。请先在项目目录执行 <code>npm.cmd run dev</code>，再通过 <code>http://travel-planner.localhost:8080</code> 访问。';
}

function ensureTripDates(trip) {
  const today = getTodayIso();
  const next = { ...(trip || {}) };
  next.startDate = next.startDate || today;
  next.endDate = next.endDate || next.startDate || today;
  return next;
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeState(raw) {
  const base = createDefaultState();
  const next = { ...base, ...(raw || {}) };
  next.trip = ensureTripDates({ ...base.trip, ...(next.trip || {}) });
  next.places = Array.isArray(next.places) ? next.places.map((place) => ({
    id: place.id || uid("place"),
    name: place.name || "未命名地点",
    city: place.city || "",
    address: place.address || "",
    lng: typeof place.lng === "number" ? place.lng : null,
    lat: typeof place.lat === "number" ? place.lat : null,
    poiId: place.poiId || ""
  })) : [];
  next.days = Array.isArray(next.days) ? next.days.map((day, dayIndex) => ({
    id: day.id || uid("day"),
    title: day.title || `Day ${dayIndex + 1}`,
    date: day.date || "",
    items: Array.isArray(day.items) ? day.items.map((item, itemIndex) => ({
      id: item.id || uid("item"),
      placeId: item.placeId,
      type: item.type || (itemIndex === 0 ? "起点" : "景点"),
      stayMinutes: Number(item.stayMinutes || 0),
      startTime: item.startTime || (itemIndex === 0 ? "09:00" : ""),
      notes: item.notes || "",
      transportFromPrev: itemIndex === 0 ? "none" : (item.transportFromPrev || "walk"),
      segment: item.segment || null,
      arrivalTime: item.arrivalTime || "",
      leaveTime: item.leaveTime || ""
    })) : []
  })) : [];
  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultState();
  }
}

function getConfig() {
  const appConfig = window.APP_CONFIG || {};
  return {
    amapKey: appConfig.amapKey || "",
    amapSecurityJsCode: appConfig.amapSecurityJsCode || "",
    defaultCity: APP_CONFIG.defaultCity || "全国",
    supabaseUrl: APP_CONFIG.supabaseUrl || "",
    supabaseAnonKey: APP_CONFIG.supabaseAnonKey || ""
  };
}

function applyAmapSecurityConfig() {
  const { amapSecurityJsCode } = getConfig();
  if (amapSecurityJsCode) window._AMapSecurityConfig = { securityJsCode: amapSecurityJsCode };
}

function syncTripInputsToState() {
  const safeTrip = ensureTripDates(state.trip);
  if (!els.startDate.value) els.startDate.value = safeTrip.startDate;
  if (!els.endDate.value) els.endDate.value = safeTrip.endDate;
  state.trip = {
    name: els.tripName.value.trim(),
    travelers: Math.max(1, Number(els.travelerCount.value || 1)),
    startDate: els.startDate.value || safeTrip.startDate,
    endDate: els.endDate.value || els.startDate.value || safeTrip.endDate
  };
}

function syncStateToTripInputs() {
  state.trip = ensureTripDates(state.trip);
  els.tripName.value = state.trip.name || "";
  els.travelerCount.value = state.trip.travelers || 1;
  els.startDate.value = state.trip.startDate;
  els.endDate.value = state.trip.endDate;
}

function saveState(showStatus = true) {
  syncTripInputsToState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (showStatus) {
    els.saveStatus.textContent = `已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  }
}

function hasSupabaseConfig() {
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function setAuthFeedback(message = "", isError = false) {
  if (!els.authFeedback) return;
  els.authFeedback.textContent = message;
  els.authFeedback.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function setAccountFeedback(message = "", isError = false) {
  if (!els.accountFeedback) return;
  els.accountFeedback.textContent = message;
  els.accountFeedback.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function setCloudStatus(message, isError = false) {
  if (!els.cloudStatus) return;
  els.cloudStatus.textContent = message;
  els.cloudStatus.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function setCurrentPlanMeta(planId = "", status = "") {
  currentPlanId = planId || "";
  currentPlanStatus = status || "";
  persistStoredValue(CURRENT_PLAN_STORAGE_KEY, currentPlanId);
  renderPlannerMeta();
  renderPlanList();
  renderAuthPanels();
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

function formatPlanStatus(status) {
  if (status === "archived") return "已归档";
  if (status === "active") return "进行中";
  return "草稿";
}

function formatPlanDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "未设置日期";
  if (startDate && endDate && startDate !== endDate) return `${startDate} 至 ${endDate}`;
  return startDate || endDate || "未设置日期";
}

function normalizePlanText(value) {
  return String(value || "").trim().toLowerCase();
}

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
  els.planStatAll.textContent = String(allCount);
  els.planStatActive.textContent = String(activeCount);
  els.planStatArchived.textContent = String(archivedCount);
  els.planStatCurrent.textContent = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId)?.title || "已绑定") : "无";
}

function setActivePage(nextPage) {
  activePage = nextPage === PAGES.planner ? PAGES.planner : PAGES.home;
  persistStoredValue(PAGE_STORAGE_KEY, activePage);
  const isHome = activePage === PAGES.home;
  els.homePage.hidden = !isHome;
  els.plannerPage.hidden = isHome;
  els.navHomeBtn.classList.toggle("active", isHome);
  els.navPlannerBtn.classList.toggle("active", !isHome);
  if (!isHome) {
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

function renderAuthPanels() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  els.homeGrid.classList.toggle("signed-in", signedIn);
  els.accountCard.hidden = signedIn;
  els.supabaseConfigNotice.hidden = configured;
  els.supabaseConfigNotice.textContent = configured
    ? ""
    : "Supabase 尚未配置。请先在 assets/js/config.local.js 中补充 supabaseUrl 和 supabaseAnonKey。";
  els.authGuestPanel.hidden = signedIn;
  els.authUserPanel.hidden = !signedIn;
  els.authBadge.textContent = signedIn ? "已登录" : "未登录";
  els.homeAuthBadge.textContent = signedIn ? "账号已连接" : (configured ? "未登录" : "待配置");
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
    els.brandProfileEmail.textContent = configured ? "登录后可查看当前账号信息" : "请先配置 Supabase 后再使用账号能力";
    els.brandProfilePlanCount.textContent = "0";
    els.brandOpenPlannerBtn.textContent = "进入功能页";
    return;
  }
  const displayName = authProfile?.display_name || authSession.user.user_metadata?.display_name || authSession.user.email?.split("@")[0] || "旅行者";
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

function renderPlanList() {
  els.homePlanList.innerHTML = "";
  renderPlanStats();
  renderPlanFilters();
  const plans = getFilteredPlans();
  const hasPlans = Array.isArray(plans) && plans.length > 0;
  els.homePlanEmpty.hidden = hasPlans;
  els.homePlanEmpty.textContent = myPlans.length
    ? "当前筛选条件下没有匹配的旅行计划。你可以切换筛选、清空搜索，或者新建一份计划。"
    : "当前还没有符合条件的旅行计划。你可以先去功能页规划，再保存到云端。";
  els.planManagerSummary.textContent = `当前显示 ${plans.length} 条计划，共 ${myPlans.length} 条`;
  if (!hasPlans) return;
  plans.forEach((plan) => {
    const article = document.createElement("article");
    article.className = "plan-card";
    const statusClass = plan.status === "archived" ? " archived" : "";
    const isCurrent = currentPlanId === plan.id;
    const noteText = isCurrent ? "这份计划当前正绑定在功能页中，你继续编辑后可以直接覆盖保存到云端。" : "你可以从这里打开计划、继续编辑，或进行归档管理。";
    article.innerHTML = `
      <div class="plan-card-top">
        <div class="plan-main">
          <h3>${escapeHtml(plan.title || "未命名旅行")}</h3>
          <div class="plan-card-meta">
            <span>${escapeHtml(formatPlanDateRange(plan.start_date, plan.end_date))}</span>
            <span>${escapeHtml(`人数 ${plan.travelers || 1}`)}</span>
            <span>${escapeHtml(`更新于 ${new Date(plan.updated_at).toLocaleString("zh-CN")}`)}</span>
            ${plan.created_at ? `<span>${escapeHtml(`创建于 ${new Date(plan.created_at).toLocaleDateString("zh-CN")}`)}</span>` : ""}
          </div>
        </div>
        <span class="plan-status${statusClass}">${escapeHtml(isCurrent ? "当前编辑中" : formatPlanStatus(plan.status))}</span>
      </div>
      <p class="plan-card-notes">${escapeHtml(noteText)}</p>
      <div class="plan-actions"></div>
    `;
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
    els.homePlanList.append(article);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "未设置日期";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", weekday: "short" });
}

function formatMinutes(minutes) {
  const value = Math.round(Number(minutes || 0));
  if (value <= 0) return "0 分钟";
  if (value >= 60) {
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
  }
  return `${value} 分钟`;
}

function formatDistance(km) {
  const value = Number(km || 0);
  if (!Number.isFinite(value) || value <= 0) return "0 m";
  return value >= 1 ? `${value.toFixed(1)} km` : `${Math.round(value * 1000)} m`;
}

function formatClock(value) {
  return value || "--:--";
}

function getModeConfig(modeValue) {
  return TRANSPORT_MODES.find((mode) => mode.value === modeValue) || TRANSPORT_MODES[0];
}

function getPlaceById(placeId) {
  return state.places.find((place) => place.id === placeId) || null;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSupabaseClient() {
  if (supabaseClient || !hasSupabaseConfig() || !window.supabase?.createClient) return supabaseClient;
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return supabaseClient;
}

async function initializeSupabase() {
  const client = getSupabaseClient();
  renderAuthPanels();
  renderPlannerMeta();
  renderPlanList();
  if (!client) return;
  const { data, error } = await client.auth.getSession();
  if (error) {
    setAuthFeedback(`登录态读取失败：${error.message}`, true);
  }
  authSession = data?.session || null;
  await refreshAccountData();
  client.auth.onAuthStateChange((_event, session) => {
    authSession = session || null;
    refreshAccountData().catch((authError) => {
      setAccountFeedback(`账号状态刷新失败：${authError.message}`, true);
    });
  });
}

async function refreshAccountData() {
  authProfile = null;
  if (!authSession?.user) {
    myPlans = [];
    renderAuthPanels();
    renderPlanList();
    renderPlannerMeta();
    return;
  }
  await Promise.all([loadProfile(), loadMyPlans()]);
  renderAuthPanels();
  renderPlanList();
  renderPlannerMeta();
}

async function loadProfile() {
  if (!authSession?.user || !supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, email, display_name, avatar_url, created_at, updated_at")
    .eq("id", authSession.user.id)
    .maybeSingle();
  if (error) {
    setAccountFeedback(`读取个人资料失败：${error.message}`, true);
    return null;
  }
  authProfile = data || null;
  return authProfile;
}

async function loadMyPlans() {
  if (!authSession?.user || !supabaseClient) {
    myPlans = [];
    return myPlans;
  }
  const { data, error } = await supabaseClient
    .from("trip_plans")
    .select("id, title, status, start_date, end_date, travelers, snapshot, updated_at, created_at, archived_at")
    .order("updated_at", { ascending: false });
  if (error) {
    setAccountFeedback(`读取旅行计划失败：${error.message}`, true);
    myPlans = [];
    return myPlans;
  }
  myPlans = data || [];
  return myPlans;
}

async function handleRegister(event) {
  event.preventDefault();
  if (!hasSupabaseConfig()) {
    setAuthFeedback("请先配置 Supabase URL 和 anon key。", true);
    return;
  }
  const email = els.registerEmail.value.trim();
  const password = els.registerPassword.value;
  const displayName = els.registerDisplayName.value.trim();
  if (!email || !password) {
    setAuthFeedback("请先填写邮箱和密码。", true);
    return;
  }
  els.registerSubmitBtn.disabled = true;
  setAuthFeedback("正在注册账号...");
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    if (error) throw error;
    if (data.session) {
      setAuthFeedback("注册成功，已自动登录。");
      els.registerForm.reset();
    } else {
      setAuthFeedback("注册成功，请先到邮箱完成确认，然后再登录。");
      setAuthView(AUTH_VIEWS.login);
    }
  } catch (error) {
    setAuthFeedback(`注册失败：${error.message}`, true);
  } finally {
    els.registerSubmitBtn.disabled = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!hasSupabaseConfig()) {
    setAuthFeedback("请先配置 Supabase URL 和 anon key。", true);
    return;
  }
  const email = els.loginEmail.value.trim();
  const password = els.loginPassword.value;
  if (!email || !password) {
    setAuthFeedback("请先填写邮箱和密码。", true);
    return;
  }
  els.loginSubmitBtn.disabled = true;
  setAuthFeedback("正在登录...");
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setAuthFeedback("登录成功。");
    els.loginForm.reset();
  } catch (error) {
    setAuthFeedback(`登录失败：${error.message}`, true);
  } finally {
    els.loginSubmitBtn.disabled = false;
  }
}

async function handleLogout() {
  if (!supabaseClient) return;
  setAccountFeedback("正在退出登录...");
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    setCurrentPlanMeta("", "");
    setAccountFeedback("已退出登录。");
  } catch (error) {
    setAccountFeedback(`退出失败：${error.message}`, true);
  }
}

async function savePlanToCloud() {
  syncTripInputsToState();
  saveState(false);
  if (!supabaseClient || !authSession?.user) {
    setCloudStatus("请先登录后再保存到云端。", true);
    setActivePage(PAGES.home);
    return;
  }
  els.saveCloudBtn.disabled = true;
  const previousPlanIds = new Set(myPlans.map((plan) => plan.id));
  setCloudStatus("正在保存到云端...");
  const payload = {
    owner_id: authSession.user.id,
    title: state.trip.name?.trim() || "未命名旅行",
    status: currentPlanStatus === "archived" ? "archived" : "active",
    start_date: state.trip.startDate || null,
    end_date: state.trip.endDate || null,
    travelers: Math.max(1, Number(state.trip.travelers || 1)),
    snapshot: state,
    archived_at: currentPlanStatus === "archived" ? new Date().toISOString() : null
  };
  try {
    let result;
    if (currentPlanId) {
      result = await supabaseClient
        .from("trip_plans")
        .update(payload)
        .eq("id", currentPlanId)
        .select("id, status")
        .maybeSingle();
    } else {
      result = await supabaseClient
        .from("trip_plans")
        .insert(payload)
        .select("id, status");
    }
    if (result.error) throw result.error;
    const savedPlan = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!savedPlan?.id) throw new Error("云端返回了空结果，请稍后重试");
    setCurrentPlanMeta(savedPlan.id, savedPlan.status || payload.status);
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setCloudStatus(`云端已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
    setAccountFeedback("旅行计划已同步到云端。");
  } catch (error) {
    setCloudStatus(`云端保存失败：${error.message}`, true);
  } finally {
    els.saveCloudBtn.disabled = false;
  }
}

async function loadPlanFromCloud(planId) {
  if (!supabaseClient || !authSession?.user) {
    setAccountFeedback("请先登录后再打开云端计划。", true);
    return;
  }
  setAccountFeedback("正在读取云端计划...");
  try {
    const { data, error } = await supabaseClient
      .from("trip_plans")
      .select("id, status, snapshot")
      .eq("id", planId)
      .single();
    if (error) throw error;
    state = normalizeState(data.snapshot || {});
    selectedDayId = state.days[0]?.id || "";
    setCurrentPlanMeta(data.id, data.status || "");
    saveState(false);
    renderAll();
    setAccountFeedback("已加载云端旅行计划。");
    setActivePage(PAGES.planner);
  } catch (error) {
    setAccountFeedback(`读取计划失败：${error.message}`, true);
  }
}

async function archivePlan(planId) {
  if (!supabaseClient || !authSession?.user) {
    setAccountFeedback("请先登录后再归档计划。", true);
    return;
  }
  try {
    const { error } = await supabaseClient
      .from("trip_plans")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", planId);
    if (error) throw error;
    if (currentPlanId === planId) setCurrentPlanMeta(planId, "archived");
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("计划已归档。");
  } catch (error) {
    setAccountFeedback(`归档失败：${error.message}`, true);
  }
}

async function restorePlan(planId) {
  if (!supabaseClient || !authSession?.user) {
    setAccountFeedback("请先登录后再取消归档。", true);
    return;
  }
  try {
    const { error } = await supabaseClient
      .from("trip_plans")
      .update({ status: "active", archived_at: null })
      .eq("id", planId);
    if (error) throw error;
    if (currentPlanId === planId) setCurrentPlanMeta(planId, "active");
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("计划已恢复到进行中。");
  } catch (error) {
    setAccountFeedback(`取消归档失败：${error.message}`, true);
  }
}

async function deletePlan(planId) {
  if (!supabaseClient || !authSession?.user) {
    setAccountFeedback("请先登录后再删除计划。", true);
    return;
  }
  const targetPlan = myPlans.find((plan) => plan.id === planId);
  const confirmed = window.confirm(`确定删除计划“${targetPlan?.title || "未命名旅行"}”吗？此操作不可恢复。`);
  if (!confirmed) return;
  try {
    const { error } = await supabaseClient
      .from("trip_plans")
      .delete()
      .eq("id", planId);
    if (error) throw error;
    if (currentPlanId === planId) setCurrentPlanMeta("", "");
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("计划已删除。");
  } catch (error) {
    setAccountFeedback(`删除失败：${error.message}`, true);
  }
}

async function duplicatePlan(planId) {
  if (!supabaseClient || !authSession?.user) {
    setAccountFeedback("请先登录后再复制计划。", true);
    return;
  }
  try {
    const { data, error } = await supabaseClient
      .from("trip_plans")
      .select("title, start_date, end_date, travelers, snapshot")
      .eq("id", planId)
      .single();
    if (error) throw error;
    const copyPayload = {
      owner_id: authSession.user.id,
      title: `${data.title || "未命名旅行"} - 副本`,
      status: "draft",
      start_date: data.start_date,
      end_date: data.end_date,
      travelers: data.travelers || 1,
      snapshot: data.snapshot || {}
    };
    const { error: insertError } = await supabaseClient
      .from("trip_plans")
      .insert(copyPayload);
    if (insertError) throw insertError;
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("已复制为一份新的旅行计划。");
  } catch (error) {
    setAccountFeedback(`复制失败：${error.message}`, true);
  }
}

function createBlankPlan() {
  state = createDefaultState();
  selectedDayId = "";
  setCurrentPlanMeta("", "");
  saveState(false);
  renderAll();
  setActivePage(PAGES.planner);
  setAccountFeedback("已创建一份新的本地空白计划。");
}

async function saveCurrentAsNewPlan() {
  setCurrentPlanMeta("", "");
  currentPlanStatus = "";
  await savePlanToCloud();
  await loadMyPlans();
  renderPlanList();
  renderAuthPanels();
}

function parseClock(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function addMinutesToClock(clock, minutes) {
  const base = parseClock(clock);
  if (base == null) return "";
  const total = base + Number(minutes || 0);
  const normalized = ((total % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mins = String(normalized % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

function createTripItem(placeId, day) {
  const isFirst = day.items.length === 0;
  return {
    id: uid("item"),
    placeId,
    type: isFirst ? "起点" : "景点",
    stayMinutes: 60,
    startTime: isFirst ? "09:00" : "",
    notes: "",
    transportFromPrev: isFirst ? "none" : "walk",
    segment: null,
    arrivalTime: "",
    leaveTime: ""
  };
}

function generateDays() {
  syncTripInputsToState();
  const { startDate, endDate } = state.trip;
  if (!startDate || !endDate) {
    alert("请先填写开始日期和结束日期。");
    return;
  }
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start > end) {
    alert("日期范围无效，请重新检查。");
    return;
  }

  const nextDays = [];
  for (let current = new Date(start), index = 1; current <= end; current.setDate(current.getDate() + 1), index += 1) {
    const iso = current.toISOString().slice(0, 10);
    const existing = state.days.find((day) => day.date === iso);
    nextDays.push(normalizeState({ days: [existing || { id: uid("day"), title: `Day ${index}`, date: iso, items: [] }] }).days[0]);
  }
  state.days = nextDays;
  selectedDayId = state.days[0]?.id || "";
  recalculateAllDays(false);
  renderAll();
}

function addPlaceToDay(placeId, dayId, insertIndex = null) {
  const day = state.days.find((item) => item.id === dayId);
  if (!day || !getPlaceById(placeId)) return;
  const newItem = createTripItem(placeId, day);
  if (insertIndex == null || insertIndex < 0 || insertIndex > day.items.length) day.items.push(newItem);
  else day.items.splice(insertIndex, 0, newItem);
  recalculateDay(day.id);
}

function moveTripItem(fromDayId, itemId, toDayId, insertIndex = null) {
  const fromDay = state.days.find((day) => day.id === fromDayId);
  const toDay = state.days.find((day) => day.id === toDayId);
  if (!fromDay || !toDay) return;
  const currentIndex = fromDay.items.findIndex((item) => item.id === itemId);
  if (currentIndex < 0) return;
  const [item] = fromDay.items.splice(currentIndex, 1);
  let targetIndex = insertIndex == null ? toDay.items.length : insertIndex;
  if (fromDayId === toDayId && currentIndex < targetIndex) targetIndex -= 1;
  targetIndex = Math.max(0, Math.min(targetIndex, toDay.items.length));
  toDay.items.splice(targetIndex, 0, item);
  recalculateMultipleDays([fromDayId, toDayId]);
}
function removePlace(placeId) {
  state.places = state.places.filter((place) => place.id !== placeId);
  state.days.forEach((day) => {
    day.items = day.items.filter((item) => item.placeId !== placeId);
  });
  recalculateAllDays();
}

function removeItem(dayId, itemId) {
  const day = state.days.find((entry) => entry.id === dayId);
  if (!day) return;
  day.items = day.items.filter((item) => item.id !== itemId);
  recalculateDay(dayId);
}

function updateItem(dayId, itemId, patch) {
  const day = state.days.find((entry) => entry.id === dayId);
  const item = day?.items.find((entry) => entry.id === itemId);
  if (!day || !item) return;
  Object.assign(item, patch);
  recalculateDay(dayId);
}

function getDistanceKm(fromPlace, toPlace) {
  if (!fromPlace || !toPlace) return 0;
  if (![fromPlace.lat, fromPlace.lng, toPlace.lat, toPlace.lng].every((value) => typeof value === "number")) return 0;
  const toRad = (degree) => degree * Math.PI / 180;
  const earth = 6371;
  const dLat = toRad(toPlace.lat - fromPlace.lat);
  const dLng = toRad(toPlace.lng - fromPlace.lng);
  const lat1 = toRad(fromPlace.lat);
  const lat2 = toRad(toPlace.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateSegment(prevPlace, nextPlace, modeValue) {
  const mode = getModeConfig(modeValue);
  const distanceKm = getDistanceKm(prevPlace, nextPlace);
  if (mode.value === "none") return { distanceKm: 0, minutes: 0 };
  if (!distanceKm) return { distanceKm: 0, minutes: mode.speed ? 15 : 0 };
  const minutes = mode.speed ? Math.max(1, Math.round(distanceKm / mode.speed * 60)) : 0;
  return { distanceKm, minutes };
}

function updateDerivedTypeHints(day) {
  if (!day.items.length) return;
  day.items.forEach((item, index) => {
    if (index === 0) item.type = "起点";
    else if (index === day.items.length - 1 && day.items.length > 1) item.type = "终点";
    else if (["起点", "终点"].includes(item.type)) item.type = "景点";
    if (index === 0) item.transportFromPrev = "none";
  });
}

function recalculateDay(dayId, shouldRender = true) {
  const day = state.days.find((entry) => entry.id === dayId);
  if (!day) return;
  updateDerivedTypeHints(day);
  day.items.forEach((item, index) => {
    const isFirst = index === 0;
    const isLast = index === day.items.length - 1;
    if (isFirst) {
      item.transportFromPrev = "none";
      item.segment = null;
      item.arrivalTime = item.startTime || "";
      item.leaveTime = item.startTime || "";
      return;
    }
    const prevItem = day.items[index - 1];
    const prevPlace = getPlaceById(prevItem.placeId);
    const nextPlace = getPlaceById(item.placeId);
    const segment = estimateSegment(prevPlace, nextPlace, item.transportFromPrev || "walk");
    item.segment = segment;
    item.arrivalTime = addMinutesToClock(prevItem.leaveTime || prevItem.startTime, segment.minutes);
    item.leaveTime = isLast ? item.arrivalTime : addMinutesToClock(item.arrivalTime, item.stayMinutes);
  });
  saveState(false);
  if (shouldRender) renderAll();
}

function recalculateMultipleDays(dayIds) {
  [...new Set(dayIds)].forEach((dayId) => recalculateDay(dayId, false));
  renderAll();
}

function recalculateAllDays(shouldRender = true) {
  state.days.forEach((day) => recalculateDay(day.id, false));
  if (shouldRender) renderAll();
}

function getDayStats(day) {
  let stayMinutes = 0;
  let travelMinutes = 0;
  let distanceKm = 0;
  day.items.forEach((item, index) => {
    if (index > 0 && index < day.items.length - 1) stayMinutes += Number(item.stayMinutes || 0);
    if (item.segment) {
      travelMinutes += Number(item.segment.minutes || 0);
      distanceKm += Number(item.segment.distanceKm || 0);
    }
  });
  return { stayMinutes, travelMinutes, distanceKm };
}

function getDropIndex(dropZone, clientY) {
  const items = [...dropZone.querySelectorAll(".itinerary-item")].filter((node) => !node.classList.contains("dragging"));
  let index = items.length;
  for (let i = 0; i < items.length; i += 1) {
    const rect = items[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      index = i;
      break;
    }
  }
  return index;
}

function showDropMarker(dropZone, index) {
  clearDropMarkers();
  const marker = document.createElement("div");
  marker.className = "drop-marker";
  const items = [...dropZone.querySelectorAll(".itinerary-item")];
  if (index >= items.length) dropZone.appendChild(marker);
  else dropZone.insertBefore(marker, items[index]);
}

function clearDropMarkers() {
  document.querySelectorAll(".drop-marker").forEach((node) => node.remove());
}

function attachDropZoneEvents(dropZone, dayId) {
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
    showDropMarker(dropZone, getDropIndex(dropZone, event.clientY));
  });
  dropZone.addEventListener("dragleave", (event) => {
    if (!dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove("drag-over");
      clearDropMarkers();
    }
  });
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    const index = getDropIndex(dropZone, event.clientY);
    dropZone.classList.remove("drag-over");
    clearDropMarkers();
    if (!dragState) return;
    if (dragState.type === "place") addPlaceToDay(dragState.placeId, dayId, index);
    if (dragState.type === "itinerary-item") moveTripItem(dragState.fromDayId, dragState.itemId, dayId, index);
  });
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

function clearSuggestions() {
  suggestions = [];
  activeSuggestionIndex = -1;
  els.suggestions.classList.remove("has-items");
  els.suggestions.innerHTML = "";
}

function addPlaceFromSuggestion(item) {
  if (!item) return;
  const exists = state.places.some((place) => (place.poiId && item.id && place.poiId === item.id) || place.name === item.name);
  if (exists) {
    els.searchKeyword.value = "";
    clearSuggestions();
    return;
  }
  state.places.push({
    id: uid("place"),
    name: item.name || "未命名地点",
    city: item.city || item.adcode || "",
    address: item.address || item.district || "",
    lng: item.location?.lng ?? null,
    lat: item.location?.lat ?? null,
    poiId: item.id || ""
  });
  saveState();
  renderPlaces();
  els.searchKeyword.value = "";
  clearSuggestions();
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

function ensureAmapLoaded() {
  const { amapKey } = getConfig();
  if (!amapKey) return Promise.reject(new Error("未配置高德 Key"));
  if (window.AMap && mapLoadedKey === amapKey) return Promise.resolve(window.AMap);
  if (window.__amapLoadingPromise && mapLoadedKey === amapKey) return window.__amapLoadingPromise;
  applyAmapSecurityConfig();
  mapLoadedKey = amapKey;
  window.__amapLoadingPromise = new Promise((resolve, reject) => {
    const callbackName = `__amapInit_${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.AMap);
    };
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(amapKey)}&plugin=AMap.AutoComplete,AMap.PlaceSearch,AMap.Walking,AMap.Driving,AMap.Transfer,AMap.Riding,AMap.DistrictSearch&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("高德地图脚本加载失败"));
    document.head.appendChild(script);
  });
  return window.__amapLoadingPromise;
}

async function ensureMapReady() {
  const AMapRef = await ensureAmapLoaded();
  if (!mapInstance) {
    mapInstance = new AMapRef.Map(els.mapStage, { zoom: 11, resizeEnable: true });
    window.addEventListener("resize", () => mapInstance?.resize());
  }
  if (!autocompleteService) autocompleteService = new AMapRef.AutoComplete({ city: getConfig().defaultCity || "全国", citylimit: false });
  if (!placeSearchService) placeSearchService = new AMapRef.PlaceSearch({ city: getConfig().defaultCity || "全国", citylimit: false, pageSize: SUGGESTION_LIMIT, pageIndex: 1 });
  return AMapRef;
}
function getRouteService(AMapRef, modeValue) {
  if (routeServices[modeValue]) return routeServices[modeValue];
  if (modeValue === "walk") routeServices[modeValue] = new AMapRef.Walking();
  if (modeValue === "drive" || modeValue === "taxi") routeServices[modeValue] = new AMapRef.Driving();
  if (modeValue === "bike") routeServices[modeValue] = new AMapRef.Riding();
  if (modeValue === "transit") routeServices[modeValue] = new AMapRef.Transfer({ city: getConfig().defaultCity || "全国" });
  return routeServices[modeValue] || null;
}

function createStraightPath(prevPlace, nextPlace) {
  return [[prevPlace.lng, prevPlace.lat], [nextPlace.lng, nextPlace.lat]];
}

function normalizePathPoints(path) {
  const points = [];
  (path || []).forEach((point) => {
    if (Array.isArray(point) && point.length >= 2) points.push(point);
    else if (point && typeof point.lng === "number" && typeof point.lat === "number") points.push([point.lng, point.lat]);
    else if (point && typeof point.getLng === "function" && typeof point.getLat === "function") points.push([point.getLng(), point.getLat()]);
  });
  return points;
}

function extractTransitPath(plan) {
  const points = [];
  (plan?.segments || []).forEach((segment) => {
    normalizePathPoints(segment?.walking?.steps?.flatMap((step) => step.path || []) || []).forEach((point) => points.push(point));
    (segment?.bus?.buslines || []).forEach((line) => {
      normalizePathPoints(line.path || []).forEach((point) => points.push(point));
    });
    normalizePathPoints(segment?.railway?.path || []).forEach((point) => points.push(point));
  });
  return points;
}

function searchServiceRoute(service, start, end) {
  return new Promise((resolve, reject) => {
    service.search(start, end, (status, result) => {
      if (status !== "complete") {
        reject(new Error("route search failed"));
        return;
      }
      resolve(result);
    });
  });
}

async function getRoutePath(AMapRef, prevPlace, nextPlace, modeValue) {
  if (!ROUTE_SERVICE_MODES.has(modeValue)) return { path: createStraightPath(prevPlace, nextPlace), dashed: true };
  const start = new AMapRef.LngLat(prevPlace.lng, prevPlace.lat);
  const end = new AMapRef.LngLat(nextPlace.lng, nextPlace.lat);
  try {
    const service = getRouteService(AMapRef, modeValue);
    if (!service) throw new Error("service missing");
    const result = await searchServiceRoute(service, start, end);
    if (modeValue === "walk") {
      const route = result.routes?.[0];
      const path = normalizePathPoints(route?.steps?.flatMap((step) => step.path || []) || []);
      return { path: path.length ? path : createStraightPath(prevPlace, nextPlace), dashed: false };
    }
    if (modeValue === "drive" || modeValue === "taxi") {
      const route = result.routes?.[0];
      const path = normalizePathPoints(route?.steps?.flatMap((step) => step.path || []) || []);
      return { path: path.length ? path : createStraightPath(prevPlace, nextPlace), dashed: false };
    }
    if (modeValue === "bike") {
      const route = result.routes?.[0];
      const path = normalizePathPoints(route?.rides?.flatMap((ride) => ride.path || []) || []);
      return { path: path.length ? path : createStraightPath(prevPlace, nextPlace), dashed: false };
    }
    if (modeValue === "transit") {
      const path = extractTransitPath(result.plans?.[0]);
      return { path: path.length ? path : createStraightPath(prevPlace, nextPlace), dashed: false };
    }
  } catch {
    return { path: createStraightPath(prevPlace, nextPlace), dashed: false };
  }
  return { path: createStraightPath(prevPlace, nextPlace), dashed: false };
}

function clearMapOverlays() {
  if (!mapInstance) return;
  mapOverlays.forEach((overlay) => mapInstance.remove(overlay));
  mapOverlays = [];
}

function createMarkerContent(index, kind) {
  const bg = kind === "start" ? "#2f7f6d" : kind === "end" ? "#d94841" : "#bf5a2b";
  return `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:#fff;display:grid;place-items:center;font-size:13px;font-weight:700;border:2px solid #fff;box-shadow:0 6px 12px rgba(0,0,0,0.15);">${index}</div>`;
}

async function renderMap() {
  if (activePage !== PAGES.planner || els.plannerPage.hidden) return;
  renderLegend();
  renderRouteSummary();
  const day = state.days.find((entry) => entry.id === els.mapDaySelect.value);
  if (!day || !day.items.length) {
    els.mapEmptyState.textContent = "选择一天后，将地点拖入中间行程，这里会显示地图。";
    els.mapEmptyState.classList.add("is-visible");
    clearMapOverlays();
    return;
  }
  try {
    const AMapRef = await ensureMapReady();
    clearMapOverlays();
    const points = day.items.map((item, index) => ({ item, index, place: getPlaceById(item.placeId) })).filter((entry) => entry.place && typeof entry.place.lng === "number" && typeof entry.place.lat === "number");
    if (!points.length) {
      els.mapEmptyState.textContent = "当前行程缺少可定位坐标，地图无法标点。";
      els.mapEmptyState.classList.add("is-visible");
      return;
    }
    els.mapEmptyState.classList.remove("is-visible");
    for (const { place, index } of points) {
      const marker = new AMapRef.Marker({
        position: [place.lng, place.lat],
        content: createMarkerContent(index + 1, index === 0 ? "start" : index === points.length - 1 ? "end" : "mid"),
        offset: new AMapRef.Pixel(-14, -14),
        title: place.name
      });
      mapOverlays.push(marker);
      mapInstance.add(marker);
    }
    for (let i = 1; i < points.length; i += 1) {
      const current = points[i];
      const prev = points[i - 1];
      const mode = getModeConfig(current.item.transportFromPrev);
      const route = await getRoutePath(AMapRef, prev.place, current.place, mode.value);
      const polyline = new AMapRef.Polyline({
        path: route.path,
        strokeColor: mode.color,
        strokeWeight: 5,
        strokeStyle: route.dashed || ["train", "flight", "ship", "other"].includes(mode.value) ? "dashed" : "solid",
        lineJoin: "round",
        lineCap: "round"
      });
      mapOverlays.push(polyline);
      mapInstance.add(polyline);
    }
    mapInstance.setFitView(mapOverlays, false, [50, 50, 50, 50]);
    mapInstance.resize();
  } catch (error) {
    els.mapEmptyState.textContent = `地图加载失败：${error.message}`;
    els.mapEmptyState.classList.add("is-visible");
  }
}

async function searchPlaces(keyword) {
  const trimmed = keyword.trim();
  if (!trimmed) {
    clearSuggestions();
    return;
  }
  try {
    await ensureMapReady();
  } catch {
    clearSuggestions();
    return;
  }
  if (autocompleteService?.search) {
    autocompleteService.search(trimmed, (status, result) => {
      if (status === "complete") {
        const tips = (result.tips || []).filter((item) => item.name);
        suggestions = tips.slice(0, SUGGESTION_LIMIT).map((item) => ({
          id: item.id || item.uid || "",
          name: item.name,
          address: item.address || "",
          city: item.city || "",
          district: item.district || "",
          type: item.type || "地点",
          location: item.location ? { lng: item.location.lng, lat: item.location.lat } : null
        }));
        activeSuggestionIndex = suggestions.length ? 0 : -1;
        renderSuggestions();
        return;
      }
      fallbackPlaceSearch(trimmed);
    });
  } else {
    fallbackPlaceSearch(trimmed);
  }
}

function fallbackPlaceSearch(keyword) {
  if (!placeSearchService?.search) {
    clearSuggestions();
    return;
  }
  placeSearchService.search(keyword, (status, result) => {
    if (status !== "complete") {
      clearSuggestions();
      return;
    }
    const pois = result.poiList?.pois || [];
    suggestions = pois.slice(0, SUGGESTION_LIMIT).map((poi) => ({
      id: poi.id || "",
      name: poi.name,
      address: poi.address || "",
      city: poi.cityname || "",
      district: poi.adname || "",
      type: poi.type || "地点",
      location: poi.location ? { lng: poi.location.lng, lat: poi.location.lat } : null
    }));
    activeSuggestionIndex = suggestions.length ? 0 : -1;
    renderSuggestions();
  });
}

function debounceSearch() {
  clearTimeout(autocompleteTimer);
  autocompleteTimer = setTimeout(() => searchPlaces(els.searchKeyword.value), 220);
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.showRegisterBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.register));
  els.showLoginBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.login));
  els.registerForm.addEventListener("submit", handleRegister);
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.brandOpenPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.brandLogoutBtn.addEventListener("click", handleLogout);
  els.createBlankPlanBtn.addEventListener("click", createBlankPlan);
  els.saveCurrentAsNewBtn.addEventListener("click", () => {
    if (!authSession?.user) {
      setAccountFeedback("请先登录后再另存为新计划。", true);
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
      setAccountFeedback("请先登录后再刷新计划列表。", true);
      return;
    }
    setAccountFeedback("正在刷新计划列表...");
    await loadMyPlans();
    renderPlanList();
    renderAuthPanels();
    setAccountFeedback("计划列表已刷新。");
  });
  els.goPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.openHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
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
    if (!window.confirm("确定清空本次旅行规划吗？")) return;
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
  els.homeMetricCurrent.textContent = currentPlanId ? currentTitle : "无";
}

function renderHomeOverview() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  if (!signedIn) {
    els.homeOverviewBadge.textContent = configured ? "访客模式" : "待配置";
    els.homeOverviewText.textContent = configured
      ? "先注册或登录账号，再进入功能页规划旅程，并在行程库中长期保存、归档和编辑你的旅行计划。"
      : "先完成 Supabase 配置，随后即可启用注册登录、云端保存和行程库管理。";
    return;
  }
  const currentTitle = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId)?.title || "当前计划") : "未绑定";
  els.homeOverviewBadge.textContent = "已登录";
  els.homeOverviewText.textContent = `当前账号已接入云端行程库，共有 ${myPlans.length} 条计划，当前绑定为 ${currentTitle}。你可以继续去功能页编辑，或在行程库统一管理历史计划。`;
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

function renderAuthPanels() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
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
  if (!hasPlans) return;
  plans.forEach((plan) => {
    const article = document.createElement("article");
    article.className = "plan-card";
    const statusClass = plan.status === "archived" ? " archived" : "";
    const isCurrent = currentPlanId === plan.id;
    const noteText = isCurrent
      ? "这条计划当前已经与功能页绑定，你可以直接继续编辑并再次保存到云端。"
      : "可以把这条计划重新载入到功能页继续编辑，也可以复制、归档或删除。";
    article.innerHTML = `
      <div class="plan-card-top">
        <div class="plan-main">
          <h3>${escapeHtml(plan.title || "未命名旅行")}</h3>
          <div class="plan-card-meta">
            <span>${escapeHtml(formatPlanDateRange(plan.start_date, plan.end_date))}</span>
            <span>${escapeHtml(`出行人数 ${plan.travelers || 1}`)}</span>
            <span>${escapeHtml(`最近更新 ${new Date(plan.updated_at).toLocaleString("zh-CN")}`)}</span>
            ${plan.created_at ? `<span>${escapeHtml(`创建于 ${new Date(plan.created_at).toLocaleDateString("zh-CN")}`)}</span>` : ""}
          </div>
        </div>
        <span class="plan-status${statusClass}">${escapeHtml(isCurrent ? "当前绑定" : formatPlanStatus(plan.status))}</span>
      </div>
      <p class="plan-card-notes">${escapeHtml(noteText)}</p>
      <div class="plan-actions"></div>
    `;
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
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.showRegisterBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.register));
  els.showLoginBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.login));
  els.registerForm.addEventListener("submit", handleRegister);
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.brandOpenPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.brandLogoutBtn.addEventListener("click", handleLogout);
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

function getPlanSnapshotSummary(plan) {
  const snapshot = plan?.snapshot || {};
  const days = Array.isArray(snapshot.days) ? snapshot.days : [];
  const places = Array.isArray(snapshot.places) ? snapshot.places : [];
  const dayCount = days.length || (plan?.start_date && plan?.end_date ? 1 : 0);
  const itemCount = days.reduce((total, day) => total + (Array.isArray(day.items) ? day.items.length : 0), 0);
  return {
    dayCount,
    placeCount: places.length,
    itemCount
  };
}

function buildPlanMetaList(plan) {
  const meta = [];
  meta.push(formatPlanDateRange(plan.start_date, plan.end_date));
  meta.push(`出行人数 ${plan.travelers || 1}`);
  if (plan.updated_at) meta.push(`最近更新 ${new Date(plan.updated_at).toLocaleString("zh-CN")}`);
  if (plan.created_at) meta.push(`创建于 ${new Date(plan.created_at).toLocaleDateString("zh-CN")}`);
  return meta;
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
  els.homeMetricCurrent.textContent = currentPlanId ? currentTitle : "无";
}

function renderHomeRecentPlans() {
  if (!els.homeRecentPlans) return;
  els.homeRecentPlans.innerHTML = "";
  const plans = [...myPlans].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);
  els.homeRecentPlansEmpty.hidden = plans.length > 0;
  if (!plans.length) return;
  plans.forEach((plan) => {
    const summary = getPlanSnapshotSummary(plan);
    const item = document.createElement("article");
    item.className = `mini-plan-item${currentPlanId === plan.id ? " is-current" : ""}`;
    item.innerHTML = `
      <div class="mini-plan-top">
        <strong class="mini-plan-title">${escapeHtml(plan.title || "未命名旅行")}</strong>
        <span class="plan-status${plan.status === "archived" ? " archived" : ""}">${escapeHtml(currentPlanId === plan.id ? "当前绑定" : formatPlanStatus(plan.status))}</span>
      </div>
      <div class="plan-card-meta">
        <span>${escapeHtml(formatPlanDateRange(plan.start_date, plan.end_date))}</span>
        <span>${escapeHtml(`${summary.dayCount || 0} 天`)}</span>
        <span>${escapeHtml(`${summary.placeCount || 0} 个地点`)}</span>
      </div>
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost small";
    button.textContent = "继续编辑";
    button.addEventListener("click", () => loadPlanFromCloud(plan.id));
    item.append(button);
    els.homeRecentPlans.append(item);
  });
}

function getArchivedPlans() {
  return myPlans.filter((plan) => plan.status === "archived");
}

function extractFootprintPlaces() {
  return getArchivedPlans()
    .flatMap((plan) => Array.isArray(plan?.snapshot?.places) ? plan.snapshot.places : [])
    .filter((place) => place && (place.city || place.address || place.name))
    .filter((place) => typeof place.lng === "number" && typeof place.lat === "number");
}

function hideFootprintEmptyState() {
  els.footprintMapEmpty.classList.add("is-hidden");
}

function showFootprintEmptyState(message, badge = "等待点亮") {
  els.footprintBadge.textContent = badge;
  els.footprintMapEmpty.textContent = message;
  els.footprintMapEmpty.classList.remove("is-hidden");
  clearFootprintMarkers();
  if (footprintProvinceLayer) {
    footprintProvinceLayer.setMap(null);
    footprintProvinceLayer = null;
  }
}

function resetFootprintStats() {
  els.footprintPlanCount.textContent = "0";
  els.footprintProvinceCount.textContent = "0";
  els.footprintCityCount.textContent = "0";
}

async function ensureFootprintMapReady() {
  const AMapRef = await ensureAmapLoaded();
  if (!footprintMapInstance) {
    footprintMapInstance = new AMapRef.Map(els.footprintMapStage, {
      viewMode: "2D",
      zoom: 4.2,
      center: [104.5, 35.2],
      mapStyle: "amap://styles/whitesmoke",
      dragEnable: true,
      zoomEnable: true,
      doubleClickZoom: false,
      keyboardEnable: false,
      jogEnable: false
    });
    window.addEventListener("resize", () => footprintMapInstance?.resize());
  }
  if (!districtSearchService) {
    districtSearchService = new AMapRef.DistrictSearch({
      level: "city",
      subdistrict: 0,
      extensions: "base"
    });
  }
  return AMapRef;
}

function normalizeProvinceAdcode(adcode) {
  const raw = String(adcode || "");
  if (!/^\d{6}$/.test(raw)) return "";
  return `${raw.slice(0, 2)}0000`;
}

function searchDistrict(keyword) {
  return new Promise((resolve) => {
    if (!districtSearchService || !keyword) {
      resolve(null);
      return;
    }
    districtSearchService.search(keyword, (status, result) => {
      if (status !== "complete") {
        resolve(null);
        return;
      }
      const first = result?.districtList?.[0] || null;
      resolve(first);
    });
  });
}

async function resolvePlaceDistrict(place) {
  const searchTerms = [place.city, place.address, place.name].map((item) => String(item || "").trim()).filter(Boolean);
  for (const term of searchTerms) {
    if (districtLookupCache.has(term)) return districtLookupCache.get(term);
    const district = await searchDistrict(term);
    if (district?.adcode) {
      const normalized = {
        cityName: district.name || term,
        cityAdcode: String(district.adcode),
        provinceAdcode: normalizeProvinceAdcode(district.adcode)
      };
      districtLookupCache.set(term, normalized);
      return normalized;
    }
  }
  return null;
}

function clearFootprintMarkers() {
  if (!footprintMapInstance || !footprintMarkers.length) return;
  footprintMarkers.forEach((marker) => footprintMapInstance.remove(marker));
  footprintMarkers = [];
}

function createFootprintProvinceLayer(AMapRef, provinceCodes) {
  return new AMapRef.DistrictLayer.Country({
    zIndex: 8,
    depth: 1,
    SOC: "CHN",
    styles: {
      "nation-stroke": "rgba(59, 89, 68, 0.22)",
      "coastline-stroke": "rgba(59, 89, 68, 0.12)",
      "province-stroke": "rgba(59, 89, 68, 0.28)",
      fill: (props) => {
        const provinceCode = normalizeProvinceAdcode(props.adcode_pro || props.adcode);
        return provinceCodes.has(provinceCode)
          ? "rgba(59, 89, 68, 0.58)"
          : "rgba(214, 173, 120, 0.14)";
      }
    }
  });
}

async function renderFootprintMap() {
  const currentToken = ++footprintRenderToken;
  resetFootprintStats();
  const archivedPlans = getArchivedPlans();
  els.footprintPlanCount.textContent = String(archivedPlans.length);
  if (!authSession?.user) {
    showFootprintEmptyState("登录后可在这里查看你已经走过的城市和省份。", "访客模式");
    return;
  }
  if (!archivedPlans.length) {
    showFootprintEmptyState("先把旅行计划归档，归档后的城市才会沉淀到足迹地图里。", "等待点亮");
    return;
  }
  if (!getConfig().amapKey) {
    showFootprintEmptyState("当前还没有配置高德地图 Key，足迹地图暂时无法渲染。", "待配置");
    return;
  }
  const places = extractFootprintPlaces();
  if (!places.length) {
    showFootprintEmptyState("已归档计划里还没有可识别的城市坐标，保存带地点信息的行程后这里会自动点亮。", "数据不足");
    return;
  }

  try {
    const AMapRef = await ensureFootprintMapReady();
    if (currentToken !== footprintRenderToken) return;

    const resolvedCityMap = new Map();
    for (const place of places) {
      const resolved = await resolvePlaceDistrict(place);
      if (currentToken !== footprintRenderToken) return;
      const cityKey = resolved?.cityAdcode || `${place.city || place.address || place.name}_${place.lng}_${place.lat}`;
      if (!resolvedCityMap.has(cityKey)) {
        resolvedCityMap.set(cityKey, {
          place,
          resolved
        });
      }
    }

    const provinceCodes = new Set(
      [...resolvedCityMap.values()]
        .map((entry) => entry.resolved?.provinceAdcode)
        .filter(Boolean)
    );

    els.footprintProvinceCount.textContent = String(provinceCodes.size);
    els.footprintCityCount.textContent = String(resolvedCityMap.size);
    els.footprintBadge.textContent = provinceCodes.size ? "足迹已点亮" : "等待点亮";
    hideFootprintEmptyState();

    if (footprintProvinceLayer) {
      footprintProvinceLayer.setMap(null);
      footprintProvinceLayer = null;
    }
    footprintProvinceLayer = createFootprintProvinceLayer(AMapRef, provinceCodes);
    footprintProvinceLayer.setMap(footprintMapInstance);

    clearFootprintMarkers();
    footprintMarkers = [...resolvedCityMap.values()].map(({ place, resolved }) => new AMapRef.Marker({
      position: [place.lng, place.lat],
      offset: new AMapRef.Pixel(-6, -6),
      anchor: "center",
      title: resolved?.cityName || place.city || place.name || "已走过的城市",
      content: '<span class="visited-city-dot"></span>'
    }));
    footprintMarkers.forEach((marker) => footprintMapInstance.add(marker));
    footprintMapInstance.setZoomAndCenter(4.2, [104.5, 35.2]);
    footprintMapInstance.resize();
  } catch (error) {
    showFootprintEmptyState(`足迹地图加载失败：${error.message}`, "加载失败");
  }
}

function renderHomeOverview() {
  const configured = hasSupabaseConfig();
  const signedIn = Boolean(authSession?.user);
  if (!signedIn) {
    els.homeOverviewBadge.textContent = configured ? "访客模式" : "待配置";
    els.homeOverviewText.textContent = configured
      ? "先注册或登录账号，再进入功能页规划旅程，并在行程库中长期保存、归档和编辑你的旅行计划。"
      : "先完成 Supabase 配置，随后即可启用注册登录、云端保存和行程库管理。";
    if (els.homeSpotlightStatus) {
      els.homeSpotlightStatus.textContent = "未绑定";
      els.homeSpotlightStatus.classList.remove("archived");
      els.homeSpotlightTitle.textContent = "还没有当前计划";
      els.homeSpotlightText.textContent = "创建或载入一条计划后，这里会显示当前绑定计划的摘要。";
      els.homeSpotlightMeta.innerHTML = "<span>等待开始</span>";
    }
    renderHomeRecentPlans();
    renderFootprintMap().catch(() => {});
    return;
  }
  const currentPlan = currentPlanId ? (myPlans.find((plan) => plan.id === currentPlanId) || null) : null;
  els.homeOverviewBadge.textContent = "已登录";
  els.homeOverviewText.textContent = `当前账号已接入云端行程库，共有 ${myPlans.length} 条计划。你可以继续去功能页编辑，也可以在行程库统一管理和归档历史计划。`;
  if (currentPlan && els.homeSpotlightStatus) {
    const summary = getPlanSnapshotSummary(currentPlan);
    els.homeSpotlightStatus.textContent = currentPlan.status === "archived" ? "已归档" : "当前绑定";
    els.homeSpotlightStatus.classList.toggle("archived", currentPlan.status === "archived");
    els.homeSpotlightTitle.textContent = currentPlan.title || "未命名旅行";
    els.homeSpotlightText.textContent = summary.itemCount
      ? `当前计划共安排了 ${summary.itemCount} 个行程节点，适合继续在功能页里做细节调整。`
      : "当前计划已经绑定，但还没有填充具体节点，可以继续去功能页完善。";
    els.homeSpotlightMeta.innerHTML = buildPlanMetaList(currentPlan)
      .slice(0, 3)
      .map((text) => `<span>${escapeHtml(text)}</span>`)
      .join("");
  } else if (els.homeSpotlightStatus) {
    els.homeSpotlightStatus.textContent = "未绑定";
    els.homeSpotlightStatus.classList.remove("archived");
    els.homeSpotlightTitle.textContent = "还没有当前计划";
    els.homeSpotlightText.textContent = "可以去功能页新建一条计划，或者从行程库载入一条已有计划。";
    els.homeSpotlightMeta.innerHTML = "<span>等待开始</span>";
  }
  renderHomeRecentPlans();
  renderFootprintMap().catch(() => {});
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
    const isCurrent = currentPlanId === plan.id;
    const article = document.createElement("article");
    article.className = `plan-card${plan.status === "archived" ? " archived" : ""}${isCurrent ? " current" : ""}`;
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

function getProvinceNameByCode(adcode) {
  return PROVINCE_NAME_MAP[String(adcode || "")] || "未知省份";
}

function clearFootprintInfoWindow() {
  if (!footprintInfoWindow || !footprintMapInstance) return;
  footprintInfoWindow.close();
}

function createFootprintInfoWindow(AMapRef) {
  if (!footprintInfoWindow) {
    footprintInfoWindow = new AMapRef.InfoWindow({
      isCustom: false,
      offset: new AMapRef.Pixel(0, -18),
      closeWhenClickMap: true
    });
  }
  return footprintInfoWindow;
}

function resetFootprintPanels() {
  activeFootprintProvinceCode = "";
  hoveredFootprintProvinceCode = "";
  footprintProvinceDataMap = new Map();
  footprintProvinceCodes = new Set();
  if (els.footprintProvinceMeta) els.footprintProvinceMeta.textContent = "点击地图上已经点亮的省份";
  if (els.footprintProvinceTitle) els.footprintProvinceTitle.textContent = "还没有选中省份";
  if (els.footprintProvinceList) els.footprintProvinceList.innerHTML = "";
  if (els.footprintProvinceEmpty) els.footprintProvinceEmpty.hidden = false;
  if (els.footprintRankingList) {
    els.footprintRankingList.innerHTML = '<div class="empty-block">归档计划后，这里会生成你的旅行热力排名。</div>';
  }
  els.footprintMapStage?.closest(".footprint-map-shell")?.classList.remove("is-hovering");
  clearFootprintInfoWindow();
}

function showFootprintEmptyState(message, badge = "等待点亮") {
  els.footprintBadge.textContent = badge;
  els.footprintMapEmpty.textContent = message;
  els.footprintMapEmpty.classList.remove("is-hidden");
  clearFootprintMarkers();
  clearFootprintInfoWindow();
  resetFootprintPanels();
  if (footprintProvinceLayer) {
    if (footprintLayerClickHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("click", footprintLayerClickHandler);
    }
    if (footprintLayerHoverHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("mousemove", footprintLayerHoverHandler);
    }
    if (footprintLayerMouseOutHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("mouseout", footprintLayerMouseOutHandler);
    }
    footprintProvinceLayer.setMap(null);
    footprintProvinceLayer = null;
  }
}

async function resolvePlaceDistrict(place) {
  const searchTerms = [place.city, place.address, place.name]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  for (const term of searchTerms) {
    if (districtLookupCache.has(term)) return districtLookupCache.get(term);
    const district = await searchDistrict(term);
    if (district?.adcode) {
      const provinceAdcode = normalizeProvinceAdcode(district.adcode);
      const normalized = {
        cityName: district.name || place.city || term,
        cityAdcode: String(district.adcode),
        provinceAdcode,
        provinceName: String(district.province || "").trim() || getProvinceNameByCode(provinceAdcode)
      };
      districtLookupCache.set(term, normalized);
      return normalized;
    }
  }
  return null;
}

function extractFootprintPlaces() {
  return getArchivedPlans()
    .flatMap((plan) => {
      const places = Array.isArray(plan?.snapshot?.places) ? plan.snapshot.places : [];
      return places.map((place) => ({
        ...place,
        __planId: plan.id,
        __planTitle: plan.title || "未命名行程",
        __planUpdatedAt: plan.updated_at || plan.created_at || ""
      }));
    })
    .filter((place) => place && (place.city || place.address || place.name))
    .filter((place) => typeof place.lng === "number" && typeof place.lat === "number");
}

function createFootprintProvinceLayer(AMapRef, provinceCodes, activeProvinceCode = "", hoverProvinceCode = "") {
  return new AMapRef.DistrictLayer.Country({
    zIndex: 8,
    depth: 1,
    SOC: "CHN",
    styles: {
      "nation-stroke": "rgba(59, 89, 68, 0.22)",
      "coastline-stroke": "rgba(59, 89, 68, 0.12)",
      "province-stroke": "rgba(59, 89, 68, 0.28)",
      fill: (props) => {
        const provinceCode = normalizeProvinceAdcode(props.adcode_pro || props.adcode);
        if (provinceCode === activeProvinceCode) return "rgba(43, 53, 63, 0.82)";
        if (provinceCode === hoverProvinceCode) return "rgba(59, 89, 68, 0.72)";
        return provinceCodes.has(provinceCode)
          ? "rgba(59, 89, 68, 0.58)"
          : "rgba(214, 173, 120, 0.14)";
      }
    }
  });
}

function setFootprintHoverState(provinceCode, AMapRef = window.AMap) {
  const nextProvinceCode = provinceCode && footprintProvinceCodes.has(provinceCode) ? provinceCode : "";
  if (hoveredFootprintProvinceCode === nextProvinceCode) return;
  hoveredFootprintProvinceCode = nextProvinceCode;
  els.footprintMapStage?.closest(".footprint-map-shell")?.classList.toggle("is-hovering", Boolean(nextProvinceCode));
  if (AMapRef) refreshFootprintProvinceLayer(AMapRef);
}

function renderFootprintProvincePanel() {
  if (!els.footprintProvinceTitle || !els.footprintProvinceList || !els.footprintProvinceEmpty) return;
  const provinceData = footprintProvinceDataMap.get(activeFootprintProvinceCode);
  els.footprintProvinceList.innerHTML = "";
  if (!provinceData) {
    els.footprintProvinceMeta.textContent = footprintProvinceCodes.size
      ? "点击地图上已经点亮的省份"
      : "归档计划后这里会自动生成详情";
    els.footprintProvinceTitle.textContent = "还没有选中省份";
    els.footprintProvinceEmpty.hidden = false;
    return;
  }
  els.footprintProvinceMeta.textContent = `${provinceData.cityCount} 座城市 · ${provinceData.visitCount} 条足迹`;
  els.footprintProvinceTitle.textContent = provinceData.provinceName;
  els.footprintProvinceEmpty.hidden = true;

  provinceData.cities
    .slice()
    .sort((a, b) => b.visitCount - a.visitCount || a.cityName.localeCompare(b.cityName, "zh-CN"))
    .forEach((city) => {
      const item = document.createElement("article");
      item.className = "footprint-city-item";
      item.innerHTML = `
        <div class="footprint-city-main">
          <strong>${escapeHtml(city.cityName)}</strong>
          <span>${escapeHtml(city.planCount > 1 ? `${city.planCount} 个计划` : "1 个计划")}</span>
        </div>
        <span class="footprint-city-badge">${escapeHtml(city.visitCount > 1 ? `${city.visitCount} 次` : "已点亮")}</span>
      `;
      els.footprintProvinceList.append(item);
    });
}

function renderFootprintRanking() {
  if (!els.footprintRankingList) return;
  els.footprintRankingList.innerHTML = "";
  const ranking = [...footprintProvinceDataMap.values()].sort(
    (a, b) => b.cityCount - a.cityCount || b.visitCount - a.visitCount || a.provinceName.localeCompare(b.provinceName, "zh-CN")
  );
  if (!ranking.length) {
    els.footprintRankingList.innerHTML = '<div class="empty-block">归档计划后，这里会生成你的旅行热力排名。</div>';
    return;
  }
  ranking.forEach((province, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `footprint-ranking-item${province.provinceCode === activeFootprintProvinceCode ? " is-active" : ""}`;
    button.innerHTML = `
      <span class="footprint-ranking-rank">#${index + 1}</span>
      <div class="footprint-ranking-main">
        <strong>${escapeHtml(province.provinceName)}</strong>
        <span>${escapeHtml(`${province.cityCount} 座城市 · ${province.visitCount} 条足迹`)}</span>
      </div>
      <span class="footprint-ranking-badge">${escapeHtml(`${province.cityCount}`)}</span>
    `;
    button.addEventListener("click", () => selectFootprintProvince(province.provinceCode));
    els.footprintRankingList.append(button);
  });
}

function refreshFootprintProvinceLayer(AMapRef) {
  if (!footprintMapInstance) return;
  if (footprintProvinceLayer) {
    if (footprintLayerClickHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("click", footprintLayerClickHandler);
    }
    if (footprintLayerHoverHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("mousemove", footprintLayerHoverHandler);
    }
    if (footprintLayerMouseOutHandler && typeof footprintProvinceLayer.off === "function") {
      footprintProvinceLayer.off("mouseout", footprintLayerMouseOutHandler);
    }
    footprintProvinceLayer.setMap(null);
    footprintProvinceLayer = null;
  }
  if (!footprintProvinceCodes.size) return;
  footprintProvinceLayer = createFootprintProvinceLayer(
    AMapRef,
    footprintProvinceCodes,
    activeFootprintProvinceCode,
    hoveredFootprintProvinceCode
  );
  footprintProvinceLayer.setMap(footprintMapInstance);
  if (typeof footprintProvinceLayer.on === "function") {
    footprintLayerClickHandler = (event) => {
      const props = event?.props || event?.data || {};
      const provinceCode = normalizeProvinceAdcode(props.adcode_pro || props.adcode);
      if (!provinceCode || !footprintProvinceCodes.has(provinceCode)) return;
      selectFootprintProvince(provinceCode);
    };
    footprintLayerHoverHandler = (event) => {
      const props = event?.props || event?.data || {};
      const provinceCode = normalizeProvinceAdcode(props.adcode_pro || props.adcode);
      setFootprintHoverState(provinceCode, AMapRef);
    };
    footprintLayerMouseOutHandler = () => {
      setFootprintHoverState("", AMapRef);
    };
    footprintProvinceLayer.on("click", footprintLayerClickHandler);
    footprintProvinceLayer.on("mousemove", footprintLayerHoverHandler);
    footprintProvinceLayer.on("mouseout", footprintLayerMouseOutHandler);
  }
}

function selectFootprintProvince(provinceCode) {
  if (!provinceCode || !footprintProvinceDataMap.has(provinceCode)) return;
  activeFootprintProvinceCode = provinceCode;
  hoveredFootprintProvinceCode = provinceCode;
  els.footprintMapStage?.closest(".footprint-map-shell")?.classList.add("is-hovering");
  renderFootprintProvincePanel();
  renderFootprintRanking();
  if (window.AMap) refreshFootprintProvinceLayer(window.AMap);
  const provinceData = footprintProvinceDataMap.get(provinceCode);
  if (provinceData?.positions?.length && footprintMapInstance) {
    footprintMapInstance.setFitView(
      provinceData.positions.map((position) => new window.AMap.LngLat(position[0], position[1])),
      false,
      [72, 72, 72, 72]
    );
  }
}

async function renderFootprintMap() {
  const currentToken = ++footprintRenderToken;
  resetFootprintStats();
  resetFootprintPanels();
  const archivedPlans = getArchivedPlans();
  els.footprintPlanCount.textContent = String(archivedPlans.length);

  if (!authSession?.user) {
    showFootprintEmptyState("登录后，归档过的旅行计划会在这里沉淀成你的中国足迹地图。", "等待登录");
    return;
  }
  if (!archivedPlans.length) {
    showFootprintEmptyState("先把一条计划归档起来吧。归档后的城市会在地图上慢慢点亮。");
    return;
  }
  if (!getConfig().amapKey) {
    showFootprintEmptyState("足迹地图需要高德地图 Key 才能显示，补齐配置后这里会自动恢复。", "等待地图");
    return;
  }

  const places = extractFootprintPlaces();
  if (!places.length) {
    showFootprintEmptyState("已归档计划里暂时还没有完整的城市坐标。重新打开计划保存一次后，再归档会更容易点亮。", "等待坐标");
    return;
  }

  try {
    const AMapRef = await ensureFootprintMapReady();
    if (currentToken !== footprintRenderToken) return;

    const cityMap = new Map();
    for (const place of places) {
      const resolved = await resolvePlaceDistrict(place);
      if (currentToken !== footprintRenderToken) return;
      const provinceCode = resolved?.provinceAdcode || "";
      if (!provinceCode) continue;
      const cityCode = resolved?.cityAdcode || `${provinceCode}_${place.city || place.name || place.lng}_${place.lat}`;
      const cityName = resolved?.cityName || place.city || place.name || "未知城市";
      if (!cityMap.has(cityCode)) {
        cityMap.set(cityCode, {
          cityCode,
          cityName,
          provinceCode,
          provinceName: resolved?.provinceName || getProvinceNameByCode(provinceCode),
          lng: place.lng,
          lat: place.lat,
          visitCount: 0,
          planIds: new Set(),
          planTitles: new Set()
        });
      }
      const cityEntry = cityMap.get(cityCode);
      cityEntry.visitCount += 1;
      if (place.__planId) cityEntry.planIds.add(place.__planId);
      if (place.__planTitle) cityEntry.planTitles.add(place.__planTitle);
    }

    footprintProvinceDataMap = new Map();
    cityMap.forEach((cityEntry) => {
      const provinceCode = cityEntry.provinceCode;
      if (!footprintProvinceDataMap.has(provinceCode)) {
        footprintProvinceDataMap.set(provinceCode, {
          provinceCode,
          provinceName: cityEntry.provinceName,
          cityCount: 0,
          visitCount: 0,
          cities: [],
          positions: []
        });
      }
      const provinceEntry = footprintProvinceDataMap.get(provinceCode);
      provinceEntry.cityCount += 1;
      provinceEntry.visitCount += cityEntry.visitCount;
      provinceEntry.positions.push([cityEntry.lng, cityEntry.lat]);
      provinceEntry.cities.push({
        cityName: cityEntry.cityName,
        cityCode: cityEntry.cityCode,
        visitCount: cityEntry.visitCount,
        planCount: cityEntry.planIds.size || 1,
        lng: cityEntry.lng,
        lat: cityEntry.lat
      });
    });

    footprintProvinceCodes = new Set(footprintProvinceDataMap.keys());
    els.footprintProvinceCount.textContent = String(footprintProvinceCodes.size);
    els.footprintCityCount.textContent = String(cityMap.size);
    els.footprintBadge.textContent = footprintProvinceCodes.size ? "足迹已点亮" : "等待点亮";
    hideFootprintEmptyState();

    if (!footprintProvinceCodes.size) {
      showFootprintEmptyState("这些归档计划已经保存好了，但还缺少可识别的城市信息。稍后完善地点后，它们会自动点亮。", "等待识别");
      return;
    }

    if (!footprintProvinceDataMap.has(activeFootprintProvinceCode)) {
      activeFootprintProvinceCode = [...footprintProvinceDataMap.values()]
        .sort((a, b) => b.cityCount - a.cityCount || b.visitCount - a.visitCount)[0]?.provinceCode || "";
    }

    renderFootprintProvincePanel();
    renderFootprintRanking();
    refreshFootprintProvinceLayer(AMapRef);

    clearFootprintMarkers();
    clearFootprintInfoWindow();
    const infoWindow = createFootprintInfoWindow(AMapRef);
    footprintMarkers = [...cityMap.values()].map((cityEntry) => {
      const marker = new AMapRef.Marker({
        position: [cityEntry.lng, cityEntry.lat],
        offset: new AMapRef.Pixel(-6, -6),
        anchor: "center",
        title: cityEntry.cityName,
        content: '<span class="visited-city-dot"></span>'
      });
      const infoContent = `
        <div class="footprint-info-window">
          <strong>${escapeHtml(cityEntry.cityName)}</strong>
          <span>${escapeHtml(cityEntry.provinceName)}</span>
          <span>${escapeHtml(cityEntry.visitCount > 1 ? `${cityEntry.visitCount} 条足迹` : "已记录 1 条足迹")}</span>
        </div>
      `;
      marker.on("mouseover", () => {
        setFootprintHoverState(cityEntry.provinceCode, AMapRef);
        infoWindow.setContent(infoContent);
        infoWindow.open(footprintMapInstance, [cityEntry.lng, cityEntry.lat]);
      });
      marker.on("mouseout", () => {
        setFootprintHoverState("", AMapRef);
        if (infoWindow) infoWindow.close();
      });
      marker.on("click", () => {
        activeFootprintProvinceCode = cityEntry.provinceCode;
        setFootprintHoverState(cityEntry.provinceCode, AMapRef);
        renderFootprintProvincePanel();
        renderFootprintRanking();
        refreshFootprintProvinceLayer(AMapRef);
        infoWindow.setContent(infoContent);
        infoWindow.open(footprintMapInstance, [cityEntry.lng, cityEntry.lat]);
      });
      return marker;
    });
    footprintMarkers.forEach((marker) => footprintMapInstance.add(marker));

    const activeProvince = footprintProvinceDataMap.get(activeFootprintProvinceCode);
    if (activeProvince?.positions?.length) {
      footprintMapInstance.setFitView(
        activeProvince.positions.map((position) => new AMapRef.LngLat(position[0], position[1])),
        false,
        [72, 72, 72, 72]
      );
    } else {
      footprintMapInstance.setZoomAndCenter(4.2, [104.5, 35.2]);
    }
    footprintMapInstance.resize();
  } catch (error) {
    showFootprintEmptyState(`足迹地图加载失败：${error.message}`, "加载失败");
  }
}

function bindEvents() {
  els.navHomeBtn.addEventListener("click", () => setActivePage(PAGES.home));
  els.navLibraryBtn.addEventListener("click", () => setActivePage(PAGES.library));
  els.navPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.showRegisterBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.register));
  els.showLoginBtn.addEventListener("click", () => setAuthView(AUTH_VIEWS.login));
  els.registerForm.addEventListener("submit", handleRegister);
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.brandOpenPlannerBtn.addEventListener("click", () => setActivePage(PAGES.planner));
  els.brandLogoutBtn.addEventListener("click", handleLogout);
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

function getConfig() {
  const appConfig = window.APP_CONFIG || {};
  return {
    amapKey: appConfig.amapKey || "",
    amapSecurityJsCode: appConfig.amapSecurityJsCode || "",
    defaultCity: appConfig.defaultCity || "全国",
    supabaseUrl: appConfig.supabaseUrl || "",
    supabaseAnonKey: appConfig.supabaseAnonKey || ""
  };
}

async function savePlanToCloud() {
  syncTripInputsToState();
  saveState(false);
  if (!supabaseClient || !authSession?.user) {
    setCloudStatus("请先登录后再保存到云端。", true);
    setActivePage(PAGES.home);
    return;
  }

  els.saveCloudBtn.disabled = true;
  setCloudStatus("正在保存到云端...");
  const previousPlanIds = new Set(myPlans.map((plan) => plan.id));
  const draftPlanId = currentPlanId || (window.crypto?.randomUUID ? window.crypto.randomUUID() : uid("plan"));
  const payload = {
    ...(currentPlanId ? {} : { id: draftPlanId }),
    owner_id: authSession.user.id,
    title: state.trip.name?.trim() || "未命名旅行",
    status: currentPlanStatus === "archived" ? "archived" : "active",
    start_date: state.trip.startDate || null,
    end_date: state.trip.endDate || null,
    travelers: Math.max(1, Number(state.trip.travelers || 1)),
    snapshot: state,
    archived_at: currentPlanStatus === "archived" ? new Date().toISOString() : null
  };

  try {
    let result;
    if (currentPlanId) {
      result = await supabaseClient
        .from("trip_plans")
        .update(payload)
        .eq("id", currentPlanId)
        .select("id, status")
        .maybeSingle();
    } else {
      result = await supabaseClient
        .from("trip_plans")
        .insert(payload)
        .select("id, status");
    }

    if (result.error) throw result.error;

    let savedPlan = Array.isArray(result.data) ? result.data[0] : result.data;
    await loadMyPlans();

    if (!savedPlan?.id && currentPlanId) {
      savedPlan = myPlans.find((plan) => plan.id === currentPlanId) || null;
    }

    if (!savedPlan?.id && !currentPlanId) {
      savedPlan =
        myPlans.find((plan) => !previousPlanIds.has(plan.id)) ||
        myPlans.find((plan) =>
          (plan.title || "") === payload.title &&
          (plan.start_date || null) === payload.start_date &&
          (plan.end_date || null) === payload.end_date
        ) ||
        myPlans[0] ||
        null;
    }

    if (!savedPlan?.id) {
      savedPlan = {
        id: draftPlanId,
        status: payload.status,
        title: payload.title,
        start_date: payload.start_date,
        end_date: payload.end_date,
        travelers: payload.travelers,
        snapshot: payload.snapshot,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        archived_at: payload.archived_at
      };
      myPlans = [savedPlan, ...myPlans];
    }

    setCurrentPlanMeta(savedPlan.id, savedPlan.status || payload.status);
    renderPlanList();
    renderAuthPanels();
    setCloudStatus(`云端已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
    setAccountFeedback("旅行计划已同步到云端。");
  } catch (error) {
    setCloudStatus(`云端保存失败：${error.message}`, true);
  } finally {
    els.saveCloudBtn.disabled = false;
  }
}

async function savePlanToCloud() {
  syncTripInputsToState();
  saveState(false);
  if (!supabaseClient || !authSession?.user) {
    setCloudStatus("请先登录后再保存到云端。", true);
    setActivePage(PAGES.home);
    return;
  }

  els.saveCloudBtn.disabled = true;
  setCloudStatus("正在保存到云端...");
  const hasExistingCloudPlan = Boolean(currentPlanId && myPlans.some((plan) => plan.id === currentPlanId));
  const draftPlanId = currentPlanId || (window.crypto?.randomUUID ? window.crypto.randomUUID() : uid("plan"));
  const payload = {
    plan_id: hasExistingCloudPlan ? currentPlanId : null,
    title: state.trip.name?.trim() || "未命名旅行",
    status: currentPlanStatus === "archived" ? "archived" : "active",
    start_date: state.trip.startDate || null,
    end_date: state.trip.endDate || null,
    travelers: Math.max(1, Number(state.trip.travelers || 1)),
    snapshot: state,
    archived_at: currentPlanStatus === "archived" ? new Date().toISOString() : null,
    new_plan_id: hasExistingCloudPlan ? null : draftPlanId
  };

  try {
    const { data, error } = await supabaseClient.rpc("save_trip_plan", payload);
    if (error) {
      if (String(error.message || "").includes("save_trip_plan")) {
        throw new Error("请先在 Supabase SQL Editor 执行 save_trip_plan 函数脚本");
      }
      throw error;
    }
    if (!data?.id) {
      throw new Error("云端保存接口未返回计划记录");
    }

    await loadMyPlans();
    setCurrentPlanMeta(data.id, data.status || payload.status);
    renderPlanList();
    renderAuthPanels();
    setCloudStatus(`云端已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
    setAccountFeedback("旅行计划已同步到云端。");
  } catch (error) {
    setCloudStatus(`云端保存失败：${error.message}`, true);
  } finally {
    els.saveCloudBtn.disabled = false;
  }
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
