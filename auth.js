/* =========================================
   GESTOK - AUTENTICAÇÃO E ASSINATURA
========================================= */

const GESTOK_CONTA = "gestok_conta";
const GESTOK_SESSAO = "gestok_sessao";


/* =========================================
   OBTER CONTA
========================================= */

function obterContaGestok() {

    try {

        const conta = JSON.parse(
            localStorage.getItem(GESTOK_CONTA) || "null"
        );

        return conta && typeof conta === "object"
            ? conta
            : null;

    } catch (erro) {

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

        return sessao && typeof sessao === "object"
            ? sessao
            : null;

    } catch (erro) {

        return null;

    }

}


/* =========================================
   VERIFICAR PAGAMENTO
========================================= */

function pagamentoAprovadoGestok(conta) {

    if (!conta || !conta.assinatura) {
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

    if (!pagamentoAprovadoGestok(conta)) {
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

    return "sistema/index.html";

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
   EXIGIR LOGIN + PAGAMENTO
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
        paginasPublicas.some(function (item) {

            return pagina.endsWith(item);

        });


    if (paginaPublica) {
        return true;
    }


    /* -----------------------------------------
       NÃO POSSUI CONTA
    ----------------------------------------- */

    if (!conta) {

        window.location.replace(
            caminhoLoginGestok()
        );

        return false;

    }


    /* -----------------------------------------
       NÃO ESTÁ LOGADO
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
       CONTA SEM PAGAMENTO
    ----------------------------------------- */

    if (!pagamentoAprovadoGestok(conta)) {

        window.location.replace(
            caminhoPagamentoGestok()
        );

        return false;

    }


    /* -----------------------------------------
       PAGAMENTO APROVADO, MAS ASSINATURA EXPIRADA
    ----------------------------------------- */

    if (!assinaturaAtivaGestok(conta)) {

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


    const agora =
        new Date();


    const conta = {

        nome:
            nome.trim(),

        email:
            email.trim().toLowerCase(),

        senha:
            senha,

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


    /*
     * A conta existe,
     * mas ainda NÃO está logada.
     */

    localStorage.removeItem(
        GESTOK_SESSAO
    );


    return {

        ok: true,

        conta: conta

    };

}


/* =========================================
   LOGIN
========================================= */

function entrarGestok(
    email,
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


    if (

        conta.email !==
            email.trim().toLowerCase() ||

        conta.senha !==
            senha

    ) {

        return {

            ok: false,

            mensagem:
                "E-mail ou senha incorretos."

        };

    }


    /*
     * Login permitido mesmo antes do pagamento,
     * porém o sistema continuará bloqueado.
     */

    localStorage.setItem(

        GESTOK_SESSAO,

        JSON.stringify({

            logado: true,

            loginEm:
                new Date().toISOString()

        })

    );


    return {

        ok: true,

        conta: conta

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


    localStorage.setItem(

        GESTOK_SESSAO,

        JSON.stringify({

            logado: true,

            loginEm:
                agora.toISOString()

        })

    );


    return {

        ok: true,

        conta: conta

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
    conta = obterContaGestok()
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