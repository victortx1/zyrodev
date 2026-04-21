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
const totalLikes = document.getElementById("totalLikes");
const totalPontos = document.getElementById("totalPontos");
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
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarNumero(valor) {
  return Number.isFinite(Number(valor)) ? Number(valor) : 0;
}

function vipEstaAtivo(usuario = {}) {
  if (usuario.vipAtivo !== true) return false;
  if (!usuario.vipFim) return true;

  const fim = new Date(usuario.vipFim);
  if (isNaN(fim.getTime())) return false;

  return fim > new Date();
}

function formatarDataVip(dataIso = "") {
  if (!dataIso) return "Sem data";

  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return "Data inválida";

  return data.toLocaleString("pt-BR");
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
      const dados = docSnap.data();

      listaUsuarios.push({
        id: docSnap.id,
        ...dados,
        likesRecebidos: normalizarNumero(dados.likesRecebidos),
        pontos: normalizarNumero(dados.pontos)
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
  totalLikes.textContent = listaUsuarios.reduce((acc, u) => acc + normalizarNumero(u.likesRecebidos), 0);
  totalPontos.textContent = listaUsuarios.reduce((acc, u) => acc + normalizarNumero(u.pontos), 0);
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
    const likesRecebidos = normalizarNumero(usuario.likesRecebidos);
    const pontos = normalizarNumero(usuario.pontos);
    const vipAtivo = vipEstaAtivo(usuario);

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
              ${vipAtivo ? `<span class="status status-admin" style="background:rgba(16,185,129,0.18);color:#6ee7b7;border:1px solid rgba(16,185,129,0.35);">VIP</span>` : ""}
            </div>
          </div>

          <div class="usuario-dados">
            <div><strong>UID:</strong> ${uid}</div>
            <div><strong>Likes recebidos:</strong> ${likesRecebidos}</div>
            <div><strong>Pontos:</strong> ${pontos}</div>
            <div><strong>VIP ativo:</strong> ${vipAtivo ? "Sim" : "Não"}</div>
            <div><strong>VIP expira em:</strong> ${vipAtivo ? escaparHTML(formatarDataVip(usuario.vipFim || "")) : "—"}</div>
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

            <button class="btn btn-like" onclick="window.adicionarLikes('${usuario.id}')">
              Adicionar Likes
            </button>

            <button class="btn btn-danger" onclick="window.removerLikes('${usuario.id}')">
              Remover Likes
            </button>

            <button class="btn btn-points" onclick="window.adicionarPontos('${usuario.id}')">
              Adicionar Pontos
            </button>

            <button class="btn btn-warning" onclick="window.removerPontos('${usuario.id}')">
              Remover Pontos
            </button>

            <button class="btn btn-green" onclick="window.darVip30Dias('${usuario.id}')">
              Dar VIP 30 dias
            </button>

            <button class="btn btn-danger" onclick="window.removerVip('${usuario.id}')">
              Remover VIP
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

window.adicionarLikes = async function (userId) {
  const valor = prompt("Quantos likes deseja adicionar?");
  if (valor === null) return;

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarMensagem("Digite um número inteiro maior que 0 para adicionar likes.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const likesAtuais = normalizarNumero(dados.likesRecebidos);

    await updateDoc(userRef, {
      likesRecebidos: likesAtuais + quantidade
    });

    mostrarMensagem(`${quantidade} like(s) adicionados com sucesso.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao adicionar likes.", "erro");
  }
};

window.removerLikes = async function (userId) {
  const valor = prompt("Quantos likes deseja remover?");
  if (valor === null) return;

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarMensagem("Digite um número inteiro maior que 0 para remover likes.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const likesAtuais = normalizarNumero(dados.likesRecebidos);
    const novoValor = Math.max(0, likesAtuais - quantidade);

    await updateDoc(userRef, {
      likesRecebidos: novoValor
    });

    mostrarMensagem(`${quantidade} like(s) removidos com sucesso.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover likes.", "erro");
  }
};

window.adicionarPontos = async function (userId) {
  const valor = prompt("Quantos pontos deseja adicionar?");
  if (valor === null) return;

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarMensagem("Digite um número inteiro maior que 0 para adicionar pontos.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const pontosAtuais = normalizarNumero(dados.pontos);

    await updateDoc(userRef, {
      pontos: pontosAtuais + quantidade
    });

    mostrarMensagem(`${quantidade} ponto(s) adicionados com sucesso.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao adicionar pontos.", "erro");
  }
};

window.removerPontos = async function (userId) {
  const valor = prompt("Quantos pontos deseja remover?");
  if (valor === null) return;

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarMensagem("Digite um número inteiro maior que 0 para remover pontos.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const pontosAtuais = normalizarNumero(dados.pontos);
    const novoValor = Math.max(0, pontosAtuais - quantidade);

    await updateDoc(userRef, {
      pontos: novoValor
    });

    mostrarMensagem(`${quantidade} ponto(s) removidos com sucesso.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover pontos.", "erro");
  }
};

window.darVip30Dias = async function (userId) {
  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];

    const badgesAtualizadas = badgesAtuais.includes("vip")
      ? badgesAtuais
      : [...badgesAtuais, "vip"];

    const agora = new Date();
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);

    await updateDoc(userRef, {
      vipAtivo: true,
      vipFim: fim.toISOString(),
      vipTipo: "esmeralda",
      vipCompradoEm: agora.toISOString(),
      vipBonusMultiplicador: 2,
      skinVipAtiva: true,
      badges: badgesAtualizadas
    });

    mostrarMensagem("VIP Esmeralda de 30 dias ativado com sucesso.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao ativar VIP.", "erro");
  }
};

window.removerVip = async function (userId) {
  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];
    const badgesAtualizadas = badgesAtuais.filter((badge) => badge !== "vip");

    await updateDoc(userRef, {
      vipAtivo: false,
      vipFim: "",
      vipTipo: "",
      vipCompradoEm: "",
      vipBonusMultiplicador: 1,
      skinVipAtiva: false,
      badges: badgesAtualizadas
    });

    mostrarMensagem("VIP removido com sucesso.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover VIP.", "erro");
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