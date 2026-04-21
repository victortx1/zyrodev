import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const STORAGE_TOTAL_COINS = "zyro_total_coins";
const STORAGE_OWNED_SKINS = "zyro_owned_skins";
const STORAGE_EQUIPPED_SKIN = "zyro_equipped_skin";
const STORAGE_VIP = "zyro_vip_ativo";
const STORAGE_VIP_END = "zyro_vip_fim";

const VIP_PRECO = 15000;
const VIP_DIAS = 30;
const VIP_BONUS_COMPRA = 100;
const VIP_MULTIPLICADOR = 2;

const skins = {
  rumagua: {
    nome: "Rum água",
    preco: 250,
    imagem: "./fotosloja/rumaguaatualizado.png"
  },
  rumanalck: {
    nome: "Rum analck",
    preco: 450,
    imagem: "./fotosloja/rumanalck-Photoroom.png"
  },
  rumfogo: {
    nome: "Rum fogo",
    preco: 550,
    imagem: "./fotosloja/rumfogo-Photoroom.png"
  },
  rumgelo: {
    nome: "Rum gelo",
    preco: 950,
    imagem: "./fotosloja/rumgelo-Photoroom.png"
  },
  rumprincipe: {
    nome: "Rum principe",
    preco: 1200,
    imagem: "./fotosloja/rumprincipe-Photoroom.png"
  },
  rumguardiao: {
    nome: "Rum guardião",
    preco: 1300,
    imagem: "./fotosloja/rumguardiao-Photoroom.png"
  },
  ruminterestelar: {
    nome: "Rum interestelar",
    preco: 1550,
    imagem: "./fotosloja/ruminterestelar-Photoroom.png"
  },
  rumhack: {
    nome: "Rum hack",
    preco: 1600,
    imagem: "./fotosloja/rumhack-Photoroom.png"
  },
  rumflash: {
    nome: "Rum flash",
    preco: 2000,
    imagem: "./fotosloja/rumflash-Photoroom.png"
  },
  rumruby: {
    nome: "Rum ruby",
    preco: 2500,
    imagem: "./fotosloja/rumruby-Photoroom.png"
  },
  rumperolanegra: {
    nome: "Rum perola negra",
    preco: 3500,
    imagem: "./fotosloja/rumperolanegra-Photoroom.png"
  }
};

let currentUser = null;
let totalCoins = 0;
let ownedSkins = [];
let equippedSkin = "";
let vipAtivo = false;
let vipFim = "";
let badges = [];
let vipTipo = "";
let vipBonusMultiplicador = 1;
let skinVipAtiva = false;

function atualizarMoedas() {
  const coinsEl = document.getElementById("coins");
  if (coinsEl) coinsEl.textContent = totalCoins;
}

function skinJaComprada(skinId) {
  return ownedSkins.includes(skinId);
}

function salvarCacheLocal() {
  localStorage.setItem(STORAGE_TOTAL_COINS, String(totalCoins));
  localStorage.setItem(STORAGE_OWNED_SKINS, JSON.stringify(ownedSkins));
  localStorage.setItem(STORAGE_EQUIPPED_SKIN, equippedSkin || "");
  localStorage.setItem(STORAGE_VIP, String(vipAtivo));
  localStorage.setItem(STORAGE_VIP_END, vipFim || "");
}

function garantirBadgeVip() {
  if (!badges.includes("vip")) {
    badges.push("vip");
  }
}

function removerBadgeVip() {
  badges = badges.filter((b) => b !== "vip");
}

function vipExpirou() {
  if (!vipAtivo || !vipFim) return false;

  const fim = new Date(vipFim);
  if (isNaN(fim.getTime())) return false;

  return new Date() > fim;
}

async function expirarVipSeNecessario() {
  if (!currentUser) return;

  if (!vipExpirou()) return;

  vipAtivo = false;
  vipFim = "";
  vipTipo = "";
  vipBonusMultiplicador = 1;
  skinVipAtiva = false;
  removerBadgeVip();

  const userRef = doc(db, "usuarios", currentUser.uid);
  await updateDoc(userRef, {
    vipAtivo: false,
    vipFim: "",
    vipTipo: "",
    vipCompradoEm: "",
    vipBonusMultiplicador: 1,
    skinVipAtiva: false,
    badges: badges
  });

  salvarCacheLocal();
  atualizarMoedas();
  atualizarBotoes();
}

async function carregarDadosLoja(uid) {
  try {
    const userRef = doc(db, "usuarios", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      totalCoins = Number(data.totalCoins || 0);
      ownedSkins = Array.isArray(data.ownedSkins) ? data.ownedSkins : [];
      equippedSkin = data.equippedSkin || "";
      vipAtivo = Boolean(data.vipAtivo || false);
      vipFim = data.vipFim || "";
      badges = Array.isArray(data.badges) ? data.badges : [];
      vipTipo = data.vipTipo || "";
      vipBonusMultiplicador = Number(data.vipBonusMultiplicador || 1);
      skinVipAtiva = Boolean(data.skinVipAtiva || false);
    } else {
      totalCoins = 0;
      ownedSkins = [];
      equippedSkin = "";
      vipAtivo = false;
      vipFim = "";
      badges = [];
      vipTipo = "";
      vipBonusMultiplicador = 1;
      skinVipAtiva = false;

      await setDoc(userRef, {
        totalCoins: 0,
        ownedSkins: [],
        equippedSkin: "",
        vipAtivo: false,
        vipFim: "",
        vipTipo: "",
        vipCompradoEm: "",
        vipBonusMultiplicador: 1,
        skinVipAtiva: false,
        badges: []
      }, { merge: true });
    }

    await expirarVipSeNecessario();

    salvarCacheLocal();
    atualizarMoedas();
    atualizarBotoes();
  } catch (error) {
    console.error("Erro ao carregar dados da loja:", error);
  }
}

async function salvarDadosLoja() {
  if (!currentUser) return;

  try {
    const userRef = doc(db, "usuarios", currentUser.uid);
    await updateDoc(userRef, {
      totalCoins: totalCoins,
      ownedSkins: ownedSkins,
      equippedSkin: equippedSkin,
      vipAtivo: vipAtivo,
      vipFim: vipFim,
      badges: badges,
      vipTipo: vipTipo,
      vipBonusMultiplicador: vipBonusMultiplicador,
      skinVipAtiva: skinVipAtiva
    });

    salvarCacheLocal();
    atualizarMoedas();
    atualizarBotoes();
  } catch (error) {
    console.error("Erro ao salvar dados da loja:", error);
    mostrarNotificacao("Erro", "Erro ao salvar compra. Tente novamente.", "erro");
  }
}

async function comprarSkin(skinId) {
  const skin = skins[skinId];
  if (!skin) return;

  if (!currentUser) {
    mostrarNotificacao("Login necessário", "Você precisa estar logado.", "erro");
    return;
  }

  if (ownedSkins.includes(skinId)) {
    mostrarNotificacao("Aviso", "Você já comprou essa skin.", "aviso");
    return;
  }

  if (totalCoins < skin.preco) {
    alert("Moedas insuficientes!");
    return;
  }

  totalCoins -= skin.preco;
  ownedSkins.push(skinId);

  if (!equippedSkin) {
    equippedSkin = skinId;
  }

  await salvarDadosLoja();

  mostrarNotificacao("Compra realizada", `Você comprou ${skin.nome}!`, "sucesso");
}

async function equiparSkin(skinId) {
  const skin = skins[skinId];
  if (!skin) return;

  if (!currentUser) {
    alert("Você precisa estar logado para equipar.");
    return;
  }

  if (!skinJaComprada(skinId)) {
    alert("Você precisa comprar essa skin primeiro.");
    return;
  }

  equippedSkin = skinId;
  await salvarDadosLoja();

  mostrarNotificacao("Equipado", `${skin.nome} equipada!`, "sucesso");
}

async function comprarVip() {
  if (!currentUser) {
    alert("Você precisa estar logado para comprar.");
    return;
  }

  if (totalCoins < VIP_PRECO) {
    mostrarNotificacao("Saldo insuficiente", "Você não tem moedas suficientes.", "erro");
    return;
  }

  totalCoins -= VIP_PRECO;
  totalCoins += VIP_BONUS_COMPRA;

  const agora = new Date();
  let base = new Date();

  if (vipAtivo && vipFim) {
    const dataAtualFim = new Date(vipFim);
    if (!isNaN(dataAtualFim.getTime()) && dataAtualFim > agora) {
      base = dataAtualFim;
    }
  }

  base.setDate(base.getDate() + VIP_DIAS);

  vipAtivo = true;
  vipFim = base.toISOString();
  vipTipo = "esmeralda";
  vipBonusMultiplicador = VIP_MULTIPLICADOR;
  skinVipAtiva = true;
  garantirBadgeVip();

  // ✅ dá a skin Rum interestelar automaticamente
  if (!ownedSkins.includes("ruminterestelar")) {
    ownedSkins.push("ruminterestelar");
  }

  // ✅ opcional: equipa automaticamente se quiser
  // equippedSkin = "ruminterestelar";

  const userRef = doc(db, "usuarios", currentUser.uid);
  await updateDoc(userRef, {
    totalCoins: totalCoins,
    vipAtivo: true,
    vipFim: vipFim,
    vipTipo: "esmeralda",
    vipCompradoEm: agora.toISOString(),
    vipBonusMultiplicador: VIP_MULTIPLICADOR,
    skinVipAtiva: true,
    badges: badges,
    ownedSkins: ownedSkins
    // equippedSkin: "ruminterestelar" // descomenta se quiser equipar automático
  });

  salvarCacheLocal();
  atualizarMoedas();
  atualizarBotoes();

  mostrarNotificacao(
    "VIP ativado",
    "VIP Esmeralda ativado por 30 dias! Você também ganhou o personagem Rum interestelar!",
    "sucesso"
  );
}

async function comprarMisterioso(nome, preco) {
  if (!currentUser) {
    alert("Você precisa estar logado para comprar.");
    return;
  }

  if (totalCoins < preco) {
    alert("Moedas insuficientes!");
    return;
  }

  totalCoins -= preco;

  await salvarDadosLoja();

  alert("Você comprou o item misterioso!");
}

function atualizarBotoes() {
  document.querySelectorAll("[data-skin-id]").forEach((card) => {
    const skinId = card.dataset.skinId;
    const buyBtn = card.querySelector(".btn-comprar");
    const equipBtn = card.querySelector(".btn-equipar");

    if (!buyBtn || !equipBtn) return;

    if (ownedSkins.includes(skinId)) {
      buyBtn.textContent = "Comprado";
      buyBtn.disabled = true;
      buyBtn.style.opacity = "0.7";

      equipBtn.disabled = false;

      if (equippedSkin === skinId) {
        equipBtn.textContent = "Equipado";
        equipBtn.disabled = true;
        equipBtn.style.opacity = "0.7";
      } else {
        equipBtn.textContent = "Equipar";
        equipBtn.disabled = false;
        equipBtn.style.opacity = "1";
      }
    } else {
      buyBtn.textContent = "Comprar";
      buyBtn.disabled = false;
      buyBtn.style.opacity = "1";

      equipBtn.textContent = "Equipar";
      equipBtn.disabled = true;
      equipBtn.style.opacity = "0.5";
    }
  });

  const vipBtn = document.querySelector(".item.vip button");
  if (vipBtn) {
    if (vipAtivo && !vipExpirou()) {
      vipBtn.textContent = "Renovar VIP";
    } else {
      vipBtn.textContent = "Comprar";
    }
  }
}

window.comprarSkin = comprarSkin;
window.equiparSkin = equiparSkin;
window.comprarVip = comprarVip;
window.comprarMisterioso = comprarMisterioso;

document.addEventListener("DOMContentLoaded", () => {
  atualizarMoedas();
  atualizarBotoes();
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await carregarDadosLoja(user.uid);
  } else {
    currentUser = null;
    totalCoins = 0;
    ownedSkins = [];
    equippedSkin = "";
    vipAtivo = false;
    vipFim = "";
    badges = [];
    vipTipo = "";
    vipBonusMultiplicador = 1;
    skinVipAtiva = false;

    salvarCacheLocal();
    atualizarMoedas();
    atualizarBotoes();
  }
});

function mostrarNotificacao(titulo, mensagem, tipo = "sucesso", duracao = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  toast.innerHTML = `
    <div class="toast-topo">
      <div class="toast-titulo">${titulo}</div>
      <button class="toast-fechar">&times;</button>
    </div>
    <div class="toast-mensagem">${mensagem}</div>
    <div class="toast-barra" style="animation-duration: ${duracao}ms;"></div>
  `;

  container.appendChild(toast);

  const removerToast = () => {
    toast.style.animation = "slideOutToast 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".toast-fechar").addEventListener("click", removerToast);

  setTimeout(removerToast, duracao);
}