/* =========================================
   GESTOK
   SOLICITAÇÕES DE COMPRA
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


const btnNovaSolicitacao =
    document.getElementById(
        "btnNovaSolicitacao"
    );

const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );

const fecharModal =
    document.getElementById(
        "fecharModal"
    );

const cancelarModal =
    document.getElementById(
        "cancelarModal"
    );


const solicitacaoForm =
    document.getElementById(
        "solicitacaoForm"
    );

const produtoSelect =
    document.getElementById(
        "produto"
    );

const estoqueAtual =
    document.getElementById(
        "estoqueAtual"
    );

const estoqueMinimo =
    document.getElementById(
        "estoqueMinimo"
    );

const unidadeProduto =
    document.getElementById(
        "unidadeProduto"
    );

const stockInfo =
    document.getElementById(
        "stockInfo"
    );


const listaSolicitacoes =
    document.getElementById(
        "listaSolicitacoes"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );


const busca =
    document.getElementById(
        "busca"
    );

const filtroStatus =
    document.getElementById(
        "filtroStatus"
    );

const limparFiltros =
    document.getElementById(
        "limparFiltros"
    );


/* =========================================
   CHAVES
========================================= */

const CHAVE_PRODUTOS =
    "gestok_produtos";

const CHAVE_SOLICITACOES =
    "gestok_solicitacoes";


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
   ESC
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            fecharMenu();

            fecharModalSolicitacao();

        }

    }
);


/* =========================================
   PRODUTOS
========================================= */

function obterProdutos() {

    const dados =
        localStorage.getItem(
            CHAVE_PRODUTOS
        );

    if (!dados) {
        return [];
    }

    try {

        const produtos =
            JSON.parse(dados);

        return Array.isArray(produtos)
            ? produtos
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );

        return [];

    }

}


/* =========================================
   SOLICITAÇÕES
========================================= */

function obterSolicitacoes() {

    const dados =
        localStorage.getItem(
            CHAVE_SOLICITACOES
        );

    if (!dados) {
        return [];
    }

    try {

        const solicitacoes =
            JSON.parse(dados);

        return Array.isArray(solicitacoes)
            ? solicitacoes
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar solicitações:",
            erro
        );

        return [];

    }

}


function salvarSolicitacoes(
    solicitacoes
) {

    localStorage.setItem(
        CHAVE_SOLICITACOES,
        JSON.stringify(solicitacoes)
    );

}


/* =========================================
   CARREGAR PRODUTOS NO SELECT
========================================= */

function carregarProdutos() {

    if (!produtoSelect) {
        return;
    }

    const produtos =
        obterProdutos();

    produtoSelect.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;

    const produtosAtivos =
        produtos.filter(function (produto) {

            return produto.ativo !== false;

        });


    produtosAtivos.forEach(
        function (produto) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                produto.id;

            option.textContent =
                produto.codigo
                    ? `${produto.nome} — ${produto.codigo}`
                    : produto.nome;

            produtoSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================
   MOSTRAR ESTOQUE DO PRODUTO
========================================= */

function atualizarInformacoesProduto() {

    const produtos =
        obterProdutos();

    const produto =
        produtos.find(
            function (item) {

                return String(item.id) ===
                    String(produtoSelect.value);

            }
        );


    if (!produto) {

        stockInfo.style.display =
            "none";

        return;

    }


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


    estoqueAtual.textContent =
        `${quantidade} ${unidade}`;

    estoqueMinimo.textContent =
        `${minimo} ${unidade}`;

    unidadeProduto.textContent =
        unidade;


    stockInfo.style.display =
        "grid";


    const motivo =
        document.getElementById(
            "motivo"
        );

    if (
        motivo &&
        minimo > 0 &&
        quantidade < minimo
    ) {

        motivo.value =
            "Estoque abaixo do mínimo";

    }

}


/* =========================================
   MODAL
========================================= */

function abrirModalSolicitacao() {

    carregarProdutos();

    if (solicitacaoForm) {
        solicitacaoForm.reset();
    }

    if (stockInfo) {
        stockInfo.style.display =
            "none";
    }

    if (modalOverlay) {

        modalOverlay.classList.add(
            "active"
        );

    }

    document.body.style.overflow =
        "hidden";

}


function fecharModalSolicitacao() {

    if (modalOverlay) {

        modalOverlay.classList.remove(
            "active"
        );

    }

    document.body.style.overflow =
        "";

}


if (btnNovaSolicitacao) {

    btnNovaSolicitacao.addEventListener(
        "click",
        abrirModalSolicitacao
    );

}


if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        fecharModalSolicitacao
    );

}


if (cancelarModal) {

    cancelarModal.addEventListener(
        "click",
        fecharModalSolicitacao
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalOverlay
            ) {

                fecharModalSolicitacao();

            }

        }
    );

}


/* =========================================
   PRODUTO SELECIONADO
========================================= */

if (produtoSelect) {

    produtoSelect.addEventListener(
        "change",
        atualizarInformacoesProduto
    );

}


/* =========================================
   DATA
========================================= */

function formatarData(data) {

    const valor =
        new Date(data);

    if (
        Number.isNaN(
            valor.getTime()
        )
    ) {

        return "-";

    }

    return valor.toLocaleDateString(
        "pt-BR"
    );

}


/* =========================================
   STATUS
========================================= */

function classeStatus(status) {

    if (status === "Pendente") {
        return "status-pendente";
    }

    if (status === "Em análise") {
        return "status-analise";
    }

    if (status === "Aprovada") {
        return "status-aprovada";
    }

    if (status === "Recusada") {
        return "status-recusada";
    }

    return "status-cancelada";

}


/* =========================================
   ATUALIZAR RESUMO
========================================= */

function atualizarResumo() {

    const solicitacoes =
        obterSolicitacoes();

    const produtos =
        obterProdutos();


    const pendentes =
        solicitacoes.filter(
            function (item) {

                return item.status ===
                    "Pendente";

            }
        ).length;


    const aprovadas =
        solicitacoes.filter(
            function (item) {

                return item.status ===
                    "Aprovada";

            }
        ).length;


    const abaixoMinimo =
        produtos.filter(
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
                    produto.ativo !== false &&
                    minimo > 0 &&
                    quantidade < minimo
                );

            }
        ).length;


    document.getElementById(
        "totalPendentes"
    ).textContent =
        pendentes;


    document.getElementById(
        "totalAprovadas"
    ).textContent =
        aprovadas;


    document.getElementById(
        "totalAbaixoMinimo"
    ).textContent =
        abaixoMinimo;


    document.getElementById(
        "totalSolicitacoes"
    ).textContent =
        solicitacoes.length;

}


/* =========================================
   FILTRAR
========================================= */

function obterSolicitacoesFiltradas() {

    const solicitacoes =
        obterSolicitacoes();

    const termo =
        (busca.value || "")
            .trim()
            .toLowerCase();

    const status =
        filtroStatus.value;


    return solicitacoes.filter(
        function (item) {

            const texto =
                [
                    item.produto,
                    item.codigo,
                    item.motivo,
                    item.observacao
                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const correspondeBusca =
                !termo ||
                texto.includes(termo);


            const correspondeStatus =
                !status ||
                item.status === status;


            return (
                correspondeBusca &&
                correspondeStatus
            );

        }
    );

}


/* =========================================
   RENDERIZAR
========================================= */

function renderizarSolicitacoes() {

    if (!listaSolicitacoes) {
        return;
    }

    const solicitacoes =
        obterSolicitacoesFiltradas();


    listaSolicitacoes.innerHTML =
        "";


    if (solicitacoes.length === 0) {

        emptyState.style.display =
            "flex";

        document.querySelector(
            ".table-wrap"
        ).style.display =
            "none";

        return;

    }


    emptyState.style.display =
        "none";

    document.querySelector(
        ".table-wrap"
    ).style.display =
        "block";


    solicitacoes.sort(
        function (a, b) {

            return new Date(b.data) -
                new Date(a.data);

        }
    );


    solicitacoes.forEach(
        function (item) {

            const tr =
                document.createElement(
                    "tr"
                );


            const statusClass =
                classeStatus(
                    item.status
                );


            tr.innerHTML = `

                <td>

                    <div class="product-name">

                        ${item.produto || "-"}

                    </div>

                    ${
                        item.codigo
                            ? `
                                <span class="product-code">
                                    Código: ${item.codigo}
                                </span>
                              `
                            : ""
                    }

                </td>


                <td>

                    ${item.estoqueAtual ?? 0}
                    ${item.unidade || "UN"}

                </td>


                <td>

                    <strong>
                        ${item.quantidade}
                        ${item.unidade || "UN"}
                    </strong>

                </td>


                <td>

                    ${item.motivo || "-"}

                </td>


                <td>

                    ${formatarData(item.data)}

                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${item.status}
                    </span>

                </td>


                <td>

                    <button
                        class="action-button"
                        type="button"
                        title="Cancelar solicitação"
                        data-cancelar="${item.id}"
                    >
                        ×
                    </button>

                </td>

            `;


            listaSolicitacoes.appendChild(
                tr
            );

        }
    );

}


/* =========================================
   CRIAR SOLICITAÇÃO
========================================= */

if (solicitacaoForm) {

    solicitacaoForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const produtos =
                obterProdutos();


            const produto =
                produtos.find(
                    function (item) {

                        return String(item.id) ===
                            String(
                                produtoSelect.value
                            );

                    }
                );


            if (!produto) {

                alert(
                    "Selecione um produto."
                );

                return;

            }


            const quantidade =
                Number(
                    document.getElementById(
                        "quantidade"
                    ).value
                );


            if (
                !Number.isFinite(
                    quantidade
                ) ||
                quantidade <= 0
            ) {

                alert(
                    "Informe uma quantidade válida."
                );

                return;

            }


            const motivo =
                document.getElementById(
                    "motivo"
                ).value;


            const observacao =
                document.getElementById(
                    "observacao"
                ).value.trim();


            const novaSolicitacao = {

                id:
                    Date.now(),

                produtoId:
                    produto.id,

                produto:
                    produto.nome,

                codigo:
                    produto.codigo || "",

                estoqueAtual:
                    Number(
                        produto.quantidade || 0
                    ),

                estoqueMinimo:
                    Number(
                        produto.estoqueMinimo || 0
                    ),

                quantidade:
                    quantidade,

                unidade:
                    produto.unidade || "UN",

                motivo:
                    motivo,

                observacao:
                    observacao,

                status:
                    "Pendente",

                data:
                    new Date().toISOString()

            };


            const solicitacoes =
                obterSolicitacoes();


            solicitacoes.push(
                novaSolicitacao
            );


            salvarSolicitacoes(
                solicitacoes
            );


            fecharModalSolicitacao();

            atualizarResumo();

            renderizarSolicitacoes();


            alert(
                "Solicitação de compra criada com sucesso!"
            );

        }
    );

}


/* =========================================
   CANCELAR SOLICITAÇÃO
========================================= */

if (listaSolicitacoes) {

    listaSolicitacoes.addEventListener(
        "click",
        function (event) {

            const botao =
                event.target.closest(
                    "[data-cancelar]"
                );


            if (!botao) {
                return;
            }


            const id =
                botao.dataset.cancelar;


            const confirmar =
                confirm(
                    "Deseja cancelar esta solicitação?"
                );


            if (!confirmar) {
                return;
            }


            const solicitacoes =
                obterSolicitacoes();


            const atualizadas =
                solicitacoes.map(
                    function (item) {

                        if (
                            String(item.id) ===
                            String(id)
                        ) {

                            return {

                                ...item,

                                status:
                                    "Cancelada"

                            };

                        }

                        return item;

                    }
                );


            salvarSolicitacoes(
                atualizadas
            );


            atualizarResumo();

            renderizarSolicitacoes();

        }
    );

}


/* =========================================
   FILTROS
========================================= */

if (busca) {

    busca.addEventListener(
        "input",
        renderizarSolicitacoes
    );

}


if (filtroStatus) {

    filtroStatus.addEventListener(
        "change",
        renderizarSolicitacoes
    );

}


if (limparFiltros) {

    limparFiltros.addEventListener(
        "click",
        function () {

            busca.value = "";

            filtroStatus.value = "";

            renderizarSolicitacoes();

        }
    );

}


/* =========================================
   ATUALIZAR QUANDO PRODUTOS MUDAR
========================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
                CHAVE_PRODUTOS ||
            event.key ===
                CHAVE_SOLICITACOES
        ) {

            carregarProdutos();

            atualizarResumo();

            renderizarSolicitacoes();

        }

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarProdutos();

        atualizarResumo();

        renderizarSolicitacoes();

    }
);