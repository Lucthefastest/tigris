/* TIGRIS – Studio-Schnittmodell und Detailmodelle (three.js, lokal unter vendor/three).
   Das Modell (models/studio-schnittmodell.glb) wird erst geladen, wenn es gebraucht wird.
   Koordinaten: Planer x = glTF x + OX, Planer y = glTF z + OZ (Draufsicht, y nach unten). */
(() => {
  const GLB = 'models/studio-schnittmodell.glb';
  const OX = 0.15, OZ = 59.42, ROOM = { w: 55.9, d: 59.57 };

  /* Gerätetypen aus dem Modell: Mesh-Name → Planer-Typ.
     [Mesh, id, Name, Kategorie, Abstand, Personen, ähnliches Planer-Modell (Ersatz, solange das Detailmodell lädt)] */
  const DEV = [
    ['Laufband', 'd_tread', 'Laufband', 'cardio', .5, 1, 'tread'],
    ['Crosstrainer', 'd_cross', 'Crosstrainer', 'cardio', .5, 1, 'cross'],
    ['Ergometer', 'd_bike', 'Ergometer', 'cardio', .5, 1, 'bike'],
    ['Sitzergometer', 'd_recumb', 'Sitzergometer', 'cardio', .5, 1, 'bike'],
    ['Brustpresse', 'd_chest', 'Brustpresse', 'kraft', .6, 1, 'chest'],
    ['Latzug', 'd_lat', 'Latzug', 'kraft', .6, 1, 'latpull'],
    ['Beinstrecker', 'd_legext', 'Beinstrecker', 'kraft', .6, 1, 'legext'],
    ['Rudern_Kabel', 'd_row', 'Ruderzug (Kabel)', 'kraft', .6, 1, 'row'],
    ['Iso_Brustpresse_PL', 'd_isochest', 'Iso-Brustpresse (Scheiben)', 'kraft', .6, 1, 'chest'],
    ['Iso_Rudern_hoch_PL', 'd_isorow', 'Iso-Rudern hoch (Scheiben)', 'kraft', .6, 1, 'row'],
    ['Beinpresse_45', 'd_legpress', 'Beinpresse 45°', 'kraft', .8, 1, 'legpress'],
    ['Power_Rack', 'd_rack', 'Power Rack', 'kraft', 1, 1, 'rack'],
    ['Flachbank', 'd_bench', 'Flachbank', 'kraft', .6, 1, 'bench'],
    ['Schraegbank', 'd_adjbench', 'Schrägbank', 'kraft', .6, 1, 'adjbench'],
    ['Kurzhantelablage', 'd_dbrack', 'Kurzhantelablage', 'kraft', .6, 2, 'dbrack'],
    ['Kurzhantelablage_schwer', 'd_dbrack_h', 'Kurzhantelablage schwer', 'kraft', .6, 2, 'dbrack'],
    ['Kurzhantelablage_klein', 'd_dbrack_s', 'Kurzhantelablage klein', 'kraft', .6, 2, 'dbrack'],
    ['Scheibenstaender', 'd_plates', 'Scheibenständer', 'kraft', .3, 0, 'plates'],
    ['Kettlebell_Regal', 'd_kbrack', 'Kettlebell-Regal', 'kraft', .6, 0, 'kbrack'],
    ['Functional_Rig', 'd_rig', 'Functional Rig', 'func', 1.2, 8, 'rig'],
    ['Plyo_Box_0', 'd_plyo_s', 'Plyo-Box klein', 'func', .3, 0, null],
    ['Plyo_Box_1', 'd_plyo_m', 'Plyo-Box mittel', 'func', .3, 0, null],
    ['Plyo_Box_2', 'd_plyo_l', 'Plyo-Box groß', 'func', .3, 0, null],
    ['Matte_matte_blau', 'd_mat_b', 'Gymnastikmatte blau', 'sport', 0, 0, null],
    ['Matte_matte_grau', 'd_mat_g', 'Gymnastikmatte grau', 'sport', 0, 0, null],
    ['Stepbrett', 'd_step', 'Stepbrett', 'sport', 0, 0, null],
    ['Spinde_6', 'd_locker6', 'Spindreihe (6 Spinde)', 'service', 0, 0, 'locker6'],
    ['Spinde_4', 'd_locker4', 'Spindreihe (4 Spinde)', 'service', 0, 0, 'locker6'],
    ['Umkleidebank', 'd_lbench', 'Umkleidebank', 'service', 0, 0, 'lbench'],
    ['WC', 'd_wc', 'WC', 'service', 0, 0, null],
    ['Drehkreuz', 'd_gate', 'Drehkreuz', 'service', .3, 0, null],
    ['Getraenkestation', 'd_drinks', 'Getränkestation', 'service', .2, 0, 'water'],
    ['Schreibtisch', 'd_desk', 'Schreibtisch', 'service', .3, 0, null],
    ['Sofa', 'd_sofa', 'Sofa', 'service', .3, 0, null],
    ['Couchtisch', 'd_table', 'Couchtisch', 'service', 0, 0, null],
    ['Pflanze', 'd_plant', 'Pflanze', 'service', 0, 0, null]
  ];
  // Maße in m aus dem Modell (Breite = quer, Tiefe = Länge, Höhe); fest hinterlegt, damit die Bibliothek ohne Laden funktioniert
  const DIM = {
    d_tread: [.9, 2.24, 1.64], d_cross: [.66, 1.95, 1.75], d_bike: [.55, 1.16, 1.32], d_recumb: [.64, 1.6, 1.19],
    d_chest: [1.3, 1.81, 2.09], d_lat: [1.35, 1.75, 2.34], d_legext: [1, 1.77, 1.69], d_row: [.86, 2.13, 1.89],
    d_isochest: [1.96, 1.65, 2.01], d_isorow: [1.96, 1.6, 2.3], d_legpress: [1.6, 2.64, 1.94], d_rack: [2.2, 1.58, 2.34],
    d_bench: [.52, 1.2, .48], d_adjbench: [.56, 1.29, .97], d_dbrack: [2.93, .56, 1.14], d_dbrack_h: [2.93, .57, 1.21],
    d_dbrack_s: [2.41, .56, 1.05], d_plates: [.6, .6, 1.43], d_kbrack: [2.05, .45, .71], d_rig: [6.22, 3.04, 3.2],
    d_plyo_s: [.5, .6, .4], d_plyo_m: [.6, .75, .5], d_plyo_l: [.75, .75, .6], d_mat_b: [.6, 1.8, .01], d_mat_g: [.6, 1.8, .01],
    d_step: [.42, 1.05, .16], d_locker6: [1.82, .53, 1.95], d_locker4: [1.22, .53, 1.95], d_lbench: [1.8, .38, .46],
    d_wc: [.5, .61, .94], d_gate: [1.35, 1.2, 1.05], d_drinks: [.45, .51, 1.6], d_desk: [1.6, 1.23, 1.26],
    d_sofa: [2, .9, .8], d_table: [1.2, .6, .42], d_plant: [.95, .88, 1.59]
  };
  const DEVICES = DEV.map(([mesh, id, name, cat, clr, p, like]) => {
    const [w, d, h] = DIM[id];
    return { id, mesh, name, cat, w, d, h, clr, p, like, ref: `Detailmodell aus dem Studio-Schnittmodell · ${Math.round(d * 100)} × ${Math.round(w * 100)} × ${Math.round(h * 100)} cm` };
  });
  const byId = Object.fromEntries(DEVICES.map(d => [d.id, d]));
  const byMesh = Object.fromEntries(DEVICES.map(d => [d.mesh, d]));
  // Bauteile, die nie auf den Boden gehören (Decke), lässt die Draufsicht weg
  const TOP_SKIP = new Set(['Zirkel_Lichtring']);

  let THREE = null, Loader = null, Orbit = null, loading = null, data = null, spriteR = null;
  const sprites = {};

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#0E1A33' }

  async function libs() {
    if (THREE) return;
    THREE = await import('./vendor/three/three.module.min.js');
    Loader = (await import('./vendor/three/loaders/GLTFLoader.js')).GLTFLoader;
    Orbit = (await import('./vendor/three/controls/OrbitControls.js')).OrbitControls;
  }

  /* Lädt three.js und das Modell einmal. onProgress(0..1) */
  function load(onProgress) {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = (async () => {
      await libs();
      const gltf = await new Promise((res, rej) => new Loader().load(GLB, res, e => { if (onProgress && e.total) onProgress(e.loaded / e.total) }, rej));
      const scene = gltf.scene;
      scene.updateMatrixWorld(true);
      const protos = {}, place = [], backdrop = new THREE.Group(), J = gltf.parser.json, A = gltf.parser.associations;
      scene.children.slice().forEach(n => {
        // Mesh-Name über den glTF-Knoten (Geräte mit mehreren Materialien sind Gruppen)
        const ni = A.get(n) && A.get(n).nodes, mi = ni != null && J.nodes[ni] ? J.nodes[ni].mesh : null;
        const dev = mi != null ? byMesh[J.meshes[mi].name] : null;
        if (dev && Math.abs(n.position.y) < .05) {
          if (!protos[dev.id]) {
            const t = n.clone(); t.position.set(0, 0, 0); t.quaternion.identity(); t.scale.set(1, 1, 1); t.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(t), c = new THREE.Vector3(); b.getCenter(c);
            protos[dev.id] = { obj: t, cx: c.x, cz: c.z, ymin: b.min.y, w: b.max.x - b.min.x, d: b.max.z - b.min.z, h: b.max.y - b.min.y };
          }
          const P = protos[dev.id], q = n.quaternion, yaw = 2 * Math.atan2(q.y, q.w);
          const wx = n.position.x + P.cx * Math.cos(yaw) + P.cz * Math.sin(yaw), wz = n.position.z - P.cx * Math.sin(yaw) + P.cz * Math.cos(yaw);
          place.push({ type: dev.id, x: +(wx + OX).toFixed(3), y: +(wz + OZ).toFixed(3), rot: Math.round(((-yaw * 180 / Math.PI) % 360 + 360) % 360) });
        } else backdrop.add(n.clone());
      });
      scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = false } });
      data = { gltf, protos, place, backdrop };
      return data;
    })();
    loading.catch(() => { loading = null });
    return loading;
  }

  // Detailgerät als Objekt: Gruppe im Mittelpunkt, Mesh so verschoben, dass die Grundfläche mittig liegt
  function deviceObject(type, it) {
    const P = data && data.protos[type]; if (!P) return null;
    const g = new THREE.Group(), m = P.obj.clone();
    m.position.set(-P.cx, 0, -P.cz); g.add(m);
    if (it) g.scale.set(it.w / P.w || 1, (it.h || P.h) / P.h || 1, it.d / P.d || 1);
    return g;
  }

  function lights(scene, strong) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a4256, strong ? 2.2 : 1.6));
    const d = new THREE.DirectionalLight(0xffffff, strong ? 2.4 : 1.8); d.position.set(-20, 40, 25); scene.add(d);
    const d2 = new THREE.DirectionalLight(0xffffff, .6); d2.position.set(25, 20, -30); scene.add(d2);
  }

  function offRenderer() {
    if (!spriteR) { spriteR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); spriteR.setClearColor(0x000000, 0); spriteR.outputColorSpace = THREE.SRGBColorSpace }
    return spriteR;
  }
  // Draufsicht von oben: rechts = +x, unten = +z
  function topCam(cx, cz, w, d, top) {
    const cam = new THREE.OrthographicCamera(-w / 2, w / 2, d / 2, -d / 2, .1, top + 20);
    cam.position.set(cx, top + 10, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, 0, cz); return cam;
  }

  /* Draufsicht eines Detailgeräts als Bild (für den 2D-Plan) */
  function sprite(type) {
    if (sprites[type] !== undefined) return sprites[type];
    if (!data || !data.protos[type]) return null;
    const P = data.protos[type], k = Math.min(160, 512 / Math.max(P.w, P.d)), W = Math.max(8, Math.round(P.w * k)), H = Math.max(8, Math.round(P.d * k));
    const R = offRenderer(), sc = new THREE.Scene(); lights(sc, true);
    const m = P.obj.clone(); m.position.set(-P.cx, 0, -P.cz); sc.add(m);
    R.setSize(W, H, false); R.render(sc, topCam(0, 0, P.w, P.d, P.h + P.ymin));
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(R.domElement, 0, 0, W, H);
    return (sprites[type] = c);
  }

  /* Grundriss des Studios als Bild (Wände, Böden, Treppen …) für die Planer-Unterlage */
  function planImage() {
    const k = 22, W = Math.round(ROOM.w * k), H = Math.round(ROOM.d * k), R = offRenderer(), sc = new THREE.Scene(); lights(sc, true);
    const g = data.backdrop.clone(); g.children.filter(o => TOP_SKIP.has(o.name)).forEach(o => g.remove(o)); sc.add(g);
    R.setSize(W, H, false); R.render(sc, topCam(ROOM.w / 2 - OX, ROOM.d / 2 - OZ, ROOM.w, ROOM.d, 6));
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(R.domElement, 0, 0, W, H);
    return c;
  }

  /* Ganzes Studio als Planer-Projekt: Raum, Grundriss-Bild und alle Detailgeräte als verschiebbare Elemente */
  async function importStudio(onProgress) {
    await load(onProgress);
    return { room: { w: ROOM.w, d: ROOM.d, bg: 'studio' }, plan: planImage(), items: data.place.map(p => Object.assign({}, p)) };
  }

  /* 3D-Ansicht in einem Container. opts.planner: Szene folgt S.items; sonst Schaufenster des ganzen Modells. */
  function view(host, opts = {}) {
    const R = new THREE.WebGLRenderer({ antialias: true }); R.outputColorSpace = THREE.SRGBColorSpace;
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setClearColor(css('--navy-dd'));
    host.appendChild(R.domElement); R.domElement.className = 'r3';
    const sc = new THREE.Scene(); lights(sc);
    const cam = new THREE.PerspectiveCamera(45, 1, .1, 600), ctl = new Orbit(cam, R.domElement);
    ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * .49; ctl.screenSpacePanning = false;
    const world = new THREE.Group(); sc.add(world);
    let bgOn = null, roomSig = '', alive = true, need = true;
    const itemsG = new THREE.Group(), roomG = new THREE.Group(); world.add(roomG, itemsG);
    const objs = new Map();
    const selBox = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color(css('--ice'))); selBox.visible = false; sc.add(selBox);
    const col = c => new THREE.Color(c);

    function frame(w, d, h) {
      const r = Math.max(w, d);
      ctl.target.set(w / 2, 0, d / 2); cam.position.set(w / 2 - r * .6, r * .8, d / 2 + r * .95); ctl.update(); need = true;
    }
    function setBackdrop(on) {
      if (bgOn === on) return; bgOn = on;
      const old = world.getObjectByName('studioBg'); if (old) world.remove(old);
      if (on && data) { const g = data.backdrop.clone(); g.name = 'studioBg'; g.position.set(OX, 0, OZ); world.add(g) }
      need = true;
    }
    // Raum ohne Schnittmodell: Boden und Wände aus dem Planer
    let framed = '';
    function buildRoom(room) {
      const fk = room.w + 'x' + room.d; if (fk !== framed) { framed = fk; frame(room.w, room.d) }
      const sig = JSON.stringify([room.w, room.d, room.poly, room.walls, room.ops, room.bg]); if (sig === roomSig) return; roomSig = sig;
      roomG.clear(); setBackdrop(room.bg === 'studio');
      if (room.bg === 'studio') return;
      const fm = new THREE.MeshStandardMaterial({ color: col(css('--navy')), roughness: .95 });
      let fg;
      if (room.poly) { const sh = new THREE.Shape(room.poly.map(p => new THREE.Vector2(p[0], p[1]))); fg = new THREE.ShapeGeometry(sh); fg.rotateX(Math.PI / 2) }
      else { fg = new THREE.PlaneGeometry(room.w, room.d); fg.rotateX(-Math.PI / 2); fg.translate(room.w / 2, 0, room.d / 2) }
      roomG.add(new THREE.Mesh(fg, fm));
      const grid = new THREE.GridHelper(Math.ceil(Math.max(room.w, room.d)), Math.ceil(Math.max(room.w, room.d)), col(css('--line2') || '#39466b'), col(css('--line2') || '#39466b'));
      grid.position.set(Math.ceil(Math.max(room.w, room.d)) / 2, .003, Math.ceil(Math.max(room.w, room.d)) / 2); grid.material.transparent = true; grid.material.opacity = .18; roomG.add(grid);
      const wm = new THREE.MeshStandardMaterial({ color: col(css('--cream')), roughness: .9 }), gm = new THREE.MeshStandardMaterial({ color: col(css('--ice')), transparent: true, opacity: .3 });
      const box = (x, z, len, t, rot, y0, y1, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(len, y1 - y0, t), m); b.position.set(x, (y0 + y1) / 2, z); b.rotation.y = -rot; roomG.add(b) };
      (room.walls || []).forEach(w => {
        const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); if (L < .01) return;
        const dx = (w.b[0] - w.a[0]) / L, dy = (w.b[1] - w.a[1]) / L, rot = Math.atan2(dy, dx), H = w.h || 3;
        const seg = (s0, s1, y0, y1, m) => { if (s1 - s0 < .005 || y1 - y0 < .01) return; const m0 = (s0 + s1) / 2; box(w.a[0] + dx * m0, w.a[1] + dy * m0, s1 - s0, m === gm ? w.t * .25 : w.t, rot, y0, y1, m) };
        const ops = (room.ops || []).filter(o => o.wall === w.id).sort((a, b) => a.pos - b.pos); let s = 0;
        ops.forEach(o => { const a = Math.max(0, o.pos - o.w / 2), e = Math.min(L, o.pos + o.w / 2); seg(s, a, 0, H, wm);
          if (o.type === 'door') seg(a, e, Math.min(o.h || 2.1, H), H, wm); else { const z0 = Math.min(o.sill || .9, H), z1 = Math.min(z0 + (o.h || 1.2), H); seg(a, e, 0, z0, wm); seg(a, e, z1, H, wm); seg(a, e, z0, z1, gm) }
          s = e });
        seg(s, L, 0, H, wm);
      });
      if (!(room.walls || []).length && !room.poly) {
        const t = .15, H = .25; box(room.w / 2, 0, room.w, t, 0, 0, H, wm); box(room.w / 2, room.d, room.w, t, 0, 0, H, wm);
        box(0, room.d / 2, room.d, t, Math.PI / 2, 0, H, wm); box(room.w, room.d / 2, room.d, t, Math.PI / 2, 0, H, wm);
      }
      need = true;
    }
    function catMat(it, cats) {
      const c = (cats[it.cat] || {}).c || '#8C93A8';
      return new THREE.MeshStandardMaterial({ color: col(c), roughness: .8, transparent: !!it.zone, opacity: it.zone ? .35 : 1 });
    }
    // Bestehende Bauteil-Modelle des Planers (models.js) als Quader/Zylinder: [Material, x0, x1, y0, y1, z0, z1, rund, Drehung°]
    const mats = {};
    function partMat(rgb, a) { const k = rgb.join(',') + '|' + a; return mats[k] || (mats[k] = new THREE.MeshStandardMaterial({ color: new THREE.Color(`rgb(${rgb.map(v => Math.round(v)).join(',')})`), roughness: .7, metalness: .1, transparent: a < 1, opacity: a })) }
    function partsObject(it, cats) {
      const parts = !it.zone && opts.parts ? opts.parts(it) : null; if (!parts) return null;
      const g = new THREE.Group(), H = it.h || 1;
      parts.forEach(([m, x0, x1, y0, y1, z0, z1, round, r]) => {
        const sx = Math.abs(x1 - x0) * it.w, sz = Math.abs(y1 - y0) * it.d, sy = Math.max(.005, Math.abs(z1 - z0) * H); if (!sx || !sz) return;
        const mesh = new THREE.Mesh(round ? new THREE.CylinderGeometry(.5, .5, 1, 20) : new THREE.BoxGeometry(1, 1, 1), partMat(opts.mat(m, it), (opts.alpha || {})[m] || 1));
        mesh.scale.set(sx, sy, sz); mesh.position.set(((x0 + x1) / 2 - .5) * it.w, (z0 + z1) / 2 * H, ((y0 + y1) / 2 - .5) * it.d); mesh.rotation.y = -(r || 0) * Math.PI / 180; g.add(mesh);
      });
      return g;
    }
    // Planer-Elemente abgleichen (nur Geändertes neu bauen)
    function sync(items, room, cats, sel) {
      buildRoom(room);
      const seen = new Set();
      items.forEach(it => {
        seen.add(it.id);
        const sig = [it.type, it.w, it.d, it.h, it.zone, it.cat, !!(data && data.protos[it.type])].join('|');
        let o = objs.get(it.id);
        if (!o || o.userData.sig !== sig) {
          if (o) itemsG.remove(o);
          o = deviceObject(it.type, it) || partsObject(it, cats);
          if (!o) {
            o = new THREE.Group();
            const h = it.zone ? .02 : Math.max(.02, it.h || .5), m = new THREE.Mesh(it.round ? new THREE.CylinderGeometry(.5, .5, 1, 24) : new THREE.BoxGeometry(1, 1, 1), catMat(it, cats));
            m.scale.set(it.w, h, it.d); m.position.y = h / 2 + (it.zone ? .004 : 0); o.add(m);
          }
          o.userData = { sig, id: it.id }; itemsG.add(o); objs.set(it.id, o);
        }
        o.position.set(it.x, 0, it.y); o.rotation.y = -it.rot * Math.PI / 180;
      });
      [...objs.keys()].forEach(id => { if (!seen.has(id)) { itemsG.remove(objs.get(id)); objs.delete(id) } });
      const so = sel != null && objs.get(sel);
      selBox.visible = !!so; if (so) selBox.box.setFromObject(so);
      need = true;
    }
    function resize() {
      const r = host.getBoundingClientRect(); if (!r.width || !r.height) return;
      R.setSize(r.width, r.height, false); R.domElement.style.width = r.width + 'px'; R.domElement.style.height = r.height + 'px';
      cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); need = true;
    }
    // Treffer auf ein Planer-Element oder Bodenpunkt
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    function setRay(e) { const r = R.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam) }
    function pick(e) {
      setRay(e); const h = ray.intersectObjects(itemsG.children, true);
      for (const x of h) { let o = x.object; while (o && o.parent !== itemsG) o = o.parent; if (o) return o.userData.id }
      return null;
    }
    function groundAt(e, y = 0) { setRay(e); floor.constant = -y; const p = new THREE.Vector3(); return ray.ray.intersectPlane(floor, p) ? { x: p.x, y: p.z } : null }

    ctl.addEventListener('change', () => { need = true });
    (function tick() { if (!alive) return; ctl.update(); if (need || opts.spin) { if (opts.spin && !opts.spinStop) { ctl.autoRotate = true; ctl.autoRotateSpeed = .5 } need = false; R.render(sc, cam) } requestAnimationFrame(tick) })();
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    if (!opts.planner && data) { const g = data.backdrop.clone(); world.add(g); const it = new THREE.Group(); data.place.forEach(p => { const o = deviceObject(p.type); if (o) { o.position.set(p.x - OX, 0, p.y - OZ); o.rotation.y = -p.rot * Math.PI / 180; it.add(o) } }); world.add(it); ctl.target.set(ROOM.w / 2 - OX, 0, ROOM.d / 2 - OZ); cam.position.set(ROOM.w / 2 - OX - 30, 42, ROOM.d / 2 - OZ + 50); ctl.update();
      R.domElement.addEventListener('pointerdown', () => { ctl.autoRotate = false; opts.spinStop = true }, { once: true }) }

    return {
      el: R.domElement, controls: ctl, sync, frame, pick, groundAt, resize,
      redraw() { need = true },
      dispose() { alive = false; ro.disconnect(); ctl.dispose(); R.dispose(); R.domElement.remove() }
    };
  }

  window.Studio3D = { DEVICES, ROOM, load, loaded: () => !!data, sprite, importStudio, view, ensure: libs };
})();
