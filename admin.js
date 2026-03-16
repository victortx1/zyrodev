import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usuariosGrid = document.getElementById("usuariosGrid");
const buscaInput = document.getElementById("busca");
const btnAtualizar = document.getElementById("btnAtualizar");

const totalUsuarios = document.getElementById("totalUsuarios");
const totalAdmins = document.getElementById("totalAdmins");
const totalBanidos = document.getElementById("totalBanidos");
const mensagem = document.getElementById("mensagem");

let listaUsuarios = [];

function mostrarMensagem(texto, tipo = "ok") {
  mensagem.textContent = texto;
  mensagem.className = `mensagem show ${tipo}`;
  setTimeout(() => {
    mensagem.className = "mensagem";
  }, 3000);
}

function escaparHTML(texto = "") {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function verificarAdmin(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const dados = snap.data();
  return dados.admin === true;
}

async function carregarUsuarios() {
  usuariosGrid.innerHTML = "<p>Carregando usuários...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    listaUsuarios = [];

    querySnapshot.forEach((docSnap) => {
      listaUsuarios.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    listaUsuarios.sort((a, b) => {
      const nomeA = (a.nome || "").toLowerCase();
      const nomeB = (b.nome || "").toLowerCase();
      return nomeA.localeCompare(nomeB);
    });

    atualizarResumo();
    renderizarUsuarios(listaUsuarios);
  } catch (error) {
    console.error(error);
    usuariosGrid.innerHTML = "<p>Erro ao carregar usuários.</p>";
    mostrarMensagem("Erro ao carregar usuários.", "erro");
  }
}

function atualizarResumo() {
  totalUsuarios.textContent = listaUsuarios.length;
  totalAdmins.textContent = listaUsuarios.filter(u => u.admin === true).length;
  totalBanidos.textContent = listaUsuarios.filter(u => u.banido === true).length;
}

function renderizarUsuarios(usuarios) {
  if (!usuarios.length) {
    usuariosGrid.innerHTML = "<p>Nenhum usuário encontrado.</p>";
    return;
  }

  usuariosGrid.innerHTML = usuarios.map(usuario => {
    const badges = Array.isArray(usuario.badges) ? usuario.badges : [];
    const foto = usuario.foto || "https://via.placeholder.com/70";
    const nome = escaparHTML(usuario.nome || "Usuário sem nome");
    const email = escaparHTML(usuario.email || "Sem email");
    const uid = escaparHTML(usuario.uid || usuario.id);

    return `
      <div class="usuario-card">
        <img src="${foto}" alt="Foto de ${nome}">
        <div>
          <div class="usuario-topo">
            <div>
              <h2>${nome}</h2>
              <span>${email}</span>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${usuario.admin ? `<span class="status status-admin">ADMIN</span>` : ""}
              ${usuario.banido ? `<span class="status status-banido">BANIDO</span>` : ""}
            </div>
          </div>

          <div class="usuario-dados">
            <div><strong>UID:</strong> ${uid}</div>
          </div>

          <div class="badges">
            ${
              badges.length
                ? badges.map(b => `<span class="badge">${escaparHTML(b)}</span>`).join("")
                : `<span class="badge">Sem badges</span>`
            }
          </div>

          <div class="acoes">
            <button class="btn btn-green" onclick="window.toggleAdmin('${usuario.id}', ${usuario.admin === true})">
              ${usuario.admin ? "Remover Admin" : "Tornar Admin"}
            </button>

            <button class="btn btn-warning" onclick="window.toggleBan('${usuario.id}', ${usuario.banido === true})">
              ${usuario.banido ? "Desbanir" : "Banir"}
            </button>

            <button class="btn" onclick="window.adicionarBadge('${usuario.id}')">
              Adicionar Badge
            </button>

            <button class="btn btn-danger" onclick="window.removerBadge('${usuario.id}')">
              Remover Badge
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.toggleAdmin = async function (userId, adminAtual) {
  try {
    await updateDoc(doc(db, "usuarios", userId), {
      admin: !adminAtual
    });

    mostrarMensagem(adminAtual ? "Admin removido com sucesso." : "Usuário virou admin com sucesso.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao alterar admin.", "erro");
  }
};

window.toggleBan = async function (userId, banidoAtual) {
  try {
    await updateDoc(doc(db, "usuarios", userId), {
      banido: !banidoAtual
    });

    mostrarMensagem(banidoAtual ? "Usuário desbanido." : "Usuário banido.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao alterar banimento.", "erro");
  }
};

window.adicionarBadge = async function (userId) {
  const badge = prompt("Digite o ID da badge que deseja adicionar:");
  if (!badge) return;

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badges = Array.isArray(dados.badges) ? dados.badges : [];

    if (badges.includes(badge)) {
      mostrarMensagem("Esse usuário já tem essa badge.", "erro");
      return;
    }

    await updateDoc(userRef, {
      badges: [...badges, badge]
    });

    mostrarMensagem("Badge adicionada com sucesso.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao adicionar badge.", "erro");
  }
};

window.removerBadge = async function (userId) {
  const badge = prompt("Digite o ID da badge que deseja remover:");
  if (!badge) return;

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badges = Array.isArray(dados.badges) ? dados.badges : [];

    await updateDoc(userRef, {
      badges: badges.filter(b => b !== badge)
    });

    mostrarMensagem("Badge removida com sucesso.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover badge.", "erro");
  }
};

function filtrarUsuarios() {
  const termo = buscaInput.value.toLowerCase().trim();

  const filtrados = listaUsuarios.filter(usuario => {
    const nome = (usuario.nome || "").toLowerCase();
    const email = (usuario.email || "").toLowerCase();
    return nome.includes(termo) || email.includes(termo);
  });

  renderizarUsuarios(filtrados);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login/login.html";
    return;
  }

  try {
    const ehAdmin = await verificarAdmin(user.uid);

    if (!ehAdmin) {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;color:white;background:#020617;">
          <div style="background:rgba(255,255,255,0.06);padding:30px;border-radius:20px;text-align:center;max-width:500px;">
            <h1 style="margin-bottom:10px;">Acesso negado</h1>
            <p>Você não tem permissão para acessar o painel administrativo.</p>
          </div>
        </div>
      `;
      return;
    }

    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao verificar permissão de admin.", "erro");
  }
});

buscaInput.addEventListener("input", filtrarUsuarios);
btnAtualizar.addEventListener("click", carregarUsuarios);