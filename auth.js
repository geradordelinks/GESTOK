/* =========================================
   GESTOK - AUTENTICAÇÃO FIREBASE
   MULTI-LOJA / SAAS
========================================= */

const GESTOK_CONTA = 'gestok_conta';
const GESTOK_SESSAO = 'gestok_sessao';
const GESTOK_PROXIMO_CODIGO_LOJA = 'gestok_proximo_codigo_loja';

function obterContaGestok() {
    try {
        const conta = JSON.parse(localStorage.getItem(GESTOK_CONTA) || 'null');
        return conta && typeof conta === 'object' ? conta : null;
    } catch (erro) {
        return null;
    }
}

function obterSessaoGestok() {
    try {
        const sessao = JSON.parse(localStorage.getItem(GESTOK_SESSAO) || 'null');
        return sessao && typeof sessao === 'object' ? sessao : null;
    } catch (erro) {
        return null;
    }
}

function pagamentoAprovadoGestok(conta) {
    return !!(
        conta?.assinatura?.status === 'ativa' &&
        conta?.assinatura?.pagamento === 'aprovado'
    );
}

function assinaturaAtivaGestok(conta) {
    if (!pagamentoAprovadoGestok(conta)) return false;
    const vencimento = new Date(conta.assinatura.vencimento).getTime();
    return Number.isFinite(vencimento) && vencimento > Date.now();
}

function usuarioLogadoGestok() {
    const sessao = obterSessaoGestok();
    const conta = obterContaGestok();
    return !!(
        auth?.currentUser &&
        sessao?.logado === true &&
        conta &&
        assinaturaAtivaGestok(conta)
    );
}

function caminhoSistemaGestok() { return '../sistema/index.html'; }
function caminhoLoginGestok() { return '../login/index.html'; }
function caminhoPagamentoGestok() { return '../pagamento/index.html'; }

function exigirLoginGestok() {
    const pagina = window.location.pathname.toLowerCase();
    const paginasPublicas = [
        '/login/index.html', '/cadastro/index.html', '/planos/index.html',
        '/pagamento/index.html', '/apresentacao.html', '/index.html'
    ];
    if (paginasPublicas.some(item => pagina.endsWith(item))) return true;

    const conta = obterContaGestok();
    const sessao = obterSessaoGestok();

    if (!auth?.currentUser || !conta || !sessao?.logado) {
        window.location.replace(caminhoLoginGestok());
        return false;
    }

    if (!pagamentoAprovadoGestok(conta)) {
        window.location.replace(caminhoPagamentoGestok());
        return false;
    }

    if (!assinaturaAtivaGestok(conta)) {
        conta.assinatura.status = 'expirada';
        localStorage.setItem(GESTOK_CONTA, JSON.stringify(conta));
        window.location.replace(caminhoPagamentoGestok());
        return false;
    }

    return true;
}

async function criarContaGestok(nome, email, usuario, senha) {
    try {
        nome = String(nome || '').trim();
        email = String(email || '').trim().toLowerCase();
        usuario = String(usuario || '').trim().toLowerCase();
        senha = String(senha || '');

        if (!nome) return { ok:false, mensagem:'Digite o nome da empresa.' };
        if (!email) return { ok:false, mensagem:'Digite seu e-mail.' };
        if (!usuario) return { ok:false, mensagem:'Digite um nome de usuário.' };
        if (senha.length < 6) return { ok:false, mensagem:'A senha precisa ter pelo menos 6 caracteres.' };

        const contaLocal = obterContaGestok();
        if (contaLocal?.firebaseUid) {
            return { ok:false, mensagem:'Esta conta já foi criada. Acesse o pagamento.' };
        }

        // O primeiro código é reservado no navegador apenas para formar o login interno.
        // O código exibido da loja é criado junto ao documento da loja.
        const codigoLogin = 'novo' + Date.now();
        const emailAuth = `${codigoLogin}.${usuario}@login.gestok.local`;
        const usuarioFirebase = await auth.createUserWithEmailAndPassword(emailAuth, senha);
        const loja = await criarLojaGestok({ nome, email, usuario, uid: usuarioFirebase.uid, emailAuth });

        const agora = new Date();
        const conta = {
            firebaseUid: usuarioFirebase.uid,
            lojaId: loja.lojaId,
            nome,
            email,
            usuario,
            codigoLoja: loja.codigoLoja,
            criadaEm: agora.toISOString(),
            assinatura: {
                plano:'Gestok', valor:30, dias:30,
                inicio:null, vencimento:null,
                status:'aguardando_pagamento', pagamento:'pendente'
            }
        };

        // Firebase Auth precisa do código definitivo para os próximos logins.
        // Recriamos a conta com o identificador definitivo não é possível; por isso
        // o login usa o e-mail real armazenado no perfil via consulta autenticada após
        // a sessão. Para manter o fluxo seguro, guardamos a sessão da conta recém-criada.
        localStorage.setItem(GESTOK_CONTA, JSON.stringify(conta));
        localStorage.removeItem(GESTOK_SESSAO);

        return { ok:true, conta };
    } catch (erro) {
        console.error('Erro ao criar conta Gestok:', erro);
        return { ok:false, mensagem: typeof mensagemErroFirebase === 'function' ? mensagemErroFirebase(erro) : 'Não foi possível criar a conta.' };
    }
}

async function entrarGestok(codigoLoja, usuario, senha) {
    try {
        codigoLoja = String(codigoLoja || '').trim();
        usuario = String(usuario || '').trim().toLowerCase();
        senha = String(senha || '');

        const acesso = await obterAcessoLoginGestok(codigoLoja, usuario);

        if (!acesso?.emailAuth || !acesso?.lojaId) {
            return { ok:false, mensagem:'Código da Loja ou usuário incorreto.' };
        }

        const lojaRef = referenciaLoja(acesso.lojaId);
        const lojaDoc = await lojaRef.get();

        if (!lojaDoc.exists) {
            return { ok:false, mensagem:'Loja não encontrada.' };
        }

        const contaLoja = lojaDoc.data();
        const usuarioFirebase = await auth.signInWithEmailAndPassword(acesso.emailAuth, senha);

        const conta = {
            firebaseUid: usuarioFirebase.uid,
            lojaId: acesso.lojaId,
            nome: contaLoja.nome,
            email: contaLoja.email,
            usuario,
            codigoLoja,
            assinatura: contaLoja.assinatura || {
                plano:'Gestok', valor:30, dias:30,
                inicio:null, vencimento:null,
                status:'aguardando_pagamento', pagamento:'pendente'
            }
        };

        localStorage.setItem(GESTOK_CONTA, JSON.stringify(conta));
        localStorage.setItem(GESTOK_SESSAO, JSON.stringify({
            logado:true,
            codigoLoja,
            usuario,
            lojaId:acesso.lojaId,
            firebaseUid:usuarioFirebase.uid,
            loginEm:new Date().toISOString()
        }));

        return { ok:true, conta };
    } catch (erro) {
        console.error('Erro no login Gestok:', erro);
        return { ok:false, mensagem: mensagemErroFirebase(erro) };
    }
}

async function aprovarPagamentoGestok() {
    try {
        const conta = obterContaGestok();
        if (!conta?.lojaId) return { ok:false, mensagem:'Conta ou loja não encontrada.' };

        const agora = new Date();
        const vencimento = new Date(agora);
        vencimento.setDate(vencimento.getDate() + 30);

        conta.assinatura = {
            ...(conta.assinatura || {}),
            inicio: agora.toISOString(),
            vencimento: vencimento.toISOString(),
            status:'ativa',
            pagamento:'aprovado'
        };

        await atualizarAssinaturaLojaGestok(conta.lojaId, conta.assinatura);
        localStorage.setItem(GESTOK_CONTA, JSON.stringify(conta));
        localStorage.setItem(GESTOK_SESSAO, JSON.stringify({
            logado:true, codigoLoja:conta.codigoLoja, usuario:conta.usuario,
            lojaId:conta.lojaId, firebaseUid:conta.firebaseUid,
            loginEm:agora.toISOString()
        }));

        return { ok:true, conta };
    } catch (erro) {
        console.error('Erro ao aprovar pagamento:', erro);
        return { ok:false, mensagem:'Não foi possível atualizar a assinatura.' };
    }
}

async function sairGestok() {
    try { if (typeof sairFirebase === 'function') await sairFirebase(); } catch (erro) {}
    localStorage.removeItem(GESTOK_SESSAO);
    window.location.href = caminhoLoginGestok();
}

function diasRestantesGestok(conta = obterContaGestok()) {
    if (!conta?.assinatura?.vencimento) return 0;
    const diferenca = new Date(conta.assinatura.vencimento).getTime() - Date.now();
    return Math.max(0, Math.ceil(diferenca / 86400000));
}
