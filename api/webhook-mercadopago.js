const crypto = require('crypto');
const { getDb } = require('./_lib/firebaseAdmin');
const { buscarPagamento } = require('./_lib/mercadopago');

function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function hmacHex(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function validarAssinatura(req, paymentId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  if (!xSignature || !xRequestId) return false;

  const parts = String(xSignature).split(',').map(v => v.trim());
  const tsPart = parts.find(v => v.startsWith('ts='));
  const v1Part = parts.find(v => v.startsWith('v1='));
  if (!tsPart || !v1Part) return false;

  const ts = tsPart.slice(3);
  const received = v1Part.slice(3);
  const manifest = `id:${String(paymentId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = hmacHex(manifest, secret);

  try {
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch (_) {
    return false;
  }
}

async function aplicarBeneficio(db, pedido, payment) {
  const userRef = db.collection('usuarios').doc(pedido.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new Error('Usuário do pedido não encontrado.');

  const dados = userSnap.data() || {};
  const updates = {};

  if (pedido.tipo === 'vip_nova_era') {
    updates.vipAtivo = true;
    updates.vipTipo = 'nova_era';
    updates.vipCompradoEm = new Date().toISOString();
    updates.nomeGlowAtivo = true;
    if (!dados.perfilCor) updates.perfilCor = '#ff6a00';
    updates.decoracaoAtiva = true;

    const badges = Array.isArray(dados.badges) ? [...dados.badges] : [];
    if (!badges.includes('vip')) badges.push('vip');
    if (!badges.includes('vip_nova_era')) badges.push('vip_nova_era');
    updates.badges = badges;

    if (dados.vipNovaEraBonusAplicado !== true) {
      const likes = Number(dados.likesRecebidos || 0);
      updates.likesRecebidos = likes + 500;
      updates.vipNovaEraBonusAplicado = true;
    }

    const molduras = Array.isArray(dados.moldurasDesbloqueadas) ? [...dados.moldurasDesbloqueadas] : [];
    if (!molduras.includes('moldura_nova_era')) molduras.push('moldura_nova_era');
    updates.moldurasDesbloqueadas = molduras;
  }

  if (pedido.tipo === 'moldura' && pedido.molduraId) {
    const molduras = Array.isArray(dados.moldurasDesbloqueadas) ? [...dados.moldurasDesbloqueadas] : [];
    if (!molduras.includes(pedido.molduraId)) molduras.push(pedido.molduraId);
    updates.moldurasDesbloqueadas = molduras;
  }

  await userRef.update(updates);

  await db.collection('pedidos').doc(pedido.orderId).update({
    status: 'pago',
    paymentId: String(payment.id),
    paymentStatus: payment.status,
    pagoEm: new Date().toISOString(),
    beneficioAplicadoEm: new Date().toISOString()
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 200, { ok: true });

  try {
    const body = req.body || {};
    const paymentId = body?.data?.id || req.query?.['data.id'] || req.query?.id;
    const type = body?.type || req.query?.type;

    if (type && type !== 'payment' && !paymentId) return send(res, 200, { ok: true });
    if (!paymentId) return send(res, 400, { error: 'Notificação sem ID de pagamento.' });

    if (!validarAssinatura(req, paymentId)) {
      return send(res, 401, { error: 'Assinatura do webhook inválida.' });
    }

    const payment = await buscarPagamento(paymentId);
    const orderId = payment.external_reference;
    if (!orderId) return send(res, 200, { ok: true, ignored: 'Pagamento sem external_reference.' });

    const db = getDb();
    const orderRef = db.collection('pedidos').doc(String(orderId));
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return send(res, 200, { ok: true, ignored: 'Pedido não encontrado.' });

    const pedido = orderSnap.data();
    if (pedido.provedor !== 'mercadopago') return send(res, 200, { ok: true, ignored: 'Pedido de outro provedor.' });

    if (pedido.status === 'pago') return send(res, 200, { ok: true, alreadyProcessed: true });

    if (payment.status === 'approved') {
      await aplicarBeneficio(db, pedido, payment);
    } else if (['cancelled', 'rejected'].includes(payment.status)) {
      await orderRef.update({
        status: payment.status === 'cancelled' ? 'cancelado' : 'recusado',
        paymentId: String(payment.id),
        paymentStatus: payment.status,
        atualizadoEm: new Date().toISOString()
      });
    } else if (['refunded', 'charged_back'].includes(payment.status)) {
      await orderRef.update({
        status: payment.status,
        paymentId: String(payment.id),
        paymentStatus: payment.status,
        atualizadoEm: new Date().toISOString()
      });
    } else {
      await orderRef.update({
        status: 'pendente',
        paymentId: String(payment.id),
        paymentStatus: payment.status,
        atualizadoEm: new Date().toISOString()
      });
    }

    return send(res, 200, { ok: true });
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return send(res, 500, { error: 'Webhook processado com erro.' });
  }
};
