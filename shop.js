/* TIGRIS – Geräte-Katalog (Platzhalter) und Anfrage / Angebot.
   Nutzt aus index.html: LIB, T, S, mk, CATS, openApp, addType, commit, toast, trk, fmt, capacity, analyze, roomArea. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } } };

  /* ---------- Katalog: Platzhalter-Produkte (noch ohne Hersteller, Bild und Preis) ---------- */
  const KCAT = {
    racks: 'Power Racks & Rigs', stationen: 'Kraftstationen', maschinen: 'Kraftmaschinen', cardio: 'Cardio',
    baenke: 'Hantelbänke', kurzhanteln: 'Kurzhanteln', scheiben: 'Hantelscheiben', stangen: 'Hantelstangen',
    functional: 'Functional & HYROX', kampf: 'Kampfsport', boden: 'Bodenschutz', service: 'Ausstattung & Service'
  };
  // [id, Name, Kategorie, LIB-Typ für den Planer (oder ''), Einheit, Hinweis]
  const KAT = [
    ['k_rack', 'Power Rack', 'racks', 'rack', 'Stk', 'Mit Klimmzugstange und Sicherheitsablagen'],
    ['k_halfrack', 'Half Rack', 'racks', 'halfrack', 'Stk', 'Offene Bauweise, Hantelablagen'],
    ['k_smith', 'Multipresse (Smith Machine)', 'racks', 'smith', 'Stk', 'Geführte Langhantel'],
    ['k_rig', 'CrossFit-Rig, modular', 'racks', 'rig', 'Stk', 'Felder à 1,2 m, erweiterbar'],
    ['k_crossover', 'Kabel-Crossover', 'stationen', 'crossover', 'Stk', 'Zwei verstellbare Zugtürme'],
    ['k_cable', 'Kabelzug Dual Pulley', 'stationen', 'cable', 'Stk', 'Zwei Gewichtsblöcke'],
    ['k_multi', 'Multistation 4-fach', 'stationen', 'multi', 'Stk', 'Vier Trainingsplätze an einem Turm'],
    ['k_cali', 'Calisthenics-Station', 'stationen', 'cali', 'Stk', 'Klimmzug, Dips, Barren'],
    ['k_chest', 'Brustpresse', 'maschinen', 'chest', 'Stk', 'Selektorisiert'],
    ['k_latpull', 'Latzug', 'maschinen', 'latpull', 'Stk', 'Selektorisiert'],
    ['k_row', 'Ruderzug sitzend', 'maschinen', 'row', 'Stk', 'Selektorisiert'],
    ['k_legpress', 'Beinpresse', 'maschinen', 'legpress', 'Stk', 'Selektorisiert oder Plate-loaded'],
    ['k_legext', 'Beinstrecker', 'maschinen', 'legext', 'Stk', 'Selektorisiert'],
    ['k_legcurl', 'Beinbeuger', 'maschinen', 'legcurl', 'Stk', 'Selektorisiert'],
    ['k_hacksq', 'Hackenschmidt', 'maschinen', 'hacksq', 'Stk', 'Plate-loaded'],
    ['k_hip', 'Hip-Thrust-Station', 'maschinen', 'hip', 'Stk', ''],
    ['k_ghd', 'Glute-Ham-Bank', 'maschinen', 'ghd', 'Stk', ''],
    ['k_tread', 'Laufband', 'cardio', 'tread', 'Stk', 'Gewerbliche Nutzung, mit Konsole'],
    ['k_curve', 'Curve-Laufband', 'cardio', 'curve', 'Stk', 'Ohne Motor'],
    ['k_cross', 'Crosstrainer', 'cardio', 'cross', 'Stk', ''],
    ['k_bike', 'Indoor-Cycling-Bike', 'cardio', 'bike', 'Stk', ''],
    ['k_airbike', 'Air-Bike', 'cardio', 'airbike', 'Stk', 'Luftwiderstand'],
    ['k_rower', 'Rudergerät', 'cardio', 'rower', 'Stk', 'Luftwiderstand'],
    ['k_ski', 'SkiErg mit Standfuß', 'cardio', 'ski', 'Stk', ''],
    ['k_stair', 'Treppensteiger', 'cardio', 'stair', 'Stk', ''],
    ['k_bench', 'Flachbank', 'baenke', 'bench', 'Stk', ''],
    ['k_adjbench', 'Schrägbank verstellbar', 'baenke', 'adjbench', 'Stk', 'Flach bis 90°'],
    ['k_dbset', 'Kurzhantelsatz 2,5–50 kg', 'kurzhanteln', '', 'Satz', '20 Paare in 2,5-kg-Schritten'],
    ['k_dbrack', 'Kurzhantelablage 3-stufig', 'kurzhanteln', 'dbrack', 'Stk', 'Für bis zu 15 Paare'],
    ['k_bumper', 'Bumper Plates 150 kg', 'scheiben', '', 'Satz', '2 × 5, 10, 15, 20, 25 kg'],
    ['k_plates', 'Scheibenständer', 'scheiben', 'plates', 'Stk', ''],
    ['k_bar20', 'Olympia-Langhantel 20 kg', 'stangen', '', 'Stk', '2,20 m, 50-mm-Hülsen'],
    ['k_bar15', 'Olympia-Langhantel 15 kg', 'stangen', '', 'Stk', '2,01 m, 25-mm-Griff'],
    ['k_ez', 'SZ-Curlstange', 'stangen', '', 'Stk', ''],
    ['k_barholder', 'Wandhalter für Langhanteln', 'stangen', '', 'Stk', 'Für 6 Stangen'],
    ['k_plyo', 'Plyo-Boxen (Satz)', 'functional', 'plyo', 'Satz', '3 Höhen'],
    ['k_kbrack', 'Kettlebells mit Regal', 'functional', 'kbrack', 'Satz', '4–32 kg'],
    ['k_wallball', 'Wallball-Zielscheibe (Rig-Montage)', 'functional', 'wallball', 'Stk', 'Markierungen 2,70 / 3,00 m'],
    ['k_wallballs', 'Wallballs (Satz)', 'functional', '', 'Satz', '4, 6 und 9 kg'],
    ['k_hxsled', 'Power-Schlitten', 'functional', 'hxsled', 'Stk', 'Für Turf-Bahnen'],
    ['k_rope', 'Battle Rope mit Anker', 'functional', 'rope', 'Stk', ''],
    ['k_trx', 'Suspension-Rig', 'functional', 'trx', 'Stk', ''],
    ['k_bag', 'Boxsack hängend', 'kampf', 'bag', 'Stk', '120 cm'],
    ['k_halfbag', 'Halbboxsack', 'kampf', 'halfbag', 'Stk', '60–80 cm'],
    ['k_standbag', 'Standboxsack', 'kampf', 'standbag', 'Stk', ''],
    ['k_ring', 'Boxring 6 × 6 m', 'kampf', 'ring', 'Stk', 'Podest 30 cm'],
    ['k_cage', 'MMA-Käfig (Octagon)', 'kampf', 'cage', 'Stk', ''],
    ['k_mat', 'Matten BJJ / Judo', 'kampf', '', 'm²', 'Puzzlematten 4 cm'],
    ['k_rubber', 'Gummiboden 20 mm', 'boden', '', 'm²', 'Für Freihantel- und Functional-Bereiche'],
    ['k_platform', 'Gewichtheber-Plattform', 'boden', 'platform', 'Stk', '2,44 × 2,44 m'],
    ['k_turf', 'Turf-Bahn', 'boden', 'sled', 'm²', 'Für Schlitten und Lunges'],
    ['k_locker', 'Spindreihe (6 Spinde)', 'service', 'locker6', 'Stk', ''],
    ['k_reception', 'Empfangstheke', 'service', 'reception', 'Stk', ''],
    ['k_water', 'Wasserspender', 'service', 'water', 'Stk', '']
  ].map(a => ({ id: a[0], name: a[1], cat: a[2], lib: a[3], unit: a[4], note: a[5] }));
  const KBY = Object.fromEntries(KAT.map(k => [k.id, k]));
  const libOf = k => k.lib && typeof T === 'function' ? T(k.lib) : null;
  const cm = v => Math.round(v * 100);
  const specs = k => { const t = libOf(k); return t ? `${cm(t.d)} × ${cm(t.w)} × ${cm(t.h)} cm` : '' };

  /* ---------- Anfragekorb ---------- */
  let cart = LS.get('tigris.quote', []);
  const saveCart = () => { LS.set('tigris.quote', cart); badge() };
  const count = () => cart.reduce((s, c) => s + 1, 0);
  function addToCart(id, qty = 1, name) {
    const k = KBY[id], c = cart.find(x => x.id === id);
    if (c) c.qty += qty; else cart.push({ id, name: name || (k ? k.name : id), unit: k ? k.unit : 'Stk', qty });
    saveCart(); trk('quote_add', { id, name: name || (k && k.name) });
  }
  function badge() { $$('.qbadge').forEach(b => { b.textContent = count(); b.style.display = count() ? '' : 'none' }) }

  /* ---------- Katalog rendern ---------- */
  let kc = 'all';
  function renderCatalog() {
    const el = $('#katGrid'); if (!el) return;
    $('#katCats').innerHTML = [['all', 'Alle'], ...Object.entries(KCAT)].map(([k, n]) => `<button class="${k === kc ? 'on' : ''}" data-kc="${k}">${esc(n)}</button>`).join('');
    $$('#katCats [data-kc]').forEach(b => b.onclick = () => { kc = b.dataset.kc; renderCatalog() });
    el.innerHTML = KAT.filter(k => kc === 'all' || k.cat === kc).map(k => `<article class="kp">
      <div class="ph"><span>${esc(KCAT[k.cat])}</span><i>Produktbild folgt</i></div>
      <div class="kb"><b>${esc(k.name)}</b><span>${esc([specs(k), k.note].filter(Boolean).join(' · ') || '&nbsp;')}</span>
      <em>Platzhalter · Hersteller & Preis auf Anfrage</em>
      <div class="ka"><button class="btn sm solid" data-qadd="${k.id}">+ Anfrage</button>${k.lib ? `<button class="btn sm ghost" data-plan="${k.lib}">Im Planer</button>` : ''}</div></div></article>`).join('');
    $$('[data-qadd]', el).forEach(b => b.onclick = () => { addToCart(b.dataset.qadd); toast(`${KBY[b.dataset.qadd].name} zur Anfrage hinzugefügt`) });
    $$('[data-plan]', el).forEach(b => b.onclick = () => { openApp(); setTimeout(() => { addType(b.dataset.plan); toast('Im Planer eingefügt – verschieben, drehen, Abstände prüfen') }, 80) });
  }

  /* ---------- Anfrage-Dialog ---------- */
  const SEG = ['Fitnessstudio', 'Boutique- / Personal-Training-Studio', 'CrossFit- / HYROX-Box', 'Kampfsportschule', 'Hotel & Resort', 'Firmenfitness', 'Verein / Schule / Hochschule', 'Polizei, Feuerwehr, Bundeswehr', 'Physio & Reha', 'Wohnanlage / Home Gym', 'Sonstiges'];
  const SERV = ['Beratung & Studiokonzept', '3D-Planung durch Experten', 'Finanzierung / Leasing', 'Lieferung', 'Bodenverlegung', 'Montage & Kalibrierung', 'Einweisung des Teams', 'Wartung & Service'];
  const TIME = ['So schnell wie möglich', 'In 1–3 Monaten', 'In 3–6 Monaten', 'In mehr als 6 Monaten', 'Noch offen'];
  const BUDGET = ['Unter 10.000 €', '10.000–25.000 €', '25.000–50.000 €', '50.000–100.000 €', '100.000–250.000 €', 'Über 250.000 €', 'Noch offen'];
  const opt = (arr, sel) => arr.map(v => `<option${v === sel ? ' selected' : ''}>${esc(v)}</option>`).join('');
  const hasPlan = () => typeof S !== 'undefined' && S.items && S.items.some(i => !i.zone);
  function planBom() {
    const m = {}; S.items.filter(i => !i.zone).forEach(i => { m[i.type] = m[i.type] || { name: i.name, qty: 0 }; m[i.type].qty++ });
    return Object.entries(m).map(([type, v]) => ({ id: 'plan:' + type, name: v.name, unit: 'Stk', qty: v.qty }));
  }
  function planSummary() {
    if (!hasPlan()) return null;
    let cap = null; try { cap = capacity(analyze(), roomArea()).total } catch (e) { }
    return { name: S.name, w: S.room.w, d: S.room.d, area: Math.round(roomArea()), persons: cap, items: S.items.filter(i => !i.zone).length,
      zones: S.items.filter(i => i.zone).map(z => ({ type: z.type, name: z.name, w: z.w, d: z.d })) };
  }
  let draft = LS.get('tigris.quote.draft', {});
  function open(pre) {
    pre = pre || {}; if (pre.segment) draft.segment = pre.segment; if (pre.service && !(draft.services || []).includes(pre.service)) draft.services = [...(draft.services || []), pre.service];
    const p = window.Cloud && Cloud.profile || {}, u = window.Cloud && Cloud.user;
    const v = k => esc(draft[k] != null ? draft[k] : ({ name: p.full_name, company: p.company, email: u && u.email, phone: p.phone, location: p.city }[k] || ''));
    const area = draft.area || (hasPlan() ? Math.round(roomArea()) : '');
    $('#quote').innerHTML = `<div class="qd" role="dialog" aria-modal="true" aria-labelledby="qT">
      <button class="qx" aria-label="Schließen">×</button>
      <div class="eyebrow">Angebot · unverbindlich & kostenlos</div><h3 id="qT">Anfrage stellen</h3>
      <p class="sub">Stelle Geräte und Leistungen zusammen. Wir melden uns mit einem passenden Angebot – herstellerunabhängig.</p>
      <h4>1 · Positionen</h4><div id="qItems"></div>
      <div class="qrow">${hasPlan() ? '<button class="btn sm" id="qPlan">Stückliste aus meinem Plan übernehmen</button>' : ''}<button class="btn sm ghost" id="qKat">Geräte aus dem Katalog</button></div>
      <h4>2 · Leistungen</h4><div class="qchk">${SERV.map(s => `<label><input type="checkbox" name="services" value="${esc(s)}"${(draft.services || []).includes(s) ? ' checked' : ''}> ${esc(s)}</label>`).join('')}</div>
      <h4>3 · Projekt</h4>
      <div class="qg"><label class="fld">Art des Projekts<select name="segment"><option value="">Bitte wählen</option>${opt(SEG, draft.segment)}</select></label>
        <label class="fld">Fläche (m²)<input name="area" type="number" min="0" step="1" value="${esc(area)}"></label>
        <label class="fld">Zeitplan<select name="timeline"><option value="">Bitte wählen</option>${opt(TIME, draft.timeline)}</select></label>
        <label class="fld">Budget (netto)<select name="budget"><option value="">Bitte wählen</option>${opt(BUDGET, draft.budget)}</select></label>
        <label class="fld" style="grid-column:1/-1">Ort des Projekts (PLZ, Stadt)<input name="location" maxlength="120" value="${v('location')}"></label></div>
      ${hasPlan() ? `<label class="qplan"><input type="checkbox" name="attach" ${draft.attach === false ? '' : 'checked'}> Planungsdaten mitsenden (Raum ${fmt(S.room.w)} × ${fmt(S.room.d)} m, ${S.items.filter(i => !i.zone).length} Geräte, Kapazität)</label>` : ''}
      <h4>4 · Kontakt</h4>
      <div class="qg"><label class="fld">Name *<input name="name" required maxlength="120" autocomplete="name" value="${v('name')}"></label>
        <label class="fld">Firma<input name="company" maxlength="160" autocomplete="organization" value="${v('company')}"></label>
        <label class="fld">E-Mail *<input name="email" type="email" required maxlength="200" autocomplete="email" value="${v('email')}"></label>
        <label class="fld">Telefon<input name="phone" type="tel" maxlength="60" autocomplete="tel" value="${v('phone')}"></label></div>
      <label class="qplan"><input type="checkbox" name="callback" ${draft.callback ? 'checked' : ''}> Bitte ruft mich für einen Beratungstermin an</label>
      <label class="fld">Nachricht<textarea name="message" maxlength="4000" rows="4" placeholder="Konzept, Wünsche, Marken, Besonderheiten der Fläche …">${esc(draft.message || '')}</textarea></label>
      <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="qplan qcons"><input type="checkbox" name="consent" required> Ich bin einverstanden, dass TIGRIS meine Angaben zur Bearbeitung dieser Anfrage speichert und mich dazu per E-Mail oder Telefon kontaktiert. Details in der <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>. *</label>
      <div class="msg" id="qMsg"></div>
      <div class="qrow"><button class="btn solid" id="qSend">Anfrage senden</button><span class="sub" style="margin:0">Unverbindlich · keine Zahlungsdaten</span></div></div>`;
    $('#quote').classList.add('on'); document.body.style.overflow = 'hidden'; renderItems(); trk('quote_open', { from: pre.from || '' });
    const f = $('#quote .qd');
    f.addEventListener('input', keepDraft); f.addEventListener('change', keepDraft);
    $('.qx', f).onclick = close; $('#quote').onclick = e => { if (e.target.id === 'quote') close() };
    const qp = $('#qPlan'); if (qp) qp.onclick = () => { planBom().forEach(b => { const c = cart.find(x => x.id === b.id); if (c) c.qty = b.qty; else cart.push(b) }); saveCart(); renderItems(); trk('quote_plan_bom', { n: planBom().length }) };
    $('#qKat').onclick = () => { close(); if (typeof openLanding === 'function') openLanding(); setTimeout(() => $('#katalog').scrollIntoView({ behavior: 'smooth' }), 60) };
    $('#qSend').onclick = send;
  }
  function keepDraft() {
    const f = $('#quote .qd'); if (!f) return; const g = n => { const e = $(`[name="${n}"]`, f); return e ? (e.type === 'checkbox' ? e.checked : e.value) : undefined };
    draft = { segment: g('segment'), area: g('area'), timeline: g('timeline'), budget: g('budget'), location: g('location'), name: g('name'), company: g('company'), email: g('email'), phone: g('phone'),
      message: g('message'), callback: g('callback'), attach: g('attach'), services: $$('[name="services"]:checked', f).map(x => x.value) };
    LS.set('tigris.quote.draft', draft);
  }
  function renderItems() {
    const el = $('#qItems'); if (!el) return;
    el.innerHTML = cart.length ? cart.map((c, i) => `<div class="qi"><span>${esc(c.name)}</span><input type="number" min="1" step="1" value="${c.qty}" data-qi="${i}" aria-label="Menge ${esc(c.name)}"><small>${esc(c.unit)}</small><button data-qdel="${i}" aria-label="Entfernen">×</button></div>`).join('')
      : '<p class="sub" style="margin:0 0 6px">Noch keine Positionen – du kannst auch nur Leistungen wie Beratung oder Planung anfragen.</p>';
    $$('[data-qi]', el).forEach(n => n.onchange = () => { cart[+n.dataset.qi].qty = Math.max(1, Math.round(+n.value || 1)); saveCart() });
    $$('[data-qdel]', el).forEach(b => b.onclick = () => { cart.splice(+b.dataset.qdel, 1); saveCart(); renderItems() });
  }
  function close() { $('#quote').classList.remove('on'); document.body.style.overflow = ''; }
  async function send() {
    keepDraft(); const f = $('#quote .qd'), m = $('#qMsg'), d = draft, err = t => { m.className = 'msg err'; m.textContent = t };
    if ($('[name="website"]', f).value) { done('–'); return } // Spam-Falle
    if (!d.name || d.name.trim().length < 2) return err('Bitte deinen Namen angeben.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '')) return err('Bitte eine gültige E-Mail-Adresse angeben.');
    if (!$('[name="consent"]', f).checked) return err('Bitte der Verarbeitung deiner Angaben für diese Anfrage zustimmen.');
    if (!cart.length && !(d.services || []).length && !(d.message || '').trim()) return err('Bitte mindestens eine Position, eine Leistung oder eine Nachricht angeben.');
    const id = crypto.randomUUID ? crypto.randomUUID() : null;
    const row = { id, name: d.name.trim(), company: d.company || null, email: d.email.trim(), phone: d.phone || null, callback: !!d.callback, segment: d.segment || null, location: d.location || null,
      area_m2: d.area ? +d.area : null, timeline: d.timeline || null, budget: d.budget || null, services: d.services || [], message: d.message || null,
      items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, unit: c.unit })), plan: d.attach !== false ? planSummary() : null, consent_at: new Date().toISOString() };
    const b = $('#qSend'); b.disabled = true; b.textContent = 'Wird gesendet …';
    try { await Cloud.submitQuote(row) } catch (e) { b.disabled = false; b.textContent = 'Anfrage senden'; return err('Senden fehlgeschlagen: ' + (e.message || e)) }
    trk('quote_submit', { items: row.items.length, services: row.services.length, segment: row.segment, budget: row.budget });
    cart = []; saveCart(); draft = { name: d.name, company: d.company, email: d.email, phone: d.phone }; LS.set('tigris.quote.draft', draft);
    done(id ? id.slice(0, 8).toUpperCase() : '–');
  }
  function done(ref) {
    $('#quote .qd').innerHTML = `<button class="qx" aria-label="Schließen">×</button><div class="eyebrow">Anfrage gesendet</div><h3>Danke!</h3>
      <p class="sub">Deine Anfrage ist bei uns eingegangen${ref !== '–' ? ` (Referenz <b>${esc(ref)}</b>)` : ''}. Wir prüfen Geräte, Fläche und Leistungen und melden uns mit einem Angebot.</p>
      <div class="qrow"><button class="btn solid" id="qOk">Schließen</button></div>`;
    $('.qx').onclick = close; $('#qOk').onclick = close;
  }

  /* ---------- Einhängen ---------- */
  const host = document.createElement('div'); host.id = 'quote'; host.className = 'qov'; document.body.appendChild(host);
  const fab = document.createElement('button'); fab.className = 'qfab'; fab.id = 'qFab'; fab.innerHTML = 'Anfrage <span class="qbadge"></span>'; fab.onclick = () => open({ from: 'fab' }); document.body.appendChild(fab);
  $$('[data-quote]').forEach(b => b.onclick = () => open({ from: b.dataset.quote, service: b.dataset.service, segment: b.dataset.segment }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && $('#quote').classList.contains('on')) close() });
  renderCatalog(); badge();
  window.Quote = { open, add: addToCart };
})();
