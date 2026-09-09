/* =========================================
GESTOK
Dashboard principal
========================================= */

/* =========================================
ELEMENTOS
========================================= */

const sidebar =
document.getElementById("sidebar");

const overlay =
document.getElementById("overlay");

const menuButton =
document.getElementById("menuButton");

const closeSidebar =
document.getElementById("closeSidebar");

const quickActions =
document.querySelectorAll(".quick-action");

const navItems =
document.querySelectorAll(".nav-item");

/* =========================================
MENU
========================================= */

function abrirMenu() {

if (sidebar) {
    sidebar.classList.add("active");
}

if (overlay) {
    overlay.classList.add("active");
}

document.body.style.overflow = "hidden";

}

function fecharMenu() {

if (sidebar) {
    sidebar.classList.remove("active");
}

if (overlay) {
    overlay.classList.remove("active");
}

document.body.style.overflow = "";

}

if (menuButton) {

menuButton.addEventListener(
    "click",
    abrirMenu
);

}

if (closeSidebar) {

closeSidebar.addEventListener(
    "click",
    fecharMenu
);

}

if (overlay) {

overlay.addEventListener(
    "click",
    fecharMenu
);

}

/* =========================================
ESC FECHA MENU
========================================= */

document.addEventListener(
"keydown",
function (event) {

    if (event.key === "Escape") {

        fecharMenu();

    }

}

);

/* =========================================
NAVEGAÇÃO DO MENU
========================================= */

navItems.forEach(function (item) {

item.addEventListener(
    "click",
    function () {

        navItems.forEach(function (nav) {

            nav.classList.remove("active");

        });


        this.classList.add("active");


        const pagina =
            this
                .querySelector("span:last-child")
                ?.textContent
                .trim();


        console.log(
            "Página selecionada:",
            pagina
        );


        fecharMenu();

    }
);

});

/* =========================================
AÇÕES RÁPIDAS
========================================= */

quickActions.forEach(function (button) {

button.addEventListener(
    "click",
    function () {

        const pagina =
            this.dataset.page;


        console.log(
            "Abrindo módulo:",
            pagina
        );


        /* =============================
           ENTRADA
        ============================= */

        if (pagina === "Entrada") {

            window.location.href =
                "entrada/index.html";

            return;

        }


        /* =============================
           SAÍDA
        ============================= */

        if (
            pagina === "Saída" ||
            pagina === "Saida"
        ) {

            window.location.href =
                "saida/index.html";

            return;

        }


        /* =============================
           MOVIMENTAÇÕES
        ============================= */

        if (
            pagina === "Movimentações" ||
            pagina === "Movimentacoes"
        ) {

            console.log(
                "Página de movimentações ainda não criada."
            );

            return;

        }


        /* =============================
           SOLICITAÇÕES
        ============================= */

        if (
            pagina === "Solicitações" ||
            pagina === "Solicitacoes"
        ) {

            console.log(
                "Página de solicitações ainda não criada."
            );

            return;

        }

    }
);

});

/* =========================================
NOTIFICAÇÕES
========================================= */

const notificationButton =
document.getElementById(
"notificationButton"
);

if (notificationButton) {

notificationButton.addEventListener(
    "click",
    function () {

        console.log(
            "Abrindo notificações..."
        );

    }
);

}

/* =========================================
DATA ATUAL
========================================= */

function atualizarData() {

const elemento =
    document.getElementById(
        "currentDate"
    );


if (!elemento) {
    return;
}


const agora =
    new Date();


const meses = [

    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"

];


const dia =
    String(
        agora.getDate()
    ).padStart(2, "0");


const mes =
    meses[
        agora.getMonth()
    ];


const ano =
    agora.getFullYear();


elemento.textContent =
    `${dia} ${mes} ${ano}`;

}

/* =========================================
OBTER PRODUTOS
========================================= */

function obterProdutos() {

const dados =
    localStorage.getItem(
        "gestok_produtos"
    );


if (!dados) {

    return [];

}


try {

    const produtos =
        JSON.parse(dados);


    if (!Array.isArray(produtos)) {

        return [];

    }


    return produtos;

} catch (erro) {

    console.error(
        "Erro ao carregar produtos:",
        erro
    );

    return [];

}

}

/* =========================================
ATUALIZAR DASHBOARD
========================================= */

function atualizarDashboard() {

const produtos =
    obterProdutos();


/* =====================================
   PRODUTOS ATIVOS
====================================== */

const produtosAtivos =
    produtos.filter(function (produto) {

        return produto.ativo !== false;

    });


/* =====================================
   ESTOQUE ABAIXO DO MÍNIMO
====================================== */

const estoqueMinimo =
    produtosAtivos.filter(function (produto) {

        const quantidade =
            Number(
                produto.quantidade || 0
            );


        const minimo =
            Number(
                produto.estoqueMinimo || 0
            );


        return (
            minimo > 0 &&
            quantidade < minimo
        );

    });


/* =====================================
   QUANTIDADE TOTAL EM ESTOQUE
====================================== */

const quantidadeTotal =
    produtosAtivos.reduce(
        function (total, produto) {

            return (
                total +
                Number(
                    produto.quantidade || 0
                )
            );

        },
        0
    );


/* =====================================
   ELEMENTOS DO DASHBOARD
====================================== */

const elementoProdutos =
    document.getElementById(
        "produtosAtivos"
    );


const elementoEstoqueMinimo =
    document.getElementById(
        "estoqueMinimo"
    );


const elementoEstoqueMaximo =
    document.getElementById(
        "estoqueMaximo"
    );


/* =====================================
   PRODUTOS ATIVOS
====================================== */

if (elementoProdutos) {

    elementoProdutos.textContent =
        produtosAtivos.length;

}


/* =====================================
   ESTOQUE MÍNIMO
====================================== */

if (elementoEstoqueMinimo) {

    elementoEstoqueMinimo.textContent =
        estoqueMinimo.length;

}


/* =====================================
   QUANTIDADE TOTAL
====================================== */

if (elementoEstoqueMaximo) {

    elementoEstoqueMaximo.textContent =
        quantidadeTotal;

}


/* =====================================
   CONTADOR DE ALERTAS
====================================== */

const alertCount =
    document.querySelector(
        ".alert-count"
    );


if (alertCount) {

    alertCount.textContent =
        estoqueMinimo.length;

}


/* =====================================
   ATUALIZAR ALERTAS
====================================== */

atualizarEstadoAlertas(
    estoqueMinimo
);

}

/* =========================================
ATUALIZAR PAINEL DE ALERTAS
========================================= */

function atualizarEstadoAlertas(
produtosAbaixoMinimo
) {

const emptyState =
    document.getElementById(
        "alertEmptyState"
    );


const lista =
    document.getElementById(
        "alertProductsList"
    );


if (!emptyState || !lista) {

    console.warn(
        "Elementos de alerta não encontrados no HTML."
    );

    return;

}


/* =====================================
   LIMPAR CARTÕES ANTERIORES
====================================== */

lista.innerHTML = "";


/* =====================================
   NENHUM ALERTA
====================================== */

if (
    produtosAbaixoMinimo.length === 0
) {

    emptyState.style.display =
        "flex";


    emptyState.innerHTML = `

        <div class="empty-icon success">
            ✓
        </div>

        <strong>
            Tudo certo!
        </strong>

        <span>
            Nenhum produto está abaixo
            do estoque mínimo.
        </span>

    `;


    return;

}


/* =====================================
   EXISTEM PRODUTOS ABAIXO DO MÍNIMO
====================================== */

emptyState.style.display =
    "none";


/* =====================================
   CRIAR UM CARTÃO PARA CADA PRODUTO
====================================== */

produtosAbaixoMinimo.forEach(
    function (produto) {

        const quantidade =
            Number(
                produto.quantidade || 0
            );


        const minimo =
            Number(
                produto.estoqueMinimo || 0
            );


        const unidade =
            produto.unidade || "UN";


        const card =
            document.createElement("div");


        card.className =
            "alert-product-card";


        /* =================================
           CONTEÚDO DO CARTÃO
        ================================== */

        card.innerHTML = `

            <div class="alert-product-top">


                <div class="alert-product-icon">
                    !
                </div>


                <div class="alert-product-name">

                    <strong>
                        ${produto.nome || "Produto sem nome"}
                    </strong>


                    ${
                        produto.codigo
                            ? `
                                <small>
                                    Código: ${produto.codigo}
                                </small>
                              `
                            : ""
                    }

                </div>


            </div>



            <div class="alert-product-details">


                <div>

                    <span>
                        Estoque atual
                    </span>

                    <strong>
                        ${quantidade} ${unidade}
                    </strong>

                </div>



                <div>

                    <span>
                        Estoque mínimo
                    </span>

                    <strong>
                        ${minimo} ${unidade}
                    </strong>

                </div>


            </div>



            <div class="alert-product-warning">

                ⚠ Estoque abaixo do mínimo

            </div>

        `;


        lista.appendChild(
            card
        );

    }
);

}

/* =========================================
ATUALIZAR QUANDO OUTRA ABA ALTERAR ESTOQUE
========================================= */

window.addEventListener(
"storage",
function (event) {

    if (
        event.key ===
        "gestok_produtos"
    ) {

        atualizarDashboard();

    }

}

);

/* =========================================
ATUALIZAR QUANDO A PÁGINA VOLTAR A FICAR VISÍVEL
========================================= */

document.addEventListener(
"visibilitychange",
function () {

    if (
        document.visibilityState ===
        "visible"
    ) {

        atualizarDashboard();

    }

}

);

/* =========================================
INICIALIZAÇÃO
========================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

    atualizarData();

    atualizarDashboard();

}

);