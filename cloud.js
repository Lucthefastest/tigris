/* TIGRIS Cloud: Konten, Profil, Einwilligung, Nutzungs-Tracking, Uploads, Projekte.
   Zwei Umsetzungen hinter derselben Schnittstelle:
   - Supabase (wenn config.js URL + anon key enthält)
   - Lokaler Testmodus (alles nur im localStorage dieses Browsers) */
(function () {
  const CFG = window.TIGRIS_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }
  };
  const rid = () => (crypto.randomUUID ? crypto.randomUUID() : 'x' + Math.random().toString(36).slice(2) + Date.now().toString(36));
  const anonId = LS.get('tigris.anon') || (() => { const v = rid(); LS.set('tigris.anon', v); return v })();
  const sessionId = rid();
  const listeners = [];
  const C = { live: LIVE, user: null, profile: null, anonId, sessionId };

  /* ---------- Einwilligung (Consent) ---------- */
  // stats = Nutzungsanalyse (Klicks, Verweildauer, Uploads, Planinhalte). Notwendige Speicherung ist immer an.
  C.consent = () => LS.get('tigris.consent', { decided: false, stats: false, at: null, v: 1 });
  C.setConsent = (stats) => {
    const c = { decided: true, stats: !!stats, at: new Date().toISOString(), v: 1 };
    LS.set('tigris.consent', c);
    if (C.user) C.saveProfile({ tracking_consent: c.stats, tracking_consent_at: c.at }).catch(() => { });
    if (c.stats) startSession(); else { queue.length = 0 }
    return c;
  };
  const tracking = () => C.consent().stats === true;

  /* ---------- Adapter: Supabase ---------- */
  let sb = null;
  if (LIVE && window.supabase) {
    sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } });
  }
  const back = location.origin + location.pathname;

  const remote = {
    async init() {
      const { data } = await sb.auth.getSession();
      await setUser(data.session ? data.session.user : null);
      sb.auth.onAuthStateChange((ev, s) => { if (ev === 'PASSWORD_RECOVERY') { C.recovery = true; if (window.Account) window.Account.open('newpw') } setTimeout(() => setUser(s ? s.user : null), 0) });
    },
    async signUp(email, password, meta) {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: back + '?auth=1' } });
      if (error) throw error;
      return { needsConfirm: !data.session };
    },
    async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error },
    async google() { const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back + '?auth=1' } }); if (error) throw error },
    async signOut() { await sb.auth.signOut() },
    async updatePassword(pw) { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error },
    async resetPw(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back + '?auth=1' }); if (error) throw error },
    async loadProfile(u) { const { data } = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle(); return data },
    async saveProfile(p) { const { data, error } = await sb.from('profiles').update(p).eq('id', C.user.id).select().maybeSingle(); if (error) throw error; return data },
    async deleteAccount() { const { error } = await sb.rpc('delete_my_account'); if (error) throw error; await sb.auth.signOut() },
    async sendEvents(rows) { const { error } = await sb.from('events').insert(rows); if (error) throw error },
    beacon(rows) {
      // beim Schließen der Seite: fetch mit keepalive, damit die letzten Ereignisse ankommen
      sb.auth.getSession().then(({ data }) => {
        const tok = data.session ? data.session.access_token : CFG.supabaseAnonKey;
        fetch(CFG.supabaseUrl + '/rest/v1/events', { method: 'POST', keepalive: true, headers: { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(rows) }).catch(() => { });
      });
    },
    async uploadPlan(file, meta) {
      const path = C.user.id + '/' + Date.now() + '-' + file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
      const up = await sb.storage.from('plans').upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) throw up.error;
      const { data, error } = await sb.from('uploads').insert({ user_id: C.user.id, path, file_name: file.name, size: file.size, mime: file.type, result: meta || {} }).select('id').single();
      if (error) throw error; return data.id;
    },
    async updateUpload(id, result) { await sb.from('uploads').update({ result }).eq('id', id) },
    async saveProject(name, data) { await sb.from('projects').upsert({ user_id: C.user.id, name, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,name' }) },
    async isAdmin() { if (!C.user) return false; const { data } = await sb.from('admins').select('user_id').eq('user_id', C.user.id).maybeSingle(); return !!data },
    async admin() {
      const [u, it, ev, up] = await Promise.all([
        sb.from('admin_user_overview').select('*').order('last_seen_at', { ascending: false, nullsFirst: false }).limit(1000),
        sb.from('admin_item_popularity').select('*').limit(100),
        sb.from('events').select('created_at,user_id,anon_id,session_id,type,data,path').order('created_at', { ascending: false }).limit(3000),
        sb.from('uploads').select('*').order('created_at', { ascending: false }).limit(500)
      ]);
      for (const r of [u, it, ev, up]) if (r.error) throw r.error;
      return { users: u.data, items: it.data, events: ev.data, uploads: up.data };
    },
    async uploadUrl(path) { const { data } = await sb.storage.from('plans').createSignedUrl(path, 600); return data && data.signedUrl }
  };

  /* ---------- Adapter: lokaler Testmodus ---------- */
  const sha = async s => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('') };
  const local = {
    users: () => LS.get('tigris.local.users', []),
    async init() { const id = LS.get('tigris.local.session'); const u = local.users().find(x => x.id === id); await setUser(u ? { id: u.id, email: u.email } : null) },
    async signUp(email, password, meta) {
      const us = local.users(); if (us.some(x => x.email === email.toLowerCase())) throw new Error('Diese E-Mail ist bereits registriert.');
      const u = { id: rid(), email: email.toLowerCase(), pw: await sha(password), created_at: new Date().toISOString() };
      u.profile = profileFromMeta(u, meta); us.push(u); LS.set('tigris.local.users', us);
      if (us.length === 1) LS.set('tigris.local.admins', [u.id]); // erster lokaler Nutzer = Admin (nur Testmodus)
      LS.set('tigris.local.session', u.id); await setUser({ id: u.id, email: u.email }); return { needsConfirm: false };
    },
    async signIn(email, password) { const u = local.users().find(x => x.email === email.toLowerCase()); if (!u || u.pw !== await sha(password)) throw new Error('E-Mail oder Passwort ist falsch.'); LS.set('tigris.local.session', u.id); await setUser({ id: u.id, email: u.email }) },
    async google() { throw new Error('Google-Anmeldung ist erst nach dem Verbinden mit Supabase verfügbar.') },
    async signOut() { LS.set('tigris.local.session', null); await setUser(null) },
    async resetPw() { throw new Error('Im lokalen Testmodus nicht verfügbar.') },
    async updatePassword() { throw new Error('Im lokalen Testmodus nicht verfügbar.') },
    async loadProfile(u) { const x = local.users().find(v => v.id === u.id); return x ? x.profile : null },
    async saveProfile(p) { const us = local.users(), x = us.find(v => v.id === C.user.id); Object.assign(x.profile, p); LS.set('tigris.local.users', us); return x.profile },
    async deleteAccount() { const id = C.user.id; LS.set('tigris.local.users', local.users().filter(v => v.id !== id)); LS.set('tigris.local.events', LS.get('tigris.local.events', []).filter(e => e.user_id !== id)); LS.set('tigris.local.uploads', LS.get('tigris.local.uploads', []).filter(e => e.user_id !== id)); await local.signOut() },
    async sendEvents(rows) { const ev = LS.get('tigris.local.events', []); rows.forEach(r => ev.push(Object.assign({ created_at: new Date().toISOString() }, r))); LS.set('tigris.local.events', ev.slice(-5000)) },
    beacon(rows) { local.sendEvents(rows) },
    async uploadPlan(file, meta) { const up = LS.get('tigris.local.uploads', []), id = up.length + 1; up.push({ id, created_at: new Date().toISOString(), user_id: C.user.id, path: null, file_name: file.name, size: file.size, mime: file.type, result: meta || {} }); LS.set('tigris.local.uploads', up); return id },
    async updateUpload(id, result) { const up = LS.get('tigris.local.uploads', []), x = up.find(v => v.id === id); if (x) { x.result = result; LS.set('tigris.local.uploads', up) } },
    async saveProject(name, data) { const pr = LS.get('tigris.local.projects', {}); pr[C.user.id + '/' + name] = { name, user_id: C.user.id, updated_at: new Date().toISOString(), items: (data.items || []).length }; LS.set('tigris.local.projects', pr) },
    async isAdmin() { return !!C.user && LS.get('tigris.local.admins', []).includes(C.user.id) },
    async admin() {
      const ev = LS.get('tigris.local.events', []), ups = LS.get('tigris.local.uploads', []);
      const users = local.users().map(u => { const e = ev.filter(x => x.user_id === u.id); return Object.assign({}, u.profile, { id: u.id, email: u.email, created_at: u.created_at, events: e.length, active_seconds: e.filter(x => x.type === 'heartbeat').reduce((s, x) => s + (x.data.sec || 0), 0), sessions: new Set(e.map(x => x.session_id)).size, uploads: ups.filter(x => x.user_id === u.id).length, last_seen_at: e.length ? e[e.length - 1].created_at : null }) });
      const m = {}; ev.filter(e => e.type === 'add_item').forEach(e => { const k = e.data.item; m[k] = m[k] || { item: k, name: e.data.name, adds: 0, u: new Set() }; m[k].adds++; m[k].u.add(e.user_id || e.anon_id) });
      const items = Object.values(m).map(x => ({ item: x.item, name: x.name, adds: x.adds, users: x.u.size })).sort((a, b) => b.adds - a.adds);
      return { users, items, events: ev.slice().reverse().slice(0, 3000), uploads: ups.slice().reverse() };
    },
    async uploadUrl() { return null }
  };
  const A = LIVE && sb ? remote : local;
  C.mode = A === remote ? 'supabase' : 'local';

  function profileFromMeta(u, m) {
    m = m || {};
    return { id: u.id, email: u.email, full_name: m.full_name || '', company: m.company || '', role: m.role || '', city: m.city || '', country: m.country || '', phone: m.phone || '',
      marketing_opt_in: !!m.marketing_opt_in, marketing_opt_in_at: m.marketing_opt_in ? new Date().toISOString() : null,
      terms_accepted_at: m.terms_accepted ? new Date().toISOString() : null, tracking_consent: !!m.tracking_consent, created_at: new Date().toISOString() };
  }
  async function setUser(u) {
    const changed = (C.user && C.user.id) !== (u && u.id);
    C.user = u; C.profile = u ? await A.loadProfile(u).catch(() => null) : null;
    if (u && changed) {
      // Einwilligung aus dem Konto übernehmen, falls auf diesem Gerät noch nicht entschieden
      const c = C.consent();
      if (!c.decided && C.profile && C.profile.tracking_consent) LS.set('tigris.consent', { decided: true, stats: true, at: C.profile.tracking_consent_at || new Date().toISOString(), v: 1 });
      if (tracking()) { startSession(); C.track('login', { method: u.app_metadata && u.app_metadata.provider || 'email' }) }
    }
    listeners.forEach(f => { try { f(C.user, C.profile) } catch (e) { console.error(e) } });
  }
  C.onAuth = f => { listeners.push(f) };
  C.init = async () => { try { await A.init() } catch (e) { console.warn('Cloud init', e) } return C.user };
  C.signUp = (email, pw, meta) => A.signUp(email, pw, meta);
  C.signIn = (email, pw) => A.signIn(email, pw);
  C.google = () => A.google();
  C.signOut = async () => { C.track('logout'); flush(); await A.signOut() };
  C.resetPw = e => A.resetPw(e);
  C.updatePassword = pw => A.updatePassword(pw);
  C.saveProfile = async p => { if (!C.user) return; C.profile = await A.saveProfile(p) || Object.assign(C.profile || {}, p); listeners.forEach(f => f(C.user, C.profile)); return C.profile };
  C.deleteAccount = () => A.deleteAccount();
  C.isAdmin = () => A.isAdmin();
  C.admin = () => A.admin();
  C.uploadUrl = p => A.uploadUrl(p);
  C.needsProfile = () => !!C.user && (!C.profile || !C.profile.terms_accepted_at || !C.profile.full_name || !C.profile.company || !C.profile.city);

  /* ---------- Tracking ---------- */
  const queue = [];
  let started = false, lastAct = Date.now(), activeAcc = 0, lastTick = Date.now();
  C.track = (type, data) => {
    if (!tracking() || window.TIGRIS_NO_TRACK) return;
    queue.push({ user_id: C.user ? C.user.id : null, anon_id: anonId, session_id: sessionId, type, data: data || {}, path: location.pathname + location.hash });
    if (queue.length >= 25) flush();
  };
  async function flush() {
    if (!queue.length) return; const rows = queue.splice(0, queue.length);
    try { await A.sendEvents(rows) } catch (e) { console.warn('track', e) }
  }
  function startSession() {
    if (started || !tracking() || window.TIGRIS_NO_TRACK) return; started = true;
    const q = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => { if (q.get(k)) utm[k] = q.get(k) });
    C.track('session_start', { tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: navigator.language, screen: screen.width + 'x' + screen.height, mobile: matchMedia('(pointer:coarse)').matches, referrer: document.referrer ? new URL(document.referrer).host : '', utm });
  }
  // aktive Zeit: zählt nur, solange der Tab sichtbar ist und in den letzten 60 s Maus/Tastatur benutzt wurde
  ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now() }, { passive: true }));
  setInterval(() => {
    const now = Date.now(); if (document.visibilityState === 'visible' && now - lastAct < 60000) activeAcc += (now - lastTick) / 1000; lastTick = now;
    if (activeAcc >= 30) { C.track('heartbeat', { sec: Math.round(activeAcc) }); activeAcc = 0 }
  }, 5000);
  setInterval(flush, 8000);
  addEventListener('pagehide', () => {
    if (tracking() && activeAcc >= 1) { C.track('heartbeat', { sec: Math.round(activeAcc) }); activeAcc = 0 }
    if (queue.length) { const rows = queue.splice(0, queue.length); A.beacon(rows) }
  });
  C.flush = flush;

  /* ---------- Uploads & Projekte (nur mit Konto) ---------- */
  C.uploadPlan = async (file, meta) => { if (!C.user || !tracking()) return null; try { return await A.uploadPlan(file, meta) } catch (e) { console.warn('upload', e); return null } };
  C.updateUpload = (id, r) => id != null && A.updateUpload(id, r).catch(() => { });
  let pt = null;
  C.saveProject = (name, data) => { if (!C.user) return; clearTimeout(pt); pt = setTimeout(() => A.saveProject(name || 'Neues Studio', data).catch(e => console.warn('project', e)), 4000) };

  if (tracking()) startSession();
  window.Cloud = C;
})();
