// =========================================
// GESTOK - FIRESTORE / MULTI-TENANT
// =========================================

const db = firebase.firestore();

function referenciaLoja(lojaId) {
    return db.collection('lojas').doc(lojaId);
}

function referenciaUsuarios(lojaId) {
    return referenciaLoja(lojaId).collection('usuarios');
}

function referenciaProdutos(lojaId) {
    return referenciaLoja(lojaId).collection('produtos');
}

function referenciaMovimentacoes(lojaId) {
    return referenciaLoja(lojaId).collection('movimentacoes');
}

function referenciaChamados(lojaId) {
    return referenciaLoja(lojaId).collection('chamados');
}

function referenciaSolicitacoes(lojaId) {
    return referenciaLoja(lojaId).collection('solicitacoes');
}

async function criarLojaGestok({ nome, email, usuario, uid, emailAuth }) {
    const lojaRef = db.collection('lojas').doc();

    // Código inicial temporário. O código definitivo/sequencial deve ser
    // gerado no backend (Cloud Function) quando colocarmos o ambiente em produção.
    const codigoLoja = String(
        Math.floor(1000 + Math.random() * 9000)
    );

    const agora = firebase.firestore.FieldValue.serverTimestamp();

    await lojaRef.set({
        nome: String(nome).trim(),
        codigo: codigoLoja,
        donoUid: uid,
        email: String(email).trim().toLowerCase(),
        criadaEm: agora,
        assinatura: {
            plano: 'Gestok',
            valor: 30,
            dias: 30,
            inicio: null,
            vencimento: null,
            status: 'aguardando_pagamento',
            pagamento: 'pendente'
        }
    });

    await lojaRef.collection('usuarios').doc(uid).set({
        uid,
        lojaId: lojaRef.id,
        codigoLoja,
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        usuario: String(usuario).trim().toLowerCase(),
        emailAuth: emailAuth || '',
        perfil: 'proprietario',
        criadoEm: agora
    });

    await db.collection('acessos').doc(`${codigoLoja}_${String(usuario).trim().toLowerCase()}`).set({
        lojaId: lojaRef.id,
        uid,
        codigoLoja,
        usuario: String(usuario).trim().toLowerCase(),
        emailAuth: emailAuth || ''
    });

    return {
        lojaId: lojaRef.id,
        codigoLoja
    };
}

async function obterAcessoLoginGestok(codigoLoja, usuario) {
    const chave = `${String(codigoLoja).trim()}_${String(usuario).trim().toLowerCase()}`;
    const doc = await db.collection('acessos').doc(chave).get();
    return doc.exists ? doc.data() : null;
}

async function obterVinculoUsuarioGestok(uid) {
    if (!uid) return null;

    const lojas = await db.collection('lojas').get();

    for (const lojaDoc of lojas.docs) {
        const usuarioDoc = await lojaDoc.ref.collection('usuarios').doc(uid).get();
        if (usuarioDoc.exists) {
            return {
                lojaId: lojaDoc.id,
                dadosLoja: lojaDoc.data(),
                dadosUsuario: usuarioDoc.data()
            };
        }
    }

    return null;
}

async function atualizarAssinaturaLojaGestok(lojaId, assinatura) {
    await referenciaLoja(lojaId).update({
        assinatura
    });
}
