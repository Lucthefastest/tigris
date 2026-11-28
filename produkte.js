/* TIGRIS – Importprodukte. Einzige Datenquelle für Katalog, Produktseiten und Planer.
   art 'geraet':   Kraftgeräte und Smith Machine. Maße in cm (L = Tiefe, B = Breite quer zum Gerät, H = Höhe),
                   Gewicht in kg, im Planer in Originalgröße platzierbar.
   art 'zubehoer': Langhanteln und Hantelscheiben. Eigene Kennwerte, nicht im Planer.
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
      text: 'Trizepsstrecken mit Armauflage und Hebelarm. Gewicht über Hantelscheiben, Sitzhöhe verstellbar.' },
    { id: 'p_smith', slug: 'smith-machine', name: 'Smith Machine', cat: 'smith', modell: 'Vertical Smith Machine', like: 'smith',
      l: 137, b: 213, h: 213, kg: 173, dimsSrc: 'richtwert', maxUser: 200, material: 'Q235-Stahlrohr',
      farben: ['Schwarz'], farbenHinweis: 'Weitere Rahmenfarben auf Anfrage',
      muskeln: 'Ganzkörper: Beine, Gesäß, Brust, Schultern, Rücken',
      bauart: 'Geführte Langhantel, scheibenbelastet – Hantelscheiben nicht enthalten',
      extra: [['Max. Hantellast', '244 kg', 'Richtwert vom Vorbildgerät'],
              ['Startgewicht der Stange', 'ca. 7 kg', 'Richtwert vom Vorbildgerät'],
              ['Hakenleiste', '18 Positionen im Abstand von 10 cm', 'Richtwert vom Vorbildgerät']],
      text: 'Senkrecht geführte Langhantel für Kniebeuge, Bankdrücken, Schulterdrücken und Rudern. Die Stange lässt sich in jeder Höhe in die Hakenleiste einhängen, seitliche Ablagen nehmen die Hantelscheiben auf.' },
    /* ---------- Zubehör: Langhanteln und Hantelscheiben ---------- */
    ...[[1500, 680.4, '8NK'], [2000, 907.2, '10NK']].map(([lb, kgMax, lager]) => ({
      id: `p_langhantel_${lb}`, slug: `olympia-langhantel-20kg-${lb}lb`, name: `Olympia-Langhantel 20 kg · ${lb.toLocaleString('de-DE')} lb`,
      cat: 'hanteln', art: 'zubehoer', modell: `Power Bar ${lb.toLocaleString('de-DE')} lb`, kg: 20, mass: 'L 220 cm · Griff-Ø 28 mm',
      farben: ['Schwarz'], farbenHinweis: 'Hantelaufnahmen in Stahloptik',
      facts: [['Länge', '220 cm'], ['Gewicht', '20 kg'], ['Max. Belastung', `ca. ${Math.round(kgMax)} kg`]],
      spec: [['Gesamtlänge', '220 cm', 'Herstellerangabe'],
             ['Griffbereich', '131 cm', 'Zwischen den Aufnahmebünden'],
             ['Länge der Hantelaufnahme', '43,2 cm je Seite'],
             ['Griff-Ø', '28 mm', 'Umfang ca. 88 mm'],
             ['Aufnahme-Ø', '50 mm', 'Für olympische Hantelscheiben, Umfang ca. 157 mm'],
             ['Eigengewicht', '20 kg', 'Toleranz ±1 % laut Hersteller'],
             ['Max. Belastung', `${lb.toLocaleString('de-DE')} lb (ca. ${num(kgMax)} kg)`, 'Laut Hersteller'],
             ['Lagerung', `${lager} (laut Hersteller)`],
             ['Material', 'Federstahl, Hartchrom-Oberfläche'],
             ['Farbe', 'Schaft schwarz, Hantelaufnahmen in Stahloptik'],
             ['Modell', `Power Bar ${lb.toLocaleString('de-DE')} lb`],
             ['Herkunft', 'Qingdao, Shandong, China']],
      fine: 'Hantelscheiben und Verschlüsse sind nicht enthalten.',
      text: `Power Bar für Kniebeuge, Bankdrücken und Kreuzheben. Schaft aus Federstahl, 28 mm Griff, belastbar bis ${lb.toLocaleString('de-DE')} lb laut Hersteller.` })),
    ...[5, 10, 15, 20].map(kg => ({
      id: `p_bumper_${kg}`, slug: `bumper-plate-${kg}kg`, name: `Bumper Plate ${kg} kg`,
      cat: 'hanteln', art: 'zubehoer', modell: 'Competition Bumper Plate', kg, mass: 'Ø 450 mm', uebersicht: true,
      farben: ['Schwarz'], farbenHinweis: 'Ohne Logo und Beschriftung',
      facts: [['Gewicht', `${kg} kg`], ['Außen-Ø', '450 mm'], ['Aufnahme-Ø', '50,6 mm']],
      spec: [['Gewicht je Scheibe', `${kg} kg`],
             ['Außen-Ø', '450 mm', 'Toleranz ±3 mm laut Hersteller, Umfang ca. 141,4 cm'],
             ['Aufnahme-Ø', '50,6 ± 0,2 mm', 'Für olympische 50-mm-Hantelaufnahmen'],
             ['Scheibendicke', 'Auf Anfrage'],
             ['Material', kg === 5 ? 'Gummi mit kleiner Stahlbuchse' : 'Gummi mit Stahleinsatz'],
             ['Farbe', 'Schwarz, ohne Logo und Beschriftung'],
             ['Erhältliche Gewichte', '5 kg, 10 kg, 15 kg, 20 kg'],
             ['Modell', 'Competition Bumper Plate'],
             ['Herkunft', 'Qingdao, Shandong, China']],
      fine: 'Langhantel und Verschlüsse sind nicht enthalten. Angebot je Scheibe oder als Satz.',
      text: `Bumper Plate mit ${kg} kg aus Gummi mit ${kg === 5 ? 'Stahlbuchse' : 'Stahleinsatz'}. Alle Gewichte haben denselben Außendurchmesser von 450 mm und passen auf olympische 50-mm-Hantelaufnahmen.` }))
  ];
  const CAT = { brust: 'Brust', ruecken: 'Rücken', schultern: 'Schultern', arme: 'Arme', beine: 'Beine', smith: 'Smith Machine', hanteln: 'Hanteln & Scheiben' };
  /* Zweites Produktbild: Strichzeichnung mit Maßen. Schulterpresse und Trizeps-Curl fehlen noch
     (die gelieferten Maßbilder tragen die Werte des jeweils anderen Geräts). */
  const OHNE_MASSBILD = ['p_schulterpresse', 'p_trizeps'];
  function num(v) { return String(Math.round(v * 10) / 10).replace('.', ',') }
  P.forEach(p => {
    const a = `assets/produkte/${p.slug}`;
    p.art = p.art || 'geraet'; p.planbar = p.art === 'geraet';
    p.img = `${a}.webp`; p.thumb = `${a}-480.webp`;
    p.alt = `${p.name}, Produktfoto auf weißem Hintergrund`;
    p.bilder = [{ src: p.img, mini: `${a}-160.webp`, alt: p.alt, label: 'Produktfoto' }];
    if (!OHNE_MASSBILD.includes(p.id)) p.bilder.push({ src: `${a}-masse.webp`, mini: `${a}-masse-160.webp`, alt: p.planbar ? `${p.name}, Zeichnung mit Aufstellmaßen Länge, Breite und Höhe` : `${p.name}, Zeichnung mit Maßen`, label: 'Maße' });
    if (p.uebersicht) p.bilder.push({ src: 'assets/produkte/bumper-plates-uebersicht.webp', mini: 'assets/produkte/bumper-plates-uebersicht-160.webp', alt: 'Bumper Plates mit 5, 10, 15 und 20 kg nebeneinander', label: 'Übersicht' });
    p.gewicht = `${num(p.kg)} kg`;
    if (p.planbar) {
      p.mass = `L ${num(p.l)} × B ${num(p.b)} × H ${num(p.h)} cm`;
      const src = p.dimsSrc === 'richtwert' ? 'Richtwert' : 'Herstellerangabe';
      p.facts = [['Maße', p.mass], ['Gewicht', p.gewicht], ['Max. Nutzergewicht', `${p.maxUser} kg`]];
      p.spec = [['Abmessungen Gerät', p.mass, p.dimsSrc === 'richtwert' ? 'Richtwert: Der Hersteller nennt keine Aufstellmaße. Die Werte stammen vom Vorbildgerät und werden vor der Bestellung bestätigt.' : 'Herstellerangabe (L = Tiefe, B = Breite, H = Höhe). Wird vor der Bestellung bestätigt.'],
        ['Gerätegewicht', p.gewicht, src],
        ['Maximales Nutzergewicht', `${p.maxUser} kg`],
        ...(p.extra || []),
        ['Materialzusammensetzung', p.material],
        ['Bauart', p.bauart || 'Scheibenbelastet (Plate Loaded) – Hantelscheiben nicht enthalten'],
        ['Trainierte Muskeln', p.muskeln],
        ['Rahmenfarben', (p.farben.length ? p.farben.join(', ') + ' · ' : '') + p.farbenHinweis],
        ['Modell', p.modell], ['Herkunft', 'Shandong, China'], ['Kennzeichnung', 'CE (laut Hersteller)'],
        ['Garantie', p.garantie], ['Verpackung', p.verpackung]].filter(r => r[1]);
      p.farbLabel = 'Rahmenfarbe';
      p.impLine = 'Importgerät · gefertigt in Shandong, China · Lieferzeit auf Anfrage';
      p.fine = p.fine || 'Hantelscheiben, Langhantel und Zubehör sind nicht enthalten.';
    } else {
      p.farbLabel = 'Farbe';
      p.impLine = 'Importartikel · gefertigt in Qingdao, China · Lieferzeit auf Anfrage';
    }
  });
  window.PRODUKTE = { list: P, cats: CAT, num, byId: Object.fromEntries(P.map(p => [p.id, p])), bySlug: Object.fromEntries(P.map(p => [p.slug, p])) };
})();
