# LunaCycle

Tracker del ciclo mestruale offline e privato: previsioni statistiche, metodo sintotermico. Nessun server, nessun tracciamento.
*Private, offline menstrual cycle tracker: statistical predictions and symptothermal method. No server, no tracking.*

## Uso / Usage
Servi la cartella con un server statico (es. `python3 -m http.server`) e apri `index.html` (o semplicemente la radice del server); da browser mobile puoi installarla come PWA.

## Lingua / Language
L'interfaccia è in **italiano** se la lingua del browser (`navigator.language`) è italiana, altrimenti in **inglese**. Si può forzare la lingua da Impostazioni → Lingua.
*The UI is in **Italian** when the browser language (`navigator.language`) is Italian, **English** otherwise. You can override it in Settings → Language.*

Per aggiungere una lingua: aggiungi un oggetto in `I18N` dentro `index.html` e aggiorna `resolveLang()`.

## Licenza
Copyright (C) 2026 I contributori di LunaCycle. Software libero sotto **GNU GPL v3 o successiva** (`SPDX: GPL-3.0-or-later`). Ogni versione modificata o ridistribuita deve restare sotto GPL con il codice sorgente disponibile. Testo completo in `LICENSE`.
