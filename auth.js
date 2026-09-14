/* =========================================
   GESTOK - AUTENTICAÇÃO
   CÓDIGO DA LOJA + USUÁRIO + SENHA
========================================= */

const GESTOK_CONTA = "gestok_conta";
const GESTOK_SESSAO = "gestok_sessao";

const GESTOK_PROXIMO_CODIGO_LOJA =
    "gestok_proximo_codigo_loja";


/* =========================================
   OBTER CONTA
========================================= */

function obterContaGestok() {

    try {

        const conta = JSON.parse(
            localStorage.getItem(GESTOK_CONTA) || "null"
        );

        return conta &&
            typeof conta === "object"
            ? conta
            : null;

    } catch (erro) {

        console.error(
            "Erro ao carregar conta:",
            erro
        );

        return null;

    }

}


/* =========================================
   OBTER SESSÃO
========================================= */

function obterSessaoGestok() {

    try {

        const sessao = JSON.parse(
            localStorage.getItem(GESTOK_SESSAO) || "null"
        );

        return sessao &&
            typeof sessao === "object"
            ? sessao
            : null;

    } catch (erro) {

        return null;

    }

}


/* =========================================
   GERAR CÓDIGO DA LOJA
========================================= */

function gerarCodigoLojaGestok() {

    let proximo = Number(

        localStorage.getItem(
            GESTOK_PROXIMO_CODIGO_LOJA
        ) || "1"

    );


    if (
        !Number.isInteger(proximo) ||
        proximo < 1
    ) {

        proximo = 1;

    }


    const codigo = String(proximo)
        .padStart(4, "0");


    localStorage.setItem(

        GESTOK_PROXIMO_CODIGO_LOJA,

        String(proximo + 1)

    );


    return codigo;

}


/* =========================================
   VERIFICAR PAGAMENTO
========================================= */

function pagamentoAprovadoGestok(conta) {

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
   VERIFICAR ASSINATURA
========================================= */

function assinaturaAtivaGestok(conta) {

    if (
        !pagamentoAprovadoGestok(conta)
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
   USUÁRIO LOGADO
========================================= */

function usuarioLogadoGestok() {

    const conta =
        obterContaGestok();

    const sessao =
        obterSessaoGestok();


    return Boolean(

        conta &&

        sessao &&

        sessao.logado === true &&

        assinaturaAtivaGestok(conta)

    );

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
   EXIGIR LOGIN
========================================= */

function exigirLoginGestok() {

    const conta =
        obterContaGestok();

    const sessao =
        obterSessaoGestok();

    const pagina =
        window.location.pathname.toLowerCase();


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
       SEM CONTA
    ----------------------------------------- */

    if (!conta) {

        window.location.replace(
            caminhoLoginGestok()
        );

        return false;

    }


    /* -----------------------------------------
       SEM SESSÃO
    ----------------------------------------- */

    if (
        !sessao ||
        sessao.logado !== true
    ) {

        window.location.replace(
            caminhoLoginGestok()
        );

        return false;

    }


    /* -----------------------------------------
       PAGAMENTO PENDENTE
    ----------------------------------------- */

    if (
        !pagamentoAprovadoGestok(conta)
    ) {

        window.location.replace(
            caminhoPagamentoGestok()
        );

        return false;

    }


    /* -----------------------------------------
       ASSINATURA EXPIRADA
    ----------------------------------------- */

    if (
        !assinaturaAtivaGestok(conta)
    ) {

        conta.assinatura.status =
            "expirada";


        localStorage.setItem(

            GESTOK_CONTA,

            JSON.stringify(conta)

        );


        window.location.replace(
            caminhoPagamentoGestok()
        );


        return false;

    }


    return true;

}


/* =========================================
   CRIAR CONTA
========================================= */

function criarContaGestok(

    nome,

    email,

    usuario,

    senha

) {

    const contaExistente =
        obterContaGestok();


    if (contaExistente) {

        return {

            ok: false,

            mensagem:
                "Já existe uma conta neste navegador."

        };

    }


    nome =
        String(nome || "").trim();

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


    const agora =
        new Date();


    const conta = {

        nome:
            nome,

        email:
            email,

        usuario:
            usuario,

        senha:
            senha,

        codigoLoja:
            null,

        criadaEm:
            agora.toISOString(),

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

    };


    localStorage.setItem(

        GESTOK_CONTA,

        JSON.stringify(conta)

    );


    localStorage.removeItem(
        GESTOK_SESSAO
    );


    return {

        ok: true,

        conta:
            conta

    };

}


/* =========================================
   LOGIN
   CÓDIGO + USUÁRIO + SENHA
========================================= */

function entrarGestok(

    codigoLoja,

    usuario,

    senha

) {

    const conta =
        obterContaGestok();


    if (!conta) {

        return {

            ok: false,

            mensagem:
                "Nenhuma conta foi cadastrada neste navegador."

        };

    }


    codigoLoja =
        String(codigoLoja || "")
            .trim();


    usuario =
        String(usuario || "")
            .trim()
            .toLowerCase();


    senha =
        String(senha || "");


    /* -----------------------------------------
       VERIFICAR CÓDIGO DA LOJA
    ----------------------------------------- */

    if (
        conta.codigoLoja !==
        codigoLoja
    ) {

        return {

            ok: false,

            mensagem:
                "Código da Loja incorreto."

        };

    }


    /* -----------------------------------------
       VERIFICAR USUÁRIO
    ----------------------------------------- */

    if (
        conta.usuario !==
        usuario
    ) {

        return {

            ok: false,

            mensagem:
                "Usuário incorreto."

        };

    }


    /* -----------------------------------------
       VERIFICAR SENHA
    ----------------------------------------- */

    if (
        conta.senha !==
        senha
    ) {

        return {

            ok: false,

            mensagem:
                "Senha incorreta."

        };

    }


    /* -----------------------------------------
       CRIAR SESSÃO
    ----------------------------------------- */

    localStorage.setItem(

        GESTOK_SESSAO,

        JSON.stringify({

            logado:
                true,

            codigoLoja:
                conta.codigoLoja,

            usuario:
                conta.usuario,

            loginEm:
                new Date().toISOString()

        })

    );


    return {

        ok: true,

        conta:
            conta

    };

}


/* =========================================
   APROVAR PAGAMENTO
========================================= */

function aprovarPagamentoGestok() {

    const conta =
        obterContaGestok();


    if (!conta) {

        return {

            ok: false,

            mensagem:
                "Conta não encontrada."

        };

    }


    /* -----------------------------------------
       GERAR CÓDIGO DA LOJA
       SOMENTE UMA VEZ
    ----------------------------------------- */

    if (!conta.codigoLoja) {

        conta.codigoLoja =
            gerarCodigoLojaGestok();

    }


    const agora =
        new Date();


    const vencimento =
        new Date(agora);


    vencimento.setDate(

        vencimento.getDate() + 30

    );


    conta.assinatura.inicio =
        agora.toISOString();


    conta.assinatura.vencimento =
        vencimento.toISOString();


    conta.assinatura.status =
        "ativa";


    conta.assinatura.pagamento =
        "aprovado";


    localStorage.setItem(

        GESTOK_CONTA,

        JSON.stringify(conta)

    );


    /* -----------------------------------------
       CRIAR SESSÃO
    ----------------------------------------- */

    localStorage.setItem(

        GESTOK_SESSAO,

        JSON.stringify({

            logado:
                true,

            codigoLoja:
                conta.codigoLoja,

            usuario:
                conta.usuario,

            loginEm:
                agora.toISOString()

        })

    );


    return {

        ok: true,

        conta:
            conta

    };

}


/* =========================================
   SAIR
========================================= */

function sairGestok() {

    localStorage.removeItem(
        GESTOK_SESSAO
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


    const diferenca =

        new Date(
            conta.assinatura.vencimento
        ).getTime() -

        Date.now();


    return Math.max(

        0,

        Math.ceil(
            diferenca / 86400000
        )

    );

}