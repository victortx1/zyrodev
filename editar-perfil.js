import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { truncateText, sanitizeMediaUrl } from "./security-utils.js";

const fotoPreview = document.getElementById("fotoPreview");
const bannerPreview = document.getElementById("bannerPreview");
const fotoInput = document.getElementById("fotoInput");
const bannerInput = document.getElementById("bannerInput");
const nomeInput = document.getElementById("nomeInput");
const bioInput = document.getElementById("bioInput");
const empresaInput = document.getElementById("empresaInput");
const siteInput = document.getElementById("siteInput");
const btnSalvar = document.getElementById("btnSalvar");
const statusMsg = document.getElementById("statusMsg");
const moldurasGrid = document.getElementById("moldurasGrid");
const vipSubtitle = document.getElementById("vipSubtitle");
const decoracaoInput = document.getElementById("decoracaoInput");
const nomeGlowInput = document.getElementById("nomeGlowInput");
const bannersGrid = document.getElementById("bannersGrid");
const fotosGrid = document.getElementById("fotosGrid");

const BANNERS = {
  banner_aurora:{id:"banner_aurora",nome:"Zyro Dev",url:"./fotos/zyrodevvvv.png"},
  banner_neon:{id:"banner_neon",nome:"Banner Neon",url:"./fotos/lar.gif"},
  banner_space:{id:"banner_space",nome:"Banner Space",url:"./fotos/spot.png"},
  banner_sunset:{id:"banner_sunset",nome:"Banner Sunset",url:"./fotos/kathaooo.gif"},
  banner_circuit:{id:"banner_circuit",nome:"Banner Circuit",url:"./fotos/node.gif"},
  banner_teste_plasma:{id:"banner_teste_plasma",nome:"Banner Plasma",url:"./fotosloja/banner-teste-plasma.svg",animada:true},
  banner_teste_neon:{id:"banner_teste_neon",nome:"Banner Neon Vivo",url:"./fotosloja/banner-teste-neon.svg",animada:true},
  banner_teste_orbita:{id:"banner_teste_orbita",nome:"Banner Órbita",url:"./fotosloja/banner-teste-orbita.svg",animada:true},
  banner_admin_1:{id:"banner_admin_1",nome:"Admin Dourado I",url:"./fotos/admin.jfif",role:"admin"},
  banner_admin_2:{id:"banner_admin_2",nome:"Admin Dourado II",url:"./fotos/narutoadmin.jfif",role:"admin"},
  banner_patrocinador_1:{id:"banner_patrocinador_1",nome:"Patrocinador Azul I",url:"./fotos/patrocinador.jfif",role:"patrocinador"},
  banner_patrocinador_2:{id:"banner_patrocinador_2",nome:"Patrocinador Azul II",url:"./fotos/propin.jfif",role:"patrocinador"},
  banner_criador_1:{id:"banner_criador_1",nome:"Criador Roxo I",url:"./fotos/criazyro.jfif",role:"criador"},
  banner_criador_2:{id:"banner_criador_2",nome:"Criador Roxo II",url:"./fotos/criador.jfif",role:"criador"},
  banner_primeira_temporada:{id:"banner_primeira_temporada",nome:"Banner Primeira Temporada",url:"./fotos/pt1.jfif",role:"season"},
  banner_delar:{id:"banner_delar",nome:"Banner Do DELAR",url:"./fotos/delarzin.jfif",role:"founder"}
};
const FOTOS = {
  avatar_aurora:{id:"avatar_aurora",nome:"Avatar Anie",url:"./fotos/anie.jfif"},
  avatar_neon:{id:"avatar_neon",nome:"Avatar do frack",url:"./fotos/frack.gif"},
  avatar_space:{id:"avatar_space",nome:"Avatar Minie",url:"./fotos/minie.jfif"},
  avatar_flame:{id:"avatar_flame",nome:"Avatar Palhaço",url:"./fotos/palhaço.jfif"},
  avatar_circuit:{id:"avatar_circuit",nome:"Avatar riok",url:"./fotos/riok.jfif"},
  avatar_teste_plasma:{id:"avatar_teste_plasma",nome:"Avatar Plasma",url:"./fotosloja/avatar-teste-plasma.svg",animada:true},
  avatar_teste_neon:{id:"avatar_teste_neon",nome:"Avatar Neon Vivo",url:"./fotosloja/avatar-teste-neon.svg",animada:true},
  avatar_teste_orbita:{id:"avatar_teste_orbita",nome:"Avatar Órbita",url:"./fotosloja/avatar-teste-orbita.svg",animada:true},
  avatar_admin_1:{id:"avatar_admin_1",nome:"Avatar Alecrin",url:"./fotos/alecrinadm.png",role:"admin"},
  avatar_admin_2:{id:"avatar_admin_2",nome:"Avatar Boom",url:"./fotos/boomadm.png",role:"admin"},
  avatar_patrocinador_1:{id:"avatar_patrocinador_1",nome:"Avatar ssponzo",url:"./fotos/ssponzo.jfif",role:"patrocinador"},
  avatar_patrocinador_2:{id:"avatar_patrocinador_2",nome:"Avatar billionaire",url:"./fotos/reimoney.jfif",role:"patrocinador"},
  avatar_criador_1:{id:"avatar_criador_1",nome:"Avatar Cfzyro",url:"./fotos/cfzyro.jfif",role:"criador"},
  avatar_criador_2:{id:"avatar_criador_2",nome:"Avatar Cria",url:"./fotos/cria.jfif",role:"criador"},
  avatar_primeira_temporada:{id:"avatar_primeira_temporada",nome:"Avatar Primeira Temporada",url:"./fotos/pt1.png",role:"season"},
  avatar_delar:{id:"avatar_delar",nome:"Avatar Do DELAR",url:"./fotos/DELAR.png",role:"founder"}
};

let bannerSelecionado = "";
let fotoSelecionada = "";

const MOLDURAS = {
  moldura_fogo:{id:"moldura_hallowen",nome:"Hallowen",url:"./fotos/hallowen.png",animada:true},
  moldura_neon:{id:"moldura_poplar",nome:"Poplar",url:"./fotos/poplar.png",animada:true},
  moldura_diamante:{id:"moldura_magico",nome:"Magico",url:"./fotos/magico.png"},
  moldura_nova_era:{id:"moldura_sakura",nome:"Sakura",url:"./fotos/sakura.png",animada:true},
  moldura_galaxia:{id:"moldura_Asmart",nome:"Asmart",url:"./fotos/asmart.png",animada:true},
  moldura_teste_plasma:{id:"moldura_teste_plasma",nome:"Plasma",url:"./fotosloja/frame-teste-plasma.svg",animada:true},
  moldura_teste_orbita:{id:"moldura_teste_orbita",nome:"Órbita",url:"./fotosloja/frame-teste-orbita.svg",animada:true},
  moldura_teste_energia:{id:"moldura_teste_energia",nome:"Energia",url:"./fotosloja/frame-teste-energia.svg",animada:true},
  none:{id:"",nome:"Sem moldura",url:""},
  moldura_admin_1:{id:"moldura_admin_1",nome:"Golden Dragon",url:"./fotos/admin.png",role:"admin",animada:true},
  moldura_admin_2:{id:"moldura_admin_2",nome:"Black Dragon",url:"./fotos/dragon.png",role:"admin",animada:true},
  moldura_patrocinador_1:{id:"moldura_patrocinador_1",nome:"Boss Zyro",url:"./fotos/bosszyro.png",role:"patrocinador"},
  moldura_patrocinador_2:{id:"moldura_patrocinador_2",nome:"Zyro sponsor",url:"./fotos/PartnerZyro.png",role:"patrocinador",animada:true},
  moldura_criador_1:{id:"moldura_criador_1",nome:"Criador Zyro",url:"./fotos/criador.png",role:"criador"},
  moldura_criador_2:{id:"moldura_criador_2",nome:"Lead Creator",url:"./fotos/criadorchefe.png",role:"criador",animada:true},
  moldura_primeira_temporada:{id:"moldura_primeira_temporada",nome:"Temp 1 zyro",url:"./fotos/pr1.png",role:"season",animada:true},
  moldura_delar:{id:"moldura_delar",nome:"Moldura Do DELAR",url:"./fotos/delarr.png",role:"founder",animada:true}
};
 
let moldurasDisponiveis = [];
let molduraSelecionada = "";

let usuarioAtual = null;
let fotoBase64 = "";
let bannerBase64 = "";

function mostrarStatus(texto, tipo = "") {
  statusMsg.textContent = texto;
  statusMsg.className = `status ${tipo}`.trim();
}

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function carregarImagem(file, maxW, maxH, targetBytes = 700000) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Escolha uma imagem válida."));
      return;
    }

    // Aceita arquivos grandes como entrada. O navegador reduz a imagem antes de salvar.
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("A imagem pode ter no máximo 15 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.88;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > targetBytes * 1.33 && quality > 0.35) {
          quality -= 0.07;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        // Firestore tem limite de ~1 MiB por documento. Mantemos folga para os demais campos.
        if (result.length > 850000) {
          reject(new Error("Não consegui reduzir essa imagem o suficiente. Escolha outra imagem."));
          return;
        }
        resolve(result);
      };
      img.onerror = () => reject(new Error("Não foi possível abrir essa imagem."));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setPreviewImage(element, value, fallback = "") {
  if (!element) return;
  element.style.backgroundImage = value ? `url("${value.replaceAll('"', '%22')}")` : fallback;
}

function obterMolduraPorUrl(url) {
  return Object.values(MOLDURAS).find(item => item.url === url) || MOLDURAS.none;
}

function atualizarPreviewAvatar() {
  const wrap = document.getElementById("editAvatarPreviewWrap");
  if (!wrap || !fotoPreview) return;

  wrap.querySelectorAll(".edit-avatar-frame").forEach(el => el.remove());

  const item = obterMolduraPorUrl(molduraSelecionada);
  if (item.url && decoracaoInput?.checked !== false) {
    const frame = document.createElement("div");
    frame.className = `edit-avatar-frame${item.animada ? " moldura-animada" : ""}`;
    frame.style.backgroundImage = `url("${item.url}")`;
    wrap.appendChild(frame);
  }
}

function renderizarMolduras(dados = {}) {
  if (!moldurasGrid) return;

  const desbloqueadas = Array.isArray(dados.moldurasDesbloqueadas) ? dados.moldurasDesbloqueadas : [];
  moldurasDisponiveis = ["none", ...desbloqueadas].filter((id, index, arr) => arr.indexOf(id) === index && MOLDURAS[id]);

  if (vipSubtitle) {
    vipSubtitle.textContent = "Escolha uma moldura adquirida gratuitamente na Loja.";
  }

  molduraSelecionada = dados.molduraPerfil || "";
  moldurasGrid.innerHTML = "";

  moldurasDisponiveis.forEach(id => {
    const item = MOLDURAS[id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `moldura-option${(item.url === molduraSelecionada || (!molduraSelecionada && id === "none")) ? " selected" : ""}`;

    const preview = document.createElement("div");
    preview.className = `moldura-preview${item.animada ? " moldura-animada" : ""}`;
    if (item.url) preview.style.backgroundImage = `url("${item.url}")`;
    button.appendChild(preview);

    const label = document.createElement("div");
    label.textContent = item.nome;
    button.appendChild(label);

    button.addEventListener("click", () => {
      molduraSelecionada = item.url;
      document.querySelectorAll(".moldura-option").forEach(el => el.classList.remove("selected"));
      button.classList.add("selected");
      atualizarPreviewAvatar();
    });

    moldurasGrid.appendChild(button);
  });

  if (decoracaoInput) decoracaoInput.checked = dados.decoracaoAtiva !== false;
  if (nomeGlowInput) nomeGlowInput.checked = dados.nomeGlowAtivo === true;

  atualizarPreviewAvatar();

  renderColecao(BANNERS, bannersGrid, Array.isArray(dados.bannersDesbloqueados) ? dados.bannersDesbloqueados : [], "banner", dados.banner || "");
  renderColecao(FOTOS, fotosGrid, Array.isArray(dados.fotosDesbloqueadas) ? dados.fotosDesbloqueadas : [], "avatar", dados.foto || "");
}

function renderColecao(catalogo, container, desbloqueados, tipo, atual) {
  if (!container) return;
  container.innerHTML = "";
  const itens = Object.values(catalogo).filter(item => desbloqueados.includes(item.id));
  if (!itens.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "grid-column:1/-1;color:#666;font-size:11px;padding:8px 0";
    empty.textContent = "Nenhum item adquirido ainda. Visite a Loja gratuita.";
    container.appendChild(empty);
    return;
  }

  itens.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `collection-option${item.url === atual ? " selected" : ""}`;

    const preview = document.createElement("div");
    preview.className = `collection-preview${tipo === "avatar" ? " avatar" : ""}`;
    preview.style.backgroundImage = `url("${item.url}")`;
    button.appendChild(preview);

    const label = document.createElement("div");
    label.textContent = item.nome;
    button.appendChild(label);

    button.addEventListener("click", () => {
      if (tipo === "banner") {
        bannerSelecionado = item.url;
        setPreviewImage(bannerPreview, bannerSelecionado);
        document.querySelectorAll("#bannersGrid .collection-option").forEach(el => el.classList.remove("selected"));
      } else {
        fotoSelecionada = item.url;
        fotoPreview.src = fotoSelecionada;
        document.querySelectorAll("#fotosGrid .collection-option").forEach(el => el.classList.remove("selected"));
      }
      button.classList.add("selected");
    });
    container.appendChild(button);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  usuarioAtual = user;
  try {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);
    const dados = userSnap.exists() ? userSnap.data() : {};

    nomeInput.value = dados?.nome || user.displayName || "";
    bioInput.value = dados?.bio || "";
    empresaInput.value = dados?.empresa || "";
    siteInput.value = dados?.site || "";
    fotoBase64 = dados?.foto || user.photoURL || "";
    bannerBase64 = dados?.banner || "";
    fotoSelecionada = fotoBase64;
    bannerSelecionado = bannerBase64;

    if (fotoBase64) fotoPreview.src = fotoBase64;
    setPreviewImage(bannerPreview, bannerBase64);
    renderizarMolduras(dados);
  } catch (error) {
    console.error(error);
    mostrarStatus("Erro ao carregar perfil.", "erro");
  }
});

fotoInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    mostrarStatus("Preparando foto...");
    fotoBase64 = await carregarImagem(file, 700, 700, 500000);
    fotoSelecionada = fotoBase64;
    fotoPreview.src = fotoBase64;
    mostrarStatus("Foto pronta para salvar.", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarStatus(error.message, "erro");
    event.target.value = "";
  }
});

bannerInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    mostrarStatus("Preparando banner... isso pode levar alguns segundos.");
    // Pode selecionar uma imagem grande; ela é automaticamente reduzida para o perfil.
    bannerBase64 = await carregarImagem(file, 1800, 650, 650000);
    bannerSelecionado = bannerBase64;
    setPreviewImage(bannerPreview, bannerBase64);
    mostrarStatus("Banner pronto para salvar.", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarStatus(error.message, "erro");
    event.target.value = "";
  }
});

btnSalvar?.addEventListener("click", async () => {
  if (!usuarioAtual) return;

  const nome = truncateText(nomeInput.value, 80);
  const bio = truncateText(bioInput.value, 160);
  const empresa = truncateText(empresaInput.value, 100);
  const site = normalizeUrl(siteInput.value);

  if (!nome) {
    mostrarStatus("Digite um nome antes de salvar.", "erro");
    return;
  }
  if (siteInput.value.trim() && !site) {
    mostrarStatus("Digite um link válido, por exemplo: https://seusite.com", "erro");
    return;
  }

  const fotoSegura =
    sanitizeMediaUrl(fotoSelecionada) ||
    sanitizeMediaUrl(fotoBase64) ||
    sanitizeMediaUrl(usuarioAtual.photoURL) ||
    "";

  const bannerSeguro =
    sanitizeMediaUrl(bannerSelecionado) ||
    sanitizeMediaUrl(bannerBase64) ||
    "";

  try {
    mostrarStatus("Salvando perfil...");
    const userRef = doc(db, "usuarios", usuarioAtual.uid);
    const userSnap = await getDoc(userRef);
    const dados = {
      nome,
      bio,
      foto: fotoSegura,
      banner: bannerSeguro,
      empresa,
      site,
      molduraPerfil: molduraSelecionada || "",
      decoracaoAtiva: decoracaoInput?.checked === true,
      nomeGlowAtivo: nomeGlowInput?.checked === true
    };

    if (userSnap.exists()) await updateDoc(userRef, dados);
    else await setDoc(userRef, {
      uid: usuarioAtual.uid,
      ...dados,
      email: usuarioAtual.email || "",
      badges: [],
      admin: false,
      banido: false,
      moldurasDesbloqueadas: [],
      bannersDesbloqueados: [],
      fotosDesbloqueadas: [],
      vipAtivo: false
    });

    mostrarStatus("Perfil salvo com sucesso!", "sucesso");
    setTimeout(() => window.location.href = "./perfil.html", 650);
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    if (error?.code === "resource-exhausted" || String(error?.message || "").toLowerCase().includes("size")) {
      mostrarStatus("O perfil ficou grande demais. As imagens já são compactadas; tente uma foto ou banner diferente.", "erro");
    } else {
      mostrarStatus("Não foi possível salvar o perfil.", "erro");
    }
  }
});


decoracaoInput?.addEventListener("change", atualizarPreviewAvatar);
