import { db } from "./firebase.js";
import { doc, getDoc, runTransaction, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const MIN_ZYRO_ID = 180000000;
const MAX_ZYRO_ID = 180009999;

function normalizarNumero(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= MIN_ZYRO_ID && n <= MAX_ZYRO_ID ? n : null;
}

function hashUid(uid) {
  let hash = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    hash ^= uid.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function candidato(uid, tentativa = 0) {
  const faixa = MAX_ZYRO_ID - MIN_ZYRO_ID + 1;
  return MIN_ZYRO_ID + ((hashUid(uid) + tentativa * 104729) % faixa);
}

export async function garantirIdZyro(uid) {
  if (!uid) throw new Error("UID não informado.");

  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("Perfil Zyro não encontrado.");

  const existente = normalizarNumero(userSnap.data()?.idZyro);
  if (existente) return existente;

  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const id = candidato(uid, tentativa);
    const idRef = doc(db, "zyroIds", String(id));
    let reservado = false;

    try {
      await runTransaction(db, async (tx) => {
        const idSnap = await tx.get(idRef);
        if (idSnap.exists()) {
          const dono = idSnap.data()?.uid;
          if (dono === uid) reservado = true;
          return;
        }

        tx.set(idRef, {
          uid,
          criadoEm: new Date().toISOString()
        });
        reservado = true;
      });
    } catch (error) {
      console.warn("Falha ao reservar ID Zyro", id, error);
      continue;
    }

    if (!reservado) continue;

    try {
      await updateDoc(userRef, { idZyro: id });
      return id;
    } catch (error) {
      console.error("Não foi possível salvar idZyro no perfil:", error);
      throw error;
    }
  }

  throw new Error("Não foi possível gerar um ID Zyro único.");
}

export async function buscarUidPorIdZyro(id) {
  const numero = normalizarNumero(String(id).replace(/\D/g, ""));
  if (!numero) return null;
  const snap = await getDoc(doc(db, "zyroIds", String(numero)));
  return snap.exists() ? snap.data()?.uid || null : null;
}

export { MIN_ZYRO_ID };
