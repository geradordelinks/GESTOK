/* =========================================
   GESTOK - AUTENTICAÇÃO FIREBASE
   FIREBASE = ÚNICA AUTENTICAÇÃO
   MULTI-LOJA / SAAS
========================================= */

const GESTOK_CONTA = 'gestok_conta';
const GESTOK_SESSAO = 'gestok_sessao';

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

function usuarioFirebaseAtualGestok() {
    return (typeof firebase !== 'undefined' && firebase.auth)
        ? firebase.auth().currentUser
        : null;
}

function usuarioLogadoGestok() {
    const usuario = usuarioFirebaseAtualGestok();
    return !!usuario;
}

function pagamentoAprovadoGestok(conta) {
    return !!(
        conta?.assinatura?.status === 'ativa' &&
        conta?.assinatura?.pagamento === 'aprovado'
    );
}

function assinaturaAtivaGestok(conta) {
    if (!pagamentoAprovadoGestok(conta)) return false;

    const vencimento =
        new Date(conta.assinatura.vencimento).getTime();

    return Number.isFinite(vencimento) && vencimento > Date.now();
}

function caminhoSistemaGestok() {
    return '../sistema/index.html';
}

function caminhoLoginGestok() {
    return '../login/index.html';
}

function caminhoPagamentoGestok() {
    return '../pagamento/index.html';
}

function exigirLoginGestok() {
    const pagina = window.location.pathname.toLowerCase();

    const paginasPublicas = [
        '/login/index.html',
        '/cadastro/index.html',
        '/planos/index.html',
        '/pagamento/index.html',
        '/apresentacao.html',
        '/index.html'
    ];

    if (paginasPublicas.some(item => pagina.endsWith(item))) {
        return true;
    }

    const usuario = usuarioFirebaseAtualGestok();
    const conta = obterContaGestok();

    if (!usuario || !conta) {
        window.location.replace(caminhoLoginGestok());
        return false;
    }

    if (!pagamentoAprovadoGestok(conta)) {
        window.location.replace(caminhoPagamentoGestok());
        return false;
    }

    if (!assinaturaAtivaGestok(conta)) {
        conta.assinatura = {
            ...(conta.assinatura || {}),
            status: 'expirada'
        };

        localStorage.setItem(
            GESTOK_CONTA,
            JSON.stringify(conta)
        );

        window.location.replace(caminhoPagamentoGestok());
        return false;
    }

    return true;
}

/* =========================================
   CADASTRO
========================================= */

async function criarContaGestok(nome, email, usuario, senha) {
    try {
        nome = String(nome || '').trim();
        email = String(email || '').trim().toLowerCase();
        usuario = String(usuario || '').trim().toLowerCase();
        senha = String(senha || '');

        if (!nome) {
            return { ok: false, mensagem: 'Digite o nome da empresa.' };
        }

        if (!email) {
            return { ok: false, mensagem: 'Digite seu e-mail.' };
        }

        if (!usuario) {
            return { ok: false, mensagem: 'Digite um nome de usuário.' };
        }

        if (senha.length < 6) {
            return { ok: false, mensagem: 'A senha precisa ter pelo menos 6 caracteres.' };
        }

        if (typeof firebase === 'undefined') {
            return { ok: false, mensagem: 'Firebase não foi carregado.' };
        }

        const authFirebase = firebase.auth();
        const dbFirebase = firebase.firestore();

        /*
         * O e-mail real é usado pelo Firebase Authentication.
         * O usuário e o Código da Loja continuam sendo a forma
         * de identificação exibida pelo Gestok.
         */
        const credencial =
            await authFirebase.createUserWithEmailAndPassword(
                email,
                senha
            );

        const usuarioFirebase = credencial.user;

        if (!usuarioFirebase || !usuarioFirebase.uid) {
            throw new Error('Firebase não retornou o UID do usuário.');
        }

        const uid = usuarioFirebase.uid;

        /* =====================================
           CRIAR LOJA
        ===================================== */

        const lojaRef = dbFirebase
            .collection('lojas')
            .doc();

        const codigoLoja =
            await gerarCodigoLojaGestok(dbFirebase);

        const agora =
            firebase.firestore.FieldValue.serverTimestamp();

        await lojaRef.set({
            id: lojaRef.id,
            nome,
            codigo: codigoLoja,
            donoUid: uid,
            email,
            criadaEm: agora,
            ativo: true,
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

        /* =====================================
           CRIAR USUÁRIO DA LOJA
        ===================================== */

        await lojaRef
            .collection('usuarios')
            .doc(uid)
            .set({
                uid,
                lojaId: lojaRef.id,
                codigoLoja,
                nome,
                email,
                usuario,
                perfil: 'proprietario',
                ativo: true,
                criadoEm: agora
            });

        /* =====================================
           ÍNDICE DE LOGIN
        ===================================== */

        await dbFirebase
            .collection('acessos')
            .doc(`${codigoLoja}_${usuario}`)
            .set({
                lojaId: lojaRef.id,
                uid,
                codigoLoja,
                usuario,
                emailAuth: email
            });

        const conta = {
            firebaseUid: uid,
            lojaId: lojaRef.id,
            nome,
            email,
            usuario,
            codigoLoja,
            criadaEm: new Date().toISOString(),
            assinatura: {
                plano: 'Gestok',
                valor: 30,
                dias: 30,
                inicio: null,
                vencimento: null,
                status: 'aguardando_pagamento',
                pagamento: 'pendente'
            }
        };

        localStorage.setItem(
            GESTOK_CONTA,
            JSON.stringify(conta)
        );

        localStorage.setItem(
            GESTOK_SESSAO,
            JSON.stringify({
                logado: true,
                codigoLoja,
                usuario,
                lojaId: lojaRef.id,
                firebaseUid: uid,
                loginEm: new Date().toISOString()
            })
        );

        return {
            ok: true,
            conta
        };

    } catch (erro) {
        console.error(
            'Erro ao criar conta Gestok:',
            erro
        );

        return {
            ok: false,
            mensagem: mensagemErroFirebase(erro)
        };
    }
}

/* =========================================
   GERAR CÓDIGO DA LOJA
========================================= */

async function gerarCodigoLojaGestok(db) {
    for (let tentativa = 0; tentativa < 30; tentativa++) {
        const codigo = String(
            Math.floor(1000 + Math.random() * 9000)
        );

        const resultado = await db
            .collection('lojas')
            .where('codigo', '==', codigo)
            .limit(1)
            .get();

        if (resultado.empty) {
            return codigo;
        }
    }

    throw new Error(
        'Não foi possível gerar um Código da Loja disponível.'
    );
}

/* =========================================
   LOGIN
========================================= */

async function entrarGestok(codigoLoja, usuario, senha) {
    try {
        codigoLoja = String(codigoLoja || '').trim();
        usuario = String(usuario || '').trim().toLowerCase();
        senha = String(senha || '');

        if (!codigoLoja || !usuario || !senha) {
            return {
                ok: false,
                mensagem: 'Preencha todos os dados de acesso.'
            };
        }

        const dbFirebase = firebase.firestore();
        const authFirebase = firebase.auth();

        const chave = `${codigoLoja}_${usuario}`;

        const acessoDoc = await dbFirebase
            .collection('acessos')
            .doc(chave)
            .get();

        if (!acessoDoc.exists) {
            return {
                ok: false,
                mensagem: 'Código da Loja ou usuário incorreto.'
            };
        }

        const acesso = acessoDoc.data();

        if (!acesso?.lojaId || !acesso?.uid || !acesso?.emailAuth) {
            return {
                ok: false,
                mensagem: 'Cadastro de acesso inválido.'
            };
        }

        const lojaDoc = await dbFirebase
            .collection('lojas')
            .doc(acesso.lojaId)
            .get();

        if (!lojaDoc.exists) {
            return {
                ok: false,
                mensagem: 'Loja não encontrada.'
            };
        }

        const contaLoja = lojaDoc.data();

        const credencial =
            await authFirebase.signInWithEmailAndPassword(
                acesso.emailAuth,
                senha
            );

        const usuarioFirebase = credencial.user;

        if (!usuarioFirebase || usuarioFirebase.uid !== acesso.uid) {
            await authFirebase.signOut();
            return {
                ok: false,
                mensagem: 'Não foi possível validar o usuário da loja.'
            };
        }

        const conta = {
            firebaseUid: usuarioFirebase.uid,
            lojaId: acesso.lojaId,
            nome: contaLoja.nome || '',
            email: contaLoja.email || acesso.emailAuth,
            usuario,
            codigoLoja,
            assinatura: contaLoja.assinatura || {
                plano: 'Gestok',
                valor: 30,
                dias: 30,
                inicio: null,
                vencimento: null,
                status: 'aguardando_pagamento',
                pagamento: 'pendente'
            }
        };

        localStorage.setItem(
            GESTOK_CONTA,
            JSON.stringify(conta)
        );

        localStorage.setItem(
            GESTOK_SESSAO,
            JSON.stringify({
                logado: true,
                codigoLoja,
                usuario,
                lojaId: acesso.lojaId,
                firebaseUid: usuarioFirebase.uid,
                loginEm: new Date().toISOString()
            })
        );

        return {
            ok: true,
            conta
        };

    } catch (erro) {
        console.error(
            'Erro no login Gestok:',
            erro
        );

        return {
            ok: false,
            mensagem: mensagemErroFirebase(erro)
        };
    }
}

/* =========================================
   PAGAMENTO / ASSINATURA
========================================= */

async function aprovarPagamentoGestok() {
    try {
        const conta = obterContaGestok();

        if (!conta?.lojaId) {
            return {
                ok: false,
                mensagem: 'Conta ou loja não encontrada.'
            };
        }

        const agora = new Date();
        const vencimento = new Date(agora);
        vencimento.setDate(vencimento.getDate() + 30);

        const assinatura = {
            ...(conta.assinatura || {}),
            inicio: agora.toISOString(),
            vencimento: vencimento.toISOString(),
            status: 'ativa',
            pagamento: 'aprovado'
        };

        await atualizarAssinaturaLojaGestok(
            conta.lojaId,
            assinatura
        );

        conta.assinatura = assinatura;

        localStorage.setItem(
            GESTOK_CONTA,
            JSON.stringify(conta)
        );

        localStorage.setItem(
            GESTOK_SESSAO,
            JSON.stringify({
                logado: true,
                codigoLoja: conta.codigoLoja,
                usuario: conta.usuario,
                lojaId: conta.lojaId,
                firebaseUid: conta.firebaseUid,
                loginEm: agora.toISOString()
            })
        );

        return {
            ok: true,
            conta
        };

    } catch (erro) {
        console.error(
            'Erro ao aprovar pagamento:',
            erro
        );

        return {
            ok: false,
            mensagem: mensagemErroFirebase(erro)
        };
    }
}

async function atualizarAssinaturaLojaGestok(lojaId, assinatura) {
    const usuario = usuarioFirebaseAtualGestok();

    if (!usuario) {
        throw new Error('Usuário não autenticado no Firebase.');
    }

    await firebase
        .firestore()
        .collection('lojas')
        .doc(lojaId)
        .update({
            assinatura
        });
}

/* =========================================
   SAIR
========================================= */

async function sairGestok() {
    try {
        await firebase.auth().signOut();
    } catch (erro) {
        console.warn(
            'Erro ao encerrar sessão Firebase:',
            erro
        );
    }

    localStorage.removeItem(GESTOK_SESSAO);
    localStorage.removeItem(GESTOK_CONTA);

    window.location.href = caminhoLoginGestok();
}

/* =========================================
   DIAS RESTANTES
========================================= */

function diasRestantesGestok(
    conta = obterContaGestok()
) {
    if (!conta?.assinatura?.vencimento) {
        return 0;
    }

    const diferenca =
        new Date(conta.assinatura.vencimento).getTime() -
        Date.now();

    return Math.max(
        0,
        Math.ceil(diferenca / 86400000)
    );
}

/* =========================================
   ERROS FIREBASE
========================================= */

function mensagemErroFirebase(erro) {
    const mapa = {
        'auth/email-already-in-use':
            'Este e-mail já está cadastrado.',

        'auth/invalid-email':
            'O e-mail informado é inválido.',

        'auth/weak-password':
            'A senha precisa ter pelo menos 6 caracteres.',

        'auth/user-not-found':
            'Código da Loja ou usuário incorreto.',

        'auth/wrong-password':
            'Senha incorreta.',

        'auth/invalid-credential':
            'Código da Loja, usuário ou senha incorretos.',

        'auth/too-many-requests':
            'Muitas tentativas. Aguarde alguns instantes e tente novamente.',

        'auth/network-request-failed':
            'Falha de conexão. Verifique sua internet.',

        'auth/operation-not-allowed':
            'O login por e-mail e senha não está ativado no Firebase.',

        'permission-denied':
            'O Firestore bloqueou esta operação pelas regras de segurança.'
    };

    return (
        mapa[erro?.code] ||
        erro?.message ||
        'Não foi possível concluir a operação. Tente novamente.'
    );
}
