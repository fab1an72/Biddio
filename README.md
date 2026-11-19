# Biddio – Solo und Online mit 2–3 Personen

## Update 0.5.0

70 Kategorien insgesamt, darunter 18 neue Listen mit jeweils mindestens sieben Antworten. Neue offene Themen nutzen ausdrücklich gekennzeichnete, feste Auswahllisten; nicht jedes fachlich richtige Beispiel ist enthalten. Im Online-Modus werden ausschließlich Kategorien mit mindestens sieben Antworten verwendet. Solo bleiben auch die kürzeren Listen erhalten. Gebote sind weiterhin auf maximal 15 Antworten begrenzt; die Antwortzeit beträgt 30 Sekunden.

## Bestehende Website aktualisieren

1. Das ZIP entpacken.
2. Alle Dateien aus dem Ordner `biddio` in das bestehende GitHub-Repository hochladen: Add file → Upload files. Gleiche Namen ersetzen die bisherige Version. Nicht den übergeordneten Ordner oder das ZIP hochladen.
3. Commit changes wählen.
4. Bei einem verbundenen Hostingdienst die Bereitstellung des neuen Commits abwarten oder auslösen. Danach die Website neu laden und einen neuen Spielraum erstellen.

Die separate `Biddio.html` ist die offline spielbare Solo-Version. Online benötigt ihr den laufenden Server; dieses Update veröffentlicht ihn nicht automatisch.

## Online-Regeln

- „Online mit Freunden“ wählen und Raum erstellen. Bis zu zwei weitere Personen treten mit Link oder Code bei.
- Der Gastgeber kann mit zwei oder drei Spielern starten. Für drei Spieler erst starten, wenn alle drei im Raum sind.
- Alle starten mit 0 Punkten. Fünf Runden, der erste Bietende wechselt reihum.
- Pro Bietzug 20 Sekunden: höher bieten oder passen. Wer passt, scheidet nur aus der aktuellen Auktion aus und kann diese Runde nicht erneut bieten.
- Sobald alle anderen gepasst haben oder das maximale Gebot erreicht wurde, antwortet der Höchstbietende innerhalb von 30 Sekunden.
- Erfolg: 100 Punkte je gebotener Antwort für den Antwortenden.
- Misserfolg: Jeder andere Spieler erhält 100 Punkte je gebotener Antwort. Bei drei Spielern bekommen also beide Gegner die volle Punktzahl.
- Ohne erstes Gebot wird bei Zeitablauf automatisch 1 geboten. Danach zählt Zeitablauf als Passen.
- Alle müssen für die nächste Runde „Bereit“ wählen. Nach fünf Runden gewinnt der höchste Punktestand; geteilte Siege sind möglich.

## Server starten

Node.js 20 oder neuer. Keine zusätzlichen Pakete erforderlich.

Im Verzeichnis mit `package.json`: `node server.mjs`. Lokal: `http://localhost:3000`.
Andere Geräte im gleichen WLAN: `http://<LAN-IP>:3000` (Firewall muss Verbindungen zulassen).

Für verschiedene Orte: Node.js-Webservice mit HTTPS, Build `npm install`, Start `node server.mjs`, Root Directory leer, wenn diese Dateien im Repository-Hauptverzeichnis liegen. Der Server nutzt `PORT` oder 3000 und bindet an `0.0.0.0`. Alle öffnen dieselbe Website. Genau eine Instanz verwenden: Räume liegen im Arbeitsspeicher.

## Grenzen

Räume verfallen nach zwei Stunden oder einem Serverneustart. Verlassen beendet die Partie für alle. Bei Verbindungsabbruch laufen Fristen weiter. Neuladen desselben Tabs stellt die Sitzung wieder her. Keine Konten, Pause oder Ersatzspieler. Die Antwortlisten sind festgelegt und enthalten Namensvarianten; keine KI-Prüfung. Solo-Antwortlisten sind lokal einsehbar.

## Prüfungen

`npm test` prüft Solo, alle Kategorien/Aliase, Zwei- und Dreispieler-Partien, Zugrechte, Passen, Zeitablauf, Punkte, Bereitschaft, fünf Runden und Anzeigen einschließlich geteilter Siege. UI-Prüfung mit simuliertem DOM; kein visueller Browsertest und kein Test über drei echte Geräte.

`node build-standalone.cjs` baut zusätzlich die Offline-Datei unter `../outputs/Biddio.html`.

Quellen für ergänzte Speziallisten: [BIPM SI-Vorsilben](https://www.bipm.org/en/measurement-units/si-prefixes), [Disney Schneewittchen](https://movies.disney.com/snow-white-and-the-seven-dwarfs), [Paris 2024 Sportarten](https://parigi2024.coni.it/en/sports.html), [Peking 2022 Disziplinen](https://english.visitbeijing.com.cn/article/47OOd1wOd64).
