import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, query, orderBy, limit, onSnapshot, addDoc, getDoc, doc, setDoc,
  deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Pegue sua chave grátis em https://api.imgbb.com e cole aqui:
const IMGBB_KEY = "bbaa7aa3ba531beb7544b9ffe684717b";

const PUBLIC = "zyroPodepaMensagens";
const CASTIGOS = "podepaCastigos";
const MAX_IMAGE = 20 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PUNISH_MS = 30 * 60 * 1000;
const DEFAULT_PHOTO = "./fotos/zraposa.png";
const REACTS = { like: "👍", love: "❤️", haha: "😂", fire: "🔥", rocket: "🚀" };
const BADGES = {
  fundador: ["./fotosloja/badge-fundador.svg", "Fundador Zyro"], copa_do_mundo: ["./fotosloja/badge-copa.svg", "Copa do Mundo"],
  primeira_temporada: ["./fotosloja/badge-primeira-temporada.svg", "Primeira Temporada"], socio: ["./fotosloja/badge-socio.svg", "Sócio Zyro"],
  vip: ["./fotosloja/vipzyrorum.png", "VIP ZYRORUM"], vip_perola_negra: ["./fotosloja/vipperolanegra.png", "VIP Pérola Negra"]
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const safeUrl = (u) => { if (/^data:(image|video)\//i.test(u || "")) return u; try { const x = new URL(u, location.href); return ["https:", "http:"].includes(x.protocol) ? x.href : ""; } catch { return ""; } };
const time = (t) => t?.toDate ? t.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "agora";

let me = null, isAdmin = false, profile = { name: "Usuário", photo: DEFAULT_PHOTO };
let unsub = null, selectedImage = null, busy = false, punishedUntil = 0, wasPunished = false, punishTimer = null;
const msgs = new Map();

/* ---------- modo embutido (aberto dentro do site) ---------- */
const embed = window.self !== window.top || location.search.includes("embed=1");
if (embed) {
  document.body.classList.add("embed");
  $("closeBtn").classList.remove("hidden");
  const close = () => parent.postMessage({ type: "podepa-close" }, location.origin);
  $("closeBtn").onclick = close;
  $("logoLink").onclick = (e) => { e.preventDefault(); close(); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lightbox").classList.contains("hidden") && $("profileModal").classList.contains("hidden")) close(); });
}

function toast(msg) {
  $("toast").textContent = msg; $("toast").classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => $("toast").classList.remove("show"), 2800);
}

/* ---------- filtro de palavrões ---------- */
const col = (s) => s.replace(/(.)\1+/g, "$1");
const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 9: "g", "@": "a", $: "s" };
const BAD = new Set(["cu", "fdp", "pqp", "vsf", "tnc", "puto", "putos", "fode", "foder", "fodase", "fodido", "foda", "otario", "babaca", "idiota", "imbecil", "cuzao", "vagabundo", "arrombado"].map(col));
const ROOTS = ["puta", "porra", "preto", "macacaco", "petista", "site horrivel", "caralho", "carai", "buceta", "punheta", "bosta", "arrombad", "desgraça", "viadinho"].map(col);
const badWord = (w) => BAD.has(w) || ROOTS.some((r) => w.startsWith(r));
function hasBad(text) {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const toks = t.split(/[^a-z0-9@$]+/).filter(Boolean)
    .map((w) => (/[a-z]/.test(w) ? w.replace(/[0134579@$]/g, (c) => LEET[c]) : w))
    .map((w) => col(w.replace(/k/g, "c")));
  if (toks.some(badWord)) return true;
  let run = ""; // pega "p o r r a"
  for (const w of [...toks, ""]) {
    if (w.length === 1) run += w;
    else { if (run.length >= 3 && badWord(col(run))) return true; run = ""; }
  }
  return false;
}

/* ---------- castigo ---------- */
function tick() {
  const left = punishedUntil - Date.now(), on = left > 0;
  $("punishBar").classList.toggle("hidden", !on);
  $("messageForm").classList.toggle("locked", on);
  $("messageInput").disabled = $("sendBtn").disabled = $("imageInput").disabled = on;
  clearInterval(punishTimer);
  if (on) {
    const s = Math.ceil(left / 1000);
    $("punishTime").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    punishTimer = setInterval(tick, 1000);
  } else if (wasPunished) toast("✅ Castigo acabou. Pode voltar a conversar!");
  wasPunished = on;
}
async function punish() {
  $("messageInput").value = ""; resize();
  $("messageForm").classList.add("shake"); setTimeout(() => $("messageForm").classList.remove("shake"), 600);
  punishedUntil = Date.now() + PUNISH_MS; tick();
  try { await setDoc(doc(db, CASTIGOS, me.uid), { uid: me.uid, castigoAte: Timestamp.fromMillis(punishedUntil) }); }
  catch (e) { console.error(e); }
}
function watchPunish() {
  onSnapshot(doc(db, CASTIGOS, me.uid), (s) => { punishedUntil = s.exists() ? s.data().castigoAte?.toMillis?.() || 0 : 0; tick(); }, () => {});
}

/* ---------- mensagens ---------- */
function msgEl(id, d, enter) {
  const mine = d.uid === me?.uid, rx = d.reacoes || {};
  const chips = Object.entries(REACTS).filter(([k]) => (rx[k] || []).length)
    .map(([k, e]) => `<button class="chip ${rx[k].includes(me.uid) ? "on" : ""}" data-act="react" data-k="${k}">${e} ${rx[k].length}</button>`).join("");
  const img = d.imageUrl ? `<img class="sent-image" data-act="zoom" src="${esc(safeUrl(d.imageUrl))}" alt="Imagem enviada" referrerpolicy="no-referrer">` : "";
  const uid = esc(d.uid);
  const el = document.createElement("article");
  el.className = `message ${mine ? "mine" : ""} ${enter ? "enter" : ""}`; el.dataset.id = id;
  el.innerHTML = `<img class="avatar" data-act="profile" data-uid="${uid}" src="${esc(safeUrl(d.foto) || DEFAULT_PHOTO)}" alt="" title="Ver perfil">
<div class="message-content"><div class="message-head"><button class="message-name" data-act="profile" data-uid="${uid}">${esc(d.nome || "Usuário")}</button><span class="message-time">${time(d.createdAt)}</span></div>
<div class="bubble">${d.texto ? esc(d.texto) : ""}${img}</div>
<div class="reactions">${chips}<span class="rx-add"><button class="chip add" data-act="picker">☺＋</button><span class="picker">${Object.entries(REACTS).map(([k, e]) => `<button data-act="react" data-k="${k}">${e}</button>`).join("")}</span></span>${mine || isAdmin ? `<button class="chip del" data-act="del" title="Apagar">🗑</button>` : ""}</div></div>`;
  const im = el.querySelector(".sent-image");
  if (im) {
    im.addEventListener("load", () => {
      const b = $("messages");
      if (b.scrollHeight - b.scrollTop - b.clientHeight < im.offsetHeight + 160) b.scrollTop = b.scrollHeight;
    });
    const fail = () => {
      console.warn("Imagem não carregou:", d.imageUrl);
      const a = document.createElement("a");
      a.className = "img-fail"; a.href = safeUrl(d.imageUrl); a.target = "_blank"; a.rel = "noopener noreferrer";
      let host = ""; try { host = new URL(a.href).host; } catch {}
      a.textContent = `🖼️ Imagem não carregou (${host || "sem link"}) — toque para abrir`;
      im.replaceWith(a);
    };
    im.addEventListener("error", fail);
    setTimeout(() => { if (im.isConnected && !im.naturalWidth) fail(); }, 8000);
  }
  if (!d.foto) fillAvatar(d.uid);
  return el;
}

const photos = new Map();
async function fillAvatar(uid) {
  if (!photos.has(uid)) photos.set(uid, getDoc(doc(db, "usuarios", uid)).then((s) => s.data()?.foto || "").catch(() => ""));
  const f = safeUrl(await photos.get(uid));
  if (f) document.querySelectorAll(".avatar").forEach((i) => { if (i.dataset.uid === uid) i.src = f; });
}

function subscribe() {
  unsub?.(); msgs.clear();
  const box = $("messages"); box.innerHTML = ""; let first = true;
  unsub = onSnapshot(query(collection(db, PUBLIC), orderBy("createdAt", "asc"), limit(150)), (snap) => {
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 140;
    let added = 0, mineNew = false;
    snap.docChanges().forEach((c) => {
      const id = c.doc.id, d = c.doc.data();
      if (c.type === "added") {
        msgs.set(id, d);
        const el = msgEl(id, d, !first);
        box.insertBefore(el, box.children[c.newIndex] || null);
        if (!first) { added++; if (d.uid === me.uid) mineNew = true; }
      } else if (c.type === "modified") {
        msgs.set(id, d);
        box.querySelector(`[data-id="${id}"]`)?.replaceWith(msgEl(id, d, false));
      } else {
        msgs.delete(id);
        const el = box.querySelector(`[data-id="${id}"]`);
        el?.classList.add("leaving"); setTimeout(() => el?.remove(), 300);
      }
    });
    box.querySelector(".empty")?.remove();
    if (!msgs.size) box.innerHTML = '<div class="empty">Seja o primeiro a mandar uma mensagem 🚀</div>';
    if (first || nearBottom || mineNew) { box.scrollTo({ top: box.scrollHeight, behavior: first ? "auto" : "smooth" }); $("newBtn").classList.add("hidden"); }
    else if (added) { $("newBtn").classList.remove("hidden"); }
    first = false;
  }, (e) => { console.error(e); toast("Erro ao carregar o chat."); });
}

async function removeMessage(id) {
  const d = msgs.get(id); if (!d) return;
  if (!confirm("Apagar esta mensagem?")) return;
  try {
    await deleteDoc(doc(db, PUBLIC, id));
  } catch (e) { console.error(e); toast("Não foi possível apagar."); }
}

async function react(id, k) {
  const on = (msgs.get(id)?.reacoes?.[k] || []).includes(me.uid);
  try { await updateDoc(doc(db, PUBLIC, id), { [`reacoes.${k}`]: on ? arrayRemove(me.uid) : arrayUnion(me.uid) }); }
  catch (e) { console.error(e); toast("Não foi possível reagir."); }
}

/* ---------- envio (texto + imagem até 20 MB) ---------- */
function upload(file) {
  return new Promise((res, rej) => {
    if (IMGBB_KEY.startsWith("COLE")) return rej(new Error("Falta colocar a chave do ImgBB no podepa.js"));
    const fd = new FormData(); fd.append("image", file);
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`);
    x.upload.onprogress = (e) => { if (e.lengthComputable) $("pvBar").style.width = (e.loaded / e.total * 100).toFixed(0) + "%"; };
    x.onload = () => {
      try { const j = JSON.parse(x.responseText); j.success ? res({ url: j.data.url, path: "" }) : rej(new Error(j.error?.message || "Falha no upload")); }
      catch (e) { rej(e); }
    };
    x.onerror = () => rej(new Error("Sem conexão com o servidor de imagens"));
    x.send(fd);
  });
}

async function send(e) {
  e.preventDefault();
  if (!me || busy) return;
  if (punishedUntil > Date.now()) return toast("Você está de castigo.");
  const texto = $("messageInput").value.trim();
  if (!texto && !selectedImage) return;
  if (hasBad(texto)) return punish();
  busy = true; $("sendBtn").disabled = true;
  try {
    let imageUrl = "", imagePath = "";
    if (selectedImage) ({ url: imageUrl, path: imagePath } = await upload(selectedImage));
    await addDoc(collection(db, PUBLIC), {
      uid: me.uid, nome: profile.name, foto: profile.photo.startsWith("data:") ? "" : profile.photo, texto, imageUrl, imagePath,
      tipo: imageUrl ? (texto ? "texto_imagem" : "imagem") : "texto", reacoes: {}, createdAt: serverTimestamp()
    });
    $("messageInput").value = ""; resize(); clearImage();
  } catch (err) {
    console.error(err);
    toast(err?.message?.startsWith("Falta") || err?.message?.includes("imagens") ? err.message : "Não foi possível enviar a mensagem.");
  } finally { busy = false; if (punishedUntil <= Date.now()) $("sendBtn").disabled = false; }
}

function pickImage(f) {
  if (!f) return;
  if (!TYPES.includes(f.type)) { toast("Use JPG, PNG, WEBP ou GIF."); return clearImage(); }
  if (f.size > MAX_IMAGE) { toast("A imagem deve ter no máximo 20 MB."); return clearImage(); }
  selectedImage = f;
  $("preview").src = URL.createObjectURL(f);
  $("pvName").textContent = `${f.name} • ${(f.size / 1048576).toFixed(1)} MB`;
  $("pvBar").style.width = "0"; $("imagePreview").classList.remove("hidden");
}
function clearImage() {
  selectedImage = null; $("imageInput").value = "";
  $("imagePreview").classList.add("hidden"); $("preview").src = "";
}
function resize() { const e = $("messageInput"); e.style.height = "auto"; e.style.height = Math.min(e.scrollHeight, 130) + "px"; }

/* ---------- perfil ---------- */
async function openProfile(uid, avatarSrc) {
  const card = $("profileCard"); $("profileModal").classList.remove("hidden");
  card.innerHTML = '<div class="p-load">Carregando perfil…</div>';
  let d = {};
  try { const s = await getDoc(doc(db, "usuarios", uid)); d = s.exists() ? s.data() : {}; } catch (e) { console.error(e); }
  const bd = Array.isArray(d.badges) ? d.badges : Object.keys(d.badges || {}).filter((k) => d.badges[k] === true);
  const list = Object.keys(BADGES).filter((k) => bd.includes(k));
  const ban = safeUrl(d.banner), site = safeUrl(d.site), mold = safeUrl(d.molduraPerfil), vid = safeUrl(d.videoPerfil);
  const cands = [...new Set([safeUrl(d.foto), avatarSrc, uid === me?.uid ? safeUrl(me.photoURL) : ""].filter((x) => x && !x.endsWith("/fotos/zraposa.png")))];
  const foto = cands.shift() || DEFAULT_PHOTO;
  const vip = list.some((k) => ["fundador", "socio"].includes(k));
  const media = vip && vid
    ? `<video class="p-photo" src="${esc(vid)}" autoplay loop muted playsinline></video>`
    : `<div class="p-frame" ${mold ? `style="background-image:url('${esc(mold)}')"` : ""}><img class="p-photo" src="${esc(foto)}" alt=""></div>`;
  card.innerHTML = `<div class="p-banner" ${ban ? `style="background-image:url('${esc(ban)}')"` : ""}></div>
<button class="p-x" data-act="closeProfile">×</button>
<div class="p-body"><div class="p-top">${media}<div><div class="p-tags"><span>Trusted</span><span>Season 1</span></div><h2>${esc(d.nome?.trim() || "Usuário")}</h2></div></div>
<div class="p-badges">${list.map((k) => `<img src="${BADGES[k][0]}" title="${BADGES[k][1]}" alt="" onerror="this.remove()">`).join("")}</div>
<div class="p-bio">${esc(d.bio?.trim() || "Sem bio ainda.")}</div>
<div class="p-extra">${d.empresa ? `<span>💼 ${esc(d.empresa)}</span>` : ""}${site ? `<a href="${esc(site)}" target="_blank" rel="noopener noreferrer">🌐 Visitar site</a>` : ""}</div>
<a class="p-btn" target="_blank" rel="noopener" href="./perfil-publico.html?uid=${encodeURIComponent(uid)}">Ver perfil completo</a></div>`;
  const pi = card.querySelector("img.p-photo");
  if (pi) {
    const next = () => { if (pi.naturalWidth) return; const n = cands.shift(); pi.src = n || DEFAULT_PHOTO; if (n) setTimeout(next, 4000); };
    pi.addEventListener("error", next);
    setTimeout(next, 4000);
  }
}

async function loadProfile() {
  try {
    const d = (await getDoc(doc(db, "usuarios", me.uid))).data() || {};
    profile.name = d.nome || me.displayName || "Usuário"; profile.photo = d.foto || me.photoURL || DEFAULT_PHOTO; isAdmin = d.admin === true;
  } catch { profile.name = me.displayName || "Usuário"; profile.photo = me.photoURL || DEFAULT_PHOTO; }
  $("myName").textContent = profile.name; $("myPhoto").src = profile.photo;
}

/* ---------- eventos ---------- */
$("generalBtn").onclick = subscribe;
$("messageForm").onsubmit = send;
$("messageInput").oninput = resize;
$("messageInput").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("messageForm").requestSubmit(); } };
$("messageInput").onpaste = (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/")); if (f) { e.preventDefault(); pickImage(f); } };
$("imageInput").onchange = (e) => pickImage(e.target.files?.[0]);
$("removeImage").onclick = clearImage;
$("menuBtn").onclick = () => $("sidebar").classList.toggle("open");
$("meBtn").onclick = () => me && openProfile(me.uid, $("myPhoto").src);
$("newBtn").onclick = () => { $("messages").scrollTo({ top: 1e9, behavior: "smooth" }); $("newBtn").classList.add("hidden"); };
$("messages").onscroll = (e) => { const b = e.target; if (b.scrollHeight - b.scrollTop - b.clientHeight < 60) $("newBtn").classList.add("hidden"); };

const sec = $("chatSection");
["dragenter", "dragover"].forEach((ev) => sec.addEventListener(ev, (e) => { e.preventDefault(); sec.classList.add("drag"); }));
["dragleave", "drop"].forEach((ev) => sec.addEventListener(ev, (e) => { e.preventDefault(); if (ev === "drop" || e.target === $("dropHint")) sec.classList.remove("drag"); }));
sec.addEventListener("drop", (e) => { sec.classList.remove("drag"); if (!punishedUntil || punishedUntil < Date.now()) pickImage(e.dataTransfer?.files?.[0]); });

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]"), act = t?.dataset.act;
  document.querySelectorAll(".rx-add.open").forEach((x) => { if (!t || act !== "picker" || x !== t.parentElement) x.classList.remove("open"); });
  if (e.target === $("profileModal")) $("profileModal").classList.add("hidden");
  if (e.target.closest("#lightbox")) $("lightbox").classList.add("hidden");
  if (!t) return;
  const id = t.closest(".message")?.dataset.id;
  if (act === "profile") openProfile(t.dataset.uid, t.closest(".message")?.querySelector(".avatar")?.src);
  else if (act === "closeProfile") $("profileModal").classList.add("hidden");
  else if (act === "picker") t.parentElement.classList.toggle("open");
  else if (act === "react") react(id, t.dataset.k);
  else if (act === "del") removeMessage(id);
  else if (act === "zoom") { $("lbImg").src = t.src; $("lightbox").classList.remove("hidden"); }
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("lightbox").classList.contains("hidden")) $("lightbox").classList.add("hidden");
  else $("profileModal").classList.add("hidden");
});

onAuthStateChanged(auth, async (user) => {
  me = user;
  if (!user) { $("loginBox").classList.remove("hidden"); $("chatSection").classList.add("hidden"); return; }
  $("loginBox").classList.add("hidden"); $("chatSection").classList.remove("hidden");
  await loadProfile(); watchPunish(); subscribe();
});