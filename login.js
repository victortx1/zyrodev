import { auth, db } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { usuarioEstaBanido } from "./security-utils.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const $ = (id) => document.getElementById(id);
const btnGoogle = $("btnGoogle");
const btnSubmit = document.querySelector(".submit-btn");
const nomeInput = $("nomeInput");
const emailInput = $("emailInput");
const senhaInput = $("senhaInput");
const erroLogin = $("erroLogin");
const modeLink = document.querySelector(".register-row a");
const title = document.querySelector(".form-content h1");
const divider = document.querySelector(".divider");
const forgot = $("forgotPassword");

let mode = "register";
let busy = false;

function showError(message = "") {
  if (erroLogin) erroLogin.textContent = message;
}

function setBusy(value) {
  busy = value;
  if (btnGoogle) btnGoogle.disabled = value;
  if (btnSubmit) btnSubmit.disabled = value;
  if (value) {
    if (btnSubmit) btnSubmit.textContent = mode === "register" ? "Criando conta..." : "Entrando...";
  } else {
    updateTexts();
  }
}

function updateTexts() {
  if (title) title.textContent = mode === "register" ? "Create Account" : "Login";
  if (btnSubmit) btnSubmit.textContent = mode === "register" ? "Create Account" : "Entrar";
  if (modeLink) modeLink.textContent = mode === "register" ? "Login" : "Criar conta";
  if (divider) divider.textContent = "or";
  if (nomeInput) {
    nomeInput.disabled = false;
    nomeInput.style.display = mode === "register" ? "" : "none";
    nomeInput.required = mode === "register";
  }
  if (emailInput) emailInput.disabled = false;
  if (senhaInput) {
    senhaInput.disabled = false;
    senhaInput.autocomplete = mode === "register" ? "new-password" : "current-password";
  }
  if (btnSubmit) btnSubmit.disabled = false;
  if (forgot) forgot.style.display = mode === "login" ? "block" : "none";
  const registerRow = document.querySelector(".register-row");
  if (registerRow) {
    registerRow.firstChild.textContent = mode === "register"
      ? "Já tenho uma conta? "
      : "Ainda não tenho uma conta? ";
  }
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function validate() {
  const email = String(emailInput?.value || "").trim().toLowerCase();
  const senha = String(senhaInput?.value || "");
  const nome = normalizeName(nomeInput?.value);

  if (!email) return "Digite seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Digite um e-mail válido.";
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  if (mode === "register" && nome.length < 2) return "Digite seu nome.";
  if (mode === "register" && nome.length > 80) return "O nome deve ter no máximo 80 caracteres.";
  return null;
}

function firebaseError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "Este e-mail já possui uma conta. Clique em Login para entrar.",
    "auth/invalid-email": "O e-mail informado é inválido.",
    "auth/weak-password": "A senha é muito fraca. Use pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Não encontramos uma conta com este e-mail.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Tente novamente ou permita pop-ups para este site.",
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase Authentication.",
    "auth/operation-not-allowed": "Este método de login ainda não foi ativado no Firebase Authentication.",
    "auth/account-exists-with-different-credential": "Este e-mail já está cadastrado com outro método de login.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet e tente novamente.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente."
  };
  return messages[code] || `Não foi possível concluir: ${error?.message || "erro desconhecido"}`;
}

export async function criarOuAtualizarUsuario(user, nomePreferido = "") {
  if (!user?.uid) throw new Error("Usuário do Firebase não encontrado.");

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  const existente = snap.exists() ? snap.data() : {};
  const nome = normalizeName(nomePreferido) || existente.nome || normalizeName(user.displayName) || "Usuário ZyroDev";
  const foto = user.photoURL || existente.foto || "";

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      nome,
      email: user.email || "",
      foto,
      bio: "",
      instagram: existente.instagram || "",
      github: existente.github || "",
      videoPerfil: existente.videoPerfil || "",
      admin: false,
      banido: false,
      fundador: false,
      pontos: 0,
      likesRecebidos: 0,
      totalCoins: 0,
      vipAtivo: false,
      vipPagoAtivo: false,
      badges: [],
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });
  } else {
    const updates = { atualizadoEm: serverTimestamp() };
    if (!existente.nome || existente.nome === "Usuário ZyroDev") updates.nome = nome;
    if (!existente.email && user.email) updates.email = user.email;
    if (!existente.foto && foto) updates.foto = foto;
    await setDoc(ref, updates, { merge: true });
  }

  return { ...existente, uid: user.uid, nome, email: user.email || existente.email || "", foto };
}

async function bloquearSeBanido(user) {
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (snap.exists() && usuarioEstaBanido(snap.data())) {
    await signOut(auth);
    showError("Sua conta foi suspensa. Entre em contato com a administração.");
    return true;
  }
  return false;
}

async function finalizarLogin(user, nome = "") {
  if (!user) return;
  await criarOuAtualizarUsuario(user, nome);
  if (await bloquearSeBanido(user)) return;
  window.location.href = "./perfil.html";
}

async function entrarGoogle() {
  showError("");
  setBusy(true);
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Erro no Google:", error);
    if (error?.code === "auth/popup-blocked" || error?.code === "auth/popup-closed-by-user") {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectError) {
        console.error("Erro no redirect do Google:", redirectError);
        showError(firebaseError(redirectError));
      }
    } else {
      showError(firebaseError(error));
    }
    setBusy(false);
  }
}

async function enviarFormulario() {
  if (busy) return;
  showError("");

  const validation = validate();
  if (validation) {
    showError(validation);
    return;
  }

  setBusy(true);
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value;
  const nome = normalizeName(nomeInput.value);

  try {
    if (mode === "register") {
      const credential = await createUserWithEmailAndPassword(auth, email, senha);
      if (nome) await updateProfile(credential.user, { displayName: nome });
      await criarOuAtualizarUsuario(credential.user, nome);
      await finalizarLogin(credential.user, nome);
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, senha);
      await finalizarLogin(credential.user);
    }
  } catch (error) {
    console.error("Erro no cadastro/login:", error);
    showError(firebaseError(error));
    setBusy(false);
  }
}

async function recuperarSenha() {
  showError("");
  const email = String(emailInput?.value || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Digite seu e-mail para recuperar a senha.");
    emailInput?.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showError("Se existir uma conta com este e-mail, enviaremos as instruções de recuperação.");
  } catch (error) {
    console.error("Erro ao recuperar senha:", error);
    showError(firebaseError(error));
  }
}

async function iniciar() {
  try {
    await setPersistence(auth, browserLocalPersistence);

    try {
      const redirect = await getRedirectResult(auth);
      if (redirect?.user) await finalizarLogin(redirect.user);
    } catch (error) {
      console.error("Erro no retorno do Google:", error);
      showError(firebaseError(error));
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await finalizarLogin(user);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        showError("Não foi possível carregar sua conta. Verifique se o Firestore está configurado.");
        setBusy(false);
      }
    });

    btnGoogle?.addEventListener("click", entrarGoogle);
    btnSubmit?.addEventListener("click", enviarFormulario);
    modeLink?.addEventListener("click", (event) => {
      event.preventDefault();
      mode = mode === "register" ? "login" : "register";
      showError("");
      if (senhaInput) senhaInput.value = "";
      updateTexts();
    });
    forgot?.addEventListener("click", (event) => {
      event.preventDefault();
      recuperarSenha();
    });

    [nomeInput, emailInput, senhaInput].forEach((input) => {
      input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") enviarFormulario();
      });
    });

    updateTexts();
  } catch (error) {
    console.error("Erro ao iniciar autenticação:", error);
    showError("Erro ao configurar o login. Confira a configuração do Firebase.");
  }
}

iniciar();
