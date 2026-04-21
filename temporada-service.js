import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { TEMPORADA_1, temporadaAtiva } from "./temporada-config.js";

export async function criarOuAtualizarUsuario(user) {
  try {
    if (!user || !user.uid) {
      console.error("Usuário inválido.");
      return;
    }

    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const badgesIniciais = [];

      if (temporadaAtiva()) {
        badgesIniciais.push(TEMPORADA_1.idBadge);
      }

      await setDoc(userRef, {
        uid: user.uid,
        nome: user.displayName || "Usuário",
        email: user.email || "",
        foto: user.photoURL || "",
        bio: "",
        pontos: 0,
        likesRecebidos: 0,
        badges: badgesIniciais,
        instagram: "",
        github: "",
        aulasConcluidas: {},
        cursosCompletos: {},
        ultimoLoginPontuado: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        admin: false,
        banido: false,

        totalCoins: 0,
        ownedSkins: [],
        equippedSkin: "",
        skinVipAtiva: false,

        vipAtivo: false,
        vipFim: "",
        vipTipo: "",
        vipCompradoEm: "",
        vipBonusMultiplicador: 1,

        vipPagoAtivo: false,
        vipPagoTipo: "",
        vipPagoCompradoEm: "",
        vipPagoBeneficiosEntregues: {
          moedas: false,
          likes: false,
          skin: false
        }
      });

      console.log("Usuário criado com sucesso!");
    } else {
      const dados = userSnap.data();

      const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];
      const bioAtual = typeof dados.bio === "string" ? dados.bio : "";
      const pontosAtuais = Number(dados.pontos || 0);
      const likesAtuais = Number(dados.likesRecebidos || 0);
      const instagramAtual = typeof dados.instagram === "string" ? dados.instagram : "";
      const githubAtual = typeof dados.github === "string" ? dados.github : "";
      const aulasConcluidasAtuais =
        dados.aulasConcluidas && typeof dados.aulasConcluidas === "object"
          ? dados.aulasConcluidas
          : {};
      const cursosCompletosAtuais =
        dados.cursosCompletos && typeof dados.cursosCompletos === "object"
          ? dados.cursosCompletos
          : {};
      const ultimoLoginPontuadoAtual =
        typeof dados.ultimoLoginPontuado === "string"
          ? dados.ultimoLoginPontuado
          : "";

      const nomeAtual =
        typeof dados.nome === "string" && dados.nome.trim() !== ""
          ? dados.nome
          : user.displayName || "Usuário";

      const fotoAtual =
        typeof dados.foto === "string" && dados.foto.trim() !== ""
          ? dados.foto
          : user.photoURL || "";

      const emailAtual =
        typeof dados.email === "string" && dados.email.trim() !== ""
          ? dados.email
          : user.email || "";

      const vipPagoBeneficiosEntreguesAtuais =
        dados.vipPagoBeneficiosEntregues &&
        typeof dados.vipPagoBeneficiosEntregues === "object"
          ? {
              moedas: Boolean(dados.vipPagoBeneficiosEntregues.moedas || false),
              likes: Boolean(dados.vipPagoBeneficiosEntregues.likes || false),
              skin: Boolean(dados.vipPagoBeneficiosEntregues.skin || false)
            }
          : {
              moedas: false,
              likes: false,
              skin: false
            };

      await updateDoc(userRef, {
        nome: nomeAtual,
        email: emailAtual,
        foto: fotoAtual,
        bio: bioAtual,
        pontos: pontosAtuais,
        likesRecebidos: likesAtuais,
        badges: badgesAtuais,
        instagram: instagramAtual,
        github: githubAtual,
        aulasConcluidas: aulasConcluidasAtuais,
        cursosCompletos: cursosCompletosAtuais,
        ultimoLoginPontuado: ultimoLoginPontuadoAtual,
        updatedAt: serverTimestamp(),

        totalCoins: Number(dados.totalCoins || 0),
        ownedSkins: Array.isArray(dados.ownedSkins) ? dados.ownedSkins : [],
        equippedSkin: typeof dados.equippedSkin === "string" ? dados.equippedSkin : "",
        skinVipAtiva: Boolean(dados.skinVipAtiva || false),

        vipAtivo: Boolean(dados.vipAtivo || false),
        vipFim: typeof dados.vipFim === "string" ? dados.vipFim : "",
        vipTipo: typeof dados.vipTipo === "string" ? dados.vipTipo : "",
        vipCompradoEm: typeof dados.vipCompradoEm === "string" ? dados.vipCompradoEm : "",
        vipBonusMultiplicador: Number(dados.vipBonusMultiplicador || 1),

        vipPagoAtivo: Boolean(dados.vipPagoAtivo || false),
        vipPagoTipo: typeof dados.vipPagoTipo === "string" ? dados.vipPagoTipo : "",
        vipPagoCompradoEm:
          typeof dados.vipPagoCompradoEm === "string" ? dados.vipPagoCompradoEm : "",
        vipPagoBeneficiosEntregues: vipPagoBeneficiosEntreguesAtuais
      });

      console.log("Usuário já existia, dados atualizados sem sobrescrever perfil personalizado.");
    }
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
  }
}

async function aplicarBeneficiosVipPagoSeNecessario(userRef, dados) {
  try {
    const vipPagoAtivo = Boolean(dados?.vipPagoAtivo);
    const vipPagoTipo = String(dados?.vipPagoTipo || "").toLowerCase().trim();

    if (!vipPagoAtivo || vipPagoTipo !== "perola_negra") {
      return dados;
    }

    const beneficios =
      dados?.vipPagoBeneficiosEntregues &&
      typeof dados.vipPagoBeneficiosEntregues === "object"
        ? dados.vipPagoBeneficiosEntregues
        : {};

    const ownedSkins = Array.isArray(dados?.ownedSkins) ? dados.ownedSkins : [];
    const badges = Array.isArray(dados?.badges) ? dados.badges : [];

    const updates = {};
    let houveMudanca = false;

    if (!badges.includes("vip_perola_negra")) {
      updates.badges = [...badges, "vip_perola_negra"];
      houveMudanca = true;
    }

    if (beneficios.moedas !== true) {
      updates.totalCoins = Number(dados?.totalCoins || 0) + 1000;
      updates["vipPagoBeneficiosEntregues.moedas"] = true;
      houveMudanca = true;
    }

    if (beneficios.likes !== true) {
      updates.likesRecebidos = Number(dados?.likesRecebidos || 0) + 500;
      updates["vipPagoBeneficiosEntregues.likes"] = true;
      houveMudanca = true;
    }

    if (beneficios.skin !== true) {
      if (!ownedSkins.includes("rumperolanegra")) {
        updates.ownedSkins = [...ownedSkins, "rumperolanegra"];
      }
      updates["vipPagoBeneficiosEntregues.skin"] = true;
      houveMudanca = true;
    }

    if (!houveMudanca) {
      return dados;
    }

    updates.updatedAt = serverTimestamp();

    await updateDoc(userRef, updates);

    return {
      ...dados,
      badges: updates.badges || badges,
      ownedSkins: updates.ownedSkins || ownedSkins,
      totalCoins:
        updates.totalCoins !== undefined
          ? updates.totalCoins
          : Number(dados?.totalCoins || 0),
      likesRecebidos:
        updates.likesRecebidos !== undefined
          ? updates.likesRecebidos
          : Number(dados?.likesRecebidos || 0),
      vipPagoBeneficiosEntregues: {
        moedas:
          beneficios.moedas === true ||
          updates["vipPagoBeneficiosEntregues.moedas"] === true,
        likes:
          beneficios.likes === true ||
          updates["vipPagoBeneficiosEntregues.likes"] === true,
        skin:
          beneficios.skin === true ||
          updates["vipPagoBeneficiosEntregues.skin"] === true
      }
    };
  } catch (error) {
    console.error("Erro ao aplicar benefícios do VIP pago:", error);
    return dados;
  }
}

export async function buscarDadosUsuario(uid) {
  try {
    if (!uid) {
      console.error("UID não informado.");
      return null;
    }

    const userRef = doc(db, "usuarios", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    let dados = userSnap.data();
    dados = await aplicarBeneficiosVipPagoSeNecessario(userRef, dados);

    return dados;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

export async function verificarEAtualizarVip(uid) {
  try {
    if (!uid) return null;

    const userRef = doc(db, "usuarios", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const dados = userSnap.data();
    const vipAtivo = Boolean(dados.vipAtivo);
    const vipFim = typeof dados.vipFim === "string" ? dados.vipFim : "";
    const badges = Array.isArray(dados.badges) ? dados.badges : [];

    if (!vipAtivo || !vipFim) {
      return dados;
    }

    const agora = new Date();
    const dataFim = new Date(vipFim);

    if (isNaN(dataFim.getTime())) {
      return dados;
    }

    if (agora > dataFim) {
      const badgesSemVip = badges.filter((b) => b !== "vip");

      await updateDoc(userRef, {
        vipAtivo: false,
        vipFim: "",
        vipTipo: "",
        vipCompradoEm: "",
        vipBonusMultiplicador: 1,
        skinVipAtiva: false,
        badges: badgesSemVip,
        updatedAt: serverTimestamp()
      });

      return {
        ...dados,
        vipAtivo: false,
        vipFim: "",
        vipTipo: "",
        vipCompradoEm: "",
        vipBonusMultiplicador: 1,
        skinVipAtiva: false,
        badges: badgesSemVip
      };
    }

    return dados;
  } catch (error) {
    console.error("Erro ao verificar VIP:", error);
    return null;
  }
}