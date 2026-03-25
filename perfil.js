import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { buscarDadosUsuario } from "./temporada-service.js";

const fotoPerfil = document.getElementById("fotoPerfil");
const nomePerfil = document.getElementById("nomePerfil");
const emailPerfil = document.getElementById("emailPerfil");
const bioPerfil = document.getElementById("bioPerfil");
const badgesPerfil = document.getElementById("badgesPerfil");
const btnSair = document.getElementById("btnSair");

/* ===== BADGES ===== */
function renderizarBadges(badges = []) {
  if (!badgesPerfil) return;

  badgesPerfil.innerHTML = "";

    // FUNDADOR
  if (badges.includes("fundador")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/fundador.png";
    badge.className = "badge-icon";
    badge.title = "Fundador Zyro";
    badge.alt = "Badge Fundador";
    badgesPerfil.appendChild(badge);
  }

  // PRIMEIRA TEMPORADA
  if (badges.includes("primeira_temporada")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/temporada1.png";
    badge.className = "badge-icon";
    badge.title = "Conta da Primeira Temporada";
    badge.alt = "Badge Primeira Temporada";
    badgesPerfil.appendChild(badge);
  }

  // SOCIO
  if (badges.includes("socio")) {
    const badge = document.createElement("img");
    badge.src = "./fotos/sociozyro.png";
    badge.className = "badge-icon";
    badge.title = "Sócio Zyro";
    badge.alt = "Badge Sócio";
    badgesPerfil.appendChild(badge);
  }
}

/* ===== TEMA ESPECIAL ===== */
function aplicarTemaEspecial(badges = []) {
  const body = document.getElementById("bodyPerfil");
  if (!body) return;

  body.classList.remove("tema-fundador");
  body.classList.remove("tema-socio");

  if (badges.includes("fundador")) {
    body.classList.add("tema-fundador");
  }

  if (badges.includes("socio")) {
    body.classList.add("tema-socio");
  }
}

/* ===== RENDER PERFIL ===== */
function renderizarPerfil(dadosBanco, userAuth) {
  const fotoFinal =
    dadosBanco?.foto && dadosBanco.foto.trim() !== ""
      ? dadosBanco.foto
      : userAuth?.photoURL || "https://via.placeholder.com/150";

  const nomeFinal =
    dadosBanco?.nome && dadosBanco.nome.trim() !== ""
      ? dadosBanco.nome
      : userAuth?.displayName || "Usuário";

  const emailFinal =
    dadosBanco?.email && dadosBanco.email.trim() !== ""
      ? dadosBanco.email
      : userAuth?.email || "Sem email";

  const bioFinal =
    dadosBanco?.bio && dadosBanco.bio.trim() !== ""
      ? dadosBanco.bio
      : "Sem bio ainda.";

  const badges = Array.isArray(dadosBanco?.badges) ? dadosBanco.badges : [];

  if (fotoPerfil) fotoPerfil.src = fotoFinal;
  if (nomePerfil) nomePerfil.textContent = nomeFinal;
  if (emailPerfil) emailPerfil.textContent = emailFinal;
  if (bioPerfil) bioPerfil.textContent = bioFinal;

  renderizarBadges(badges);
  aplicarTemaEspecial(badges);
}

/* ===== AUTH ===== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const dados = await buscarDadosUsuario(user.uid);
    renderizarPerfil(dados, user);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    renderizarPerfil(null, user);
  }
});

/* ===== LOGOUT ===== */
btnSair?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./login.html";
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Não foi possível sair da conta.");
  }
});