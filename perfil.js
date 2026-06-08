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

function normalizarBadges(badges) {
  if (Array.isArray(badges)) return badges;

  if (badges && typeof badges === "object") {
    return Object.keys(badges).filter((key) => badges[key] === true);
  }

  return [];
}

function criarBadge(src, className, title, alt) {
  const badge = document.createElement("img");
  badge.src = src;
  badge.className = className;
  badge.title = title;
  badge.alt = alt;
  return badge;
}

function renderizarBadges(badges = []) {
  if (!badgesPerfil) return;

  badgesPerfil.innerHTML = "";

    if (badges.includes("fundador")) {
    badgesPerfil.appendChild(
      criarBadge("./fotos/fundador.png", "badge-icon", "Fundador Zyro", "Badge Fundador")
    );
  }

  if (badges.includes("copa_do_mundo")) {
    badgesPerfil.appendChild(
      criarBadge(
        "./fotos/copa_do_mundo.png",
        "badge-icon badge-copa",
        "Copa do Mundo",
        "Badge Copa do Mundo"
      )
    );
  }


  if (badges.includes("primeira_temporada")) {
    badgesPerfil.appendChild(
      criarBadge("./fotos/temporada1.png", "badge-icon", "Conta da Primeira Temporada", "Badge Primeira Temporada")
    );
  }

  if (badges.includes("socio")) {
    badgesPerfil.appendChild(
      criarBadge("./fotos/sociozyro.png", "badge-icon", "Sócio Zyro", "Badge Sócio")
    );
  }

  if (badges.includes("vip")) {
    badgesPerfil.appendChild(
      criarBadge("./fotosloja/vipzyrorum.png", "badge-icon", "VIP ZYRORUM", "Badge VIP")
    );
  }

  if (badges.includes("vip_perola_negra")) {
    badgesPerfil.appendChild(
      criarBadge("./fotosloja/vipperolanegra.png", "badge-icon", "VIP Pérola Negra", "Badge VIP Pérola Negra")
    );
  }
}

function aplicarTemaEspecial(dadosBanco = {}) {
  const body = document.body;
  const html = document.documentElement;
  const card = document.querySelector(".perfil-card");
  const titulo = document.querySelector(".perfil-info h1");
  const botoes = document.querySelectorAll(".btn-primary");
  const btnDanger = document.querySelector(".btn-danger");
  const avatar = document.querySelector(".avatar-wrap");

  body.classList.remove(
    "tema-fundador",
    "tema-copa-mundo",
    "tema-socio",
    "tema-vip-esmeralda",
    "tema-vip-perola-negra"
  );

  html.classList.remove("tema-copa-mundo");

  const badges = normalizarBadges(dadosBanco?.badges);
  const vipAtivo = Boolean(dadosBanco?.vipAtivo);
  const vipPagoAtivo = Boolean(dadosBanco?.vipPagoAtivo);

  if (badges.includes("copa_do_mundo")) {
    body.classList.add("tema-copa-mundo");
    html.classList.add("tema-copa-mundo");

    body.style.background = `
      linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.40)),
      url("./fotos/fundo-copa.png") center / cover no-repeat fixed
    `;

    if (card) {
      card.style.background = "rgba(0, 35, 20, .78)";
      card.style.border = "2px solid #ffdf00";
      card.style.boxShadow = "0 0 40px rgba(255,223,0,.65), 0 0 90px rgba(0,156,59,.55)";
    }

    if (titulo) {
      titulo.style.color = "#ffdf00";
      titulo.style.textShadow = "0 0 12px rgba(255,223,0,.9), 0 0 22px rgba(0,156,59,.9)";
    }

    botoes.forEach((btn) => {
      btn.style.background = "linear-gradient(135deg, #009c3b, #ffdf00)";
      btn.style.color = "#001b0f";
      btn.style.boxShadow = "0 0 18px rgba(255,223,0,.65)";
    });

    if (btnDanger) {
      btnDanger.style.background = "rgba(0,156,59,.25)";
      btnDanger.style.border = "1px solid #ffdf00";
      btnDanger.style.color = "#fff";
    }

    if (avatar) {
      avatar.style.background = "linear-gradient(135deg, #ffdf00, #009c3b, #002776)";
      avatar.style.boxShadow = "0 0 25px rgba(255,223,0,.95)";
    }

    return;
  }

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
  const badges = normalizarBadges(dadosBanco?.badges);

  return (
    dadosBanco?.vipAtivo === true ||
    dadosBanco?.vipPagoAtivo === true ||
    badges.includes("vip") ||
    badges.includes("vip_perola_negra") ||
    badges.includes("fundador") ||
    badges.includes("socio")
  );
}

function renderizarMidiaPerfil(dadosBanco = {}, userAuth) {
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

    const badges = normalizarBadges(dadosBanco?.badges);

    if (dadosBanco?.vipPagoAtivo === true || badges.includes("vip_perola_negra")) {
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

function renderizarPerfil(dadosBanco = {}, userAuth) {
  const nomeFinal =
    dadosBanco?.nome && dadosBanco.nome.trim() !== ""
      ? dadosBanco.nome
      : userAuth?.displayName || "Usuário";

  const bioFinal =
    dadosBanco?.bio && dadosBanco.bio.trim() !== ""
      ? dadosBanco.bio
      : "Sem bio ainda.";

  const badges = normalizarBadges(dadosBanco?.badges);

  console.log("DADOS DO BANCO:", dadosBanco);
  console.log("BADGES NORMALIZADAS:", badges);

  renderizarMidiaPerfil(dadosBanco, userAuth);

  if (nomePerfil) nomePerfil.textContent = nomeFinal;
  if (bioPerfil) bioPerfil.textContent = bioFinal;
  if (emailPerfil) emailPerfil.textContent = userAuth?.email || "";

  renderizarBadges(badges);
  aplicarTemaEspecial({ ...dadosBanco, badges });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    await verificarEAtualizarVip(user.uid);
    const dados = await buscarDadosUsuario(user.uid);
    renderizarPerfil(dados || {}, user);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    renderizarPerfil({}, user);
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