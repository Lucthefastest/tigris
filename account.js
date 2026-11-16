/* TIGRIS Konto-Oberfläche: Anmeldung, Registrierung, Profil, Einwilligung, Konto-Einstellungen, Klick-Tracking */
(function () {
  const C = window.Cloud, q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ROLES = ['Studio-Betreiber/in', 'Gründer/in (Studio in Planung)', 'Investor/in', 'Trainer/in', 'Architekt/in / Planer/in', 'Hotel / Wellness / Reha', 'Verein / Schule / Kommune', 'Sonstiges'];
  const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz', 'Liechtenstein', 'Luxemburg', 'Niederlande', 'Belgien', 'Frankreich', 'Italien', 'Spanien', 'Polen', 'Tschechien', 'Dänemark', 'Vereinigtes Königreich', 'Anderes Land'];
  const G = '<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';

  /* ---------- Grundgerüst einfügen ---------- */
  document.body.insertAdjacentHTML('beforeend', `
  <div class="ov" id="acOv"><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="acTitle"><button class="x" id="acX" aria-label="Schließen">×</button><div id="acBody"></div></div></div>
  <div class="cbar" id="cBar" role="dialog" aria-label="Datenschutz-Einstellungen">
    <h4>Datenschutz-Einstellungen</h4>
    <p>Technisch Notwendiges (Anmeldung, dein gespeicherter Plan, diese Auswahl) speichern wir immer. <b>Mit deiner Einwilligung</b> werten wir zusätzlich aus, wie du TIGRIS nutzt: Klicks, gewählte Geräte und Funktionen, Verweildauer, ungefähre Herkunft (Zeitzone, Sprache) sowie hochgeladene Grundrisse – bei Anmeldung deinem Konto zugeordnet. Damit verbessern wir das Produkt und erkennen, welche Ausstattung gefragt ist. Kontakt zu Angeboten gibt es nur, wenn du dem bei der Registrierung gesondert zustimmst. Widerruf jederzeit unter „Cookie-Einstellungen“. <a data-legal="datenschutz">Datenschutzerklärung</a></p>
    <div class="acts"><button class="btn" id="cNo">Nur notwendige</button><button class="btn" id="cSet">Einstellungen</button><button class="btn solid" id="cYes">Alle akzeptieren</button></div>
  </div>`);
  const ov = q('#acOv'), body = q('#acBody'), bar = q('#cBar');
  let pending = null, view = null;
  const open = (v, o) => { view = v; q('.dlg', ov).classList.toggle('wide', v === 'account'); body.innerHTML = VIEWS[v](o || {}); ov.classList.add('on'); WIRE[v] && WIRE[v](o || {}); const f = q('input,select', body); if (f && v !== 'consent') setTimeout(() => f.focus(), 30) };
  const close = () => { ov.classList.remove('on'); view = null };
  q('#acX').onclick = () => { close(); pending = null };
  ov.addEventListener('mousedown', e => { if (e.target === ov && view !== 'profile') { close(); pending = null } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('on') && view !== 'profile') { close(); pending = null } });
  const msg = (t, ok) => { const m = q('.msg', body); if (m) { m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = t } };
  const busy = (b, on) => { if (b) { b.disabled = on; b.style.opacity = on ? .6 : 1 } };
  const legalUrl = k => k + '.html';
  document.addEventListener('click', e => { const a = e.target.closest('[data-legal]'); if (!a) return; e.preventDefault(); if (a.dataset.legal === 'cookies') { open('consent') } else window.open(legalUrl(a.dataset.legal), '_blank', 'noopener') });

  /* ---------- Formularteile ---------- */
  const fld = (n, l, v, o = {}) => `<label class="fld"><span class="${o.req ? 'req' : ''}">${l}</span><input name="${n}" type="${o.type || 'text'}" value="${esc(v)}" ${o.req ? 'required' : ''} ${o.ac ? `autocomplete="${o.ac}"` : ''} ${o.min ? `minlength="${o.min}"` : ''} ${o.list ? `list="${o.list}"` : ''} maxlength="${o.max || 120}"></label>`;
  const sel = (n, l, v, opts, req) => `<label class="fld"><span class="${req ? 'req' : ''}">${l}</span><select name="${n}" ${req ? 'required' : ''}><option value="">Bitte wählen …</option>${opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  const profileFields = p => `
    ${fld('full_name', 'Vor- und Nachname', p.full_name, { req: 1, ac: 'name' })}
    <div class="two">${fld('company', 'Firma / Studio / Projekt', p.company, { req: 1, ac: 'organization' })}${sel('role', 'Rolle', p.role, ROLES, 1)}</div>
    <div class="two">${fld('city', 'Stadt / Ort', p.city, { req: 1, ac: 'address-level2' })}${sel('country', 'Land', p.country || 'Deutschland', COUNTRIES, 1)}</div>
    ${fld('phone', 'Telefon (optional)', p.phone, { type: 'tel', ac: 'tel', max: 40 })}`;
  const consentBoxes = (p, withTerms) => `
    ${withTerms ? `<label class="chk"><input type="checkbox" name="terms" required><span>Ich akzeptiere die <a data-legal="agb">AGB</a> und habe die <a data-legal="datenschutz">Datenschutzerklärung</a> gelesen. <b class="req"></b></span></label>` : ''}
    <label class="chk"><input type="checkbox" name="marketing" ${p.marketing_opt_in ? 'checked' : ''}><span><b>Optional:</b> TIGRIS darf mich per E-Mail und Telefon zu Angeboten kontaktieren (günstigerer Geräteeinkauf, individuell gefertigte Anlagen, Finanzierung/Leasing-Alternativen, Beratungstermine) und dafür meine Profil- und Nutzungsdaten auswerten. Widerruf jederzeit im Konto oder per E-Mail.</span></label>`;
  const readForm = f => { const d = Object.fromEntries(new FormData(f).entries()); ['full_name', 'company', 'city', 'phone', 'email'].forEach(k => { if (d[k] != null) d[k] = d[k].trim() }); return d };
  const errText = e => { const m = (e && e.message) || String(e); if (/Invalid login/i.test(m)) return 'E-Mail oder Passwort ist falsch.'; if (/already registered|already been registered/i.test(m)) return 'Diese E-Mail ist bereits registriert – bitte anmelden.'; if (/Email not confirmed/i.test(m)) return 'Bitte bestätige zuerst deine E-Mail-Adresse (Link in der Bestätigungsmail).'; if (/Password should be/i.test(m)) return 'Das Passwort ist zu kurz (mindestens 8 Zeichen).'; if (/rate limit/i.test(m)) return 'Zu viele Versuche – bitte kurz warten.'; return m };

  /* ---------- Ansichten ---------- */
  const VIEWS = {
    login: o => `<h3 id="acTitle">Anmelden</h3><p class="sub">${o.gate ? 'Planen ist frei. Zum Herunterladen (Stückliste, PNG, JSON) brauchst du ein kostenloses Konto – dauert eine Minute. Dein Layout bleibt erhalten.' : 'Willkommen zurück bei TIGRIS.'}</p>
      <button class="gbtn" id="aG" type="button">${G}Mit Google fortfahren</button><div class="or">oder mit E-Mail</div>
      <form id="aF">${fld('email', 'E-Mail', '', { type: 'email', req: 1, ac: 'email' })}${fld('password', 'Passwort', '', { type: 'password', req: 1, ac: 'current-password' })}
      <div class="acts"><button class="btn solid" type="submit">Anmelden</button></div><div class="msg"></div></form>
      <div class="foot"><a class="lnk" id="aReset">Passwort vergessen?</a> · Neu hier? <a class="lnk" id="aToS">Konto erstellen</a></div>${C.mode === 'local' ? '<p class="foot">Testmodus: Konten werden nur in diesem Browser gespeichert.</p>' : ''}`,
    signup: o => `<h3 id="acTitle">Kostenloses Konto erstellen</h3><p class="sub">Damit speichern wir deine Planung und du kannst sie jederzeit weiterbearbeiten.</p>
      <button class="gbtn" id="aG" type="button">${G}Mit Google registrieren</button><div class="or">oder mit E-Mail</div>
      <form id="aF">${profileFields({})}${fld('email', 'E-Mail', '', { type: 'email', req: 1, ac: 'email' })}${fld('password', 'Passwort (mind. 8 Zeichen)', '', { type: 'password', req: 1, ac: 'new-password', min: 8 })}
      ${consentBoxes({}, true)}<div class="acts"><button class="btn solid" type="submit">Konto erstellen</button></div><div class="msg"></div></form>
      <div class="foot">Schon registriert? <a class="lnk" id="aToL">Anmelden</a></div>`,
    profile: () => `<h3 id="acTitle">Profil vervollständigen</h3><p class="sub">Noch ein paar Angaben, damit wir deine Planung richtig zuordnen können.</p>
      <form id="aF">${profileFields(C.profile || {})}${consentBoxes(C.profile || {}, !(C.profile && C.profile.terms_accepted_at))}<div class="acts"><button class="btn solid" type="submit">Weiter zum Planer</button></div><div class="msg"></div></form>
      <div class="foot"><a class="lnk" id="aOut">Abmelden</a></div>`,
    reset: () => `<h3 id="acTitle">Passwort zurücksetzen</h3><p class="sub">Wir schicken dir einen Link zum Festlegen eines neuen Passworts.</p>
      <form id="aF">${fld('email', 'E-Mail', '', { type: 'email', req: 1, ac: 'email' })}<div class="acts"><button class="btn solid" type="submit">Link senden</button></div><div class="msg"></div></form><div class="foot"><a class="lnk" id="aToL">Zurück zur Anmeldung</a></div>`,
    newpw: () => `<h3 id="acTitle">Neues Passwort</h3><form id="aF">${fld('password', 'Neues Passwort (mind. 8 Zeichen)', '', { type: 'password', req: 1, ac: 'new-password', min: 8 })}<div class="acts"><button class="btn solid" type="submit">Speichern</button></div><div class="msg"></div></form>`,
    confirm: o => `<h3 id="acTitle">Fast geschafft</h3><p class="sub">Wir haben dir eine E-Mail an <b>${esc(o.email)}</b> geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen – danach geht es direkt im Planer weiter.</p><div class="acts"><button class="btn" id="aToL">Zur Anmeldung</button></div>`,
    consent: () => { const c = C.consent(); return `<h3 id="acTitle">Datenschutz-Einstellungen</h3><p class="sub">Du kannst deine Auswahl jederzeit ändern. Details in der <a class="lnk" data-legal="datenschutz">Datenschutzerklärung</a>.</p>
      <div class="tgl"><div><b>Notwendig</b><span>Anmeldung, gespeicherter Plan, diese Einstellung. Ohne diese Speicherung funktioniert TIGRIS nicht.</span></div><span class="swt on fixed" aria-label="immer aktiv"></span></div>
      <div class="tgl"><div><b>Nutzungsanalyse</b><span>Klicks, gewählte Geräte und Funktionen, Verweildauer, Zeitzone/Sprache, hochgeladene Grundrisse und Planinhalte – bei Anmeldung deinem Konto zugeordnet. Zweck: Produktverbesserung, Auswertung der Nachfrage und – nur bei gesonderter Zustimmung – passende Angebote.</span></div><button class="swt ${c.stats ? 'on' : ''}" id="cSw" role="switch" aria-checked="${c.stats}" aria-label="Nutzungsanalyse"></button></div>
      <div class="acts"><button class="btn" id="cSave">Auswahl speichern</button><button class="btn solid" id="cAll">Alle akzeptieren</button></div>` },
    account: () => { const p = C.profile || {}, c = C.consent(); return `<h3 id="acTitle">Mein Konto</h3><p class="sub">${esc(C.user.email)}${C.mode === 'local' ? ' · Testmodus' : ''}</p>
      <form id="aF">${profileFields(p)}
      <div class="tgl"><div><b>Kontakt zu Angeboten</b><span>Wir dürfen dich per E-Mail/Telefon zu Geräteeinkauf, individuellen Anlagen, Leasing-Alternativen und Beratung kontaktieren.${p.marketing_opt_in_at ? ' Erteilt am ' + new Date(p.marketing_opt_in_at).toLocaleDateString('de-DE') + '.' : ''}</span></div><button type="button" class="swt ${p.marketing_opt_in ? 'on' : ''}" id="aMk" role="switch" aria-checked="${!!p.marketing_opt_in}"></button></div>
      <div class="tgl"><div><b>Nutzungsanalyse</b><span>Auswertung deiner Nutzung (Klicks, Geräte, Verweildauer, Uploads).</span></div><button type="button" class="swt ${c.stats ? 'on' : ''}" id="aTr" role="switch" aria-checked="${c.stats}"></button></div>
      <div class="acts"><button class="btn solid" type="submit">Speichern</button><button class="btn" type="button" id="aOut">Abmelden</button></div><div class="msg"></div></form>
      <div class="foot"><a class="lnk" id="aAdm" style="display:none">Admin-Auswertung öffnen</a> <a class="lnk" id="aDel">Konto und alle Daten löschen</a></div>` }
  };
  const after = async () => { close(); refreshChips(); if (C.needsProfile()) { open('profile'); return } const f = pending; pending = null; if (f) f() };
  const WIRE = {
    login: o => {
      q('#aToS').onclick = () => open('signup', o); q('#aReset').onclick = () => open('reset');
      q('#aG').onclick = () => C.google().catch(e => msg(errText(e)));
      q('#aF').onsubmit = async e => { e.preventDefault(); const d = readForm(e.target), b = q('button[type=submit]', body); busy(b, 1); try { await C.signIn(d.email, d.password); await after() } catch (er) { msg(errText(er)) } busy(b, 0) };
    },
    signup: o => {
      q('#aToL').onclick = () => open('login', o);
      q('#aG').onclick = () => C.google().catch(e => msg(errText(e)));
      q('#aF').onsubmit = async e => {
        e.preventDefault(); const f = e.target, d = readForm(f), b = q('button[type=submit]', body);
        if (!f.terms.checked) { msg('Bitte AGB und Datenschutzerklärung bestätigen.'); return }
        busy(b, 1);
        try {
          const meta = { full_name: d.full_name, company: d.company, role: d.role, city: d.city, country: d.country, phone: d.phone, terms_accepted: true, marketing_opt_in: f.marketing.checked, tracking_consent: C.consent().stats };
          const r = await C.signUp(d.email, d.password, meta);
          C.track('signup', { role: d.role, country: d.country, marketing: f.marketing.checked });
          if (r.needsConfirm) open('confirm', { email: d.email }); else await after();
        } catch (er) { msg(errText(er)) }
        busy(b, 0);
      };
    },
    profile: () => {
      q('#aOut').onclick = async () => { await C.signOut(); close(); pending = null; refreshChips() };
      q('#aF').onsubmit = async e => {
        e.preventDefault(); const f = e.target, d = readForm(f), b = q('button[type=submit]', body);
        if (f.terms && !f.terms.checked) { msg('Bitte AGB und Datenschutzerklärung bestätigen.'); return }
        const p = { full_name: d.full_name, company: d.company, role: d.role, city: d.city, country: d.country, phone: d.phone || null };
        if (f.terms) p.terms_accepted_at = new Date().toISOString();
        if (f.marketing.checked !== !!(C.profile && C.profile.marketing_opt_in)) { p.marketing_opt_in = f.marketing.checked; p.marketing_opt_in_at = f.marketing.checked ? new Date().toISOString() : null }
        busy(b, 1); try { await C.saveProfile(p); C.track('profile_completed', { role: d.role, country: d.country }); await after() } catch (er) { msg(errText(er)) } busy(b, 0);
      };
    },
    reset: () => { q('#aToL').onclick = () => open('login'); q('#aF').onsubmit = async e => { e.preventDefault(); const d = readForm(e.target); try { await C.resetPw(d.email); msg('Falls ein Konto existiert, ist der Link unterwegs.', 1) } catch (er) { msg(errText(er)) } } },
    newpw: () => { q('#aF').onsubmit = async e => { e.preventDefault(); const d = readForm(e.target); try { await C.updatePassword(d.password); msg('Passwort gespeichert.', 1); setTimeout(close, 900) } catch (er) { msg(errText(er)) } } },
    confirm: () => { q('#aToL').onclick = () => open('login') },
    consent: () => {
      const sw = q('#cSw'); sw.onclick = () => { sw.classList.toggle('on'); sw.setAttribute('aria-checked', sw.classList.contains('on')) };
      q('#cSave').onclick = () => { setConsent(sw.classList.contains('on')); close() };
      q('#cAll').onclick = () => { setConsent(true); close() };
    },
    account: () => {
      const tg = id => { const s = q(id); s.onclick = () => { s.classList.toggle('on'); s.setAttribute('aria-checked', s.classList.contains('on')) }; return s };
      const mk = tg('#aMk'), tr = tg('#aTr');
      C.isAdmin().then(a => { if (a) { const l = q('#aAdm'); l.style.display = ''; l.onclick = () => window.open('admin.html', '_blank') } });
      q('#aOut').onclick = async () => { await C.signOut(); close(); refreshChips(); if (window.openLanding) openLanding() };
      q('#aDel').onclick = async () => { if (!confirm('Konto, Profil, hochgeladene Pläne und alle Nutzungsdaten endgültig löschen? Das kann nicht rückgängig gemacht werden.')) return; try { await C.deleteAccount(); close(); refreshChips(); if (window.openLanding) openLanding(); toastMsg('Dein Konto und deine Daten wurden gelöscht.') } catch (er) { msg(errText(er)) } };
      q('#aF').onsubmit = async e => {
        e.preventDefault(); const d = readForm(e.target), was = !!(C.profile && C.profile.marketing_opt_in), now = mk.classList.contains('on');
        const p = { full_name: d.full_name, company: d.company, role: d.role, city: d.city, country: d.country, phone: d.phone || null };
        if (was !== now) { p.marketing_opt_in = now; p.marketing_opt_in_at = now ? new Date().toISOString() : null; C.track(now ? 'marketing_opt_in' : 'marketing_opt_out') }
        if (tr.classList.contains('on') !== C.consent().stats) setConsent(tr.classList.contains('on'));
        try { await C.saveProfile(p); msg('Gespeichert.', 1); refreshChips() } catch (er) { msg(errText(er)) }
      };
    }
  };
  const toastMsg = t => { if (typeof window.toast === 'function') window.toast(t) };

  /* ---------- Einwilligungs-Banner ---------- */
  function setConsent(v) { const was = C.consent(); C.setConsent(v); bar.classList.remove('on'); if (v && !(was.decided && was.stats)) C.track('consent_granted'); }
  q('#cYes').onclick = () => setConsent(true);
  q('#cNo').onclick = () => setConsent(false);
  q('#cSet').onclick = () => { bar.classList.remove('on'); open('consent') };
  if (!C.consent().decided) bar.classList.add('on');

  /* ---------- Konto-Knöpfe und Rechtslinks ---------- */
  const nav = q('#landing nav');
  nav.insertAdjacentHTML('afterbegin', '<a id="lAcct" class="acct">Anmelden</a>');
  const undo = q('#bUndo');
  undo.insertAdjacentHTML('beforebegin', '<button class="btn sm ghost acct" id="bAcct">Anmelden</button>');
  const links = '<a data-legal="impressum">Impressum</a><a data-legal="datenschutz">Datenschutz</a><a data-legal="agb">AGB</a><a data-legal="cookies">Cookie-Einstellungen</a>';
  const foot = q('#landing footer'); foot.insertAdjacentHTML('beforeend', `<span class="legal-links">${links}</span>`);
  q('aside.l').insertAdjacentHTML('beforeend', `<div class="legal-links">${links}</div>`);
  const chipClick = () => { if (C.user) open('account'); else open('login') };
  q('#lAcct').onclick = chipClick; q('#bAcct').onclick = chipClick;
  function refreshChips() {
    const n = C.user ? ((C.profile && C.profile.full_name) || C.user.email) : 'Anmelden';
    q('#lAcct').textContent = C.user ? '◉ ' + n : 'Anmelden'; q('#bAcct').textContent = C.user ? '◉ ' + n : 'Anmelden';
  }

  /* ---------- Planer nur mit Konto ---------- */
  function requireAccount(fn) {
    if (C.user && !C.needsProfile()) { fn(); return }
    pending = fn;
    if (C.user) open('profile'); else open('login', { gate: true });
  }
  // Planen geht ohne Konto; nur das Herunterladen (Export) verlangt ein kostenloses Konto
  qa('[data-open]').forEach(b => b.onclick = () => { openApp(); C.track('open_planner') });
  qa('[data-demo]').forEach(b => b.onclick = () => { openApp(); setTimeout(loadDemo, 80); C.track('open_planner', { demo: true }) });

  /* ---------- Klick-Tracking (nur mit Einwilligung, Cloud.track prüft das) ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('button,a,.li,.cat,[data-track]'); if (!el || el.closest('#acOv,#cBar')) return;
    const label = (el.dataset.track || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    C.track('click', { label, id: el.id || undefined, area: el.closest('#landing') ? 'landing' : el.closest('#app') ? 'planner' : 'other' });
  }, true);

  /* ---------- Start ---------- */
  C.onAuth(() => refreshChips());
  C.init().then(() => {
    refreshChips();
    const u = new URL(location.href), fromAuth = u.searchParams.get('auth') === '1';
    if (fromAuth) { u.searchParams.delete('auth'); history.replaceState(null, '', u.pathname + u.search + '#planer') }
    if (C.recovery) { open('newpw'); return }
    if (fromAuth || location.hash === '#planer') {
      if (!q('#app').classList.contains('on')) { openApp(); C.track('open_planner') }
      if (C.user && C.needsProfile()) open('profile');
    }
  });
  window.Account = { open, requireAccount };
})();
