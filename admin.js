import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { escapeHtml, escapeAttr, sanitizeMediaUrl } from "./security-utils.js";

const usuariosGrid = document.getElementById("usuariosGrid");
const buscaInput = document.getElementById("busca");
const btnAtualizar = document.getElementById("btnAtualizar");

const totalUsuarios = document.getElementById("totalUsuarios");
const totalAdmins = document.getElementById("totalAdmins");
const totalBanidos = document.getElementById("totalBanidos");
const totalLikes = document.getElementById("totalLikes");
const totalPontos = document.getElementById("totalPontos");
const mensagem = document.getElementById("mensagem");
const solicitacoesGrid = document.getElementById("solicitacoesGrid");

let listaUsuarios = [];

const MOLDURAS = {
  fogo: { nome: "Moldura Fogo", id: "moldura_fogo", url: "./fotosloja/moldura-fogo.svg" },
  neon: { nome: "Moldura Neon", id: "moldura_neon", url: "./fotosloja/moldura-neon.svg" },
  diamante: { nome: "Moldura Diamante", id: "moldura_diamante", url: "./fotosloja/moldura-diamante.svg" },
  nova_era: { nome: "Moldura Nova Era", id: "moldura_nova_era", url: "./fotosloja/moldura-nova-era.svg" },
  vip_nova_era: { nome: "Moldura VIP Nova Era", id: "moldura_vip_nova_era", url: "./fotosloja/moldura-vip-nova-era.svg" }
};

function mostrarMensagem(texto, tipo = "ok") {
  mensagem.textContent = texto;
  mensagem.className = `mensagem show ${tipo}`;
  setTimeout(() => {
    mensagem.className = "mensagem";
  }, 3000);
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
    renderizarSolicitacoes();
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

function renderizarSolicitacoes(){
  if(!solicitacoesGrid)return;
  const pedidos=[];
  listaUsuarios.forEach(u=>(Array.isArray(u.solicitacoesBadges)?u.solicitacoesBadges:[]).forEach((p,i)=>{if(p?.status==="pendente")pedidos.push({user:u,request:p,index:i});}));
  if(!pedidos.length){solicitacoesGrid.innerHTML='<p style="color:#94a3b8">Nenhuma solicitação pendente.</p>';return;}
  solicitacoesGrid.innerHTML=pedidos.map(({user,request,index})=>`<div class="usuario-card" style="grid-template-columns:60px 1fr"><img src="${escapeAttr(sanitizeMediaUrl(user.foto)||"https://via.placeholder.com/60")}" alt=""><div><strong>${escapeHtml(user.nome||"Usuário")}</strong><div style="color:#cbd5e1;margin:5px 0">Solicitou: <b>${escapeHtml(request.nome||request.badgeId)}</b></div><div class="acoes"><button class="btn btn-green" onclick="window.aprovarSolicitacao('${escapeAttr(user.id)}',${index})">Aprovar</button><button class="btn btn-danger" onclick="window.rejeitarSolicitacao('${escapeAttr(user.id)}',${index})">Rejeitar</button></div></div></div>`).join('');
}

window.aprovarSolicitacao=async function(userId,index){
  if(!(await confirmarAdminAtivo()))return;
  try{const ref=doc(db,"usuarios",userId),snap=await getDoc(ref);if(!snap.exists())return;const d=snap.data();const pedidos=Array.isArray(d.solicitacoesBadges)?[...d.solicitacoesBadges]:[];const req=pedidos[index];if(!req)return;const badges=Array.isArray(d.badges)?[...d.badges]:[];if(!badges.includes(req.badgeId))badges.push(req.badgeId);const extra={badges,solicitacoesBadges:pedidos.map((x,i)=>i===index?{...x,status:"aprovado",analisadoEm:new Date().toISOString()}:x)};if(req.badgeId==="patrocinador"||req.badgeId==="socio"){extra.patrocinador=true;extra.moldurasDesbloqueadas=[...new Set([...(Array.isArray(d.moldurasDesbloqueadas)?d.moldurasDesbloqueadas:[]),"moldura_patrocinador_1","moldura_patrocinador_2"])];extra.bannersDesbloqueados=[...new Set([...(Array.isArray(d.bannersDesbloqueados)?d.bannersDesbloqueados:[]),"banner_patrocinador_1","banner_patrocinador_2"])];extra.fotosDesbloqueadas=[...new Set([...(Array.isArray(d.fotosDesbloqueadas)?d.fotosDesbloqueadas:[]),"avatar_patrocinador_1","avatar_patrocinador_2"])]}
if(req.badgeId==="criador"){extra.criador=true;extra.moldurasDesbloqueadas=[...new Set([...(Array.isArray(d.moldurasDesbloqueadas)?d.moldurasDesbloqueadas:[]),"moldura_criador_1","moldura_criador_2"])];extra.bannersDesbloqueados=[...new Set([...(Array.isArray(d.bannersDesbloqueados)?d.bannersDesbloqueados:[]),"banner_criador_1","banner_criador_2"])];extra.fotosDesbloqueadas=[...new Set([...(Array.isArray(d.fotosDesbloqueadas)?d.fotosDesbloqueadas:[]),"avatar_criador_1","avatar_criador_2"])]}
if(req.badgeId==="primeira_temporada"){extra.moldurasDesbloqueadas=[...new Set([...(Array.isArray(d.moldurasDesbloqueadas)?d.moldurasDesbloqueadas:[]),"moldura_primeira_temporada"])];extra.bannersDesbloqueados=[...new Set([...(Array.isArray(d.bannersDesbloqueados)?d.bannersDesbloqueados:[]),"banner_primeira_temporada"])];extra.fotosDesbloqueadas=[...new Set([...(Array.isArray(d.fotosDesbloqueadas)?d.fotosDesbloqueadas:[]),"avatar_primeira_temporada"])]}
await updateDoc(ref,extra);mostrarMensagem("Solicitação aprovada.");await carregarUsuarios();}catch(e){console.error(e);mostrarMensagem("Erro ao aprovar solicitação.","erro");}
};
window.rejeitarSolicitacao=async function(userId,index){
  if(!(await confirmarAdminAtivo()))return;
  try{const ref=doc(db,"usuarios",userId),snap=await getDoc(ref);if(!snap.exists())return;const d=snap.data();const pedidos=Array.isArray(d.solicitacoesBadges)?[...d.solicitacoesBadges]:[];if(!pedidos[index])return;pedidos[index]={...pedidos[index],status:"rejeitado",analisadoEm:new Date().toISOString()};await updateDoc(ref,{solicitacoesBadges:pedidos});mostrarMensagem("Solicitação rejeitada.");await carregarUsuarios();}catch(e){console.error(e);mostrarMensagem("Erro ao rejeitar solicitação.","erro");}
};

function renderizarUsuarios(usuarios) {
  if (!usuarios.length) {
    usuariosGrid.innerHTML = "<p>Nenhum usuário encontrado.</p>";
    return;
  }

  usuariosGrid.innerHTML = usuarios.map(usuario => {
    const badges = Array.isArray(usuario.badges) ? usuario.badges : [];
    const foto = sanitizeMediaUrl(usuario.foto) || "https://via.placeholder.com/70";
    const nome = escapeHtml(usuario.nome || "Usuário sem nome");
    const email = escapeHtml(usuario.email || "Sem email");
    const uid = escapeHtml(usuario.uid || usuario.id);
    const userIdAttr = escapeAttr(usuario.id);
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
            <div><strong>VIP:</strong> ${escapeHtml(usuario.vipTipo === "nova_era" ? "Nova Era" : (usuario.vipTipo || "Nenhum"))}</div>
            <div><strong>VIP expira em:</strong> ${vipAtivo ? escapeHtml(formatarDataVip(usuario.vipFim || "")) : "—"}</div>
            <div><strong>Molduras:</strong> ${Array.isArray(usuario.moldurasDesbloqueadas) ? usuario.moldurasDesbloqueadas.length : 0}</div>
          </div>

          <div class="badges">
            ${
              badges.length
                ? badges.map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("")
                : `<span class="badge">Sem badges</span>`
            }
          </div>

          <div class="acoes">
            <button class="btn btn-green" onclick="window.toggleAdmin('${userIdAttr}', ${usuario.admin === true})">
              ${usuario.admin ? "Remover Admin" : "Tornar Admin"}
            </button>

            <button class="btn btn-warning" onclick="window.toggleBan('${userIdAttr}', ${usuario.banido === true})">
              ${usuario.banido ? "Desbanir" : "Banir"}
            </button>

            <button class="btn" onclick="window.adicionarBadge('${userIdAttr}')">
              Adicionar Badge
            </button>

            <button class="btn btn-danger" onclick="window.removerBadge('${userIdAttr}')">
              Remover Badge
            </button>

            <button class="btn btn-like" onclick="window.adicionarLikes('${userIdAttr}')">
              Adicionar Likes
            </button>

            <button class="btn btn-danger" onclick="window.removerLikes('${userIdAttr}')">
              Remover Likes
            </button>

            <button class="btn btn-points" onclick="window.adicionarPontos('${userIdAttr}')">
              Adicionar Pontos
            </button>

            <button class="btn btn-warning" onclick="window.removerPontos('${userIdAttr}')">
              Remover Pontos
            </button>

            <button class="btn btn-green" onclick="window.darVipNovaEra('${userIdAttr}')">
              👑 Dar VIP Nova Era
            </button>

            <button class="btn btn-danger" onclick="window.removerVip('${userIdAttr}')">
              Remover VIP
            </button>

            <button class="btn" onclick="window.adicionarMoldura('${userIdAttr}')">
              🖼️ Liberar moldura
            </button>

            <button class="btn btn-warning" onclick="window.removerMoldura('${userIdAttr}')">
              Remover moldura
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function confirmarAdminAtivo() {
  const ehAdmin = await verificarAdmin(auth.currentUser?.uid);
  if (!ehAdmin) {
    mostrarMensagem("Sessão admin inválida. Recarregue a página.", "erro");
    return false;
  }
  return true;
}

window.toggleAdmin = async function (userId, adminAtual) {
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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
  if (!(await confirmarAdminAtivo())) return;

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

window.darVipNovaEra = async function (userId) {
  if (!(await confirmarAdminAtivo())) return;

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];
    const moldurasAtuais = Array.isArray(dados.moldurasDesbloqueadas) ? dados.moldurasDesbloqueadas : [];
    const badges = badgesAtuais.includes("vip_nova_era") ? badgesAtuais : [...badgesAtuais, "vip_nova_era"];
    const molduras = moldurasAtuais.includes("moldura_vip_nova_era")
      ? moldurasAtuais
      : [...moldurasAtuais, "moldura_vip_nova_era"];

    const bonusJaAplicado = dados.vipNovaEraBonusAplicado === true;
    const likesAtuais = normalizarNumero(dados.likesRecebidos);

    await updateDoc(userRef, {
      vipAtivo: true,
      vipFim: "",
      vipTipo: "nova_era",
      vipCompradoEm: new Date().toISOString(),
      vipNovaEraBonusAplicado: true,
      skinVipAtiva: true,
      nomeGlowAtivo: true,
      perfilCor: "#ff6a00",
      decoracaoAtiva: true,
      badges,
      moldurasDesbloqueadas: molduras,
      molduraPerfil: dados.molduraPerfil || "./fotosloja/moldura-vip-nova-era.svg",
      likesRecebidos: bonusJaAplicado ? likesAtuais : likesAtuais + 500
    });

    mostrarMensagem("VIP Nova Era vitalício ativado. Benefícios aplicados!");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao ativar o VIP Nova Era.", "erro");
  }
};

window.removerVip = async function (userId) {
  if (!(await confirmarAdminAtivo())) return;

  try {
    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = userSnap.data();
    const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];
    const badges = badgesAtuais.filter((badge) => badge !== "vip" && badge !== "vip_nova_era");

    await updateDoc(userRef, {
      vipAtivo: false,
      vipFim: "",
      vipTipo: "",
      vipCompradoEm: "",
      skinVipAtiva: false,
      nomeGlowAtivo: false,
      perfilCor: "",
      decoracaoAtiva: false,
      badges
    });

    mostrarMensagem("VIP removido. Os 500 likes bônus permanecem.");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover VIP.", "erro");
  }
};

window.adicionarMoldura = async function (userId) {
  if (!(await confirmarAdminAtivo())) return;

  const opcoes = Object.entries(MOLDURAS).map(([key, value]) => `${key} = ${value.nome}`).join("\n");
  const escolha = prompt(`Digite o ID da moldura:

${opcoes}`);
  if (!escolha) return;

  const moldura = MOLDURAS[escolha.trim().toLowerCase()];
  if (!moldura) {
    mostrarMensagem("Moldura inválida.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = snap.data();
    const atuais = Array.isArray(dados.moldurasDesbloqueadas) ? dados.moldurasDesbloqueadas : [];
    const novas = atuais.includes(moldura.id) ? atuais : [...atuais, moldura.id];

    await updateDoc(userRef, { moldurasDesbloqueadas: novas });
    mostrarMensagem(`${moldura.nome} liberada.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao liberar moldura.", "erro");
  }
};

window.removerMoldura = async function (userId) {
  if (!(await confirmarAdminAtivo())) return;

  const opcoes = Object.entries(MOLDURAS).map(([key, value]) => `${key} = ${value.nome}`).join("\n");
  const escolha = prompt(`Digite o ID da moldura para remover:

${opcoes}`);
  if (!escolha) return;

  const moldura = MOLDURAS[escolha.trim().toLowerCase()];
  if (!moldura) {
    mostrarMensagem("Moldura inválida.", "erro");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      mostrarMensagem("Usuário não encontrado.", "erro");
      return;
    }

    const dados = snap.data();
    const atuais = Array.isArray(dados.moldurasDesbloqueadas) ? dados.moldurasDesbloqueadas : [];
    await updateDoc(userRef, {
      moldurasDesbloqueadas: atuais.filter(id => id !== moldura.id),
      molduraPerfil: dados.molduraPerfil === moldura.url ? "" : (dados.molduraPerfil || "")
    });

    mostrarMensagem(`${moldura.nome} removida.`);
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao remover moldura.", "erro");
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

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let cursor = obj;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

const siteConfigFields = [
  {
    category: "GERAL",
    fields: [
      { key: "site.name", label: "Nome do site", type: "text" },
      { key: "site.title", label: "Título do site", type: "text" },
      { key: "site.description", label: "Descrição", type: "text" },
      { key: "site.url", label: "URL", type: "text" },
      { key: "site.email", label: "Email", type: "text" },
      { key: "site.founderName", label: "Nome do fundador", type: "text" },
      { key: "site.copyright", label: "Copyright", type: "text" }
    ]
  },
  {
    category: "APARÊNCIA",
    fields: [
      { key: "theme", label: "Tema", type: "select", options: [
        ["dark-orange", "Preto + laranja"],
        ["light", "Branco + preto"],
        ["light-orange", "Branco + laranja"]
      ] },
      { key: "language", label: "Idioma", type: "select", options: [
        ["pt-BR", "Português"],
        ["en", "English"]
      ] },
      { key: "visual.primary", label: "Cor principal", type: "color" },
      { key: "visual.secondary", label: "Cor secundária", type: "color" },
      { key: "visual.accent", label: "Cor de destaque", type: "color" },
      { key: "visual.background", label: "Fundo", type: "color" },
      { key: "visual.cards", label: "Cards", type: "color" },
      { key: "visual.footer", label: "Footer", type: "text" },
      { key: "visual.navbar", label: "Navbar", type: "text" }
    ]
  },
  {
    category: "TEMA",
    fields: [
      { key: "features.showNavbar", label: "Mostrar navbar", type: "checkbox" },
      { key: "features.showHero", label: "Mostrar hero", type: "checkbox" },
      { key: "features.showStats", label: "Mostrar estatísticas", type: "checkbox" },
      { key: "features.showCommunity", label: "Mostrar comunidade", type: "checkbox" },
      { key: "features.showFooter", label: "Mostrar footer", type: "checkbox" }
    ]
  },
  {
    category: "ANIMAÇÕES",
    fields: [
      { key: "features.showAnimations", label: "Animações ativas", type: "checkbox" },
      { key: "animations.enabled", label: "Ativar animações", type: "checkbox" },
      { key: "animations.scrollReveal", label: "Scroll reveal", type: "checkbox" },
      { key: "animations.hover", label: "Hover", type: "checkbox" },
      { key: "animations.modal", label: "Modal", type: "checkbox" }
    ]
  },
  {
    category: "PRELOADER",
    fields: [
      { key: "preloader.enabled", label: "Preloader ativo", type: "checkbox" },
      { key: "preloader.duration", label: "Tempo (ms)", type: "number" },
      { key: "preloader.color", label: "Cor do preloader", type: "color" },
      { key: "preloader.elementColor", label: "Cor dos elementos", type: "color" }
    ]
  },
  {
    category: "CURSOS",
    fields: [
      { key: "features.showCourses", label: "Mostrar cursos", type: "checkbox" },
      { key: "courses.showCourses", label: "Exibir cursos", type: "checkbox" },
      { key: "courses.requireLogin", label: "Exigir login", type: "checkbox" },
      { key: "courses.visibleCount", label: "Quantidade exibida", type: "number" }
    ]
  },
  {
    category: "LOGIN",
    fields: [
      { key: "features.showLogin", label: "Mostrar login", type: "checkbox" },
      { key: "features.showProfile", label: "Mostrar perfil", type: "checkbox" },
      { key: "login.googleLogin", label: "Login Google", type: "checkbox" },
      { key: "login.googlePopup", label: "Popup Google", type: "checkbox" }
    ]
  },
  {
    category: "REDES SOCIAIS",
    fields: [
      { key: "socials.discord", label: "Discord", type: "text" },
      { key: "socials.instagram", label: "Instagram", type: "text" },
      { key: "socials.youtube", label: "YouTube", type: "text" },
      { key: "socials.github", label: "GitHub", type: "text" }
    ]
  },
  {
    category: "COOKIES",
    fields: [
      { key: "features.showCookies", label: "Mostrar cookie banner", type: "checkbox" },
      { key: "cookies.showCookieBanner", label: "Cookie ativo", type: "checkbox" },
      { key: "cookies.cookieText", label: "Texto do cookie", type: "text" },
      { key: "cookies.cookieButtonText", label: "Texto do botão", type: "text" }
    ]
  },
  {
    category: "SEO",
    fields: [
      { key: "seo.title", label: "SEO title", type: "text" },
      { key: "seo.description", label: "SEO description", type: "text" },
      { key: "seo.keywords", label: "Keywords", type: "text" },
      { key: "seo.author", label: "Author", type: "text" }
    ]
  },
  {
    category: "FOOTER",
    fields: [
      { key: "site.footerText", label: "Texto do footer", type: "text" },
      { key: "features.showSocialLinks", label: "Mostrar redes", type: "checkbox" },
      { key: "features.showDiscord", label: "Mostrar Discord", type: "checkbox" }
    ]
  },
  {
    category: "ADMIN",
    fields: [
      { key: "features.showAdminButton", label: "Mostrar botão admin", type: "checkbox" },
      { key: "admin.showAdminButton", label: "Botão admin visível", type: "checkbox" },
      { key: "admin.displayAdminInfo", label: "Exibir infos admin", type: "checkbox" }
    ]
  }
];

function renderSiteSettingsForm() {
  const form = document.getElementById("siteSettingsForm");
  if (!form) return;

  const config = window.ZyroConfigAPI ? window.ZyroConfigAPI.getConfig() : {};

  form.innerHTML = siteConfigFields.map((group) => {
    const fields = group.fields.map((field) => {
      const value = getByPath(config, field.key);
      const checked = value === true ? "checked" : "";
      const currentValue = value ?? "";

      const inputHtml = field.type === "checkbox"
        ? `<input data-config-key="${field.key}" type="checkbox" ${checked}>`
        : field.type === "select"
          ? `<select data-config-key="${field.key}">${(field.options || []).map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${String(currentValue) === String(optionValue) ? "selected" : ""}>${optionLabel}</option>`).join("")}</select>`
          : field.type === "color"
            ? `<input data-config-key="${field.key}" type="color" value="${String(currentValue || "#ff6a00")}">`
            : `<input data-config-key="${field.key}" type="${field.type}" value="${String(currentValue ?? "")}">`;

      return `
        <div class="setting-field">
          <label>${field.label}</label>
          ${inputHtml}
        </div>
      `;
    }).join("");

    return `
      <div class="setting-group">
        <h3>${group.category}</h3>
        ${fields}
      </div>
    `;
  }).join("");
}

function collectFormConfig() {
  const form = document.getElementById("siteSettingsForm");
  if (!form) return null;

  const next = JSON.parse(JSON.stringify(window.ZyroConfigAPI ? window.ZyroConfigAPI.getConfig() : {}));

  form.querySelectorAll("[data-config-key]").forEach((field) => {
    const path = field.dataset.configKey;
    const value = field.type === "checkbox" ? field.checked : field.value;
    setByPath(next, path, value);
  });

  if (typeof next.visual === "object") {
    next.visual = {
      ...next.visual,
      primary: next.visual.primary && next.visual.primary !== "" ? next.visual.primary : "#ff6a00",
      secondary: next.visual.secondary || "#ff8533",
      background: next.visual.background || "#000000",
      cards: next.visual.cards || "#111111",
      footer: next.visual.footer || "#0a0a0a",
      navbar: next.visual.navbar || "rgba(10,14,25,0.85)"
    };
  }

  return next;
}

function saveSiteConfig() {
  const next = collectFormConfig();
  if (!next) return;

  if (window.ZyroConfigAPI && typeof window.ZyroConfigAPI.saveConfig === "function") {
    window.ZyroConfigAPI.saveConfig(next);
  }

  if (window.ZyroConfigAPI && typeof window.ZyroConfigAPI.apply === "function") {
    window.ZyroConfigAPI.apply();
  }

  mostrarMensagem("Configurações do site salvas.", "ok");
}

function resetSiteConfig() {
  const resetConfig = JSON.parse(JSON.stringify(window.ZyroConfigAPI ? window.ZyroConfigAPI.getConfig() : {}));
  const base = {
    theme: "dark-orange",
    language: "pt-BR",
    site: { name: "ZyroDev", title: "ZyroDev", description: "Aprenda programação gratuitamente e evolua com a ZyroDev", url: "https://zyrodev.com", email: "contato@zyrodev.com", founderName: "Delarotaldev", copyright: "© 2026 ZyroDev Temp 2" },
    socials: { discord: "https://discord.gg/AJkeUcN47e", instagram: "https://www.instagram.com/delarotaldev", youtube: "https://youtube.com/@delarotaldev", github: "https://github.com/victortx1" },
    features: { showNavbar: true, showHero: true, showStats: true, showCourses: true, showCommunity: true, showFooter: true, showCookies: true, showGooglePopup: true, showPreloader: true, showAnimations: true, showMotivationalPhrases: true, showUpdates: true, showDiscord: true, showSocialLinks: true, showProfile: true, showLogin: true, showSearch: true, showNotifications: true, showAdminButton: true, showPartnerSection: true, showFounderBadge: true, showVipBadge: true },
    visual: { primary: "#ff6a00", secondary: "#ff8533", accent: "#ffb067", text: "#f5f5f5", textSecondary: "#b8b8b8", background: "#000000", cards: "#111111", panels: "#171717", borders: "rgba(255,255,255,0.10)", buttons: "#ff6a00", buttonHover: "#ff8533", links: "#ff8a3d", navbar: "rgba(10,14,25,0.85)", footer: "#0a0a0a", icons: "#ff6a00", headings: "#ffffff", subtitles: "#b8b8b8", opacity: 0.9, shadow: "0 12px 30px rgba(0,0,0,0.45)", borderWidth: "1px", borderRadiusCard: "18px", borderRadiusButton: "12px", effectIntensity: 1, animationSpeed: 0.3 },
    animations: { enabled: true, pageEntrance: true, scrollReveal: true, hover: true, cards: true, buttons: true, navbar: true, hero: true, modal: true, preloader: true, transitions: true },
    preloader: { enabled: true, duration: 1690, animation: "honeycomb", color: "#ff6a00", elementColor: "#ff8533", onlyOncePerSession: true, showOnAllPages: true },
    cookies: { showCookieBanner: true, cookieEnabled: true, cookieText: "🍪 Este site utiliza cookies para melhorar sua experiência no ZyroDev.", cookieButtonText: "Aceitar", cookieStorageKey: "zyro_cookie" },
    login: { googleLogin: true, googlePopup: true, showProfile: true, redirectAfterLogin: "perfil.html", protectedPagesRedirect: "login.html", showLoggedUser: true, showPhoto: true, showName: true },
    courses: { showCourses: true, visibleCount: 12, showClassButton: true, requireLogin: true, showProtectedContent: true, unauthenticatedMessage: "Faça login para acessar os cursos." },
    admin: { showAdminButton: true, showAdminResources: true, displayAdminInfo: true },
    seo: { title: "ZyroDev", description: "Aprenda programação gratuitamente e evolua com a ZyroDev", keywords: "programação, cursos, desenvolvimento, ZyroDev, JavaScript, Python, HTML, CSS", author: "ZyroDev", ogTitle: "ZyroDev", ogDescription: "Aprenda programação gratuitamente e evolua com a ZyroDev", ogImage: "/preview.png", language: "pt-BR", robots: "index,follow", canonical: "" }
  };

  Object.assign(resetConfig, base);

  if (window.ZyroConfigAPI && typeof window.ZyroConfigAPI.saveConfig === "function") {
    window.ZyroConfigAPI.saveConfig(resetConfig);
  }

  if (window.ZyroConfigAPI && typeof window.ZyroConfigAPI.apply === "function") {
    window.ZyroConfigAPI.apply();
  }

  renderSiteSettingsForm();
  mostrarMensagem("Configurações resetadas.", "ok");
}

const saveSiteConfigBtn = document.getElementById("saveSiteConfig");
const resetSiteConfigBtn = document.getElementById("resetSiteConfig");

saveSiteConfigBtn?.addEventListener("click", saveSiteConfig);
resetSiteConfigBtn?.addEventListener("click", resetSiteConfig);
renderSiteSettingsForm();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
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