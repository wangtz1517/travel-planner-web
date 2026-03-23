const STORAGE_KEY = "travel_planner_v9";
const APP_CONFIG = window.APP_CONFIG || {};

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

const els = {
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
  routeSummary: document.getElementById("routeSummary"),
  placeCardTemplate: document.getElementById("placeCardTemplate"),
  dayCardTemplate: document.getElementById("dayCardTemplate"),
  itineraryItemTemplate: document.getElementById("itineraryItemTemplate"),
  segmentTemplate: document.getElementById("segmentTemplate")
};

let state = loadState();
let selectedDayId = state.days[0]?.id || "";
let suggestions = [];
let activeSuggestionIndex = -1;
let autocompleteTimer = null;
let dragState = null;
let mapInstance = null;
let mapLoadedKey = "";
let mapOverlays = [];
let autocompleteService = null;
let placeSearchService = null;
let routeServices = {};

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
  return {
    amapKey: APP_CONFIG.amapKey || "",
    amapSecurityJsCode: APP_CONFIG.amapSecurityJsCode || "",
    defaultCity: APP_CONFIG.defaultCity || "全国"
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
  suggestions.slice(0, 5).forEach((item, index) => {
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
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(amapKey)}&plugin=AMap.AutoComplete,AMap.PlaceSearch,AMap.Walking,AMap.Driving,AMap.Transfer,AMap.Riding&callback=${callbackName}`;
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
  if (!placeSearchService) placeSearchService = new AMapRef.PlaceSearch({ city: getConfig().defaultCity || "全国", citylimit: false, pageSize: 5, pageIndex: 1 });
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
        suggestions = tips.slice(0, 5).map((item) => ({
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
    suggestions = pois.slice(0, 5).map((poi) => ({
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
  [els.tripName, els.travelerCount, els.startDate, els.endDate].forEach((input) => {
    input.addEventListener("change", () => {
      syncTripInputsToState();
      saveState();
    });
  });
  els.generateDaysBtn.addEventListener("click", generateDays);
  els.saveBtn.addEventListener("click", () => saveState());
  els.exportBtn.addEventListener("click", () => window.print());
  els.resetBtn.addEventListener("click", () => {
    if (!window.confirm("确定清空本次旅行规划吗？")) return;
    state = createDefaultState();
    selectedDayId = "";
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
  renderPlaces();
  renderDays();
  renderMap();
  saveState(false);
}

bindEvents();
recalculateAllDays(false);
renderAll();
ensureMapReady().catch(() => renderMap());
