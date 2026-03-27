var STORAGE_KEY = "travel_planner_v9";
var PAGE_STORAGE_KEY = "gopace_active_page";
var AUTH_VIEW_STORAGE_KEY = "gopace_auth_view";
var CURRENT_PLAN_STORAGE_KEY = "gopace_current_plan_id";
var GUEST_DRAFT_MIGRATION_STORAGE_KEY = "gopace_guest_draft_migration";
var GUEST_PLACE_LIBRARY_STORAGE_KEY = "gopace_guest_place_library_v1";
var GUEST_PLACE_LIBRARY_MIGRATION_STORAGE_KEY = "gopace_guest_place_library_migration";
var PLAN_LIBRARY_META_STORAGE_KEY = "gopace_plan_library_meta";
var SOCIAL_STORAGE_KEY = "gopace_social_v1";

var PLACE_TYPES = ["起点", "终点", "景点", "途径点", "饭店", "酒店", "交通枢纽", "购物", "休闲", "备用"];
var PLACE_LIBRARY_CATEGORIES = [
  { value: "all", label: "全部" },
  { value: "play", label: "玩" },
  { value: "food", label: "吃" },
  { value: "stay", label: "住" },
  { value: "other", label: "其他" }
];
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
var PAGES = { home: "home", placeLibrary: "placeLibrary", planner: "planner", community: "community", profile: "profile" };
var AUTH_VIEWS = { register: "register", login: "login" };
var SOCIAL_DIRECTORY = [
  {
    id: "lumi",
    name: "露米",
    handle: "@lumi_routes",
    email: "lumi@gopace.cn",
    city: "杭州",
    note: "偏爱展览、步行和咖啡馆路线。",
    tags: ["城市漫游", "展览"]
  },
  {
    id: "anson",
    name: "安森",
    handle: "@anson_drive",
    email: "anson@gopace.cn",
    city: "成都",
    note: "擅长自驾节奏和多城串联。",
    tags: ["自驾", "多城"]
  },
  {
    id: "mika",
    name: "Mika",
    handle: "@mika_foodie",
    email: "mika@gopace.cn",
    city: "上海",
    note: "会补餐厅、夜生活和雨天备选。",
    tags: ["美食", "夜生活"]
  },
  {
    id: "nora",
    name: "Nora",
    handle: "@nora_archives",
    email: "nora@gopace.cn",
    city: "北京",
    note: "喜欢把每次旅行整理成精致归档。",
    tags: ["归档", "摄影"]
  },
  {
    id: "kevin",
    name: "Kevin",
    handle: "@kevin_weekend",
    email: "kevin@gopace.cn",
    city: "深圳",
    note: "更适合周末短途和轻量行程。",
    tags: ["周末", "轻量"]
  },
  {
    id: "yuki",
    name: "Yuki",
    handle: "@yuki_stay",
    email: "yuki@gopace.cn",
    city: "大阪",
    note: "对酒店、温泉和落脚点很有经验。",
    tags: ["住宿", "温泉"]
  }
];

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
  navPlaceLibraryBtn: document.getElementById("navPlaceLibraryBtn"),
  navPlannerBtn: document.getElementById("navPlannerBtn"),
  navCommunityBtn: document.getElementById("navCommunityBtn"),
  navProfileBtn: document.getElementById("navProfileBtn"),
  authBadge: document.getElementById("authBadge"),
  homeAuthBadge: document.getElementById("homeAuthBadge"),
  homePage: document.getElementById("homePage"),
  homeOverviewCard: document.getElementById("homeOverviewCard"),
  homeMasthead: document.getElementById("homeMasthead"),
  homeStageLibraryAction: document.getElementById("homeStageLibraryAction"),
  homeStagePlannerAction: document.getElementById("homeStagePlannerAction"),
  homeStageFootprintAction: document.getElementById("homeStageFootprintAction"),
  placeLibraryPage: document.getElementById("placeLibraryPage"),
  plannerPage: document.getElementById("plannerPage"),
  communityPage: document.getElementById("communityPage"),
  profilePage: document.getElementById("profilePage"),
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
  placeLibraryStatAll: document.getElementById("placeLibraryStatAll"),
  placeLibraryStatPlay: document.getElementById("placeLibraryStatPlay"),
  placeLibraryStatFood: document.getElementById("placeLibraryStatFood"),
  placeLibraryStatStay: document.getElementById("placeLibraryStatStay"),
  placeLibraryCount: document.getElementById("placeLibraryCount"),
  placeFilterAllBtn: document.getElementById("placeFilterAllBtn"),
  placeFilterPlayBtn: document.getElementById("placeFilterPlayBtn"),
  placeFilterFoodBtn: document.getElementById("placeFilterFoodBtn"),
  placeFilterStayBtn: document.getElementById("placeFilterStayBtn"),
  placeFilterOtherBtn: document.getElementById("placeFilterOtherBtn"),
  placeLibrarySearchInput: document.getElementById("placeLibrarySearchInput"),
  placeLibrarySummary: document.getElementById("placeLibrarySummary"),
  placeLibraryList: document.getElementById("placeLibraryList"),
  placeLibraryEmpty: document.getElementById("placeLibraryEmpty"),
  profileHubAuthBadge: document.getElementById("profileHubAuthBadge"),
  profileHubName: document.getElementById("profileHubName"),
  profileHubEmail: document.getElementById("profileHubEmail"),
  profileHubPlaceCount: document.getElementById("profileHubPlaceCount"),
  profileHubArchivedCount: document.getElementById("profileHubArchivedCount"),
  socialModeBadge: document.getElementById("socialModeBadge"),
  socialFriendCount: document.getElementById("socialFriendCount"),
  socialRequestCount: document.getElementById("socialRequestCount"),
  socialUnreadCount: document.getElementById("socialUnreadCount"),
  socialShareCount: document.getElementById("socialShareCount"),
  socialNetworkHint: document.getElementById("socialNetworkHint"),
  socialOperationsHint: document.getElementById("socialOperationsHint"),
  socialShowDiscoveryBtn: document.getElementById("socialShowDiscoveryBtn"),
  socialShowRequestsBtn: document.getElementById("socialShowRequestsBtn"),
  socialDiscoveryPanel: document.getElementById("socialDiscoveryPanel"),
  socialRequestPanel: document.getElementById("socialRequestPanel"),
  socialSearchInput: document.getElementById("socialSearchInput"),
  socialQuickAddBtn: document.getElementById("socialQuickAddBtn"),
  socialDiscoveryList: document.getElementById("socialDiscoveryList"),
  socialRequestList: document.getElementById("socialRequestList"),
  socialFriendList: document.getElementById("socialFriendList"),
  socialConversationTitle: document.getElementById("socialConversationTitle"),
  socialConversationMeta: document.getElementById("socialConversationMeta"),
  socialConversationFeed: document.getElementById("socialConversationFeed"),
  socialMessageInput: document.getElementById("socialMessageInput"),
  socialSendMessageBtn: document.getElementById("socialSendMessageBtn"),
  socialSharePlanBtn: document.getElementById("socialSharePlanBtn"),
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
  cloudStatus: document.getElementById("cloudStatus"),
  plannerPlaceSearchInput: document.getElementById("plannerPlaceSearchInput"),
  plannerPlaceCategorySelect: document.getElementById("plannerPlaceCategorySelect"),
  tripName: document.getElementById("tripName"),
  travelerCount: document.getElementById("travelerCount"),
  tripDateRangeBtn: document.getElementById("tripDateRangeBtn"),
  tripDateRangeValue: document.getElementById("tripDateRangeValue"),
  tripDatePicker: document.getElementById("tripDatePicker"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
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
var placeLibraryState = loadInitialPlaceLibraryState(state);
state.places = clonePlaceCollection(placeLibraryState);
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
var tripDateRangeDraftStart = "";
var tripDateRangeSelectionStep = "start";
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
var placeLibraryFilter = "all";
var placeLibrarySearchQuery = "";
var plannerPlaceSearchQuery = "";
var plannerPlaceFilter = "all";
var placeLibraryNotice = "";
var placeLibraryCloudStatus = createDefaultPlaceLibraryCloudStatus();
var persistGuestPlaceLibraryChanges = true;
var socialScopeKey = "";
var socialSearchQuery = "";
var socialOperationsTab = "discovery";
var selectedConversationId = "";
var socialState = createDefaultSocialState();

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

function normalizePlaceEntry(place) {
  return {
    id: place?.id || uid("place"),
    name: place?.name || "未命名地点",
    category: place?.category || "other",
    province: place?.province || "",
    city: place?.city || "",
    district: place?.district || "",
    address: place?.address || "",
    lng: toNumberOrNull(place?.lng),
    lat: toNumberOrNull(place?.lat),
    poiId: place?.poiId || "",
    sourceKey: place?.sourceKey || ""
  };
}

function normalizePlaceCollection(places) {
  return Array.isArray(places) ? places.map((place) => normalizePlaceEntry(place)) : [];
}

function clonePlaceCollection(places) {
  return normalizePlaceCollection(places);
}

function createDefaultPlaceLibraryCloudStatus() {
  return {
    mode: "guest",
    phase: "idle",
    detail: "",
    lastSyncedAt: ""
  };
}

function setPlaceLibraryCloudStatus(patch = {}) {
  placeLibraryCloudStatus = {
    ...createDefaultPlaceLibraryCloudStatus(),
    ...placeLibraryCloudStatus,
    ...(patch || {})
  };
  return placeLibraryCloudStatus;
}

function getPlaceLibraryLastSyncedAt() {
  return placeLibraryCloudStatus?.lastSyncedAt || authProfile?.place_library_synced_at || "";
}

function loadGuestPlaceLibrary() {
  const storedPlaces = loadStoredJson(GUEST_PLACE_LIBRARY_STORAGE_KEY, null);
  if (Array.isArray(storedPlaces)) return normalizePlaceCollection(storedPlaces);
  const legacyState = loadStoredJson(STORAGE_KEY, {});
  const legacyPlaces = normalizePlaceCollection(legacyState?.places);
  if (legacyPlaces.length) persistGuestPlaceLibrary(legacyPlaces);
  return legacyPlaces;
}

function loadInitialPlaceLibraryState(planState) {
  const guestPlaces = loadGuestPlaceLibrary();
  if (guestPlaces.length) return guestPlaces;
  return normalizePlaceCollection(planState?.places);
}

function persistGuestPlaceLibrary(nextPlaces = placeLibraryState) {
  persistStoredJson(GUEST_PLACE_LIBRARY_STORAGE_KEY, normalizePlaceCollection(nextPlaces));
}

function restoreGuestPlaceLibrary() {
  replacePlaceLibrary(loadGuestPlaceLibrary());
  persistGuestPlaceLibraryChanges = false;
  setPlaceLibraryCloudStatus(createDefaultPlaceLibraryCloudStatus());
  return placeLibraryState;
}

function buildPlaceLibraryFingerprint(places = placeLibraryState) {
  const normalizedPlaces = normalizePlaceCollection(places)
    .map((place) => ({
      key: buildPlaceLibraryMergeKey(place),
      name: place.name || "",
      category: place.category || "other",
      province: place.province || "",
      city: place.city || "",
      district: place.district || "",
      address: place.address || "",
      poiId: place.poiId || "",
      sourceKey: place.sourceKey || "",
      lng: toNumberOrNull(place.lng),
      lat: toNumberOrNull(place.lat)
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
  return normalizedPlaces.length ? JSON.stringify(normalizedPlaces) : "";
}

function loadGuestPlaceLibraryMigrationMap() {
  return loadStoredJson(GUEST_PLACE_LIBRARY_MIGRATION_STORAGE_KEY, {});
}

function persistGuestPlaceLibraryMigrationMap(migrationMap) {
  persistStoredJson(GUEST_PLACE_LIBRARY_MIGRATION_STORAGE_KEY, migrationMap || {});
}

function hasGuestPlaceLibraryMigrationRecord(userId, fingerprint) {
  if (!userId || !fingerprint) return false;
  const migrationMap = loadGuestPlaceLibraryMigrationMap();
  return migrationMap[userId] === fingerprint;
}

function markGuestPlaceLibraryMigrated(userId, fingerprint) {
  if (!userId || !fingerprint) return;
  const migrationMap = loadGuestPlaceLibraryMigrationMap();
  migrationMap[userId] = fingerprint;
  persistGuestPlaceLibraryMigrationMap(migrationMap);
}

function normalizeState(raw) {
  const base = createDefaultState();
  const next = { ...base, ...(raw || {}) };
  next.trip = ensureTripDates({ ...base.trip, ...(next.trip || {}) });
  next.places = normalizePlaceCollection(next.places);
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
  resetTripDateRangeSelection();
  state.trip = ensureTripDates(state.trip);
  els.tripName.value = state.trip.name || "";
  els.travelerCount.value = state.trip.travelers || 1;
  els.startDate.value = state.trip.startDate;
  els.endDate.value = state.trip.endDate;
  renderTripDateRangeControl();
}

function resetTripDateRangeSelection() {
  tripDateRangeDraftStart = "";
  tripDateRangeSelectionStep = "start";
  if (els.tripDatePicker) {
    els.tripDatePicker.min = "";
  }
}

function renderTripDateRangeControl() {
  if (!els.tripDateRangeValue || !els.tripDateRangeBtn) return;
  const safeTrip = ensureTripDates(state.trip);
  els.tripDateRangeValue.textContent = formatPlanDateRange(safeTrip.startDate, safeTrip.endDate);
  if (tripDateRangeSelectionStep === "end" && tripDateRangeDraftStart) {
    els.tripDateRangeBtn.dataset.selectionStep = "end";
    els.tripDateRangeBtn.setAttribute("aria-label", `开始日期已选 ${tripDateRangeDraftStart}，请继续选择结束日期`);
  } else {
    els.tripDateRangeBtn.dataset.selectionStep = "start";
    els.tripDateRangeBtn.setAttribute("aria-label", "选择行程日期范围");
  }
}

function openTripDateRangePicker() {
  if (!els.tripDatePicker) return;
  const safeTrip = ensureTripDates(state.trip);
  if (tripDateRangeSelectionStep === "end" && tripDateRangeDraftStart) {
    els.tripDatePicker.min = tripDateRangeDraftStart;
    els.tripDatePicker.value = safeTrip.endDate && safeTrip.endDate >= tripDateRangeDraftStart
      ? safeTrip.endDate
      : tripDateRangeDraftStart;
  } else {
    resetTripDateRangeSelection();
    els.tripDatePicker.min = "";
    els.tripDatePicker.value = safeTrip.startDate || getTodayIso();
  }
  if (typeof els.tripDatePicker.showPicker === "function") {
    els.tripDatePicker.showPicker();
    return;
  }
  els.tripDatePicker.focus();
}

function handleTripDateRangePick() {
  if (!els.tripDatePicker) return;
  const pickedDate = els.tripDatePicker.value;
  if (!pickedDate) return;

  if (tripDateRangeSelectionStep === "start") {
    tripDateRangeDraftStart = pickedDate;
    tripDateRangeSelectionStep = "end";
    els.startDate.value = pickedDate;
    els.endDate.value = pickedDate;
    syncTripInputsToState();
    saveState(false);
    renderPlannerMeta();
    renderTripDateRangeControl();
    els.tripDatePicker.min = pickedDate;
    els.tripDatePicker.value = state.trip.endDate && state.trip.endDate >= pickedDate ? state.trip.endDate : pickedDate;
    if (typeof els.tripDatePicker.showPicker === "function") {
      setTimeout(() => {
        if (tripDateRangeSelectionStep === "end") els.tripDatePicker.showPicker();
      }, 30);
    }
    return;
  }

  els.startDate.value = tripDateRangeDraftStart || pickedDate;
  els.endDate.value = pickedDate;
  resetTripDateRangeSelection();
  syncTripInputsToState();
  generateDays();
}

function replacePlaceLibrary(nextPlaces) {
  placeLibraryState = normalizePlaceCollection(nextPlaces);
  state.places = clonePlaceCollection(placeLibraryState);
  persistGuestPlaceLibraryChanges = true;
  return state.places;
}

function buildPlaceLibraryMergeKey(place) {
  const normalized = normalizePlaceEntry(place);
  if (normalized.sourceKey) return `source:${normalizePlanText(normalized.sourceKey)}`;
  if (normalized.poiId) return `poi:${normalizePlanText(normalized.poiId)}`;
  const geo = normalized.lng != null && normalized.lat != null
    ? `|geo:${normalized.lng.toFixed(6)},${normalized.lat.toFixed(6)}`
    : "";
  return [
    "name",
    normalizePlanText(normalized.name),
    normalizePlanText(normalized.province),
    normalizePlanText(normalized.city),
    normalizePlanText(normalized.district),
    normalizePlanText(normalized.address)
  ].join(":") + geo;
}

function mergePlaceCollections(...collections) {
  const merged = [];
  const seenIds = new Set();
  const seenKeys = new Set();
  collections.forEach((collection) => {
    normalizePlaceCollection(collection).forEach((place) => {
      const mergeKey = buildPlaceLibraryMergeKey(place);
      if (seenIds.has(place.id)) return;
      if (mergeKey && seenKeys.has(mergeKey)) return;
      seenIds.add(place.id);
      if (mergeKey) seenKeys.add(mergeKey);
      merged.push(place);
    });
  });
  return merged;
}

function arePlaceCollectionsEqual(left, right) {
  return JSON.stringify(normalizePlaceCollection(left)) === JSON.stringify(normalizePlaceCollection(right));
}

function saveState(showStatus = true) {
  state.places = clonePlaceCollection(placeLibraryState);
  syncTripInputsToState();
  const persistedState = normalizeState(state);
  if (authSession?.user) {
    persistedState.places = [];
  } else if (persistGuestPlaceLibraryChanges) {
    persistGuestPlaceLibrary(placeLibraryState);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
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

function getSocialScopeKey() {
  return authSession?.user?.id || "guest";
}

function normalizeSocialMessage(message) {
  return {
    id: message?.id || uid("social_message"),
    sender: message?.sender || "system",
    type: message?.type || "text",
    text: message?.text || "",
    planId: message?.planId || "",
    planTitle: message?.planTitle || "",
    createdAt: message?.createdAt || new Date().toISOString()
  };
}

function normalizeSocialConversation(conversation) {
  return {
    id: conversation?.id || uid("social_conversation"),
    participantId: conversation?.participantId || "",
    unreadCount: Math.max(0, Number(conversation?.unreadCount || 0)),
    messages: Array.isArray(conversation?.messages)
      ? conversation.messages.map((message) => normalizeSocialMessage(message))
      : []
  };
}

function normalizeSocialState(raw) {
  const next = raw && typeof raw === "object" ? raw : {};
  return {
    friends: Array.isArray(next.friends)
      ? next.friends.map((friend) => ({
          profileId: friend?.profileId || "",
          connectedAt: friend?.connectedAt || new Date().toISOString()
        })).filter((friend) => friend.profileId)
      : [],
    requests: Array.isArray(next.requests)
      ? next.requests.map((request) => ({
          id: request?.id || uid("friend_request"),
          profileId: request?.profileId || "",
          direction: request?.direction === "outgoing" ? "outgoing" : "incoming",
          message: request?.message || "",
          createdAt: request?.createdAt || new Date().toISOString()
        })).filter((request) => request.profileId)
      : [],
    conversations: Array.isArray(next.conversations)
      ? next.conversations.map((conversation) => normalizeSocialConversation(conversation)).filter((conversation) => conversation.participantId)
      : [],
    shares: Array.isArray(next.shares)
      ? next.shares.map((share) => ({
          id: share?.id || uid("social_share"),
          participantId: share?.participantId || "",
          direction: share?.direction === "received" ? "received" : "sent",
          planId: share?.planId || "",
          planTitle: share?.planTitle || "",
          note: share?.note || "",
          createdAt: share?.createdAt || new Date().toISOString()
        })).filter((share) => share.participantId)
      : []
  };
}

function createDefaultSocialState() {
  return normalizeSocialState({
    friends: [
      { profileId: "lumi", connectedAt: "2026-03-18T10:20:00.000Z" },
      { profileId: "anson", connectedAt: "2026-03-16T08:10:00.000Z" },
      { profileId: "mika", connectedAt: "2026-03-14T13:30:00.000Z" }
    ],
    requests: [
      { profileId: "nora", direction: "incoming", message: "我也在整理足迹，想和你交换路线灵感。", createdAt: "2026-03-26T09:12:00.000Z" },
      { profileId: "kevin", direction: "outgoing", message: "想约你一起做周末短途路线。", createdAt: "2026-03-25T18:40:00.000Z" }
    ],
    conversations: [
      {
        participantId: "lumi",
        unreadCount: 2,
        messages: [
          { sender: "lumi", type: "text", text: "下周那条城市漫游线，我觉得上午先逛展会更顺。", createdAt: "2026-03-26T08:40:00.000Z" },
          { sender: "me", type: "text", text: "可以，我再把午饭和咖啡馆插进去。", createdAt: "2026-03-26T08:48:00.000Z" },
          { sender: "lumi", type: "text", text: "你改好之后再发我，我帮你看动线。", createdAt: "2026-03-26T09:03:00.000Z" }
        ]
      },
      {
        participantId: "anson",
        unreadCount: 0,
        messages: [
          { sender: "me", type: "share", text: "把上次那条川西自驾线发你了，看看节奏还顺不顺。", planTitle: "川西自驾试跑线", createdAt: "2026-03-25T20:15:00.000Z" },
          { sender: "anson", type: "text", text: "收到，我晚点帮你补两个中转休息点。", createdAt: "2026-03-25T20:24:00.000Z" }
        ]
      },
      {
        participantId: "mika",
        unreadCount: 1,
        messages: [
          { sender: "mika", type: "text", text: "你东京那条路线里，晚餐可以换成中目黑那家烤鸡店。", createdAt: "2026-03-27T07:55:00.000Z" }
        ]
      }
    ],
    shares: [
      { participantId: "anson", direction: "sent", planTitle: "川西自驾试跑线", note: "想请他帮忙看看长距离驾驶节奏。", createdAt: "2026-03-25T20:15:00.000Z" },
      { participantId: "lumi", direction: "received", planTitle: "苏州周末慢游", note: "她发来一条两天一夜的轻步行路线。", createdAt: "2026-03-24T19:05:00.000Z" }
    ]
  });
}

function loadSocialStore() {
  return loadStoredJson(SOCIAL_STORAGE_KEY, {});
}

function persistSocialStore(store) {
  persistStoredJson(SOCIAL_STORAGE_KEY, store || {});
}

function loadSocialStateForScope(scopeKey = getSocialScopeKey()) {
  const store = loadSocialStore();
  const scoped = store[scopeKey];
  return normalizeSocialState(scoped || createDefaultSocialState());
}

function persistSocialState() {
  socialState = normalizeSocialState(socialState);
  const store = loadSocialStore();
  store[getSocialScopeKey()] = socialState;
  persistSocialStore(store);
  return socialState;
}

function ensureSelectedSocialConversation() {
  const conversations = Array.isArray(socialState?.conversations) ? socialState.conversations : [];
  if (conversations.some((conversation) => conversation.id === selectedConversationId)) return;
  selectedConversationId = conversations[0]?.id || "";
}

function syncSocialStateScope() {
  const nextScopeKey = getSocialScopeKey();
  if (socialScopeKey === nextScopeKey) {
    ensureSelectedSocialConversation();
    return socialState;
  }
  socialScopeKey = nextScopeKey;
  socialState = loadSocialStateForScope(nextScopeKey);
  ensureSelectedSocialConversation();
  return socialState;
}

function getSocialProfile(profileId) {
  const profile = SOCIAL_DIRECTORY.find((item) => item.id === profileId);
  return profile || {
    id: profileId,
    name: "未命名好友",
    handle: "@pending",
    email: "",
    city: "",
    note: "",
    tags: []
  };
}

function getSocialConversationByParticipant(profileId) {
  syncSocialStateScope();
  return socialState.conversations.find((conversation) => conversation.participantId === profileId) || null;
}

function ensureSocialConversation(profileId) {
  syncSocialStateScope();
  let conversation = getSocialConversationByParticipant(profileId);
  if (conversation) return conversation;
  conversation = normalizeSocialConversation({
    participantId: profileId,
    unreadCount: 0,
    messages: [
      {
        sender: "system",
        type: "system",
        text: "现在可以在这里讨论路线、预算和集合安排了。"
      }
    ]
  });
  socialState.conversations.unshift(conversation);
  persistSocialState();
  ensureSelectedSocialConversation();
  return conversation;
}

function getSocialFriends() {
  syncSocialStateScope();
  return socialState.friends
    .map((friend) => ({
      ...friend,
      profile: getSocialProfile(friend.profileId),
      conversation: getSocialConversationByParticipant(friend.profileId)
    }))
    .sort((left, right) => {
      const leftTime = new Date(left.conversation?.messages?.slice(-1)[0]?.createdAt || left.connectedAt).getTime();
      const rightTime = new Date(right.conversation?.messages?.slice(-1)[0]?.createdAt || right.connectedAt).getTime();
      return rightTime - leftTime;
    });
}

function getSocialRequests(direction = "") {
  syncSocialStateScope();
  return socialState.requests
    .filter((request) => !direction || request.direction === direction)
    .map((request) => ({ ...request, profile: getSocialProfile(request.profileId) }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getSocialConversations() {
  syncSocialStateScope();
  return socialState.conversations
    .map((conversation) => ({
      ...conversation,
      profile: getSocialProfile(conversation.participantId)
    }))
    .sort((left, right) => {
      const leftTime = new Date(left.messages.slice(-1)[0]?.createdAt || 0).getTime();
      const rightTime = new Date(right.messages.slice(-1)[0]?.createdAt || 0).getTime();
      return rightTime - leftTime;
    });
}

function getSocialShares() {
  syncSocialStateScope();
  return socialState.shares
    .map((share) => ({ ...share, profile: getSocialProfile(share.participantId) }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getSocialDiscoveryResults() {
  syncSocialStateScope();
  const friendIds = new Set(socialState.friends.map((friend) => friend.profileId));
  const requestIds = new Set(socialState.requests.map((request) => request.profileId));
  const query = normalizePlanText(socialSearchQuery);
  return SOCIAL_DIRECTORY
    .filter((profile) => !friendIds.has(profile.id) && !requestIds.has(profile.id))
    .filter((profile) => {
      if (!query) return true;
      return [
        profile.name,
        profile.handle,
        profile.email,
        profile.city,
        profile.note,
        ...(Array.isArray(profile.tags) ? profile.tags : [])
      ].some((field) => normalizePlanText(field).includes(query));
    })
    .slice(0, 4);
}

function setSocialSearchQuery(query) {
  socialSearchQuery = String(query || "").trim();
}

function hasSocialFriend(profileId) {
  syncSocialStateScope();
  return socialState.friends.some((friend) => friend.profileId === profileId);
}

function hasPendingSocialRequest(profileId) {
  syncSocialStateScope();
  return socialState.requests.some((request) => request.profileId === profileId);
}

function sendFriendRequest(profileId) {
  syncSocialStateScope();
  if (!profileId || hasSocialFriend(profileId) || hasPendingSocialRequest(profileId)) return false;
  socialState.requests.unshift({
    id: uid("friend_request"),
    profileId,
    direction: "outgoing",
    message: "想和你一起分享路线和旅行灵感。",
    createdAt: new Date().toISOString()
  });
  persistSocialState();
  return true;
}

function acceptFriendRequest(requestId) {
  syncSocialStateScope();
  const requestIndex = socialState.requests.findIndex((request) => request.id === requestId);
  if (requestIndex < 0) return null;
  const [request] = socialState.requests.splice(requestIndex, 1);
  if (!socialState.friends.some((friend) => friend.profileId === request.profileId)) {
    socialState.friends.unshift({
      profileId: request.profileId,
      connectedAt: new Date().toISOString()
    });
  }
  const conversation = ensureSocialConversation(request.profileId);
  conversation.messages.push(normalizeSocialMessage({
    sender: "system",
    type: "system",
    text: "你们已经成为好友，现在可以互相分享行程了。"
  }));
  persistSocialState();
  selectedConversationId = conversation.id;
  return request.profileId;
}

function declineFriendRequest(requestId) {
  syncSocialStateScope();
  const requestIndex = socialState.requests.findIndex((request) => request.id === requestId);
  if (requestIndex < 0) return null;
  const [request] = socialState.requests.splice(requestIndex, 1);
  persistSocialState();
  return request.profileId;
}

function openSocialConversation(profileId) {
  const conversation = ensureSocialConversation(profileId);
  conversation.unreadCount = 0;
  selectedConversationId = conversation.id;
  persistSocialState();
  return conversation;
}

function getSelectedSocialConversation() {
  syncSocialStateScope();
  ensureSelectedSocialConversation();
  return socialState.conversations.find((conversation) => conversation.id === selectedConversationId) || null;
}

function sendSocialMessage(text) {
  syncSocialStateScope();
  const conversation = getSelectedSocialConversation();
  const content = String(text || "").trim();
  if (!conversation || !content) return false;
  conversation.messages.push(normalizeSocialMessage({
    sender: "me",
    type: "text",
    text: content,
    createdAt: new Date().toISOString()
  }));
  persistSocialState();
  return true;
}

function getDefaultSharePlan() {
  if (currentPlanId) {
    const currentPlan = myPlans.find((plan) => plan.id === currentPlanId);
    if (currentPlan) return currentPlan;
  }
  if (hasMeaningfulPlanState(state)) {
    return {
      id: currentPlanId || "local-draft",
      title: state.trip?.name?.trim() || "当前规划草稿"
    };
  }
  return myPlans[0] || null;
}

function sharePlanWithFriend(profileId) {
  syncSocialStateScope();
  if (!hasSocialFriend(profileId)) return { ok: false, message: "只有已添加的好友才能分享行程。" };
  const plan = getDefaultSharePlan();
  if (!plan) return { ok: false, message: "当前还没有可分享的行程计划。" };
  const conversation = ensureSocialConversation(profileId);
  const planTitle = plan.title || "未命名旅行";
  conversation.messages.push(normalizeSocialMessage({
    sender: "me",
    type: "share",
    text: `分享给你一条行程：${planTitle}`,
    planId: plan.id,
    planTitle,
    createdAt: new Date().toISOString()
  }));
  socialState.shares.unshift({
    id: uid("social_share"),
    participantId: profileId,
    direction: "sent",
    planId: plan.id,
    planTitle,
    note: "从个人页直接发起的路线分享。",
    createdAt: new Date().toISOString()
  });
  selectedConversationId = conversation.id;
  persistSocialState();
  return { ok: true, planTitle, profileId };
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
  return placeLibraryState.find((place) => place.id === placeId) || null;
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
