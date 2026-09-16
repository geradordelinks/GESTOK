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
   MOVIMENTAÇÕES DO DASHBOARD - FIRESTORE
========================================= */

let unsubscribeMovimentacoesDashboard = null;

function timestampParaDataGestok(valor) {

    if (!valor) {
        return null;
    }

    if (typeof valor.toDate === "function") {
        return valor.toDate();
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
        ? null
        : data;

}


function formatarDataMovimentacao(data) {

    const d = timestampParaDataGestok(data);

    if (!d) {
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


function renderizarMovimentacoesDashboard(movimentos) {

    const painel =
        document.querySelector(".movements-panel");

    if (!painel) {
        return;
    }

    const vazio =
        painel.querySelector(".empty-state");

    const recentes = movimentos.slice(0, 5);

    let lista =
        painel.querySelector(
            ".dashboard-movements-list"
        );

    if (!recentes.length) {

        if (lista) {
            lista.remove();
        }

        if (vazio) {

            vazio.style.display = "flex";

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
        vazio.style.display = "none";
    }

    if (!lista) {

        lista =
            document.createElement("div");

        lista.className =
            "dashboard-movements-list";

        painel.appendChild(lista);

    }

    lista.innerHTML =
        recentes.map(function (item) {

            const entrada =
                String(item.tipo || "")
                    .toLowerCase()
                    .includes("entrada");

            const sinal =
                entrada ? "+" : "−";

            const classe =
                entrada
                    ? "movement-entry"
                    : "movement-exit";

            const icone =
                entrada ? "↓" : "↑";

            const quantidade =
                Number(item.quantidade || 0);

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
                                    (entrada ? "Entrada" : "Saída")
                                }
                                •
                                ${formatarDataMovimentacao(item.data)}
                            </span>

                        </div>

                    </div>

                    <div class="movement-values">

                        <strong class="movement-quantity">
                            ${sinal}${quantidade}
                        </strong>

                        <span>
                            ${item.unidade || "UN"}
                        </span>

                        <small>
                            ${anterior} → ${novo}
                        </small>

                    </div>

                </div>
            `;

        })
        .join("");

}


function iniciarMonitoramentoMovimentacoesDashboard() {

    if (
        typeof firebase === "undefined" ||
        !firebase.auth ||
        !firebase.firestore
    ) {
        return;
    }

    const usuario =
        firebase.auth().currentUser;

    if (!usuario) {
        return;
    }

    const conta =
        typeof obterContaGestok === "function"
            ? obterContaGestok()
            : null;

    const lojaId =
        conta && conta.lojaId;

    if (!lojaId) {
        return;
    }

    if (unsubscribeMovimentacoesDashboard) {
        unsubscribeMovimentacoesDashboard();
        unsubscribeMovimentacoesDashboard = null;
    }

    const referencia =
        firebase
            .firestore()
            .collection("lojas")
            .doc(lojaId)
            .collection("movimentacoes")
            .orderBy("data", "desc");

    unsubscribeMovimentacoesDashboard =
        referencia.onSnapshot(
            function (snapshot) {

                const movimentos =
                    snapshot.docs
                        .map(function (doc) {

                            return {
                                id: doc.id,
                                ...doc.data()
                            };

                        })
                        .sort(function (a, b) {

                            const dataA =
                                timestampParaDataGestok(a.data);

                            const dataB =
                                timestampParaDataGestok(b.data);

                            return (
                                (dataB?.getTime() || 0) -
                                (dataA?.getTime() || 0)
                            );

                        });

                const elemento =
                    document.getElementById(
                        "totalMovimentacoes"
                    );

                if (elemento) {
                    elemento.textContent =
                        snapshot.size;
                }

                renderizarMovimentacoesDashboard(
                    movimentos
                );

            },
            function (erro) {

                console.error(
                    "Erro ao monitorar movimentações do Dashboard:",
                    erro
                );

            }
        );

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

            iniciarMonitoramentoMovimentacoesDashboard();

            atualizarNomeUsuario();

        }

    }
);


/* =========================================
   INICIALIZAÇÃO
   -----------------------------------------
   Aguarda o Firebase restaurar a sessão
   antes de iniciar o listener do Firestore.
========================================= */

let dashboardFirebaseInicializado = false;

function iniciarDashboardComFirebase() {

    if (dashboardFirebaseInicializado) {
        return;
    }

    dashboardFirebaseInicializado = true;

    atualizarData();

    iniciarMonitoramentoProdutosDashboard();

    iniciarMonitoramentoMovimentacoesDashboard();

    atualizarNomeUsuario();

    atualizarNotificacoes();

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarData();

        if (
            typeof firebase !== "undefined" &&
            firebase.auth
        ) {

            firebase
                .auth()
                .onAuthStateChanged(
                    function (usuario) {

                        if (!usuario) {

                            window.location.replace(
                                caminhoLoginGestok()
                            );

                            return;

                        }

                        console.log(
                            "Firebase confirmou usuário do Dashboard:",
                            usuario.uid
                        );

                        iniciarDashboardComFirebase();

                    }
                );

        } else {

            console.error(
                "Firebase Auth não está disponível no Dashboard."
            );

        }

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

        iniciarMonitoramentoMovimentacoesDashboard();

        iniciarMonitoramentoMovimentacoesDashboard();

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