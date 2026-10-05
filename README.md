# ABC Dating

26 Dates von A bis Z – für Raphaela & Satoshi. Buchstabe ziehen, abwechselnd planen, erleben, Erinnerung festhalten.

- **App:** https://marcobalzano222-hub.github.io/abc-dating/
- **Daten:** liegen *nicht* hier, sondern im privaten Repo `abc-dating-data` (eine Datei `dates.json`).
- **Kein Backend, kein Konto:** Die App spricht direkt mit der GitHub-API. Der Token bleibt nur auf euren Handys.

## Einrichtung (einmalig, ca. 5 Minuten)

1. **Privates Daten-Repo:** GitHub → **+ → New repository** → Name `abc-dating-data` → **Private** → Create. Darf leer bleiben.
2. **Fine-grained Token:** https://github.com/settings/personal-access-tokens/new
   - Name z. B. `ABC Dating`, Ablaufdatum z. B. 1 Jahr
   - **Only select repositories** → nur `abc-dating-data`
   - **Repository permissions → Contents: Read and write**
   - Token (`github_pat_…`) kopieren
3. **Erstes Handy:** App-URL in Safari öffnen → Teilen → **Zum Home-Bildschirm**. App öffnen → ⚙︎ → „Oder manuell eingeben“ → Benutzername, `abc-dating-data`, Token → **Verbinden**.
4. **Zweites Handy:** Auf dem ersten Handy ⚙︎ → **Code fürs Partner-Handy kopieren** → per AirDrop/privat schicken. Auf dem zweiten Handy App installieren → ⚙︎ → Code einfügen → **Verbinden**.

Ohne Verbindung funktioniert die App auch – dann nur auf dem jeweiligen Gerät.

## Bedienung

- **Buchstabe ziehen:** zufälliger offener Buchstabe; wer dran ist, plant. „Neu ziehen“ gibt einen noch leeren Buchstaben wieder frei.
- **„… plant“ antippen:** Planer wechseln.
- **Kachel antippen:** Idee (Vorschläge oder Zufallsidee), Datum, Status offen / geplant / erlebt, Herzen und Erinnerung.
- **Erinnerungen:** alle erlebten Dates, neueste zuerst.
- **Sync-Punkt am ⚙︎:** grün = synchron, gelb = ausstehend/offline, rot = Fehler.

Beide können gleichzeitig ändern: pro Buchstabe gewinnt die neueste Änderung, der Rest wird zusammengeführt.

## Entwicklung

Reines HTML/CSS/JS ohne Build. Lokal: `python3 -m http.server 8765`.
Bei jedem Release `CACHE_VERSION` in `sw.js` erhöhen, damit Updates auf den Handys ankommen.
