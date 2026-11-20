const { verificarTokenFirebase, getDb } = require('../_lib/firebaseAdmin');
const { buscarPagamento } = require('../_lib/mercadopago');

function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Método não permitido.' });

  try {
    const decoded = await verificarTokenFirebase(req);
    const orderId = String(req.query?.orderId || '').trim();
    if (!orderId) return send(res, 400, { error: 'orderId não informado.' });

    const db = getDb();
    const ref = db.collection('pedidos').doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) return send(res, 404, { error: 'Pedido não encontrado.' });

    const pedido = snap.data();
    if (pedido.uid !== decoded.uid) return send(res, 403, { error: 'Este pedido não pertence a esta conta.' });

    return send(res, 200, {
      orderId,
      status: pedido.status || 'pendente',
      produtoNome: pedido.produtoNome || '',
      valor: pedido.valor || 0,
      paymentId: pedido.paymentId || null
    });
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    return send(res, error.statusCode || 500, { error: error.message || 'Falha ao consultar pedido.' });
  }
};
