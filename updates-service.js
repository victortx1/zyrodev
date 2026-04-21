import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function buscarUpdates() {
  try {
    const ref = collection(db, "updates");
    const snap = await getDocs(ref);

    const lista = [];

    snap.forEach((doc) => {
      lista.push(doc.data());
    });

    return lista;
  } catch (error) {
    console.error("Erro ao buscar updates:", error);
    return [];
  }
}