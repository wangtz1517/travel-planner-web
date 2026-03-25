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
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(amapKey)}&plugin=AMap.AutoComplete,AMap.PlaceSearch,AMap.Walking,AMap.Driving,AMap.Transfer,AMap.Riding,AMap.DistrictSearch,AMap.Geocoder&callback=${callbackName}`;
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
