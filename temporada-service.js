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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        badges: badgesIniciais,
        admin: false,
        banido: false
      });

      console.log("Usuário criado com sucesso!");
    } else {
      const dados = userSnap.data();

      const badgesAtuais = Array.isArray(dados.badges) ? dados.badges : [];

      await updateDoc(userRef, {
        nome: user.displayName || dados.nome || "Usuário",
        email: user.email || dados.email || "",
        foto: user.photoURL || dados.foto || "",
        bio: dados.bio || "",
        badges: badgesAtuais,
        updatedAt: serverTimestamp()
      });

      console.log("Usuário já existia, dados atualizados.");
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