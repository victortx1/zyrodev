function getAsaasBaseUrl() {
  return (process.env.ASAAS_BASE_URL || "https://api-sandbox.asaas.com/v3").replace(/\/$/, "");
}

async function asaasRequest(path, options = {}) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error("ASAAS_API_KEY não configurada.");

  const response = await fetch(`${getAsaasBaseUrl()}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      access_token: apiKey,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    const description = data?.errors?.map?.((e) => e.description).filter(Boolean).join("; ") || data?.message || `Asaas HTTP ${response.status}`;
    throw new Error(description);
  }

  return data;
}

module.exports = { asaasRequest };
