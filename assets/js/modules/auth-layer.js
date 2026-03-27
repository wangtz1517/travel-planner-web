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
    restoreGuestPlaceLibrary();
    saveState(false);
    renderAll();
    return;
  }
  await Promise.all([loadProfile(), loadMyPlans()]);
  try {
    await reconcilePlaceLibraryWithCloud();
  } catch (error) {
    setAccountFeedback(`地点库云端同步失败：${error.message}`, true);
  }
  await maybeMigrateGuestDraftToCloud();
  renderAll();
}

async function maybeMigrateGuestDraftToCloud() {
  if (!supabaseClient || !authSession?.user || !hasMeaningfulPlanState(state)) return false;
  if (currentPlanId && myPlans.some((plan) => plan.id === currentPlanId)) return false;

  const fingerprint = buildGuestDraftFingerprint(state);
  if (!fingerprint || hasGuestDraftMigrationRecord(authSession.user.id, fingerprint)) return false;

  const payload = {
    plan_id: null,
    title: state.trip.name?.trim() || "未命名旅行",
    status: "active",
    start_date: state.trip.startDate || null,
    end_date: state.trip.endDate || null,
    travelers: Math.max(1, Number(state.trip.travelers || 1)),
    snapshot: state,
    archived_at: null,
    new_plan_id: window.crypto?.randomUUID ? window.crypto.randomUUID() : uid("plan")
  };

  try {
    const { data, error } = await supabaseClient.rpc("save_trip_plan", payload);
    if (error) throw error;
    if (!data?.id) throw new Error("未收到有效的云端计划编号");

    markGuestDraftMigrated(authSession.user.id, fingerprint);
    await loadMyPlans();
    setCurrentPlanMeta(data.id, data.status || payload.status);
    saveState(false);
    setAuthFeedback("登录成功，游客草稿已同步到云端");
    setAccountFeedback("已将游客模式下的本地草稿同步到当前账号");
    return true;
  } catch (error) {
    setAccountFeedback(`游客草稿同步失败：${error.message}`, true);
    return false;
  }
}

async function loadProfile() {
  if (!authSession?.user || !supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", authSession.user.id)
    .maybeSingle();
  if (error) {
    setAccountFeedback(`读取个人资料失败：${error.message}`, true);
    return null;
  }
  authProfile = data || null;
  return authProfile;
}

function getCloudPlaceLibrarySnapshot() {
  return normalizePlaceCollection(authProfile?.place_library_snapshot);
}

function getCloudPlaceLibrarySyncedAt() {
  return authProfile?.place_library_synced_at || "";
}

function isPlaceLibrarySchemaMissing(error) {
  const message = String(error?.message || "");
  return message.includes("place_library_snapshot") || message.includes("place_library_synced_at");
}

async function persistPlaceLibraryToCloud(nextPlaces = placeLibraryState, options = {}) {
  if (!supabaseClient || !authSession?.user) return null;
  const { silent = false, successMessage = "" } = options;
  const normalizedPlaces = normalizePlaceCollection(nextPlaces);
  const syncedAt = new Date().toISOString();
  setPlaceLibraryCloudStatus({
    mode: "cloud",
    phase: "syncing",
    detail: silent ? "" : "正在同步地点库...",
    lastSyncedAt: getPlaceLibraryLastSyncedAt()
  });
  if (typeof refreshPlaceLibraryPanels === "function") refreshPlaceLibraryPanels();
  const { data, error } = await supabaseClient
    .from("profiles")
    .update({
      place_library_snapshot: normalizedPlaces,
      place_library_synced_at: syncedAt
    })
    .eq("id", authSession.user.id)
    .select("*")
    .single();
  if (error) {
    if (isPlaceLibrarySchemaMissing(error)) {
      throw new Error("请先在 Supabase SQL Editor 执行 002-profile-place-library.sql 和 003-profile-place-library-sync.sql 脚本");
    }
    throw error;
  }
  authProfile = data || authProfile;
  setPlaceLibraryCloudStatus({
    mode: "cloud",
    phase: "idle",
    detail: successMessage,
    lastSyncedAt: authProfile?.place_library_synced_at || syncedAt
  });
  if (typeof refreshPlaceLibraryPanels === "function") refreshPlaceLibraryPanels();
  if (!silent && successMessage) {
    setCloudStatus(successMessage);
  }
  return authProfile;
}

async function syncPlaceLibraryToCloud(options = {}) {
  const { silent = false, rethrow = false } = options;
  try {
    return await persistPlaceLibraryToCloud(placeLibraryState, options);
  } catch (error) {
    setPlaceLibraryCloudStatus({
      mode: authSession?.user ? "cloud" : "guest",
      phase: "error",
      detail: error.message,
      lastSyncedAt: getPlaceLibraryLastSyncedAt()
    });
    if (typeof refreshPlaceLibraryPanels === "function") refreshPlaceLibraryPanels();
    if (!silent) {
      setCloudStatus(`地点库同步失败：${error.message}`, true);
      setAccountFeedback(`地点库同步失败：${error.message}`, true);
    }
    if (rethrow) throw error;
    return null;
  }
}

async function reconcilePlaceLibraryWithCloud() {
  const cloudPlaces = getCloudPlaceLibrarySnapshot();
  const guestPlaces = loadGuestPlaceLibrary();
  const guestFingerprint = buildPlaceLibraryFingerprint(guestPlaces);
  const shouldImportGuestPlaces = Boolean(
    guestPlaces.length &&
    guestFingerprint &&
    !hasGuestPlaceLibraryMigrationRecord(authSession?.user?.id, guestFingerprint)
  );
  const nextPlaces = shouldImportGuestPlaces
    ? mergePlaceCollections(cloudPlaces, guestPlaces)
    : cloudPlaces;
  const shouldUpdateCloud = !arePlaceCollectionsEqual(cloudPlaces, nextPlaces);

  replacePlaceLibrary(nextPlaces);
  saveState(false);
  if (shouldUpdateCloud) {
    await persistPlaceLibraryToCloud(nextPlaces, { silent: true });
  } else {
    setPlaceLibraryCloudStatus({
      mode: "cloud",
      phase: "idle",
      detail: "",
      lastSyncedAt: getCloudPlaceLibrarySyncedAt()
    });
    if (typeof refreshPlaceLibraryPanels === "function") refreshPlaceLibraryPanels();
  }
  if (shouldImportGuestPlaces) {
    markGuestPlaceLibraryMigrated(authSession?.user?.id, guestFingerprint);
    if (shouldUpdateCloud) {
      setAccountFeedback("已把当前浏览器中的游客地点库并入当前账号云端。");
    }
  }
  return nextPlaces;
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
  prunePlanLibraryMeta(authSession.user.id, myPlans.map((plan) => plan.id));
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
    setActivePage(PAGES.home);
    setAccountFeedback("已退出登录。");
  } catch (error) {
    setAccountFeedback(`退出失败：${error.message}`, true);
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
    const nextState = normalizeState(data.snapshot || {});
    const mergedPlaces = mergePlaceCollections(nextState.places, placeLibraryState);
    state = nextState;
    replacePlaceLibrary(mergedPlaces);
    selectedDayId = state.days[0]?.id || "";
    markPlanOpened(data.id);
    setCurrentPlanMeta(data.id, data.status || "");
    saveState(false);
    renderAll();
    void syncPlaceLibraryToCloud({ silent: true });
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
    markPlanOpened(data.id);
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
