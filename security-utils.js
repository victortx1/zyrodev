/**
 * Utilitários de segurança compartilhados (XSS, URLs, UIDs, rate limit).
 * Importar como módulo ES: import { escapeHtml, ... } from "./security-utils.js";
 */

export function escapeHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttr(texto = "") {
  return escapeHtml(texto).replaceAll("`", "&#096;");
}

/**
 * Valida UID do Firebase Auth (alfanumérico, tamanho típico 20–128).
 */
export function isValidUid(uid) {
  return typeof uid === "string" && /^[a-zA-Z0-9]{20,128}$/.test(uid);
}

/**
 * Permite apenas URLs http(s), caminhos relativos ou data:image/* (base64 de foto).
 */
export function sanitizeMediaUrl(url) {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("./") || trimmed.startsWith("/")) {
    return trimmed.replace(/[<>"']/g, "");
  }

  if (trimmed.startsWith("data:image/")) {
    if (trimmed.length > 2_000_000) return "";
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return "";
  }

  return "";
}

/**
 * Links sociais: apenas http(s) para evitar javascript: e data:.
 */
export function sanitizeSocialUrl(url) {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return "";
  }

  return "";
}

export function truncateText(text, maxLen = 500) {
  const str = String(text ?? "").trim();
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

/**
 * Rate limiter simples no cliente (dissuasão; a proteção real está nas Rules).
 */
export function createRateLimiter(minIntervalMs = 1000) {
  let lastCall = 0;

  return function canProceed() {
    const now = Date.now();
    if (now - lastCall < minIntervalMs) return false;
    lastCall = now;
    return true;
  };
}

/**
 * Verifica se usuário está banido e retorna true se banido.
 */
export function usuarioEstaBanido(dados = {}) {
  return dados?.banido === true;
}
