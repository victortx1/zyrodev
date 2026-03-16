import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { criarOuAtualizarUsuario } from "./temporada-service.js";

const provider = new GoogleAuthProvider();
const btnGoogle = document.getElementById("btnGoogle");
const erroLogin = document.getElementById("erroLogin");

async function iniciar() {
  try {
    await setPersistence(auth, browserLocalPersistence);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await criarOuAtualizarUsuario(user);
          window.location.href = "./perfil.html";
        } catch (error) {
          console.error("Erro ao salvar usuário no Firestore:", error);
          erroLogin.textContent = "Erro ao carregar sua conta.";
        }
      }
    });

    btnGoogle?.addEventListener("click", async () => {
      erroLogin.textContent = "";

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await criarOuAtualizarUsuario(user);

        window.location.href = "./perfil.html";
      } catch (error) {
        console.error("Erro no login com Google:", error);
        erroLogin.textContent = "Erro ao entrar com Google.";
      }
    });
  } catch (error) {
    console.error("Erro ao iniciar login:", error);
    erroLogin.textContent = "Erro ao configurar login.";
  }
}

iniciar();