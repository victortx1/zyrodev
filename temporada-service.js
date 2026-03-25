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
        banido: false
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
        updatedAt: serverTimestamp()
      });

      console.log("Usuário já existia, dados atualizados sem sobrescrever perfil personalizado.");
    }
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
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

    return userSnap.data();
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}