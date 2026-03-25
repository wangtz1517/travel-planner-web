function getArchivedPlans() {
  return myPlans.filter((plan) => plan.status === "archived");
}

function extractFootprintPlaces() {
  return getArchivedPlans()
    .flatMap((plan) => {
      const places = Array.isArray(plan?.snapshot?.places) ? plan.snapshot.places : [];
      const fallbackName = String(plan?.snapshot?.trip?.name || plan?.title || "").trim();
      if (!places.length) {
        if (!fallbackName) return [];
        return [{
          name: fallbackName,
          city: fallbackName,
          address: "",
          lng: null,
          lat: null,
          __planId: plan.id,
          __planTitle: plan.title || fallbackName,
          __planUpdatedAt: plan.updated_at || plan.created_at || "",
          __source: "plan-fallback"
        }];
      }
      return places.map((place) => ({
        ...place,
        name: String(place?.name || "").trim() || fallbackName || "未命名地点",
        city: String(place?.city || "").trim() || fallbackName,
        address: String(place?.address || "").trim() || fallbackName,
        lng: toNumberOrNull(place?.lng),
        lat: toNumberOrNull(place?.lat),
        __planId: plan.id,
        __planTitle: plan.title || "未命名行程",
        __planUpdatedAt: plan.updated_at || plan.created_at || "",
        __source: (place?.city || place?.address) ? "place" : "place-with-plan-fallback"
      }));
    })
    .filter((place) => place && (place.city || place.address || place.name));
}

function hideFootprintEmptyState() {
  els.footprintMapEmpty.classList.add("is-hidden");
}

function showFootprintEmptyState(message, badge = "等待点亮") {
  els.footprintBadge.textContent = badge;
  els.footprintMapEmpty.textContent = message;
  els.footprintMapEmpty.classList.remove("is-hidden");
  clearFootprintMarkers();
  clearFootprintInfoWindow();
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
  if (!geocoderService) {
    geocoderService = new AMapRef.Geocoder({
      radius: 1000,
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

function reverseGeocodePlace(place) {
  return new Promise((resolve) => {
    if (!geocoderService || typeof place?.lng !== "number" || typeof place?.lat !== "number") {
      resolve(null);
      return;
    }
    geocoderService.getAddress([place.lng, place.lat], (status, result) => {
      if (status !== "complete") {
        resolve(null);
        return;
      }
      const component = result?.regeocode?.addressComponent;
      if (!component) {
        resolve(null);
        return;
      }
      const provinceName = String(component.province || "").trim();
      const cityField = component.city;
      const districtName = String(component.district || "").trim();
      const cityName = Array.isArray(cityField)
        ? String(cityField[0] || "").trim()
        : String(cityField || "").trim();
      const provinceMatch = resolveProvinceFromText(`${provinceName} ${cityName} ${districtName}`);
      if (!provinceMatch?.provinceAdcode) {
        resolve(null);
        return;
      }
      resolve({
        cityName: cityName || districtName || stripProvinceSuffix(provinceName) || place.name || "已记录城市",
        cityAdcode: "",
        provinceAdcode: provinceMatch.provinceAdcode,
        provinceName: provinceMatch.provinceName
      });
    });
  });
}

async function resolvePlaceDistrict(place) {
  const rawCity = String(place.city || "").trim();
  if (/^\d{6}$/.test(rawCity)) {
    const provinceAdcode = normalizeProvinceAdcode(rawCity);
    return {
      cityName: getProvinceNameByCode(rawCity) !== "æœªçŸ¥çœä»½" ? stripProvinceSuffix(getProvinceNameByCode(rawCity)) : (place.name || rawCity),
      cityAdcode: rawCity,
      provinceAdcode,
      provinceName: getProvinceNameByCode(provinceAdcode)
    };
  }

  const textFields = [place.city, place.address, place.name]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);

  // Coordinates are more reliable than route titles or fallback text when a single plan crosses multiple provinces.
  if (typeof place.lng === "number" && typeof place.lat === "number") {
    const coordKey = `coords:${place.lng},${place.lat}`;
    if (districtLookupCache.has(coordKey)) return districtLookupCache.get(coordKey);
    const reverseResolved = await reverseGeocodePlace(place);
    if (reverseResolved?.provinceAdcode) {
      districtLookupCache.set(coordKey, reverseResolved);
      return reverseResolved;
    }
  }

  for (const term of textFields) {
    const directProvinceMatch = resolveProvinceFromText(term);
    if (!directProvinceMatch) continue;
    return {
      cityName: directProvinceMatch.cityName || rawCity || place.name || "已记录城市",
      cityAdcode: directProvinceMatch.cityAdcode || "",
      provinceAdcode: directProvinceMatch.provinceAdcode,
      provinceName: directProvinceMatch.provinceName
    };
  }

  const searchTerms = textFields.filter((term) => findProvinceMatchesInText(term).length <= 1);
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

  const combinedProvinceMatch = resolveProvinceFromText(textFields.join(" "));
  if (combinedProvinceMatch) {
    return {
      cityName: combinedProvinceMatch.cityName || rawCity || place.name || "已记录城市",
      cityAdcode: combinedProvinceMatch.cityAdcode || "",
      provinceAdcode: combinedProvinceMatch.provinceAdcode,
      provinceName: combinedProvinceMatch.provinceName
    };
  }

  const coordKey = `coords:${place.lng},${place.lat}`;
  if (districtLookupCache.has(coordKey)) return districtLookupCache.get(coordKey);
  const reverseResolved = await reverseGeocodePlace(place);
  if (reverseResolved?.provinceAdcode) {
    districtLookupCache.set(coordKey, reverseResolved);
    return reverseResolved;
  }
  return null;
}

function clearFootprintMarkers() {
  if (!footprintMapInstance || !footprintMarkers.length) return;
  footprintMarkers.forEach((marker) => footprintMapInstance.remove(marker));
  footprintMarkers = [];
}

function getProvinceNameByCode(adcode) {
  return PROVINCE_NAME_MAP[String(adcode || "")] || "未知省份";
}

function stripProvinceSuffix(name) {
  return String(name || "")
    .replace(/(省|市|自治区|特别行政区|壮族自治区|回族自治区|维吾尔自治区)$/u, "")
    .trim();
}

function findProvinceMatchesInText(text) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) return [];

  const municipalities = [
    { code: "110000", name: "北京市", aliases: ["北京"] },
    { code: "120000", name: "天津市", aliases: ["天津"] },
    { code: "310000", name: "上海市", aliases: ["上海"] },
    { code: "500000", name: "重庆市", aliases: ["重庆"] }
  ];
  const matches = [];

  const pushMatch = (match) => {
    if (!match?.provinceAdcode) return;
    if (matches.some((item) => item.provinceAdcode === match.provinceAdcode)) return;
    matches.push(match);
  };

  for (const province of municipalities) {
    if (province.aliases.some((alias) => normalizedText.includes(alias))) {
      pushMatch({
        provinceAdcode: province.code,
        provinceName: province.name,
        cityAdcode: province.code,
        cityName: province.aliases[0]
      });
    }
  }

  for (const [code, provinceName] of Object.entries(PROVINCE_NAME_MAP)) {
    const shortName = stripProvinceSuffix(provinceName);
    if (normalizedText.includes(provinceName) || (shortName && normalizedText.includes(shortName))) {
      pushMatch({
        provinceAdcode: code,
        provinceName,
        cityAdcode: "",
        cityName: ""
      });
    }
  }

  return matches;
}

function resolveProvinceFromText(text) {
  const matches = findProvinceMatchesInText(text);
  return matches.length === 1 ? matches[0] : null;
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

function fitFootprintMapToPositions(positions, AMapRef = window.AMap) {
  if (!footprintMapInstance || !AMapRef) return false;
  const validPositions = Array.isArray(positions)
    ? positions.filter((position) => Array.isArray(position) && Number.isFinite(position[0]) && Number.isFinite(position[1]))
    : [];
  if (!validPositions.length) return false;

  if (validPositions.length === 1) {
    footprintMapInstance.setZoomAndCenter(9.5, validPositions[0]);
    return true;
  }

  const lngList = validPositions.map((position) => position[0]);
  const latList = validPositions.map((position) => position[1]);
  const southWest = new AMapRef.LngLat(Math.min(...lngList), Math.min(...latList));
  const northEast = new AMapRef.LngLat(Math.max(...lngList), Math.max(...latList));
  const bounds = new AMapRef.Bounds(southWest, northEast);
  footprintMapInstance.setBounds(bounds, false, [72, 72, 72, 72]);
  return true;
}

function resetFootprintMapToChinaView() {
  if (!footprintMapInstance || !window.AMap) return;
  const chinaSouthWest = new window.AMap.LngLat(69.5, 14.0);
  const chinaNorthEast = new window.AMap.LngLat(137.5, 56.5);
  const chinaBounds = new window.AMap.Bounds(chinaSouthWest, chinaNorthEast);
  footprintMapInstance.setBounds(chinaBounds, false, [36, 36, 36, 36]);
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
  if (provinceData?.positions?.length && footprintMapInstance) fitFootprintMapToPositions(provinceData.positions, window.AMap);
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
    showFootprintEmptyState("已归档计划里暂时还没有可识别的地点信息。重新打开计划保存一次后，再归档会更容易点亮。", "等待识别");
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
      if (typeof cityEntry.lng === "number" && typeof cityEntry.lat === "number") {
        provinceEntry.positions.push([cityEntry.lng, cityEntry.lat]);
      }
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
    footprintMarkers = [...cityMap.values()]
      .filter((cityEntry) => typeof cityEntry.lng === "number" && typeof cityEntry.lat === "number")
      .map((cityEntry) => {
      const marker = new AMapRef.CircleMarker({
        center: [cityEntry.lng, cityEntry.lat],
        radius: 6,
        strokeColor: "rgba(255, 250, 244, 0.96)",
        strokeWeight: 2,
        strokeOpacity: 1,
        fillColor: "#cd8147",
        fillOpacity: 0.95,
        bubble: true,
        zIndex: 22,
        cursor: "default"
      });
      return marker;
    });
    footprintMarkers.forEach((marker) => footprintMapInstance.add(marker));

    resetFootprintMapToChinaView();
    footprintMapInstance.resize();
  } catch (error) {
    showFootprintEmptyState(`足迹地图加载失败：${error.message}`, "加载失败");
  }
}
