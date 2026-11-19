# Biddio – Solo und Online-Duell

## Update: 40 Kategorien

28 neue, überwiegend einfache Allgemeinwissens-Kategorien. Beide Spielmodi nutzen dieselbe Auswahl. Die bisherigen Kategorien bleiben erhalten.

Für ein bestehendes GitHub-Repository: Alle Dateien aus diesem Ordner hochladen und vorhandene Dateien ersetzen. Danach Commit changes. Falls Render bereits verbunden ist, dort prüfen, ob die neue Version automatisch bereitgestellt wird; andernfalls die neueste Version manuell bereitstellen.

Die separate Biddio.html im Archiv ist die direkt im Browser spielbare Solo-Version. Online-Duelle benötigen weiterhin den laufenden Server.

Der Online-Freundemodus ist implementiert, aber noch nicht öffentlich bereitgestellt. Die HTML-Datei allein stellt keinen Spielserver bereit.

## Starten

Voraussetzung: Node.js 20 oder neuer. Es werden keine zusätzlichen Pakete benötigt.

1. Dieses Verzeichnis entpacken.
2. Im Verzeichnis `node server.mjs` ausführen.
3. Auf dem Servergerät `http://localhost:3000` öffnen.
4. Auf einem zweiten Gerät im gleichen WLAN `http://<LAN-IP-des-Servergeräts>:3000` öffnen. Die Firewall muss eingehende Verbindungen auf diesem Port zulassen.

Für zwei Geräte an verschiedenen Orten muss der Server auf einem öffentlich erreichbaren Node.js-Host laufen. Startbefehl: `node server.mjs`. Der Port wird über die Umgebungsvariable `PORT` bestimmt (Standard 3000). Davor gehört ein HTTPS-Endpunkt des Hostinganbieters. Beide Spieler öffnen dieselbe Website. Der Dienst benötigt genau einen laufenden Prozess/eine Instanz, weil Spielräume im Arbeitsspeicher gehalten werden. Kein statisches Hosting und kein Mehrinstanz-Betrieb.

## Online-Duell

- „Online gegen Freund“ wählen, Namen eingeben und Raum erstellen.
- Link oder sechsstelligen Raumcode an den Freund weitergeben.
- Der Gastgeber startet, sobald beide im Raum sind.
- Abwechselnd höher bieten oder passen. Pro Zug 20 Sekunden.
- Ohne erstes Gebot wird bei Zeitablauf automatisch 1 geboten. Bei einem bestehenden Gebot gilt Zeitablauf als Passen.
- Wer das höchste Gebot hält, beantwortet innerhalb von 30 Sekunden die Kategorie.
- Erfolg: 100 Punkte je gebotener Antwort für den Antwortenden.
- Misserfolg: dieselben Punkte für den Gegner.
- Beide starten mit 0 Punkten. Fünf Runden; Gleichstände sind möglich.
- Für die nächste Kategorie müssen beide „Bereit“ wählen.

## Grenzen der ersten Version

- Räume verfallen nach zwei Stunden und gehen bei Serverneustart verloren.
- Anmeldung im Raum bleibt in der aktuellen Browser-Tab-Sitzung gespeichert. Neuladen desselben Tabs verbindet wieder; ein neuer Tab hat nicht automatisch dieselbe Sitzung.
- Bei Verbindungsabbruch laufen Fristen auf dem Server weiter. Es gibt noch keinen automatischen Ersatzspieler und keine Pause.
- Kein Chat, kein Zuschauerbeitritt und keine Konten. Die Codes sind zum Teilen unter Freunden gedacht.
- Die Antwortlisten sind festgelegt und enthalten gängige Namensvarianten. Keine KI-Antwortprüfung.
- Der Solo-Modus enthält die Antwortlisten lokal. Das ist ein Gelegenheitsspiel, kein gegen Nachschlagen abgesicherter Wettbewerb.

## Prüfung

`npm test` oder einzeln `node test.cjs` und `node test-online.mjs`.

Geprüft: Solo-Spiel, Kategorien und Namensvarianten, zwei Spielersitzungen, Zugrechte, Punkte, Zeitablauf, doppelte Antworten, fünf Runden, abgelaufene Räume und Geheimhaltung der Sitzungsschlüssel in Spielstatus-Antworten.

Noch nicht geprüft: visueller Browsertest und tatsächliche Verbindung zweier Geräte über das Internet. Veröffentlichung war auf dem Erstellungsgerät durch fehlende Entwicklerwerkzeuge blockiert.
