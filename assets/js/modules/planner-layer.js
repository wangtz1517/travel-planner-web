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
