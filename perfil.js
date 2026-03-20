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
  badgesPerfil.innerHTML = "";

  // PRIMEIRA TEMPORADA
  if (badges.includes("primeira_temporada")) {
    const badge = document.createElement("img");

    badge.src = "./fotos/temporada1.png";
    badge.className = "badge-icon";
    badge.title = "Conta da Primeira Temporada";
    badge.alt = "Badge Primeira Temporada";

    badgesPerfil.appendChild(badge);
  }

  // FUNDADOR 👑
  if (badges.includes("fundador")) {
    const badge = document.createElement("img");

    badge.src = "./fotos/fundador.png"; // coloca sua imagem aqui
    badge.className = "badge-icon";
    badge.title = "Fundador Zyro";
    badge.alt = "Badge Fundador";

    badgesPerfil.appendChild(badge);
  }
}

/* ===== TEMA ESPECIAL ===== */
function aplicarTemaEspecial(badges = []) {
  const body = document.getElementById("bodyPerfil");

  if (badges.includes("fundador")) {
    body.classList.add("tema-fundador");
  }
}

/* ===== AUTH ===== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const dados = await buscarDadosUsuario(user.uid);

    const badges = dados?.badges || [];

    fotoPerfil.src = dados?.foto || user.photoURL || "https://via.placeholder.com/150";
    nomePerfil.textContent = dados?.nome || user.displayName || "Usuário";
    emailPerfil.textContent = dados?.email || user.email || "Sem email";
    bioPerfil.textContent = dados?.bio || "Sem bio ainda.";

    renderizarBadges(badges);

    // 🔥 AQUI QUE FALTAVA
    aplicarTemaEspecial(badges);

  } catch (error) {
    console.error("Erro ao carregar perfil:", error);

    fotoPerfil.src = user.photoURL || "https://via.placeholder.com/150";
    nomePerfil.textContent = user.displayName || "Usuário";
    emailPerfil.textContent = user.email || "Sem email";
    bioPerfil.textContent = "Sem bio ainda.";
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