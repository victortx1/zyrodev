const { verificarTokenFirebase, getDb } = require('../_lib/firebaseAdmin');
const { getProduct } = require('../_lib/products');
const { criarPreferencia } = require('../_lib/mercadopago');

function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Método não permitido.' });

  try {
    const decoded = await verificarTokenFirebase(req);
    const produtoId = req.body?.produtoId;
    const produto = getProduct(produtoId);

    if (!produto) return send(res, 400, { error: 'Produto inválido.' });

    const db = getDb();
    const orderRef = db.collection('pedidos').doc();
    const orderId = orderRef.id;
    const siteUrl = String(process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');

    if (!siteUrl) return send(res, 500, { error: 'PUBLIC_SITE_URL não configurada.' });

    const pedido = {
      orderId,
      uid: decoded.uid,
      email: decoded.email || '',
      produtoId,
      produtoNome: produto.nome,
      tipo: produto.tipo,
      molduraId: produto.molduraId || null,
      valor: produto.valor,
      status: 'pendente',
      provedor: 'mercadopago',
      criadoEm: new Date().toISOString()
    };

    await orderRef.set(pedido);

    const preference = await criarPreferencia({
      items: [{
        id: produtoId,
        title: produto.nome,
        description: `Compra ${produto.nome} - ZyroDev`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: produto.valor
      }],
      payer: decoded.email ? { email: decoded.email } : undefined,
      external_reference: orderId,
      notification_url: `${siteUrl}/api/webhook-mercadopago`,
      back_urls: {
        success: `${siteUrl}/pagamento-retorno.html?orderId=${encodeURIComponent(orderId)}&status=success`,
        failure: `${siteUrl}/pagamento-retorno.html?orderId=${encodeURIComponent(orderId)}&status=failure`,
        pending: `${siteUrl}/pagamento-retorno.html?orderId=${encodeURIComponent(orderId)}&status=pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'ZYRODEV'
    });

    await orderRef.update({
      preferenceId: preference.id || null,
      checkoutUrl: preference.init_point || preference.sandbox_init_point || null
    });

    const checkoutUrl = preference.init_point || preference.sandbox_init_point;
    if (!checkoutUrl) {
      throw new Error('Mercado Pago não retornou o link do checkout.');
    }

    return send(res, 200, { orderId, checkoutUrl, preferenceId: preference.id || null });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return send(res, error.statusCode || 500, {
      error: error.message || 'Não foi possível criar o pagamento.'
    });
  }
};
