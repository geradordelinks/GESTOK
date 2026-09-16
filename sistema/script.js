/* =========================================
   GESTOK
   Dashboard principal
========================================= */


/* =========================================
   AUTENTICAÇÃO
========================================= */

if (!exigirLoginGestok()) {

    throw new Error(
        "Acesso bloqueado: assinatura necessária."
    );

}


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
   NÚMERO DE MOVIMENTAÇÕES
========================================= */

function atualizarNumeroMovimentacoes() {

    const elemento =
        document.getElementById(
            "totalMovimentacoes"
        );

    if (!elemento) {
        return;
    }

    let movimentacoes = [];

    try {

        movimentacoes =
            JSON.parse(
                localStorage.getItem(
                    "gestok_movimentacoes"
                )
            ) || [];

    } catch (erro) {

        movimentacoes = [];

    }

    elemento.textContent =
        movimentacoes.length;

}


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

    document.body.style.overflow =
        "hidden";

}


function fecharMenu() {

    if (sidebar) {

        sidebar.classList.remove("active");

    }

    if (overlay) {

        overlay.classList.remove("active");

    }

    document.body.style.overflow =
        "";

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

            navItems.forEach(
                function (nav) {

                    nav.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add(
                "active"
            );


            const pagina =
                this
                    .querySelector(
                        "span:last-child"
                    )
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
                    "../entrada/index.html";

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
                    "../saida/index.html";

                return;

            }


            /* =============================
               MOVIMENTAÇÕES
            ============================= */

            if (
                pagina === "Movimentações" ||
                pagina === "Movimentacoes"
            ) {

                window.location.href =
                    "../movimentacoes/index.html";

                return;

            }


            /* =============================
               SOLICITAÇÕES
            ============================= */

            if (
                pagina === "Solicitações" ||
                pagina === "Solicitacoes"
            ) {

                window.location.href =
                    "../solicitacoes/index.html";

                return;

            }

        }
    );

});


/* =========================================
   MOVIMENTAÇÕES DO DASHBOARD
========================================= */

const CHAVE_MOVIMENTACOES =
    "gestok_movimentacoes";


function obterMovimentacoesDashboard() {

    try {

        const dados =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_MOVIMENTACOES
                ) || "[]"
            );

        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar movimentações:",
            erro
        );

        return [];

    }

}


function formatarDataMovimentacao(
    data
) {

    const d =
        new Date(data);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(d);

}


function atualizarMovimentacoesDashboard() {

    const painel =
        document.querySelector(
            ".movements-panel"
        );

    if (!painel) {
        return;
    }


    const vazio =
        painel.querySelector(
            ".empty-state"
        );


    let movimentos =
        obterMovimentacoesDashboard()
            .filter(
                item =>
                    item &&
                    item.data
            )
            .sort(
                (a, b) =>
                    new Date(b.data) -
                    new Date(a.data)
            );


    const recentes =
        movimentos.slice(0, 5);


    let lista =
        painel.querySelector(
            ".dashboard-movements-list"
        );


    if (!recentes.length) {

        if (lista) {

            lista.remove();

        }

        if (vazio) {

            vazio.style.display =
                "flex";

            vazio.innerHTML = `

                <div class="empty-icon">
                    ↔
                </div>

                <strong>
                    Nenhuma movimentação
                </strong>

                <span>
                    As entradas e saídas aparecerão aqui.
                </span>

            `;

        }

        return;

    }


    if (vazio) {

        vazio.style.display =
            "none";

    }


    if (!lista) {

        lista =
            document.createElement(
                "div"
            );

        lista.className =
            "dashboard-movements-list";

        painel.appendChild(
            lista
        );

    }


    lista.innerHTML =
        recentes
            .map(function (item) {

                const entrada =
                    String(
                        item.tipo || ""
                    )
                    .toLowerCase()
                    .includes(
                        "entrada"
                    );


                const sinal =
                    entrada
                        ? "+"
                        : "−";


                const classe =
                    entrada
                        ? "movement-entry"
                        : "movement-exit";


                const icone =
                    entrada
                        ? "↓"
                        : "↑";


                const quantidade =
                    Number(
                        item.quantidade || 0
                    );


                const anterior =
                    item.estoqueAnterior ??
                    item.estoqueAntes ??
                    0;


                const novo =
                    item.estoqueNovo ??
                    item.estoqueDepois ??
                    0;


                return `

                    <div class="dashboard-movement ${classe}">

                        <div class="movement-main">

                            <div class="movement-icon">
                                ${icone}
                            </div>

                            <div class="movement-info">

                                <strong>
                                    ${item.produto || "Produto"}
                                </strong>

                                <span>
                                    ${
                                        item.tipo ||
                                        (
                                            entrada
                                                ? "Entrada"
                                                : "Saída"
                                        )
                                    }
                                    •
                                    ${formatarDataMovimentacao(item.data)}
                                </span>

                            </div>

                        </div>


                        <div class="movement-values">

                            <strong>
                                ${sinal}${quantidade}
                                ${item.unidade || "UN"}
                            </strong>

                            <span>
                                ${anterior} → ${novo}
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================
   NOTIFICAÇÕES DO SISTEMA
========================================= */

const CHAVE_AVISOS_SISTEMA =
    "gestok_avisos_sistema";

const CHAVE_AVISOS_LIDOS =
    "gestok_avisos_lidos";


const notificationButton =
    document.getElementById(
        "notificationButton"
    );

const notificationsPanel =
    document.getElementById(
        "notificationsPanel"
    );

const notificationsList =
    document.getElementById(
        "notificationsList"
    );

const notificationsEmpty =
    document.getElementById(
        "notificationsEmpty"
    );

const marcarAvisosLidos =
    document.getElementById(
        "marcarAvisosLidos"
    );


function obterAvisosSistema() {

    try {

        const avisos =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_AVISOS_SISTEMA
                ) || "[]"
            );

        return Array.isArray(avisos)
            ? avisos
            : [];

    } catch (erro) {

        return [];

    }

}


function obterAvisosLidos() {

    try {

        const lidos =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_AVISOS_LIDOS
                ) || "[]"
            );

        return Array.isArray(lidos)
            ? lidos
            : [];

    } catch (erro) {

        return [];

    }

}


function salvarAvisosLidos(ids) {

    localStorage.setItem(
        CHAVE_AVISOS_LIDOS,
        JSON.stringify(ids)
    );

}


function escaparHtml(texto) {

    return String(texto ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatarDataAviso(data) {

    const d =
        new Date(data);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "Aviso do sistema";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(d);

}


function atualizarNotificacoes() {

    if (!notificationsList) {
        return;
    }


    const avisos =
        obterAvisosSistema()
            .filter(
                aviso =>
                    aviso &&
                    aviso.id != null
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.data || 0
                    ) -
                    new Date(
                        a.data || 0
                    )
            );


    const lidos =
        obterAvisosLidos();


    const naoLidos =
        avisos.filter(
            aviso =>
                !lidos.includes(
                    String(aviso.id)
                )
        );


    const dot =
        notificationButton?.querySelector(
            ".notification-dot"
        );


    if (dot) {

        dot.style.display =
            naoLidos.length
                ? "block"
                : "none";

    }


    if (!avisos.length) {

        notificationsList.innerHTML =
            "";

        if (notificationsEmpty) {

            notificationsEmpty.hidden =
                false;

        }

        return;

    }


    if (notificationsEmpty) {

        notificationsEmpty.hidden =
            true;

    }


    notificationsList.innerHTML =
        avisos
            .slice(0, 10)
            .map(function (aviso) {

                const id =
                    String(aviso.id);

                const lido =
                    lidos.includes(id);

                const tipo =
                    String(
                        aviso.tipo || ""
                    )
                    .toLowerCase();


                const icone =
                    tipo.includes("manuten")
                        ? "🔧"
                        : tipo.includes("atual")
                            ? "↻"
                            : tipo.includes("recurso")
                                ? "✦"
                                : "ℹ";


                return `

                    <article
                        class="notification-item ${
                            lido
                                ? "is-read"
                                : "is-unread"
                        }"
                        data-aviso-id="${escaparHtml(id)}"
                    >

                        <div class="notification-item-icon">
                            ${icone}
                        </div>

                        <div class="notification-item-content">

                            <div class="notification-item-top">

                                <strong>
                                    ${
                                        escaparHtml(
                                            aviso.titulo ||
                                            "Aviso do sistema"
                                        )
                                    }
                                </strong>

                                ${
                                    lido
                                        ? ""
                                        : '<span class="notification-new">NOVO</span>'
                                }

                            </div>

                            <p>
                                ${
                                    escaparHtml(
                                        aviso.mensagem || ""
                                    )
                                }
                            </p>

                            <small>
                                ${formatarDataAviso(aviso.data)}
                            </small>

                        </div>

                    </article>

                `;

            })
            .join("");


    notificationsList
        .querySelectorAll(
            ".notification-item"
        )
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    const id =
                        item.dataset.avisoId;

                    const ids =
                        obterAvisosLidos();


                    if (!ids.includes(id)) {

                        ids.push(id);

                        salvarAvisosLidos(
                            ids
                        );

                        atualizarNotificacoes();

                    }

                }
            );

        });

}


function alternarNotificacoes() {

    if (!notificationsPanel) {
        return;
    }


    const aberto =
        notificationsPanel.classList.toggle(
            "active"
        );


    notificationsPanel.setAttribute(
        "aria-hidden",
        String(!aberto)
    );


    if (aberto) {

        atualizarNotificacoes();

    }

}


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function (evento) {

            evento.stopPropagation();

            alternarNotificacoes();

        }
    );

}


if (notificationsPanel) {

    notificationsPanel.addEventListener(
        "click",
        function (evento) {

            evento.stopPropagation();

        }
    );

}


document.addEventListener(
    "click",
    function () {

        if (!notificationsPanel) {
            return;
        }

        notificationsPanel.classList.remove(
            "active"
        );

        notificationsPanel.setAttribute(
            "aria-hidden",
            "true"
        );

    }
);


if (marcarAvisosLidos) {

    marcarAvisosLidos.addEventListener(
        "click",
        function () {

            salvarAvisosLidos(
                obterAvisosSistema()
                    .map(
                        aviso =>
                            String(aviso.id)
                    )
            );

            atualizarNotificacoes();

        }
    );

}


window.addEventListener(
    "storage",
    function (evento) {

        if (
            evento.key ===
                CHAVE_AVISOS_SISTEMA ||
            evento.key ===
                CHAVE_AVISOS_LIDOS
        ) {

            atualizarNotificacoes();

        }

    }
);


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
   PRODUTOS DO FIRESTORE
   -----------------------------------------
   O dashboard não usa mais gestok_produtos.
========================================= */

let cancelarProdutosDashboard = null;


function obterLojaDashboardGestok() {

    const usuario =
        usuarioFirebaseAtualGestok();

    const conta =
        obterContaGestok();

    if (!usuario || !conta || !conta.lojaId) {
        return null;
    }

    if (
        conta.firebaseUid &&
        conta.firebaseUid !== usuario.uid
    ) {
        return null;
    }

    return conta.lojaId;

}


function obterProdutosDashboard() {

    const lojaId =
        obterLojaDashboardGestok();

    if (!lojaId) {
        return null;
    }

    return referenciaProdutos(lojaId);

}


/* =========================================
   ATUALIZAR DASHBOARD
========================================= */

function atualizarDashboard(
    produtos = []
) {

    const produtosAtivos =
        produtos.filter(
            function (produto) {

                return produto.ativo !== false;

            }
        );


    const estoqueMinimo =
        produtosAtivos.filter(
            function (produto) {

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

            }
        );


    const quantidadeTotal =
        produtosAtivos.reduce(
            function (
                total,
                produto
            ) {

                return (
                    total +
                    Number(
                        produto.quantidade || 0
                    )
                );

            },
            0
        );


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


    if (elementoProdutos) {

        elementoProdutos.textContent =
            produtosAtivos.length;

    }

    if (elementoEstoqueMinimo) {

        elementoEstoqueMinimo.textContent =
            estoqueMinimo.length;

    }

    if (elementoEstoqueMaximo) {

        elementoEstoqueMaximo.textContent =
            quantidadeTotal;

    }


    const alertCount =
        document.querySelector(
            ".alert-count"
        );

    if (alertCount) {

        alertCount.textContent =
            estoqueMinimo.length;

    }


    atualizarEstadoAlertas(
        estoqueMinimo
    );

}


/* =========================================
   MONITORAR PRODUTOS EM TEMPO REAL
========================================= */

function iniciarMonitoramentoProdutosDashboard() {

    if (cancelarProdutosDashboard) {

        cancelarProdutosDashboard();
        cancelarProdutosDashboard = null;

    }


    const referencia =
        obterProdutosDashboard();


    if (!referencia) {

        atualizarDashboard([]);
        return;

    }


    cancelarProdutosDashboard =
        referencia
            .onSnapshot(
                function (snapshot) {

                    const produtos =
                        snapshot.docs.map(
                            function (doc) {

                                return {
                                    id: doc.id,
                                    ...doc.data()
                                };

                            }
                        );

                    atualizarDashboard(
                        produtos
                    );

                    console.log(
                        "Dashboard atualizado pelo Firestore.",
                        produtos.length,
                        "produtos"
                    );

                },
                function (erro) {

                    console.error(
                        "Erro ao monitorar produtos do dashboard:",
                        erro
                    );

                    atualizarDashboard([]);

                }
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

    lista.innerHTML = "";


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


    emptyState.style.display =
        "none";


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
                document.createElement(
                    "div"
                );

            card.className =
                "alert-product-card";

            card.innerHTML = `

                <div class="alert-product-top">

                    <div class="alert-product-icon">
                        !
                    </div>

                    <div class="alert-product-name">

                        <strong>
                            ${escaparHtmlDashboard(produto.nome || "Produto sem nome")}
                        </strong>

                        ${
                            produto.codigo
                                ? `
                                    <small>
                                        Código: ${escaparHtmlDashboard(produto.codigo)}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                </div>

                <div class="alert-product-details">

                    <div>
                        <span>Estoque atual</span>
                        <strong>
                            ${quantidade} ${escaparHtmlDashboard(unidade)}
                        </strong>
                    </div>

                    <div>
                        <span>Estoque mínimo</span>
                        <strong>
                            ${minimo} ${escaparHtmlDashboard(unidade)}
                        </strong>
                    </div>

                </div>

                <div class="alert-product-warning">
                    ⚠ Estoque abaixo do mínimo
                </div>

            `;

            lista.appendChild(card);

        }
    );

}


function escaparHtmlDashboard(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   USUÁRIO LOGADO
========================================= */

/* =========================================
   USUÁRIO LOGADO
========================================= */

/* =========================================
   USUÁRIO LOGADO
========================================= */

function atualizarNomeUsuario() {

    const nomePrincipal =
        document.getElementById("nomeUsuario");

    const nomeMenu =
        document.getElementById("nomeUsuarioMenu");

    const avatar =
        document.getElementById("avatarUsuario");


    try {

        const dados =
            localStorage.getItem("gestok_conta");


        if (!dados) {

            console.warn(
                "Nenhuma conta encontrada em gestok_conta."
            );

            return;

        }


        const conta =
            JSON.parse(dados);


        if (
            !conta ||
            !conta.nome
        ) {

            return;

        }


        const nome =
            String(conta.nome).trim();


        if (!nome) {

            return;

        }


        /* =====================================
           NOME NO CENTRO
        ===================================== */

        if (nomePrincipal) {

            nomePrincipal.textContent =
                nome;

        }


        /* =====================================
           NOME NO CANTO SUPERIOR
        ===================================== */

        if (nomeMenu) {

            nomeMenu.textContent =
                nome;

        }


        /* =====================================
           AVATAR
        ===================================== */

        if (avatar) {

            avatar.textContent =
                nome.charAt(0).toUpperCase();

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

    }

}


/* =========================================
   ATUALIZAR QUANDO O ESTOQUE MUDAR
========================================= */

window.addEventListener(
    "storage",
    function (evento) {

        if (
            evento.key ===
            "gestok_conta"
        ) {

            atualizarNomeUsuario();
            iniciarMonitoramentoProdutosDashboard();

        }

    }
);


/* =========================================
   ATUALIZAR AO VOLTAR PARA A PÁGINA
========================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            iniciarMonitoramentoProdutosDashboard();

            atualizarMovimentacoesDashboard();

            atualizarNumeroMovimentacoes();

            atualizarNomeUsuario();

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

        iniciarMonitoramentoProdutosDashboard();

        atualizarMovimentacoesDashboard();

        atualizarNumeroMovimentacoes();

        atualizarNomeUsuario();

        atualizarNotificacoes();

    }
);


/* =========================================
   PÁGINA VOLTOU A FICAR VISÍVEL
========================================= */

window.addEventListener(
    "pageshow",
    function () {

        atualizarData();

        iniciarMonitoramentoProdutosDashboard();

        atualizarMovimentacoesDashboard();

        atualizarNumeroMovimentacoes();

        atualizarNomeUsuario();

    }
);


/* =========================================
   VER TODAS AS MOVIMENTAÇÕES
========================================= */

const verTodasMovimentacoes =
    document.getElementById(
        "verTodasMovimentacoes"
    );


if (verTodasMovimentacoes) {

    verTodasMovimentacoes.addEventListener(
        "click",
        function () {

            window.location.href =
                "../movimentacoes/index.html";

        }
    );

}