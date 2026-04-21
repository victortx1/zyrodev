import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { buscarDadosUsuario, verificarEAtualizarVip } from "./temporada-service.js";

const perfilMediaWrap = document.getElementById("perfilMediaWrap");
const nomePerfil = document.getElementById("nomePerfil");
const emailPerfil = document.getElementById("emailPerfil");
const bioPerfil = document.getElementById("bioPerfil");
const badgesPerfil = document.getElementById("badgesPerfil");
const btnSair = document.getElementById("btnSair");

function renderizarBadges(badges = []) {
  if (!badgesPerfil) return;

  badgesPerfil.innerHTML = "";

  if (badges.includes("fundador")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/fundador.png";
    badge.className = "badge-icon";
    badge.title = "Fundador Zyro";
    badge.alt = "Badge Fundador";
    badgesPerfil.appendChild(badge);
  }

  if (badges.includes("primeira_temporada")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/temporada1.png";
    badge.className = "badge-icon";
    badge.title = "Conta da Primeira Temporada";
    badge.alt = "Badge Primeira Temporada";
    badgesPerfil.appendChild(badge);
  }

  if (badges.includes("socio")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/sociozyro.png";
    badge.className = "badge-icon";
    badge.title = "Sócio Zyro";
    badge.alt = "Badge Sócio";
    badgesPerfil.appendChild(badge);
  }

  if (badges.includes("vip")) {
    const badge = document.createElement("img");
    badge.src = "./fotosloja/vipzyrorum.png";
    badge.className = "badge-icon";
    badge.title = "VIP ZYRORUM";
    badge.alt = "Badge VIP";
    badgesPerfil.appendChild(badge);
  }

  if (badges.includes("vip_perola_negra")) {
    const badge = document.createElement("img");
    badge.src = "./fotosloja/vipperolanegra.png";
    badge.className = "badge-icon";
    badge.title = "VIP Pérola Negra";
    badge.alt = "Badge VIP Pérola Negra";
    badgesPerfil.appendChild(badge);
  }
}

function aplicarTemaEspecial(dadosBanco = {}) {
  const body = document.getElementById("bodyPerfil");
  if (!body) return;

  body.classList.remove(
    "tema-fundador",
    "tema-socio",
    "tema-vip-esmeralda",
    "tema-vip-perola-negra"
  );

  const badges = Array.isArray(dadosBanco?.badges) ? dadosBanco.badges : [];
  const vipAtivo = Boolean(dadosBanco?.vipAtivo);
  const vipPagoAtivo = Boolean(dadosBanco?.vipPagoAtivo);

  if (badges.includes("fundador")) {
    body.classList.add("tema-fundador");
    return;
  }

  if (badges.includes("socio")) {
    body.classList.add("tema-socio");
    return;
  }

  if (vipPagoAtivo || badges.includes("vip_perola_negra")) {
    body.classList.add("tema-vip-perola-negra");
    return;
  }

  if (vipAtivo || badges.includes("vip")) {
    body.classList.add("tema-vip-esmeralda");
  }
}

function usuarioPodeUsarVideo(dadosBanco = {}) {
  const badges = Array.isArray(dadosBanco?.badges) ? dadosBanco.badges : [];

  return (
    dadosBanco?.vipAtivo === true ||
    dadosBanco?.vipPagoAtivo === true ||
    badges.includes("vip") ||
    badges.includes("vip_perola_negra") ||
    badges.includes("fundador") ||
    badges.includes("socio")
  );
}

function renderizarMidiaPerfil(dadosBanco, userAuth) {
  if (!perfilMediaWrap) return;

  const fotoFinal =
    dadosBanco?.foto && dadosBanco.foto.trim() !== ""
      ? dadosBanco.foto
      : userAuth?.photoURL || "https://via.placeholder.com/150";

  const videoFinal =
    dadosBanco?.videoPerfil && dadosBanco.videoPerfil.trim() !== ""
      ? dadosBanco.videoPerfil
      : "";

  const podeUsarVideo = usuarioPodeUsarVideo(dadosBanco);

  perfilMediaWrap.classList.remove("video-ativa");
  perfilMediaWrap.innerHTML = "";

  if (podeUsarVideo && videoFinal) {
    perfilMediaWrap.classList.add("video-ativa");

    const video = document.createElement("video");
    video.className = "video-perfil";
    video.src = videoFinal;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");

    const selo = document.createElement("div");
    selo.className = "video-badge";

    if (dadosBanco?.vipPagoAtivo === true || (Array.isArray(dadosBanco?.badges) && dadosBanco.badges.includes("vip_perola_negra"))) {
      selo.textContent = "VIP PAGO";
    } else {
      selo.textContent = "VIP";
    }

    perfilMediaWrap.appendChild(video);
    perfilMediaWrap.appendChild(selo);
    return;
  }

  const img = document.createElement("img");
  img.id = "fotoPerfil";
  img.className = "foto";
  img.src = fotoFinal;
  img.alt = "Foto do perfil";

  perfilMediaWrap.appendChild(img);
}

function renderizarPerfil(dadosBanco, userAuth) {
  const nomeFinal =
    dadosBanco?.nome && dadosBanco.nome.trim() !== ""
      ? dadosBanco.nome
      : userAuth?.displayName || "Usuário";

  const bioFinal =
    dadosBanco?.bio && dadosBanco.bio.trim() !== ""
      ? dadosBanco.bio
      : "Sem bio ainda.";

  const badges = Array.isArray(dadosBanco?.badges) ? dadosBanco.badges : [];

  renderizarMidiaPerfil(dadosBanco, userAuth);

  if (nomePerfil) nomePerfil.textContent = nomeFinal;
  if (bioPerfil) bioPerfil.textContent = bioFinal;
  if (emailPerfil) emailPerfil.textContent = userAuth?.email || "";

  renderizarBadges(badges);
  aplicarTemaEspecial(dadosBanco);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    await verificarEAtualizarVip(user.uid);
    const dados = await buscarDadosUsuario(user.uid);
    renderizarPerfil(dados, user);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    renderizarPerfil(null, user);
  }
});

btnSair?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./login.html";
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Não foi possível sair da conta.");
  }
});