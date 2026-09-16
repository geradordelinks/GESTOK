/* =========================================
   GESTOK
   AUTENTICAÇÃO CENTRAL
   FIREBASE AUTH + FIRESTORE
========================================= */


/* =========================================
   CHAVES DE CACHE LOCAL
   -----------------------------------------
   IMPORTANTE:
   localStorage NÃO é autenticação.
   Serve apenas como espelho dos dados.
========================================= */

const GESTOK_CONTA = "gestok_conta";
const GESTOK_SESSAO = "gestok_sessao";


/* =========================================
   OBTER CONTA LOCAL
========================================= */

function obterContaGestok() {

    try {

        const dados =
            localStorage.getItem(
                GESTOK_CONTA
            );

        if (!dados) {
            return null;
        }

        const conta =
            JSON.parse(dados);

        return (
            conta &&
            typeof conta === "object"
        )
            ? conta
            : null;

    } catch (erro) {

        console.error(
            "Erro ao carregar conta local:",
            erro
        );

        return null;

    }

}


/* =========================================
   OBTER SESSÃO LOCAL
========================================= */

function obterSessaoGestok() {

    try {

        const dados =
            localStorage.getItem(
                GESTOK_SESSAO
            );

        if (!dados) {
            return null;
        }

        const sessao =
            JSON.parse(dados);

        return (
            sessao &&
            typeof sessao === "object"
        )
            ? sessao
            : null;

    } catch (erro) {

        return null;

    }

}


/* =========================================
   USUÁRIO FIREBASE ATUAL
========================================= */

function usuarioFirebaseAtualGestok() {

    if (
        typeof firebase === "undefined" ||
        !firebase.auth
    ) {

        return null;

    }

    return (
        firebase.auth().currentUser ||
        null
    );

}


/* =========================================
   UID FIREBASE ATUAL
========================================= */

function uidFirebaseAtualGestok() {

    const usuario =
        usuarioFirebaseAtualGestok();

    return usuario
        ? usuario.uid
        : null;

}


/* =========================================
   VERIFICAR AUTENTICAÇÃO FIREBASE
========================================= */

function usuarioLogadoGestok() {

    return Boolean(
        usuarioFirebaseAtualGestok()
    );

}


/* =========================================
   OBSERVAR AUTENTICAÇÃO
========================================= */

function observarAutenticacaoGestok(callback) {

    if (
        typeof firebase === "undefined" ||
        !firebase.auth
    ) {

        return null;

    }

    return firebase
        .auth()
        .onAuthStateChanged(
            function (usuario) {

                if (typeof callback === "function") {

                    callback(usuario);

                }

            }
        );

}


/* =========================================
   GERAR CÓDIGO DA LOJA
========================================= */

async function gerarCodigoLojaGestok() {

    if (
        typeof firebase === "undefined" ||
        !firebase.firestore
    ) {

        throw new Error(
            "Firebase Firestore não foi carregado."
        );

    }


    const db =
        firebase.firestore();


    for (let tentativa = 0; tentativa < 20; tentativa++) {

        const codigo =
            String(
                Math.floor(
                    1000 +
                    Math.random() * 9000
                )
            );


        const consulta =
            await db
                .collection("lojas")
                .where(
                    "codigo",
                    "==",
                    codigo
                )
                .limit(1)
                .get();


        if (consulta.empty) {

            return codigo;

        }

    }


    throw new Error(
        "Não foi possível gerar um código de loja disponível."
    );

}


/* =========================================
   PAGAMENTO APROVADO
========================================= */

function pagamentoAprovadoGestok(
    conta = obterContaGestok()
) {

    if (
        !conta ||
        !conta.assinatura
    ) {

        return false;

    }


    return (

        conta.assinatura.status === "ativa" &&

        conta.assinatura.pagamento === "aprovado"

    );

}


/* =========================================
   ASSINATURA ATIVA
========================================= */

function assinaturaAtivaGestok(
    conta = obterContaGestok()
) {

    if (
        !pagamentoAprovadoGestok(conta)
    ) {

        return false;

    }


    if (
        !conta.assinatura.vencimento
    ) {

        return false;

    }


    const vencimento =
        new Date(
            conta.assinatura.vencimento
        ).getTime();


    return (

        Number.isFinite(vencimento) &&

        vencimento > Date.now()

    );

}


/* =========================================
   CRIAR CONTA
========================================= */

async function criarContaGestok(

    nome,

    email,

    usuario,

    senha

) {

    nome =
        String(nome || "")
            .trim();

    email =
        String(email || "")
            .trim()
            .toLowerCase();

    usuario =
        String(usuario || "")
            .trim()
            .toLowerCase();

    senha =
        String(senha || "");


    /* -----------------------------------------
       VALIDAÇÕES
    ----------------------------------------- */

    if (!nome) {

        return {

            ok: false,

            mensagem:
                "Digite o nome da empresa."

        };

    }


    if (!email) {

        return {

            ok: false,

            mensagem:
                "Digite seu e-mail."

        };

    }


    if (!usuario) {

        return {

            ok: false,

            mensagem:
                "Digite um nome de usuário."

        };

    }


    if (senha.length < 6) {

        return {

            ok: false,

            mensagem:
                "A senha precisa ter pelo menos 6 caracteres."

        };

    }


    if (
        typeof firebase === "undefined" ||
        !firebase.auth ||
        !firebase.firestore
    ) {

        return {

            ok: false,

            mensagem:
                "Firebase não foi carregado corretamente."

        };

    }


    let usuarioFirebase =
        null;


    try {

        /* =====================================
           1. CRIAR USUÁRIO NO FIREBASE AUTH
        ===================================== */

        const credencial =
            await firebase
                .auth()
                .createUserWithEmailAndPassword(
                    email,
                    senha
                );


        usuarioFirebase =
            credencial.user;


        if (
            !usuarioFirebase ||
            !usuarioFirebase.uid
        ) {

            throw new Error(
                "O Firebase não retornou o UID do usuário."
            );

        }


        /* =====================================
           UID REAL DO FIREBASE
        ===================================== */

        const uid =
            usuarioFirebase.uid;


        console.log(
            "Usuário Firebase criado:",
            uid
        );


        /* =====================================
           2. FIRESTORE
        ===================================== */

        const db =
            firebase.firestore();


        /* =====================================
           3. GERAR CÓDIGO DA LOJA
        ===================================== */

        const codigoLoja =
            await gerarCodigoLojaGestok();


        /* =====================================
           4. CRIAR DOCUMENTO DA LOJA
        ===================================== */

        const lojaRef =
            db
                .collection("lojas")
                .doc();


        const agora =
            firebase.firestore.FieldValue
                .serverTimestamp();


        await lojaRef.set({

            nome:
                nome,

            codigo:
                codigoLoja,

            donoUid:
                uid,

            email:
                email,

            criadaEm:
                agora,

            assinatura: {

                plano:
                    "Gestok",

                valor:
                    30,

                dias:
                    30,

                inicio:
                    null,

                vencimento:
                    null,

                status:
                    "aguardando_pagamento",

                pagamento:
                    "pendente"

            }

        });


        console.log(
            "Loja criada:",
            lojaRef.id
        );


        /* =====================================
           5. CRIAR USUÁRIO DENTRO DA LOJA
        ===================================== */

        await lojaRef
            .collection("usuarios")
            .doc(uid)
            .set({

                uid:
                    uid,

                lojaId:
                    lojaRef.id,

                codigoLoja:
                    codigoLoja,

                nome:
                    nome,

                email:
                    email,

                usuario:
                    usuario,

                perfil:
                    "proprietario",

                criadoEm:
                    agora

            });


        /* =====================================
           6. CRIAR ÍNDICE DE LOGIN
        ===================================== */

        await db
            .collection("acessos")
            .doc(
                `${codigoLoja}_${usuario}`
            )
            .set({

                lojaId:
                    lojaRef.id,

                uid:
                    uid,

                codigoLoja:
                    codigoLoja,

                usuario:
                    usuario,

                emailAuth:
                    email

            });


        /* =====================================
           7. ESPELHO LOCAL
           NÃO É AUTENTICAÇÃO
        ===================================== */

        const conta = {

            firebaseUid:
                uid,

            lojaId:
                lojaRef.id,

            nome:
                nome,

            email:
                email,

            usuario:
                usuario,

            codigoLoja:
                codigoLoja,

            assinatura: {

                plano:
                    "Gestok",

                valor:
                    30,

                dias:
                    30,

                inicio:
                    null,

                vencimento:
                    null,

                status:
                    "aguardando_pagamento",

                pagamento:
                    "pendente"

            },

            criadaEm:
                new Date().toISOString()

        };


        localStorage.setItem(

            GESTOK_CONTA,

            JSON.stringify(conta)

        );


        localStorage.setItem(

            GESTOK_SESSAO,

            JSON.stringify({

                logado:
                    true,

                firebaseUid:
                    uid,

                lojaId:
                    lojaRef.id,

                codigoLoja:
                    codigoLoja,

                usuario:
                    usuario,

                loginEm:
                    new Date().toISOString()

            })

        );


        /* =====================================
           SUCESSO
        ===================================== */

        return {

            ok: true,

            conta:
                conta,

            usuario:
                usuarioFirebase

        };


    } catch (erro) {

        console.error(
            "Erro ao criar conta Gestok:",
            erro
        );


        /* =====================================
           SE FIRESTORE FALHAR DEPOIS DO AUTH,
           REMOVE O USUÁRIO CRIADO
        ===================================== */

        if (
            usuarioFirebase &&
            usuarioFirebase.uid
        ) {

            try {

                await usuarioFirebase.delete();

                console.log(
                    "Usuário Firebase removido após falha."
                );

            } catch (erroDelete) {

                console.error(
                    "Não foi possível remover usuário Firebase:",
                    erroDelete
                );

            }

        }


        return {

            ok: false,

            mensagem:
                mensagemErroFirebaseGestok(
                    erro
                ),

            erro:
                erro

        };

    }

}


/* =========================================
   LOGIN
   CÓDIGO DA LOJA + USUÁRIO + SENHA
========================================= */

async function entrarGestok(

    codigoLoja,

    usuario,

    senha

) {

    codigoLoja =
        String(codigoLoja || "")
            .trim();

    usuario =
        String(usuario || "")
            .trim()
            .toLowerCase();

    senha =
        String(senha || "");


    if (!codigoLoja) {

        return {

            ok: false,

            mensagem:
                "Digite o código da loja."

        };

    }


    if (!usuario) {

        return {

            ok: false,

            mensagem:
                "Digite o usuário."

        };

    }


    if (!senha) {

        return {

            ok: false,

            mensagem:
                "Digite a senha."

        };

    }


    try {

        const db =
            firebase.firestore();


        /* =====================================
           1. LOCALIZAR ACESSO
        ===================================== */

        const acessoRef =
            db
                .collection("acessos")
                .doc(
                    `${codigoLoja}_${usuario}`
                );


        const acessoSnap =
            await acessoRef.get();


        if (!acessoSnap.exists) {

            return {

                ok: false,

                mensagem:
                    "Código da Loja ou usuário incorreto."

            };

        }


        const acesso =
            acessoSnap.data();


        if (
            !acesso.emailAuth ||
            !acesso.uid ||
            !acesso.lojaId
        ) {

            return {

                ok: false,

                mensagem:
                    "Dados de acesso da conta estão incompletos."

            };

        }


        /* =====================================
           2. LOGIN REAL NO FIREBASE AUTH
        ===================================== */

        const usuarioFirebase =
            await firebase
                .auth()
                .signInWithEmailAndPassword(

                    acesso.emailAuth,

                    senha

                );


        const user =
            usuarioFirebase.user;


        if (!user) {

            return {

                ok: false,

                mensagem:
                    "Não foi possível autenticar."

            };

        }


        /* =====================================
           3. CONFERIR UID
        ===================================== */

        if (
            user.uid !== acesso.uid
        ) {

            await firebase
                .auth()
                .signOut();


            return {

                ok: false,

                mensagem:
                    "A conta autenticada não corresponde à loja informada."

            };

        }


        /* =====================================
           4. BUSCAR LOJA
        ===================================== */

        const lojaSnap =
            await db
                .collection("lojas")
                .doc(
                    acesso.lojaId
                )
                .get();


        if (!lojaSnap.exists) {

            await firebase
                .auth()
                .signOut();


            return {

                ok: false,

                mensagem:
                    "Loja não encontrada."

            };

        }


        const loja =
            lojaSnap.data();


        /* =====================================
           5. CONFERIR DONO DA LOJA
        ===================================== */

        if (
            loja.donoUid !== user.uid
        ) {

            await firebase
                .auth()
                .signOut();


            return {

                ok: false,

                mensagem:
                    "Acesso não autorizado para esta loja."

            };

        }


        /* =====================================
           6. MONTAR CONTA LOCAL
        ===================================== */

        const conta = {

            firebaseUid:
                user.uid,

            lojaId:
                acesso.lojaId,

            nome:
                loja.nome || "",

            email:
                user.email || acesso.emailAuth,

            usuario:
                acesso.usuario,

            codigoLoja:
                acesso.codigoLoja,

            assinatura:
                loja.assinatura || {

                    plano:
                        "Gestok",

                    valor:
                        30,

                    dias:
                        30,

                    inicio:
                        null,

                    vencimento:
                        null,

                    status:
                        "aguardando_pagamento",

                    pagamento:
                        "pendente"

                }

        };


        localStorage.setItem(

            GESTOK_CONTA,

            JSON.stringify(conta)

        );


        localStorage.setItem(

            GESTOK_SESSAO,

            JSON.stringify({

                logado:
                    true,

                firebaseUid:
                    user.uid,

                lojaId:
                    acesso.lojaId,

                codigoLoja:
                    acesso.codigoLoja,

                usuario:
                    acesso.usuario,

                loginEm:
                    new Date().toISOString()

            })

        );


        return {

            ok: true,

            conta:
                conta,

            usuario:
                user

        };


    } catch (erro) {

        console.error(
            "Erro ao entrar no Gestok:",
            erro
        );


        return {

            ok: false,

            mensagem:
                mensagemErroFirebaseGestok(
                    erro
                ),

            erro:
                erro

        };

    }

}


/* =========================================
   APROVAR PAGAMENTO
   -----------------------------------------
   TEMPORÁRIO PARA TESTE.
   O PAGAMENTO REAL DEVERÁ SER CONFIRMADO
   PELO BACKEND/WEBHOOK.
========================================= */

async function aprovarPagamentoGestok() {

    const conta =
        obterContaGestok();


    const usuarioFirebase =
        usuarioFirebaseAtualGestok();


    if (!usuarioFirebase) {

        return {

            ok: false,

            mensagem:
                "Usuário não autenticado no Firebase."

        };

    }


    if (!conta) {

        return {

            ok: false,

            mensagem:
                "Conta Gestok não encontrada."

        };

    }


    if (!conta.lojaId) {

        return {

            ok: false,

            mensagem:
                "Loja não identificada."

        };

    }


    try {

        const db =
            firebase.firestore();


        const agora =
            new Date();


        const vencimento =
            new Date(
                agora
            );


        vencimento.setDate(
            vencimento.getDate() + 30
        );


        const assinatura = {

            plano:
                "Gestok",

            valor:
                30,

            dias:
                30,

            inicio:
                agora.toISOString(),

            vencimento:
                vencimento.toISOString(),

            status:
                "ativa",

            pagamento:
                "aprovado"

        };


        /* =====================================
           ATUALIZAR FIRESTORE
        ===================================== */

        await db
            .collection("lojas")
            .doc(
                conta.lojaId
            )
            .update({

                assinatura:
                    assinatura

            });


        /* =====================================
           ATUALIZAR ESPELHO LOCAL
        ===================================== */

        conta.assinatura =
            assinatura;


        localStorage.setItem(

            GESTOK_CONTA,

            JSON.stringify(conta)

        );


        return {

            ok: true,

            conta:
                conta

        };


    } catch (erro) {

        console.error(
            "Erro ao aprovar pagamento:",
            erro
        );


        return {

            ok: false,

            mensagem:
                mensagemErroFirebaseGestok(
                    erro
                ),

            erro:
                erro

        };

    }

}


/* =========================================
   EXIGIR LOGIN
   -----------------------------------------
   IMPORTANTE:
   FIREBASE AUTH É A AUTORIDADE.
========================================= */

function exigirLoginGestok() {

    const usuario =
        usuarioFirebaseAtualGestok();


    const pagina =
        window.location.pathname
            .toLowerCase();


    const paginasPublicas = [

        "/login/index.html",

        "/cadastro/index.html",

        "/planos/index.html",

        "/apresentacao.html",

        "/index.html"

    ];


    const paginaPublica =
        paginasPublicas.some(

            function (item) {

                return pagina.endsWith(item);

            }

        );


    if (paginaPublica) {

        return true;

    }


    /* -----------------------------------------
       SEM FIREBASE AUTH
    ----------------------------------------- */

    if (!usuario) {

        window.location.replace(
            caminhoLoginGestok()
        );

        return false;

    }


    return true;

}


/* =========================================
   CAMINHO DO SISTEMA
========================================= */

function caminhoSistemaGestok() {

    return "../sistema/index.html";

}


/* =========================================
   CAMINHO DO LOGIN
========================================= */

function caminhoLoginGestok() {

    return "../login/index.html";

}


/* =========================================
   CAMINHO DO PAGAMENTO
========================================= */

function caminhoPagamentoGestok() {

    return "../pagamento/index.html";

}


/* =========================================
   SAIR
========================================= */

async function sairGestok() {

    try {

        await firebase
            .auth()
            .signOut();

    } catch (erro) {

        console.error(
            "Erro ao sair do Firebase:",
            erro
        );

    }


    localStorage.removeItem(
        GESTOK_SESSAO
    );

    localStorage.removeItem(
        GESTOK_CONTA
    );


    window.location.href =
        caminhoLoginGestok();

}


/* =========================================
   DIAS RESTANTES
========================================= */

function diasRestantesGestok(

    conta =
        obterContaGestok()

) {

    if (

        !conta ||

        !conta.assinatura ||

        !conta.assinatura.vencimento

    ) {

        return 0;

    }


    const vencimento =
        new Date(
            conta.assinatura.vencimento
        ).getTime();


    if (
        !Number.isFinite(vencimento)
    ) {

        return 0;

    }


    const diferenca =
        vencimento -
        Date.now();


    return Math.max(

        0,

        Math.ceil(
            diferenca /
            86400000
        )

    );

}


/* =========================================
   MENSAGENS DE ERRO FIREBASE
========================================= */

function mensagemErroFirebaseGestok(
    erro
) {

    if (!erro) {

        return "Ocorreu um erro inesperado.";

    }


    const codigo =
        erro.code || "";


    const mensagens = {

        "auth/email-already-in-use":
            "Este e-mail já está cadastrado no Firebase.",

        "auth/invalid-email":
            "O e-mail informado é inválido.",

        "auth/weak-password":
            "A senha é muito fraca.",

        "auth/user-not-found":
            "Usuário não encontrado.",

        "auth/wrong-password":
            "Senha incorreta.",

        "auth/invalid-credential":
            "Código, usuário ou senha incorretos.",

        "auth/too-many-requests":
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",

        "auth/network-request-failed":
            "Falha de conexão com o Firebase.",

        "auth/operation-not-allowed":
            "O método de login por e-mail e senha não está habilitado no Firebase.",

        "permission-denied":
            "O Firebase bloqueou o acesso ao Firestore pelas regras de segurança.",

        "failed-precondition":
            "O Firebase recusou a operação por uma condição não atendida."

    };


    if (
        mensagens[codigo]
    ) {

        return mensagens[codigo];

    }


    if (
        erro.message
    ) {

        return erro.message;

    }


    return "Ocorreu um erro ao processar a operação.";

}