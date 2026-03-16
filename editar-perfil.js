import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fotoPreview = document.getElementById("fotoPreview");
const fotoInput = document.getElementById("fotoInput");
const nomeInput = document.getElementById("nomeInput");
const bioInput = document.getElementById("bioInput");
const btnSalvar = document.getElementById("btnSalvar");
const statusMsg = document.getElementById("statusMsg");

let usuarioAtual = null;
let fotoBase64 = "";

function mostrarStatus(texto, tipo = "") {
  statusMsg.textContent = texto;
  statusMsg.className = `status ${tipo}`.trim();
}

function arquivoParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
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

    if (userSnap.exists()) {
      const dados = userSnap.data();

      nomeInput.value = dados?.nome || user.displayName || "";
      bioInput.value = dados?.bio || "";
      fotoBase64 = dados?.foto || user.photoURL || "";
      fotoPreview.src = fotoBase64 || "https://via.placeholder.com/150";
    } else {
      nomeInput.value = user.displayName || "";
      bioInput.value = "";
      fotoBase64 = user.photoURL || "";
      fotoPreview.src = fotoBase64 || "https://via.placeholder.com/150";
    }
  } catch (error) {
    console.error("Erro ao carregar dados do perfil:", error);
    mostrarStatus("Erro ao carregar perfil.", "erro");
  }
});

fotoInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const base64 = await arquivoParaBase64(file);
    fotoBase64 = base64;
    fotoPreview.src = base64;
  } catch (error) {
    console.error("Erro ao ler imagem:", error);
    mostrarStatus("Erro ao carregar a imagem.", "erro");
  }
});

btnSalvar?.addEventListener("click", async () => {
  if (!usuarioAtual) return;

  const nome = nomeInput.value.trim();
  const bio = bioInput.value.trim();

  if (!nome) {
    mostrarStatus("Digite um nome antes de salvar.", "erro");
    return;
  }

  try {
    mostrarStatus("Salvando...");

    const userRef = doc(db, "usuarios", usuarioAtual.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        nome,
        bio,
        foto: fotoBase64 || usuarioAtual.photoURL || ""
      });
    } else {
      await setDoc(userRef, {
        uid: usuarioAtual.uid,
        nome,
        bio,
        foto: fotoBase64 || usuarioAtual.photoURL || "",
        email: usuarioAtual.email || "",
        badges: [],
        admin: false,
        banido: false
      });
    }

    mostrarStatus("Perfil salvo com sucesso.", "sucesso");

    setTimeout(() => {
      window.location.href = "./perfil.html";
    }, 900);
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    mostrarStatus("Não foi possível salvar o perfil.", "erro");
  }
});