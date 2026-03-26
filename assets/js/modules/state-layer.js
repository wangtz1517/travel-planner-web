var STORAGE_KEY = "travel_planner_v9";
var PAGE_STORAGE_KEY = "gopace_active_page";
var AUTH_VIEW_STORAGE_KEY = "gopace_auth_view";
var CURRENT_PLAN_STORAGE_KEY = "gopace_current_plan_id";
var GUEST_DRAFT_MIGRATION_STORAGE_KEY = "gopace_guest_draft_migration";
var PLAN_LIBRARY_META_STORAGE_KEY = "gopace_plan_library_meta";

var PLACE_TYPES = ["起点", "终点", "景点", "途径点", "饭店", "酒店", "交通枢纽", "购物", "休闲", "备用"];
var TRANSPORT_MODES = [
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
var STAY_OPTIONS = [0, 15, 30, 45, 60, 90, 120, 180, 240, 360, 480];
var ROUTE_SERVICE_MODES = new Set(["walk", "taxi", "drive", "transit", "bike"]);
var SUGGESTION_LIMIT = 10;
var PAGES = { home: "home", library: "library", planner: "planner" };
var AUTH_VIEWS = { register: "register", login: "login" };

var els = {
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
  enterGuestModeBtn: document.getElementById("enterGuestModeBtn"),
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

var state = loadState();
var selectedDayId = state.days[0]?.id || "";
var activePage = loadStoredValue(PAGE_STORAGE_KEY, PAGES.home);
var authView = loadStoredValue(AUTH_VIEW_STORAGE_KEY, AUTH_VIEWS.register);
var currentPlanId = loadStoredValue(CURRENT_PLAN_STORAGE_KEY, "");
var suggestions = [];
var activeSuggestionIndex = -1;
var autocompleteTimer = null;
var dragState = null;
var mapInstance = null;
var mapLoadedKey = "";
var mapOverlays = [];
var autocompleteService = null;
var placeSearchService = null;
var districtSearchService = null;
var geocoderService = null;
var routeServices = {};
var footprintMapInstance = null;
var footprintProvinceLayer = null;
var footprintMarkers = [];
var footprintRenderToken = 0;
var districtLookupCache = new Map();
var footprintInfoWindow = null;
var activeFootprintProvinceCode = "";
var hoveredFootprintProvinceCode = "";
var footprintProvinceDataMap = new Map();
var footprintProvinceCodes = new Set();
var footprintLayerClickHandler = null;
var footprintLayerHoverHandler = null;
var footprintLayerMouseOutHandler = null;
var PROVINCE_NAME_MAP = {
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
var supabaseClient = null;
var authSession = null;
var authProfile = null;
var myPlans = [];
var currentPlanStatus = "";
var planSearchQuery = "";
var planFilter = "all";
var planSort = "updated_desc";

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

function toNumberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
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
    lng: toNumberOrNull(place.lng),
    lat: toNumberOrNull(place.lat),
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
    defaultCity: appConfig.defaultCity || "全国",
    supabaseUrl: appConfig.supabaseUrl || "",
    supabaseAnonKey: appConfig.supabaseAnonKey || ""
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

function hasMeaningfulPlanState(planState = state) {
  const snapshot = normalizeState(planState);
  const hasTripName = Boolean(snapshot.trip?.name?.trim());
  const hasPlaces = snapshot.places.some((place) => Boolean(place.name?.trim() || place.city?.trim() || place.address?.trim()));
  const hasItems = snapshot.days.some((day) => Array.isArray(day.items) && day.items.length > 0);
  return hasTripName || hasPlaces || hasItems;
}

function buildGuestDraftFingerprint(planState = state) {
  const snapshot = normalizeState(planState);
  if (!hasMeaningfulPlanState(snapshot)) return "";
  return JSON.stringify({
    trip: {
      name: snapshot.trip?.name?.trim() || "",
      travelers: Math.max(1, Number(snapshot.trip?.travelers || 1)),
      startDate: snapshot.trip?.startDate || "",
      endDate: snapshot.trip?.endDate || ""
    },
    places: snapshot.places.map((place) => ({
      name: place.name || "",
      city: place.city || "",
      address: place.address || "",
      lng: toNumberOrNull(place.lng),
      lat: toNumberOrNull(place.lat)
    })),
    days: snapshot.days.map((day) => ({
      title: day.title || "",
      date: day.date || "",
      items: Array.isArray(day.items) ? day.items.map((item) => ({
        placeId: item.placeId || "",
        type: item.type || "",
        stayMinutes: Number(item.stayMinutes || 0),
        startTime: item.startTime || "",
        notes: item.notes || "",
        transportFromPrev: item.transportFromPrev || "none"
      })) : []
    }))
  });
}

function loadGuestDraftMigrationMap() {
  try {
    const raw = localStorage.getItem(GUEST_DRAFT_MIGRATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function persistStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures and keep the app usable.
  }
}

function persistGuestDraftMigrationMap(migrationMap) {
  try {
    localStorage.setItem(GUEST_DRAFT_MIGRATION_STORAGE_KEY, JSON.stringify(migrationMap || {}));
  } catch {
    // Ignore storage write failures and keep the app usable.
  }
}

function hasGuestDraftMigrationRecord(userId, fingerprint) {
  if (!userId || !fingerprint) return false;
  const migrationMap = loadGuestDraftMigrationMap();
  return migrationMap[userId] === fingerprint;
}

function markGuestDraftMigrated(userId, fingerprint) {
  if (!userId || !fingerprint) return;
  const migrationMap = loadGuestDraftMigrationMap();
  migrationMap[userId] = fingerprint;
  persistGuestDraftMigrationMap(migrationMap);
}

function getPlanLibraryMetaStore() {
  return loadStoredJson(PLAN_LIBRARY_META_STORAGE_KEY, {});
}

function getPlanLibraryMeta(userId) {
  if (!userId) return { pinnedIds: [], recentIds: [] };
  const store = getPlanLibraryMetaStore();
  const scoped = store[userId];
  return {
    pinnedIds: Array.isArray(scoped?.pinnedIds) ? scoped.pinnedIds : [],
    recentIds: Array.isArray(scoped?.recentIds) ? scoped.recentIds : []
  };
}

function persistPlanLibraryMeta(userId, meta) {
  if (!userId) return;
  const store = getPlanLibraryMetaStore();
  store[userId] = {
    pinnedIds: Array.isArray(meta?.pinnedIds) ? meta.pinnedIds.slice(0, 20) : [],
    recentIds: Array.isArray(meta?.recentIds) ? meta.recentIds.slice(0, 12) : []
  };
  persistStoredJson(PLAN_LIBRARY_META_STORAGE_KEY, store);
}

function prunePlanLibraryMeta(userId, validPlanIds) {
  if (!userId) return;
  const allowedIds = new Set(Array.isArray(validPlanIds) ? validPlanIds.filter(Boolean) : []);
  const meta = getPlanLibraryMeta(userId);
  persistPlanLibraryMeta(userId, {
    pinnedIds: meta.pinnedIds.filter((id) => allowedIds.has(id)),
    recentIds: meta.recentIds.filter((id) => allowedIds.has(id))
  });
}

function togglePinnedPlan(planId) {
  const userId = authSession?.user?.id;
  if (!userId || !planId) return false;
  const meta = getPlanLibraryMeta(userId);
  const isPinned = meta.pinnedIds.includes(planId);
  meta.pinnedIds = isPinned
    ? meta.pinnedIds.filter((id) => id !== planId)
    : [planId, ...meta.pinnedIds.filter((id) => id !== planId)];
  persistPlanLibraryMeta(userId, meta);
  return !isPinned;
}

function markPlanOpened(planId) {
  const userId = authSession?.user?.id;
  if (!userId || !planId) return;
  const meta = getPlanLibraryMeta(userId);
  meta.recentIds = [planId, ...meta.recentIds.filter((id) => id !== planId)];
  persistPlanLibraryMeta(userId, meta);
}

function getRecentPlanRank(planId) {
  const userId = authSession?.user?.id;
  if (!userId || !planId) return -1;
  return getPlanLibraryMeta(userId).recentIds.indexOf(planId);
}

function isPlanPinned(planId) {
  const userId = authSession?.user?.id;
  if (!userId || !planId) return false;
  return getPlanLibraryMeta(userId).pinnedIds.includes(planId);
}

function getPlanCompletionState(plan) {
  const snapshot = normalizeState(plan?.snapshot || {});
  const summary = getPlanSnapshotSummary({ snapshot, start_date: plan?.start_date, end_date: plan?.end_date });
  const hasDateRange = Boolean(plan?.start_date && plan?.end_date);
  const hasTripName = Boolean(plan?.title?.trim());
  const hasRoute = summary.itemCount >= 2 || (summary.placeCount >= 2 && summary.dayCount >= 1);
  if (hasTripName && hasDateRange && hasRoute) {
    return { label: "进行中", tone: "active" };
  }
  return { label: "待完善", tone: "draft" };
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

function buildHomeSpotlightMeta(plan, summary) {
  return [
    formatPlanDateRange(plan.start_date, plan.end_date),
    `${summary.dayCount || 0} 天`,
    `${summary.placeCount || 0} 个地点`,
    `${summary.itemCount || 0} 个节点`
  ];
}
