const $ = (id) => document.getElementById(id);
let mode = "m3u";
let channels = [];
let favorites = new Set();
let activeObjectURL = null;

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  mode = btn.dataset.mode;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
  $("m3uForm").classList.toggle("hidden", mode !== "m3u");
  $("xtreamForm").classList.toggle("hidden", mode !== "xtream");
}));

function status(message, type = "") {
  $("status").textContent = message;
  $("status").className = "status " + type;
}
function safeURL(value) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u : null;
  } catch { return null; }
}
function parseM3U(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const found = [];
  let meta = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF:")) {
      const comma = line.lastIndexOf(",");
      const attrs = line.slice(0, comma > -1 ? comma : undefined);
      const name = comma > -1 ? line.slice(comma + 1).trim() : "Channel";
      const attr = key => {
        const m = attrs.match(new RegExp('(?:^|\\\\s)' + key + '="([^"]*)"', "i"));
        return m ? m[1] : "";
      };
      meta = {name, group: attr("group-title") || "Uncategorized", logo: attr("tvg-logo")};
    } else if (line && !line.startsWith("#") && meta) {
      const url = safeURL(line);
      if (url) found.push({name: meta.name || url.hostname, group: meta.group, logo: meta.logo, url: url.href});
      meta = null;
    }
  }
  return found;
}
function renderChannels() {
  $("channelsPanel").classList.remove("hidden");
  $("channelCount").textContent = `${channels.length} Sender`;
  const q = $("search").value.trim().toLocaleLowerCase();
  const visible = channels.filter(c => (c.name + " " + c.group).toLocaleLowerCase().includes(q));
  const list = $("channelList");
  list.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = channels.length ? "Keine passenden Sender gefunden." : "Keine Sender in der Playlist.";
    list.append(empty); return;
  }
  visible.forEach((channel, index) => {
    const row = document.createElement("div"); row.className = "channel";
    const logo = channel.logo ? document.createElement("img") : document.createElement("div");
    logo.className = channel.logo ? "channel-logo" : "channel-logo channel-placeholder";
    if (channel.logo) { logo.src = channel.logo; logo.alt = ""; logo.onerror = () => { logo.removeAttribute("src"); logo.className = "channel-logo channel-placeholder"; logo.textContent = "▶"; }; }
    else logo.textContent = "▶";
    const info = document.createElement("div"); info.className = "channel-info";
    const name = document.createElement("div"); name.className = "channel-name"; name.textContent = channel.name;
    const group = document.createElement("div"); group.className = "channel-group"; group.textContent = channel.group;
    info.append(name, group);
    const play = document.createElement("button"); play.className = "channel"; play.style.cssText = "padding:0;border:0;background:transparent;width:auto;flex:1";
    play.append(logo, info); play.addEventListener("click", () => playChannel(channel));
    const star = document.createElement("button"); star.className = "star" + (favorites.has(channel.url) ? " on" : "");
    star.textContent = favorites.has(channel.url) ? "★" : "☆"; star.setAttribute("aria-label", "Favorit");
    star.addEventListener("click", () => { if (favorites.has(channel.url)) favorites.delete(channel.url); else favorites.add(channel.url); renderChannels(); });
    row.append(play, star); list.append(row);
  });
}
function playChannel(channel) {
  const video = $("video");
  if (activeObjectURL) { URL.revokeObjectURL(activeObjectURL); activeObjectURL = null; }
  video.pause(); video.removeAttribute("src");
  video.src = channel.url;
  video.load();
  $("nowTitle").textContent = channel.name;
  $("playerPanel").classList.remove("hidden");
  $("playerPanel").scrollIntoView({behavior:"smooth", block:"start"});
  video.play().catch(() => status("Stream geladen. Tippe im Videoplayer auf Wiedergabe oder prüfe, ob dein Anbieter HLS im Browser erlaubt.", "error"));
}
$("search").addEventListener("input", renderChannels);

$("m3uForm").addEventListener("submit", async e => {
  e.preventDefault();
  const url = safeURL($("m3uUrl").value.trim());
  if (!url) { status("Bitte eine gültige http- oder https-M3U-URL eingeben.", "error"); return; }
  status("Playlist wird geladen …");
  try {
    const response = await fetch(url.href);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    setChannels(parseM3U(text));
  } catch (err) {
    status("Playlist konnte nicht aus dem Browser geladen werden. Häufig blockiert der Anbieter CORS. Versuche den Datei-Import oder frage deinen Anbieter nach Browser-Zugriff. (" + err.message + ")", "error");
  }
});
$("m3uFile").addEventListener("change", async e => {
  const file = e.target.files?.[0]; if (!file) return;
  try { setChannels(parseM3U(await file.text())); }
  catch (err) { status("Datei konnte nicht gelesen werden: " + err.message, "error"); }
});
function setChannels(items) {
  if (!items.length) { status("Keine gültigen Sender gefunden. Prüfe das M3U-Format.", "error"); return; }
  channels = items; favorites.clear(); $("search").value = "";
  renderChannels(); status(`${items.length} Sender erfolgreich geladen.`, "ok");
}
$("xtreamForm").addEventListener("submit", async e => {
  e.preventDefault();
  const base = safeURL($("xtServer").value.trim());
  const username = $("xtUser").value.trim(), password = $("xtPass").value;
  if (!base || !username || !password) { status("Bitte Serveradresse, Benutzername und Passwort vollständig eingeben.", "error"); return; }
  status("Verbindung zum Anbieter wird hergestellt …");
  try {
    const api = new URL(base.href);
    api.pathname = api.pathname.replace(/\/$/, "") + "/player_api.php";
    api.search = new URLSearchParams({username, password, action:"get_live_streams"}).toString();
    const response = await fetch(api.href);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("API-Antwort ist ungültig oder Zugangsdaten stimmen nicht.");
    const items = data.map(item => {
      const streamId = item.stream_id;
      if (!streamId) return null;
      const stream = new URL(base.href);
      stream.pathname = stream.pathname.replace(/\/$/, "") + `/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.m3u8`;
      return {name:item.name || `Sender ${streamId}`, group:item.category_name || item.category_id || "Live TV", logo:item.stream_icon || "", url:stream.href};
    }).filter(Boolean);
    setChannels(items);
    // Credentials intentionally remain only in memory for this page session.
    $("xtPass").value = "";
  } catch (err) {
    status("Xtream-Verbindung fehlgeschlagen. Der Anbieter muss Browser-Zugriff (CORS) erlauben; manche Server unterstützen nur native IPTV-Apps. " + err.message, "error");
  }
});
$("installHint").addEventListener("click", () => {
  alert('Zum Installieren: In Safari auf „Teilen“ tippen und „Zum Home-Bildschirm“ auswählen. Die App muss zuerst über eine HTTPS-Adresse geöffnet werden.');
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
