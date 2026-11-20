const MP_API_URL = 'https://api.mercadopago.com';

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
  return token;
}

async function mpRequest(path, options = {}) {
  const response = await fetch(`${MP_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }

  if (!response.ok) {
    const detail = data?.message || data?.error || `HTTP ${response.status}`;
    const error = new Error(`Mercado Pago: ${detail}`);
    error.statusCode = response.status;
    error.providerResponse = data;
    throw error;
  }

  return data;
}

async function criarPreferencia(body) {
  return mpRequest('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function buscarPagamento(paymentId) {
  return mpRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

module.exports = { criarPreferencia, buscarPagamento };
