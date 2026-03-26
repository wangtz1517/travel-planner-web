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
  return {
    stayMinutes,
    travelMinutes,
    distanceKm,
    diagnostics: getDayDiagnostics(day, { stayMinutes, travelMinutes, distanceKm })
  };
}

function inferPlaceLibraryCategory(item) {
  const rawText = `${item?.type || ""} ${item?.name || ""}`.toLowerCase();
  if (/(酒店|宾馆|民宿|客栈|住宿)/.test(rawText)) return "stay";
  if (/(餐厅|美食|小吃|咖啡|奶茶|火锅|烤鸭|饭店)/.test(rawText)) return "food";
  if (/(景点|公园|博物馆|乐园|古镇|广场|山|寺|玩)/.test(rawText)) return "play";
  return "other";
}

function updatePlaceLibraryEntry(placeId, patch) {
  const place = state.places.find((entry) => entry.id === placeId);
  if (!place) return;
  Object.assign(place, patch);
  saveState(false);
  renderAll();
}

function buildPlaceIdentityKey(entry) {
  const poiId = normalizePlanText(entry?.poiId || "");
  if (poiId) return `poi:${poiId}`;
  const name = normalizePlanText(entry?.name || "");
  const province = normalizePlanText(entry?.province || "");
  const city = normalizePlanText(entry?.city || entry?.adcode || "");
  const district = normalizePlanText(entry?.district || "");
  const address = normalizePlanText(entry?.address || "");
  const lng = toNumberOrNull(entry?.lng ?? entry?.location?.lng);
  const lat = toNumberOrNull(entry?.lat ?? entry?.location?.lat);
  const geo = lng != null && lat != null ? `|geo:${lng.toFixed(6)},${lat.toFixed(6)}` : "";
  return `name:${name}|province:${province}|city:${city}|district:${district}|address:${address}${geo}`;
}

function findDuplicatePlace(item) {
  const itemKey = buildPlaceIdentityKey(item);
  return state.places.find((place) => buildPlaceIdentityKey(place) === itemKey) || null;
}

function getDayDiagnostics(day, stats = getDayStats(day)) {
  const diagnostics = [];
  const items = Array.isArray(day?.items) ? day.items : [];
  const middleStops = Math.max(0, items.length - 2);
  const firstItem = items[0] || null;
  const lastItem = items[items.length - 1] || null;
  const firstStartMinutes = parseClock(firstItem?.startTime || "");
  const lastLeaveMinutes = parseClock(lastItem?.leaveTime || lastItem?.arrivalTime || "");
  const hasMissingSchedule = items.some((item, index) => {
    if (index === 0) return parseClock(item.startTime || "") == null;
    const arrival = parseClock(item.arrivalTime || "");
    if (arrival == null) return true;
    if (index < items.length - 1) {
      const leave = parseClock(item.leaveTime || "");
      if (leave == null || leave < arrival) return true;
    }
    return false;
  });

  if (!items.length) {
    diagnostics.push({
      level: "info",
      tone: "calm",
      label: "待开始",
      message: "这一天还没有安排地点，可以先从起点和核心目的地开始。"
    });
    return diagnostics;
  }

  if (hasMissingSchedule || firstStartMinutes == null) {
    diagnostics.push({
      level: "warning",
      tone: "danger",
      label: "时间冲突",
      message: "部分时间未形成有效衔接，请检查出发时间或停留时长。"
    });
  }

  if (lastLeaveMinutes != null && lastLeaveMinutes >= 21 * 60 + 30) {
    diagnostics.push({
      level: "warning",
      tone: "warning",
      label: "结束偏晚",
      message: `当前预计结束时间约 ${formatClock(lastItem?.leaveTime || lastItem?.arrivalTime)}，节奏偏晚。`
    });
  }

  if (stats.travelMinutes >= 180 || stats.distanceKm >= 80) {
    diagnostics.push({
      level: "warning",
      tone: "warning",
      label: "奔波偏多",
      message: "当天路程较长，建议压缩跨城或远距离移动。"
    });
  }

  if (middleStops >= 6 || (middleStops >= 5 && stats.travelMinutes >= 120)) {
    diagnostics.push({
      level: "warning",
      tone: "warning",
      label: "节奏过满",
      message: `当前共安排 ${middleStops} 个中间停留点，建议删减或拆分到其他天。`
    });
  }

  if (!diagnostics.length && middleStops > 0 && stats.travelMinutes <= 90 && lastLeaveMinutes != null && lastLeaveMinutes <= 20 * 60) {
    diagnostics.push({
      level: "info",
      tone: "positive",
      label: "节奏平衡",
      message: "当天节奏较均衡，可以继续细化备注、预约和预算。"
    });
  }

  return diagnostics;
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

function clearSuggestions() {
  suggestions = [];
  activeSuggestionIndex = -1;
  els.suggestions.classList.remove("has-items");
  els.suggestions.innerHTML = "";
}

function removeSuggestionFromList(item) {
  if (!item) return;
  suggestions = suggestions.filter((entry) => {
    if (entry.id && item.id) return entry.id !== item.id;
    return !(
      String(entry.name || "").trim() === String(item.name || "").trim() &&
      String(entry.address || "").trim() === String(item.address || "").trim()
    );
  });
  activeSuggestionIndex = suggestions.length ? Math.min(activeSuggestionIndex, suggestions.length - 1) : -1;
}

function refreshPlaceLibraryPanels() {
  renderPlaces();
  renderPlaceLibraryList();
  renderProfileHub();
}

function refreshSuggestionsForCurrentKeyword() {
  const keyword = els.searchKeyword.value.trim();
  if (!keyword) {
    clearSuggestions();
    return;
  }
  searchPlaces(keyword);
}

function addPlaceFromSuggestion(item) {
  if (!item) return;
  const existingPlace = findDuplicatePlace(item);
  if (existingPlace) {
    placeLibraryNotice = `已跳过重复地点：${existingPlace.name}`;
    setCloudStatus(`地点库里已经有“${existingPlace.name}”，已跳过重复添加。`);
    removeSuggestionFromList(item);
    renderSuggestions();
    refreshPlaceLibraryPanels();
    return;
  }
  const nextPlaceName = item.name || "未命名地点";
  state.places.push({
    id: uid("place"),
    name: nextPlaceName,
    category: inferPlaceLibraryCategory(item),
    province: item.pname || "",
    city: item.city || item.adcode || "",
    district: item.district || "",
    address: item.address || item.district || "",
    lng: item.location?.lng ?? null,
    lat: item.location?.lat ?? null,
    poiId: item.id || "",
    sourceKey: buildPlaceIdentityKey(item)
  });
  placeLibraryFilter = "all";
  placeLibrarySearchQuery = "";
  placeLibraryNotice = `已加入地点库：${nextPlaceName}`;
  saveState();
  setCloudStatus(`已加入地点库：${nextPlaceName}`);
  removeSuggestionFromList(item);
  renderSuggestions();
  refreshPlaceLibraryPanels();
}
