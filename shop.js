/* TIGRIS – Geräte-Katalog (Importgeräte aus produkte.js), Produktseiten und Anfrage / Angebot.
   Nutzt aus index.html: LIB, T, S, mk, CATS, openApp, openLanding, addType, commit, toast, trk, fmt, capacity, analyze, roomArea. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } } };

  /* ---------- Katalog: Importgeräte aus produkte.js ---------- */
  const PR = window.PRODUKTE, KCAT = PR.cats, KAT = PR.list, KBY = PR.byId;

  /* ---------- Anfragekorb ---------- */
  let cart = LS.get('tigris.quote', []);
  const saveCart = () => { LS.set('tigris.quote', cart); badge() };
  const count = () => cart.reduce((s, c) => s + 1, 0);
  function addToCart(id, qty = 1, name) {
    const k = KBY[id], c = cart.find(x => x.id === id);
    if (c) c.qty += qty; else cart.push({ id, name: name || (k ? k.name : id), unit: 'Stk', qty });
    saveCart(); trk('quote_add', { id, name: name || (k && k.name) });
  }
  function badge() { $$('.qbadge').forEach(b => { b.textContent = count(); b.style.display = count() ? '' : 'none' }) }
  const toPlan = id => { closeProduct(true); openApp(); setTimeout(() => { addType(id); toast('Im Planer eingefügt – in Originalmaßen, verschieben und drehen möglich') }, 80) };
  const askFor = p => { addToCart(p.id); toast(`${p.name} zur Anfrage hinzugefügt`) };

  /* ---------- Katalog rendern ---------- */
  let kc = 'all';
  function renderCatalog() {
    const el = $('#katGrid'); if (!el) return;
    $('#katCats').innerHTML = [['all', 'Alle'], ...Object.entries(KCAT).filter(([k]) => KAT.some(p => p.cat === k))].map(([k, n]) => `<button class="${k === kc ? 'on' : ''}" data-kc="${k}">${esc(n)}</button>`).join('');
    $$('#katCats [data-kc]').forEach(b => b.onclick = () => { kc = b.dataset.kc; renderCatalog() });
    el.innerHTML = KAT.filter(p => kc === 'all' || p.cat === kc).map(p => `<article class="kp">
      <a class="kimg" href="#produkt/${p.slug}" aria-label="${esc(p.name)} ansehen"><img src="${p.thumb}" alt="${esc(p.alt)}" width="480" height="480" loading="lazy"><span>${esc(KCAT[p.cat])}</span></a>
      <div class="kb"><a class="kn" href="#produkt/${p.slug}">${esc(p.name)}</a>
      <dl class="km"><dt>Maße</dt><dd>${esc(p.mass)}</dd><dt>Gewicht</dt><dd>${esc(p.gewicht)}</dd></dl>
      <em>Import · Preis auf Anfrage${p.dimsSrc === 'richtwert' ? ' · Maße Richtwert' : ''}</em>
      <div class="ka"><a class="btn sm" href="#produkt/${p.slug}">Details</a><button class="btn sm solid" data-qadd="${p.id}">+ Anfrage</button></div></div></article>`).join('');
    $$('[data-qadd]', el).forEach(b => b.onclick = () => askFor(KBY[b.dataset.qadd]));
  }

  /* ---------- Produktseite (#produkt/<slug>) ---------- */
  const row = ([k, v, note]) => `<tr><th>${esc(k)}</th><td>${esc(v)}${note ? `<small>${esc(note)}</small>` : ''}</td></tr>`;
  function productHTML(p) {
    const farben = p.farben.length ? p.farben.map(f => `<li>${esc(f)}</li>`).join('') : '';
    const more = KAT.filter(x => x.cat === p.cat && x.id !== p.id).concat(KAT.filter(x => x.cat !== p.cat)).slice(0, 4);
    return `<div class="pd" role="dialog" aria-modal="true" aria-labelledby="pdT">
      <div class="pdbar"><nav class="crumb"><a href="#katalog">Katalog</a><span>›</span><a href="#katalog" data-kcat="${p.cat}">${esc(KCAT[p.cat])}</a><span>›</span><b>${esc(p.name)}</b></nav><button class="qx" aria-label="Schließen">×</button></div>
      <div class="pdtop">
        <div class="pdgal"><figure class="pdimg"><img src="${p.img}" alt="${esc(p.alt)}" width="1000" height="1000"></figure>${p.bilder.length > 1 ? `
          <div class="pdthumbs" role="group" aria-label="Produktbilder">${p.bilder.map((b, i) => `<button type="button" data-img="${i}" aria-pressed="${i === 0}" aria-label="${esc(b.label)} anzeigen"><img src="${b.mini}" alt="" width="160" height="160"><span>${esc(b.label)}</span></button>`).join('')}</div>` : ''}</div>
        <div class="pdbuy">
          <div class="eyebrow">Import · ${esc(KCAT[p.cat])}</div>
          <h2 id="pdT">${esc(p.name)}</h2>
          <p class="pdlead">${esc(p.text)}</p>
          <div class="pdprice"><span>Preis</span><b>Auf Anfrage</b><small>Angebot inklusive Fracht, Zoll und Lieferzeit – unverbindlich und kostenlos</small></div>
          <ul class="pdfacts">${p.facts.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}</ul>
          <div class="pdcol"><span>${esc(p.farbLabel)}</span>${farben ? `<ul>${farben}</ul>` : ''}<small>${esc(p.farbenHinweis)}</small></div>
          <div class="pdcta"><button class="btn solid" data-pask>Angebot anfragen</button>${p.planbar ? '<button class="btn" data-pplan>Im Planer platzieren</button>' : ''}</div>
          <p class="pdimp">${esc(p.impLine)}</p>
        </div>
      </div>
      <div class="pdtabs" role="tablist"><button role="tab" class="on" data-tab="spec">Spezifikationen</button><button role="tab" data-tab="desc">Beschreibung</button><button role="tab" data-tab="imp">Import & Lieferung</button></div>
      <div class="pdpane on" data-pane="spec"><table class="pdspec"><tbody>
        ${p.spec.map(row).join('')}
      </tbody></table></div>
      <div class="pdpane" data-pane="desc"><p>${esc(p.text)}</p>${p.planbar ? '<p>Im TIGRIS-Planer steht das Gerät in Originalmaßen bereit: platzieren, drehen und Abstände zu anderen Geräten prüfen, bevor du bestellst.</p>' : ''}<p class="pdfine">* ${esc(p.fine)}</p></div>
      <div class="pdpane" data-pane="imp"><ol class="pdsteps">
        <li><b>Anfrage</b><span>Du fragst ${p.planbar ? 'das Gerät mit Stückzahl und Rahmenfarbe' : 'den Artikel mit Stückzahl'} an.</span></li>
        <li><b>Angebot</b><span>Wir nennen Preis, Fracht, Zoll und Lieferzeit und bestätigen Maße und Gewicht beim Hersteller.</span></li>
        <li><b>Import</b><span>Fertigung und Seefracht aus China, Verzollung in Deutschland.</span></li>
        <li><b>Lieferung</b><span>Auf Wunsch mit Montage und Einweisung – siehe Service.</span></li></ol></div>
      <div class="pdmore"><h4>${p.planbar ? 'Weitere Importgeräte' : 'Weitere Importprodukte'}</h4><div class="pdmg">${more.map(x => `<a href="#produkt/${x.slug}"><img src="${x.thumb}" alt="${esc(x.alt)}" width="480" height="480" loading="lazy"><b>${esc(x.name)}</b><span>${esc(x.mass)}</span></a>`).join('')}</div></div>
    </div>`;
  }
  let pdBack = null;
  function openProduct(slug) {
    const p = PR.bySlug[slug]; if (!p) return closeProduct();
    const ov = $('#prod'); ov.innerHTML = productHTML(p); ov.classList.add('on'); ov.scrollTop = 0; document.body.style.overflow = 'hidden';
    document.title = `${p.name} · TIGRIS`; trk('product_view', { id: p.id });
    $('.qx', ov).onclick = () => closeProduct();
    $('[data-pask]', ov).onclick = () => { askFor(p); closeProduct(true); open({ from: 'product' }) };
    if (p.planbar) $('[data-pplan]', ov).onclick = () => toPlan(p.id);
    $$('[data-kcat]', ov).forEach(a => a.onclick = () => { kc = a.dataset.kcat; renderCatalog() });
    const big = $('.pdimg img', ov), pick = i => { const b = p.bilder[i]; big.src = b.src; big.alt = b.alt; $$('[data-img]', ov).forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.img === i))) };
    $$('[data-img]', ov).forEach(x => x.onclick = () => pick(+x.dataset.img));
    p.bilder.slice(1).forEach(b => { const im = new Image(); im.src = b.src });
    $$('.pdtabs [data-tab]', ov).forEach(b => b.onclick = () => { $$('.pdtabs [data-tab]', ov).forEach(x => x.classList.toggle('on', x === b)); $$('.pdpane', ov).forEach(x => x.classList.toggle('on', x.dataset.pane === b.dataset.tab)) });
  }
  function closeProduct(silent) {
    const ov = $('#prod'); if (!ov || !ov.classList.contains('on')) return;
    ov.classList.remove('on'); ov.innerHTML = ''; document.body.style.overflow = ''; if (pdBack) document.title = pdBack;
    if (/^#produkt\//.test(location.hash)) history.replaceState(null, '', location.pathname + location.search + '#katalog');
  }
  /* Katalog ist eine eigene Seite (#katalog); Produktseiten liegen darüber */
  function showKat(on) {
    const kp = $('#katPage'); if (!kp) return;
    if (on) { const app = $('#app'); if (app) app.classList.remove('on'); $('#landing').style.display = 'none'; if (kp.hidden) { kp.hidden = false; scrollTo(0, 0) } }
    else if (!kp.hidden) { kp.hidden = true; $('#landing').style.display = '' }
  }
  function route() {
    const h = location.hash, m = h.match(/^#produkt\/([a-z0-9-]+)$/);
    if (m) { showKat(true); openProduct(m[1]) } else { closeProduct(true); showKat(h === '#katalog') }
  }
  const goKat = () => { if (location.hash === '#katalog') route(); else location.hash = '#katalog' };

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
    $('#qKat').onclick = () => { close(); goKat() };
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
  const pov = document.createElement('div'); pov.id = 'prod'; pov.className = 'pov'; document.body.appendChild(pov); pdBack = document.title;
  pov.onclick = e => { if (e.target.id === 'prod') closeProduct() };
  addEventListener('hashchange', route);
  const fab = document.createElement('button'); fab.className = 'qfab'; fab.id = 'qFab'; fab.innerHTML = 'Anfrage <span class="qbadge"></span>'; fab.onclick = () => open({ from: 'fab' }); document.body.appendChild(fab);
  $$('[data-quote]').forEach(b => b.onclick = () => open({ from: b.dataset.quote, service: b.dataset.service, segment: b.dataset.segment }));
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if ($('#quote').classList.contains('on')) close(); else closeProduct() });
  renderCatalog(); badge(); route();
  window.Quote = { open, add: addToCart }; window.Katalog = { go: goKat };
})();
