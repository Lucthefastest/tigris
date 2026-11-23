# Einbau in die Tigris-Website (Anleitung für Claude Code)

Ziel: Den 3D-Raumplan als eigene Seite und als einbettbares Element auf der
Website bereitstellen. Der Viewer ist reines HTML + JavaScript ohne Build-Schritt
und ohne externe Abhängigkeiten (three.js liegt in `viewer/vendor/`).

## 1. Dateien ins Repository kopieren

Den gesamten Ordner `tigris-3d-raumplan/` in den **statisch ausgelieferten Ordner**
der Website kopieren. Die relativen Pfade müssen erhalten bleiben
(`viewer/index.html` lädt `../models/fitx-biesdorf-web.glb` und `vendor/*.js`).

| Projektart | Zielordner |
|---|---|
| Reines HTML / GitHub Pages | `<repo-root>/3d/` |
| Vite, React (CRA), Vue, Astro, SvelteKit | `public/3d/` |
| Next.js | `public/3d/` |
| Jekyll | `<repo-root>/3d/` (Ordner nicht mit `_` beginnen) |

Danach ist der Viewer erreichbar unter: `https://<domain>/3d/viewer/index.html`

`source/fitx-biesdorf.blend` (19 MB) und `vorschau/` werden für die Website nicht
gebraucht. Optional weglassen oder in einen Ordner außerhalb von `public/` legen.

## 2. Einbinden

### a) Als eigene Seite verlinken
```html
<a href="/3d/viewer/index.html">3D-Raumplan ansehen</a>
```

### b) Auf einer bestehenden Seite einbetten (empfohlen)
```html
<div style="position:relative;width:100%;aspect-ratio:16/10;max-height:85vh">
  <iframe src="/3d/viewer/index.html" title="3D-Raumplan FitX Berlin-Biesdorf"
          style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:14px"
          loading="lazy" allow="fullscreen"></iframe>
</div>
```
In React/Next.js entsprechend als JSX (`style={{...}}`, `allow="fullscreen"`).

### c) Nur das Modell in einer eigenen three.js-/model-viewer-Komponente
`models/fitx-biesdorf-web.glb` ist ein normales glTF 2.0 Binary.
Gruppenknoten im Modell (für Ein-/Ausblenden):
- `Basis` – Böden, Türen, Treppen
- `Gebaeude_komplett` (enthält `Decke`) – Wände bis Träger, Deckenkonstruktion
- `Gebaeude_Schnitt` – Wände auf 2,80 m gekappt
- `Ausstattung` – Unterknoten je Bereich (`Ausdauer`, `Geraetetraining`, `Zirkel`, `Basics`, `Freihantel`, `Turnecke`, `Lady_Gym`, …)
- `Boden_<Zonenname>` – Bodenflächen je Zone (anklickbar)

Achtung: Wenn `Gebaeude_komplett` und `Gebaeude_Schnitt` gleichzeitig sichtbar sind,
liegen die Wände doppelt. Immer nur eine der beiden Gruppen anzeigen.
Für einfache Einbettung ohne Umschalten lieber `fitx-biesdorf-schnittmodell.glb` nehmen.

## 3. Server / Hosting

- MIME-Typ für `.glb`: `model/gltf-binary`. GitHub Pages, Netlify und Vercel liefern das korrekt aus.
- Der Viewer muss über HTTP(S) geöffnet werden. Direkt per `file://` geöffnet lädt das Modell nicht
  (Browser-Sicherheit). Lokal testen z. B. mit `npx serve .` oder `python3 -m http.server`
  im Ordner `tigris-3d-raumplan/` und dann `http://localhost:8000/viewer/index.html` öffnen.
- Dateigrößen: größte Datei 19 MB (`.blend`), alle GLB-Dateien unter 10 MB → kein Git LFS nötig.

## 4. Prüfen nach dem Einbau

1. Seite öffnen, Ladebalken läuft, Modell erscheint in der Übersicht.
2. Buttons testen: Übersicht, Draufsicht, Innen, Schnitt/Mit Decke, Beschriftung, Messen, Rundflug.
3. Rechte Spalte: Zonen anklicken (Kamera fliegt hin), Geräteliste anklicken (Geräte werden orange).
4. Mobil: Wischen dreht, zwei Finger zoomen; Werkzeugleiste ist horizontal scrollbar.
5. Browser-Konsole ohne Fehler.

## 5. Anpassen

- Farben/Schrift: CSS-Variablen am Anfang von `viewer/index.html` (`--river`, `--tiger`, `--deep` …).
- Kopfzeile ausblenden für reine Einbettung: `<header>` in `viewer/index.html` entfernen.
- Startansicht: Funktion `V` in `viewer/index.html` (`all`, `top`, `in`) – Koordinaten in Metern,
  three.js-Achsen: x = Grundriss-x, y = Höhe, z = −Grundriss-y.
- Zonendaten: `window.PLAN` in `viewer/index.html` (identisch mit `data/zonen.json`).
