# IPplayerTv – kostenlose iPhone-Web-App (PWA)

## Was enthalten ist
- Premium-Oberfläche in dunklem Magenta-Design
- M3U/M3U8: URL laden oder lokale M3U-Datei importieren
- Xtream Codes: Server, Benutzername, Passwort; Live-Sender laden
- Suche, Favoriten und HTML5-Video-Player
- PWA-Dateien für „Zum Home-Bildschirm“ und Offline-Caching der Oberfläche

## Ehrliche Einschränkungen
- Das ist eine Web-App/PWA, keine native iOS-App.
- Eine Installation auf dem Home-Bildschirm benötigt eine HTTPS-Webadresse.
- Der Quellcode wird nicht automatisch öffentlich gehostet. Du musst die Dateien bei einem Hoster bereitstellen.
- Browser-Zugriff auf M3U-/Xtream-Server kann an CORS scheitern. Das kann nur der Playlist-Anbieter erlauben. Der Player liefert keine Streams mit.
- iOS Safari unterstützt HLS (.m3u8) nativ; nicht jedes `.ts`-/Sonderformat funktioniert im Browser.
- Die aktuelle Version zeigt Live-TV. EPG, Filme und Serien sind noch nicht implementiert.

## Kostenlos hosten mit GitHub Pages
1. Erstelle kostenlos ein GitHub-Konto unter https://github.com.
2. Lege ein neues öffentliches Repository namens `IPplayerTv` an.
3. Lade alle Dateien aus diesem Ordner direkt in das Repository hoch.
4. Öffne im Repository **Settings → Pages**.
5. Bei **Build and deployment** `Deploy from a branch` wählen, Branch `main`, Ordner `/ (root)`, speichern.
6. Warte, bis GitHub Pages eine HTTPS-Adresse anzeigt.

## Auf dem iPhone installieren
1. Öffne die GitHub-Pages-Adresse in **Safari** (nicht in einem In-App-Browser).
2. Tippe auf **Teilen** (Quadrat mit Pfeil nach oben).
3. Wähle **Zum Home-Bildschirm**.
4. Name `IPplayerTv` bestätigen und **Hinzufügen** tippen.

## Datenschutz
- Xtream-Zugangsdaten werden in dieser Version nicht in localStorage oder Cookies gespeichert.
- Die eingegebenen Zugangsdaten werden für die laufende Sitzung verwendet; das Passwortfeld wird nach erfolgreichem Abruf geleert.
- Playlists und Stream-Adressen werden direkt vom Browser beim angegebenen Anbieter abgerufen.
- Verwende ausschließlich Streams, zu deren Nutzung du berechtigt bist.
