import { db } from "./firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function buscarDadosUsuario(uid) {
  if (!uid) return {};
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? snap.data() : {};
}

export async function verificarEAtualizarVip(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  if (!snap.exists()) return {};
  const dados = snap.data();
  if (dados.vipAtivo === true && dados.vipFim) {
    const fim = new Date(dados.vipFim);
    if (!Number.isNaN(fim.getTime()) && fim <= new Date()) {
      const badges = Array.isArray(dados.badges) ? dados.badges.filter(b => b !== "vip_nova_era") : [];
      await updateDoc(doc(db, "usuarios", uid), {
        vipAtivo: false,
        vipTipo: "",
        vipFim: "",
        badges
      });
      return { ...dados, vipAtivo:false, vipTipo:"", vipFim:"", badges };
    }
  }
  return dados;
}
