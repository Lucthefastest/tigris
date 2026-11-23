# Tigris 3D-Raumplan – FitX Berlin-Biesdorf

Paket mit den 3D-Modellen, dem interaktiven Web-Viewer, Plänen und Daten
für die Tigris-Website. Stand: 22.11.2026.

> **Für Claude Code:** Die Einbau-Anleitung steht in `INTEGRATION.md`.
> Alle Dateien und ihre Aufgaben stehen maschinenlesbar in `manifest.json`.

## Inhalt

```
tigris-3d-raumplan/
├── README.md                 diese Datei
├── INTEGRATION.md            Schritt-für-Schritt-Anleitung zum Einbau in die Website
├── manifest.json             Dateiliste mit Zweck, Format, Größe
├── models/
│   ├── fitx-biesdorf-web.glb          Web-Modell (wird vom Viewer geladen): komplett + Schnitt + Decke
│   ├── fitx-biesdorf-komplett.glb     realistisches Modell mit Wänden bis Träger, Decke, Lüftung, Licht
│   └── fitx-biesdorf-schnittmodell.glb realistisches Schnittmodell, Wände auf 2,80 m, ohne Decke
├── viewer/
│   ├── index.html            eigenständiger 3D-Viewer (Drehen/Wischen, Zonen, Geräteliste, Messen)
│   └── vendor/               three.js r147 (lokal, kein CDN nötig) + Lizenz
├── data/
│   ├── zonen.json            Zonen mit Fläche (m²) und Label-Position
│   ├── geraeteliste.json     128 Geräte nach Typ und Bereich
│   └── plan-geometrie.json   Grundriss-Geometrie in Metern (Außenwand, Wände, Zonen, Türen …)
├── plaene/
│   ├── grundriss-fitx-biesdorf-m1-200-a2-index-a.pdf   Grundriss M 1:200, A2
│   └── grundriss-fitx-biesdorf.dxf                     Grundriss für CAD (Einheit Meter, Layer A_*)
├── vorschau/                 Renderings und Screenshots (für Website-Teaser/OG-Bild)
└── source/
    └── fitx-biesdorf.blend   Blender-Quelldatei (Blender 5.0, Texturen eingepackt)
```

## Eckdaten

| | |
|---|---|
| Außenmaße | 55,60 × 59,27 m |
| Brutto-Grundfläche | 3.237,4 m² |
| Netto-Raumfläche Mietbereich | 2.401,7 m² |
| Geräte im Modell | 128 (19 Gerätetypen + Zubehör) |
| Einheit 3D-Modelle | Meter, Y-oben (glTF 2.0) |

## Hinweise

- Der Grundriss ist aus dem Flucht- und Rettungsplan (03.07.2024) abgeleitet,
  Maßbezug WC-Kabinenlänge 2,00 m, Genauigkeit ca. ± 3–5 %.
- Geräteauswahl und Aufstellung sind ein Planungsbeispiel, nicht der reale Bestand.
- Geräte sind eigene Modelle in der Bauweise üblicher OEM-Studiogeräte, ohne Herstellerlogos.
