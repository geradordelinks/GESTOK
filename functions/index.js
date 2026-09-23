/* =========================================
   GESTOK - BACKEND DE PAGAMENTOS
   Mercado Pago + Firebase Admin

   NUNCA coloque ACCESS TOKEN ou WEBHOOK SECRET
   no frontend.
========================================= */

const crypto = require("crypto");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const MP_ACCESS_TOKEN = defineSecret("MP_ACCESS_TOKEN");
const MP_WEBHOOK_SECRET = defineSecret("MP_WEBHOOK_SECRET");
const MP_PUBLIC_KEY = defineString("MP_PUBLIC_KEY", {
  description: "Public Key do Mercado Pago usada pelo frontend.",
});

const VALOR_PLANO = 30.00;
const DIAS_PLANO = 30;

function json(res, status, body) {
  return res.status(status).json(body);
}

function cors(req, res) {
  const origin = req.headers.origin || "";
  // Em produção, se desejar, troque por seu domínio exato.
  const permitido = origin || "*";
  res.set("Access-Control-Allow-Origin", permitido);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization" );
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

async function usuarioAutenticado(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new Error("AUTH_REQUIRED");
  }

  const idToken = header.substring(7).trim();
  if (!idToken) throw new Error("AUTH_REQUIRED");

  return admin.auth().verifyIdToken(idToken);
}

async function lojaDoUsuario(lojaId, uid) {
  if (!lojaId || !uid) return null;

  const ref = db.collection("lojas").doc(String(lojaId));
  const snap = await ref.get();
  if (!snap.exists) return null;

  const loja = snap.data() || {};
  if (loja.donoUid !== uid) return null;

  return { ref, snap, loja };
}

function idempotencyKey(value) {
  const base = String(value || crypto.randomUUID());
  return crypto.createHash("sha256").update(base).digest("hex");
}

async function mpFetch(path, options = {}) {
  const token = MP_ACCESS_TOKEN.value();
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Mercado Pago recusou a operação.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function extrairAssinatura(header) {
  const result = {};
  String(header || "").split(",").forEach((part) => {
    const [key, ...rest] = part.split("=");
    if (!key || !rest.length) return;
    result[key.trim()] = rest.join("=").trim();
  });
  return result;
}

function assinaturaWebhookValida(req) {
  const secret = MP_WEBHOOK_SECRET.value();
  const xSignature = req.headers["x-signature"] || "";
  const xRequestId = req.headers["x-request-id"] || "";
  const dataId = String(req.query["data.id"] || "").toLowerCase();

  const parsed = extrairAssinatura(xSignature);
  const ts = parsed.ts;
  const hash = parsed.v1;

  if (!secret || !ts || !hash || !xRequestId || !dataId) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(hash, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function aplicarStatusPagamento(payment) {
  const externalReference = String(payment.external_reference || "");
  const partes = externalReference.split(":");
  if (partes.length < 3 || partes[0] !== "gestok") {
    return { ok: false, motivo: "external_reference inválido" };
  }

  const lojaId = partes[1];
  const uid = partes[2];
  const paymentId = String(payment.id);
  const lojaInfo = await lojaDoUsuario(lojaId, uid);
  if (!lojaInfo) {
    return { ok: false, motivo: "loja/usuário não conferem" };
  }

  const pagamentoRef = lojaInfo.ref.collection("pagamentos").doc(paymentId);
  const status = String(payment.status || "pending");
  const statusDetail = String(payment.status_detail || "");

  const dadosPagamento = {
    paymentId,
    status,
    statusDetail,
    paymentMethodId: payment.payment_method_id || null,
    paymentTypeId: payment.payment_type_id || null,
    transactionAmount: Number(payment.transaction_amount || 0),
    externalReference,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  };

  await pagamentoRef.set(dadosPagamento, { merge: true });

  if (status === "approved") {
    const atual = lojaInfo.loja.assinatura || {};
    const agora = new Date();
    const vencimentoAtual = atual.vencimento ? new Date(atual.vencimento) : null;
    const inicio = vencimentoAtual && !Number.isNaN(vencimentoAtual.getTime()) && vencimentoAtual > agora
      ? vencimentoAtual
      : agora;
    const vencimento = new Date(inicio);
    vencimento.setDate(vencimento.getDate() + DIAS_PLANO);

    const assinatura = {
      plano: "Gestok",
      valor: VALOR_PLANO,
      dias: DIAS_PLANO,
      tipo: "assinatura",
      inicio: inicio.toISOString(),
      vencimento: vencimento.toISOString(),
      status: "ativa",
      pagamento: "aprovado",
      paymentId,
      metodo: payment.payment_method_id || "",
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    };

    await lojaInfo.ref.update({ assinatura });
    await pagamentoRef.set({ status: "approved", statusDetail, confirmadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  return { ok: true, status };
}

exports.paymentConfig = onRequest(
  { region: "southamerica-east1" },
  async (req, res) => {
    cors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    return json(res, 200, { publicKey: MP_PUBLIC_KEY.value() });
  }
);

exports.createPayment = onRequest(
  { region: "southamerica-east1", secrets: [MP_ACCESS_TOKEN] },
  async (req, res) => {
    cors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return json(res, 405, { ok: false, mensagem: "Método não permitido." });

    try {
      const decoded = await usuarioAutenticado(req);
      const { lojaId, payment = {} } = req.body || {};
      const lojaInfo = await lojaDoUsuario(lojaId, decoded.uid);

      if (!lojaInfo) return json(res, 403, { ok: false, mensagem: "Loja não pertence ao usuário autenticado." });

      const assinatura = lojaInfo.loja.assinatura || {};
      if (assinatura.status === "ativa" && assinatura.pagamento === "aprovado" && assinatura.vencimento && new Date(assinatura.vencimento) > new Date()) {
        return json(res, 200, { ok: true, status: "approved", assinaturaAtiva: true });
      }

      const requestId = String(payment.request_id || crypto.randomUUID());
      const pagamentosRef = lojaInfo.ref.collection("pagamentos");
      const anteriorSnap = await pagamentosRef.where("requestId", "==", requestId).limit(1).get();
      if (!anteriorSnap.empty) {
        const anterior = anteriorSnap.docs[0].data();
        return json(res, 200, {
          ok: true,
          status: anterior.status || "pending",
          paymentId: anterior.paymentId || null,
          qrCode: anterior.qrCode || null,
          qrCodeBase64: anterior.qrCodeBase64 || null,
        });
      }

      const paymentMethodId = String(payment.payment_method_id || payment.paymentMethodId || "").toLowerCase();
      if (!paymentMethodId) return json(res, 400, { ok: false, mensagem: "Forma de pagamento não informada." });

      const email = decoded.email || lojaInfo.loja.email;
      if (!email) return json(res, 400, { ok: false, mensagem: "E-mail do pagador não encontrado." });

      const body = {
        transaction_amount: VALOR_PLANO,
        description: "Assinatura Gestok - 30 dias",
        external_reference: `gestok:${lojaId}:${decoded.uid}:${requestId}`,
        payer: { email },
      };

      if (paymentMethodId === "pix") {
        body.payment_method_id = "pix";
      } else {
        if (!payment.token) return json(res, 400, { ok: false, mensagem: "Token do cartão não recebido." });
        body.token = String(payment.token);
        body.installments = Number(payment.installments || 1);
        body.payment_method_id = paymentMethodId;
        if (payment.issuer_id !== undefined && payment.issuer_id !== null && payment.issuer_id !== "") {
          body.issuer_id = Number(payment.issuer_id);
        }
        if (payment.payer?.identification?.type && payment.payer?.identification?.number) {
          body.payer.identification = {
            type: String(payment.payer.identification.type),
            number: String(payment.payer.identification.number),
          };
        }
        if (payment.payer?.first_name) body.payer.first_name = String(payment.payer.first_name);
      }

      const mpPayment = await mpFetch("/v1/payments", {
        method: "POST",
        headers: { "X-Idempotency-Key": idempotencyKey(requestId) },
        body: JSON.stringify(body),
      });

      const paymentId = String(mpPayment.id);
      const transactionData = mpPayment.point_of_interaction?.transaction_data || {};
      const dados = {
        paymentId,
        requestId,
        status: mpPayment.status || "pending",
        statusDetail: mpPayment.status_detail || "",
        paymentMethodId: mpPayment.payment_method_id || paymentMethodId,
        paymentTypeId: mpPayment.payment_type_id || null,
        transactionAmount: Number(mpPayment.transaction_amount || VALOR_PLANO),
        externalReference: body.external_reference,
        qrCode: transactionData.qr_code || null,
        qrCodeBase64: transactionData.qr_code_base64 || null,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      };

      await pagamentosRef.doc(paymentId).set(dados, { merge: true });
      await aplicarStatusPagamento(mpPayment);

      return json(res, 200, {
        ok: true,
        status: mpPayment.status || "pending",
        statusDetail: mpPayment.status_detail || "",
        paymentId,
        qrCode: transactionData.qr_code || null,
        qrCodeBase64: transactionData.qr_code_base64 || null,
      });
    } catch (error) {
      console.error("createPayment:", error);
      if (error.message === "AUTH_REQUIRED") return json(res, 401, { ok: false, mensagem: "Sessão inválida. Faça login novamente." });
      return json(res, 500, { ok: false, mensagem: error.message || "Erro ao criar pagamento." });
    }
  }
);

exports.paymentStatus = onRequest(
  { region: "southamerica-east1", secrets: [MP_ACCESS_TOKEN] },
  async (req, res) => {
    cors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return json(res, 405, { ok: false, mensagem: "Método não permitido." });

    try {
      const decoded = await usuarioAutenticado(req);
      const { lojaId } = req.body || {};
      const lojaInfo = await lojaDoUsuario(lojaId, decoded.uid);
      if (!lojaInfo) return json(res, 403, { ok: false, mensagem: "Loja não pertence ao usuário autenticado." });

      const assinatura = lojaInfo.loja.assinatura || {};
      const assinaturaAtiva = assinatura.status === "ativa" && assinatura.pagamento === "aprovado" && assinatura.vencimento && new Date(assinatura.vencimento) > new Date();
      if (assinaturaAtiva) return json(res, 200, { ok: true, assinaturaAtiva: true, status: "approved", vencimento: assinatura.vencimento });

      const snap = await lojaInfo.ref.collection("pagamentos").orderBy("criadoEm", "desc").limit(1).get();
      if (snap.empty) return json(res, 200, { ok: true, assinaturaAtiva: false, status: "pending" });

      const pagamento = snap.docs[0].data();
      let status = pagamento.status || "pending";

      if (pagamento.paymentId && status !== "approved") {
        try {
          const atual = await mpFetch(`/v1/payments/${encodeURIComponent(pagamento.paymentId)}`, { method: "GET" });
          await aplicarStatusPagamento(atual);
          status = atual.status || status;
        } catch (error) {
          console.warn("paymentStatus: não foi possível atualizar no Mercado Pago", error.message);
        }
      }

      const lojaAtual = (await lojaInfo.ref.get()).data() || {};
      const assinaturaAtual = lojaAtual.assinatura || {};
      const ativaAgora = assinaturaAtual.status === "ativa" && assinaturaAtual.pagamento === "aprovado" && assinaturaAtual.vencimento && new Date(assinaturaAtual.vencimento) > new Date();

      return json(res, 200, {
        ok: true,
        assinaturaAtiva: !!ativaAgora,
        status,
        paymentId: pagamento.paymentId || null,
        vencimento: assinaturaAtual.vencimento || null,
      });
    } catch (error) {
      console.error("paymentStatus:", error);
      if (error.message === "AUTH_REQUIRED") return json(res, 401, { ok: false, mensagem: "Sessão inválida." });
      return json(res, 500, { ok: false, mensagem: error.message || "Erro ao consultar pagamento." });
    }
  }
);

exports.mercadoPagoWebhook = onRequest(
  { region: "southamerica-east1", secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET] },
  async (req, res) => {
    // O Mercado Pago exige resposta rápida 200/201 para confirmar recebimento.
    cors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      if (!assinaturaWebhookValida(req)) {
        return res.status(401).send("Invalid signature");
      }

      const type = String(req.query.type || req.body?.type || "");
      const dataId = String(req.query["data.id"] || req.body?.data?.id || "");

      if (type === "payment" && dataId) {
        const payment = await mpFetch(`/v1/payments/${encodeURIComponent(dataId)}`, { method: "GET" });
        await aplicarStatusPagamento(payment);
      }

      return res.status(200).send("OK");
    } catch (error) {
      console.error("mercadoPagoWebhook:", error);
      return res.status(500).send("Webhook error");
    }
  }
);
