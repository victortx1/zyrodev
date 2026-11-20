const { adminDb } = require("./_lib/firebaseAdmin");
const { asaasRequest } = require("./_lib/asaas");
const { FieldValue } = require("./_lib/firebaseAdmin");
const { getProduct } = require("./_lib/products");

function send(res, status, body) { return res.status(status).json(body); }

function validarWebhook(req) {
  const esperado = String(process.env.ASAAS_WEBHOOK_TOKEN || "");
  const recebido = String(req.headers["asaas-access-token"] || "");
  return !!esperado && recebido === esperado;
}

async function localizarPedido(db, body) {
  const recurso = body?.checkout || body?.payment || {};
  let externalReference = recurso.externalReference || body?.externalReference || "";

  if (!externalReference && recurso.id && body?.event?.startsWith?.("CHECKOUT_")) {
    try {
      const checkout = await asaasRequest(`/checkouts/${encodeURIComponent(recurso.id)}`, { method: "GET" });
      externalReference = checkout.externalReference || "";
    } catch (e) {
      console.warn("Não foi possível consultar checkout pelo ID:", e.message);
    }
  }

  if (!externalReference) return null;
  const snap = await db.collection("pedidos").doc(externalReference).get();
  return snap.exists ? { ref: snap.ref, data: snap.data() } : null;
}

async function liberarProduto(db, pedido) {
  const product = getProduct(pedido.produtoId);
  if (!product) throw new Error(`Produto não encontrado: ${pedido.produtoId}`);

  const userRef = db.collection("usuarios").doc(pedido.uid);
  const orderRef = pedido.ref;

  await db.runTransaction(async (tx) => {
    const [userSnap, orderSnap] = await Promise.all([tx.get(userRef), tx.get(orderRef)]);
    if (!orderSnap.exists) throw new Error("Pedido não encontrado durante a transação.");
    const order = orderSnap.data();

    if (order.status === "pago") return;

    const user = userSnap.exists ? userSnap.data() : {};
    const badges = Array.isArray(user.badges) ? [...user.badges] : [];
    const molduras = Array.isArray(user.moldurasDesbloqueadas) ? [...user.moldurasDesbloqueadas] : [];
    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (product.type === "vip") {
      if (!badges.includes("vip_nova_era")) badges.push("vip_nova_era");
      if (!molduras.includes("moldura_vip_nova_era")) molduras.push("moldura_vip_nova_era");

      const bonusJaAplicado = user.vipNovaEraBonusAplicado === true;
      updates.vipAtivo = true;
      updates.vipFim = "";
      updates.vipTipo = "nova_era";
      updates.vipCompradoEm = new Date().toISOString();
      updates.vipNovaEraBonusAplicado = true;
      updates.badges = badges;
      updates.moldurasDesbloqueadas = molduras;
      updates.nomeGlowAtivo = true;
      updates.perfilCor = user.perfilCor || "#ff6a00";
      if (!user.molduraPerfil) updates.molduraPerfil = "./fotosloja/moldura-vip-nova-era.svg";
      if (!bonusJaAplicado) updates.likesRecebidos = Number(user.likesRecebidos || 0) + 500;
    } else if (product.type === "frame") {
      if (!molduras.includes(product.frameId)) molduras.push(product.frameId);
      updates.moldurasDesbloqueadas = molduras;
    }

    tx.set(userRef, updates, { merge: true });
    tx.update(orderRef, {
      status: "pago",
      pagoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Método não permitido." });
  if (!validarWebhook(req)) return send(res, 401, { error: "Webhook não autorizado." });

  try {
    const body = req.body || {};
    const eventId = String(body.id || "");
    const event = String(body.event || "");
    if (!eventId) return send(res, 400, { error: "Evento sem ID." });

    const db = adminDb();
    const eventRef = db.collection("asaas_webhook_events").doc(eventId);
    const already = await eventRef.get();
    if (already.exists) return send(res, 200, { ok: true, duplicate: true });

    await eventRef.set({
      eventId,
      event,
      recebidoEm: new Date().toISOString()
    });

    if (event === "CHECKOUT_PAID") {
      const pedido = await localizarPedido(db, body);
      if (!pedido) {
        console.warn("CHECKOUT_PAID sem pedido correspondente", body);
        return send(res, 200, { ok: true, processed: false });
      }
      await liberarProduto(db, pedido);
    } else if (event === "CHECKOUT_CANCELED" || event === "CHECKOUT_EXPIRED") {
      const pedido = await localizarPedido(db, body);
      if (pedido && pedido.data.status !== "pago") {
        await pedido.ref.update({ status: event === "CHECKOUT_EXPIRED" ? "expirado" : "cancelado", atualizadoEm: new Date().toISOString() });
      }
    }

    return send(res, 200, { ok: true });
  } catch (error) {
    console.error("[WEBHOOK ASAAS]", error);
    return send(res, 500, { error: "Erro ao processar webhook." });
  }
};
