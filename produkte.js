/* TIGRIS – Importgeräte (Kraft, scheibenbelastet). Einzige Datenquelle für Katalog, Produktseiten und Planer.
   Maße in cm (L = Tiefe, B = Breite quer zum Gerät, H = Höhe), Gewicht in kg.
   dimsSrc: 'hersteller' = Angabe des Herstellers, noch nicht bestätigt
            'richtwert'  = Hersteller nennt keine Maße; Werte des Vorbildgeräts als Planungswert
   Preise gibt es nur auf Anfrage. */
(function () {
  const ALLE = ['Rot', 'Schwarz', 'Grün', 'Gold', 'Weiß', 'Silber', 'Grau', 'Orange', 'Blau', 'Lila', 'Cyan', 'Gelb'];
  const P = [
    { id: 'p_brust_flach_prm', slug: 'brustpresse-flach-prm', name: 'Flache Brustpresse PRM', cat: 'brust', modell: 'PRM Flat Chest Press', like: 'chest',
      l: 188, b: 188, h: 140, kg: 218, dimsSrc: 'richtwert', maxUser: 200, material: 'Q235-Stahlrohr',
      farben: ['Schwarz'], farbenHinweis: 'Weitere Rahmenfarben auf Anfrage',
      muskeln: 'Brust, vordere Schulter, Trizeps',
      text: 'Brustpresse im Liegen auf der Flachbank. Zwei Hebelarme werden mit Hantelscheiben beladen und führen die Druckbewegung auf einer festen Bahn.' },
    { id: 'p_brust_flach_yt402', slug: 'brustpresse-flach-yt402', name: 'Flache Brustpresse YT402', cat: 'brust', modell: 'YT402', like: 'chest',
      l: 215, b: 162, h: 114, kg: 135, dimsSrc: 'hersteller', maxUser: 200, material: 'Stahl',
      farben: ALLE, farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Brust, vordere Schulter, Trizeps',
      text: 'Scheibenbelastete Brustpresse für das Drücken im Liegen. Hebelarme mit Scheibenaufnahme führen die Druckbewegung auf einer festen Bahn.' },
    { id: 'p_brust_schraeg_yt403', slug: 'brustpresse-schraeg-yt403', name: 'Schrägbrustpresse YT403', cat: 'brust', modell: 'YT403', like: 'chest',
      l: 215, b: 162, h: 114, kg: 135, dimsSrc: 'hersteller', maxUser: 200, material: 'Stahl',
      farben: ALLE, farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Obere Brust, vordere Schulter, Trizeps',
      text: 'Scheibenbelastete Schrägbankpresse für die obere Brust. Hebelarme mit Scheibenaufnahme, Liegefläche im Schrägwinkel.' },
    { id: 'p_lat_combo', slug: 'latzug-lat-combo-pull', name: 'Latzug Lat Combo Pull', cat: 'ruecken', modell: 'LAT COMBO PULL', like: 'latpull',
      l: 182.8, b: 148.7, h: 226, kg: 209, dimsSrc: 'hersteller', maxUser: 200, material: 'Stahl',
      farben: ['Silber', 'Schwarz', 'Rot', 'Grau', 'Weiß'], farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Breiter Rückenmuskel, Bizeps, hintere Schulter',
      text: 'Scheibenbelasteter Latzug für das Ziehen von oben. Rahmen aus Stahl, Gewicht über Hantelscheiben.' },
    { id: 'p_lat_b105', slug: 'hebel-latzug-b105', name: 'Hebel-Latzug B105', cat: 'ruecken', modell: 'B105', like: 'latpull',
      l: 234, b: 116, h: 213, kg: 175, dimsSrc: 'hersteller', maxUser: 200, material: 'Stahl',
      farben: ['Weiß', 'Silber'], farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Gesamter Rücken, Bizeps, hintere Schulter',
      text: 'Latzug mit drei Hebeln und natürlicher Bewegungsbahn für den gesamten Rücken. Gewicht über Hantelscheiben.' },
    { id: 'p_hochrudern', slug: 'hochrudern-iso-lateral', name: 'Iso-laterales Hochrudern', cat: 'ruecken', modell: 'High Row', like: 'row',
      l: 220.2, b: 123.5, h: 250.6, kg: 196, dimsSrc: 'hersteller', maxUser: 220, material: 'Stahl',
      farben: ['Silber', 'Schwarz', 'Rot', 'Grau', 'Weiß'], farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Oberer Rücken, breiter Rückenmuskel, Bizeps',
      text: 'Hochrudern mit getrennten Hebelarmen: Jede Seite arbeitet für sich, Ungleichgewichte werden sichtbar. Drehbare Griffe, Gewicht über Hantelscheiben.' },
    { id: 'p_rudern_sitzend', slug: 'rudern-sitzend', name: 'Rudern sitzend', cat: 'ruecken', modell: 'Seated Row', like: 'row',
      l: 150, b: 145, h: 125, kg: 159, dimsSrc: 'richtwert', maxUser: 200, material: 'Q235-Stahlrohr',
      farben: ['Schwarz'], farbenHinweis: 'Weitere Rahmenfarben auf Anfrage',
      muskeln: 'Mittlerer Rücken, breiter Rückenmuskel, Bizeps',
      text: 'Scheibenbelastetes Rudern im Sitzen mit Brustpolster. Gewicht über Hantelscheiben.' },
    { id: 'p_hack_yt412', slug: 'hack-squat-beinpresse-yt412', name: 'Hack Squat und Beinpresse YT412', cat: 'beine', modell: 'YT412', like: 'hacksq',
      l: 259.9, b: 160, h: 138.5, kg: 321, dimsSrc: 'hersteller', maxUser: 200, material: 'Stahl',
      farben: ALLE, farbenHinweis: 'Rahmenfarbe wählbar',
      muskeln: 'Oberschenkel vorne und hinten, Gesäß',
      text: 'Zwei Übungen auf einem Schlitten: Hackenschmidt-Kniebeuge mit Schulterpolstern und Beinpresse. Gewicht über Hantelscheiben.' },
    { id: 'p_schulterpresse', slug: 'schulterpresse', name: 'Schulterpresse', cat: 'schultern', modell: 'Shoulder Press', like: 'chest',
      l: 139.7, b: 152.4, h: 132.1, kg: 122.4, dimsSrc: 'richtwert', maxUser: 200, material: '3,0-mm-Stahlrohr',
      farben: ['Gold'], farbenHinweis: 'Weitere Rahmenfarben auf Anfrage',
      muskeln: 'Schultern, Trizeps, oberer Brustbereich',
      text: 'Schulterdrücken im Sitzen mit zusammenlaufenden Hebelarmen. Verstellbarer Sitz, Gewicht über Hantelscheiben.' },
    { id: 'p_bizeps_b110', slug: 'bizeps-curl-b110', name: 'Bizeps-Curl PRM-B110', cat: 'arme', modell: 'PRM-B110', like: 'legext',
      l: 123.4, b: 120, h: 130.4, kg: 145, dimsSrc: 'hersteller', maxUser: 240, material: 'Stahl',
      farben: [], farbenHinweis: 'Rahmenfarbe frei wählbar',
      muskeln: 'Bizeps, Unterarme',
      garantie: '1 Jahr (laut Hersteller)', verpackung: 'Holzkiste',
      text: 'Scheibenbelasteter Bizeps-Curl mit Armauflage. Die Oberarme liegen fest auf, der Bizeps arbeitet ohne Schwung.' },
    { id: 'p_trizeps', slug: 'trizeps-curl', name: 'Trizeps-Curl', cat: 'arme', modell: 'Triceps Curl', like: 'legext',
      l: 125, b: 122, h: 133, kg: 136, dimsSrc: 'richtwert', maxUser: 200, material: 'Q235-Stahlrohr',
      farben: ['Schwarz'], farbenHinweis: 'Weitere Rahmenfarben auf Anfrage',
      muskeln: 'Trizeps',
      text: 'Trizepsstrecken mit Armauflage und Hebelarm. Gewicht über Hantelscheiben, Sitzhöhe verstellbar.' }
  ];
  const CAT = { brust: 'Brust', ruecken: 'Rücken', schultern: 'Schultern', arme: 'Arme', beine: 'Beine' };
  const num = v => String(Math.round(v * 10) / 10).replace('.', ',');
  P.forEach(p => {
    p.img = `assets/produkte/${p.slug}.webp`; p.thumb = `assets/produkte/${p.slug}-480.webp`;
    p.alt = `${p.name}, Produktfoto auf weißem Hintergrund`;
    p.mass = `L ${num(p.l)} × B ${num(p.b)} × H ${num(p.h)} cm`; p.gewicht = `${num(p.kg)} kg`;
  });
  window.PRODUKTE = { list: P, cats: CAT, num, byId: Object.fromEntries(P.map(p => [p.id, p])), bySlug: Object.fromEntries(P.map(p => [p.slug, p])) };
})();
