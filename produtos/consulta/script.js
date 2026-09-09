/* =========================================
GESTOK
Consulta de produtos
========================================= */

const CHAVE_PRODUTOS = "gestok_produtos";
/* =========================================
   MENU LATERAL
========================================= */

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const menuButton =
    document.getElementById("menuButton");

const closeSidebar =
    document.getElementById("closeSidebar");


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


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            fecharMenu();

        }

    }
);
/* =========================================
ELEMENTOS
========================================= */

const tabela =
document.getElementById("produtosTabela");

const pesquisa =
document.getElementById("pesquisaProduto");

const filtroCategoria =
document.getElementById("filtroCategoria");

const filtroStatus =
document.getElementById("filtroStatus");

const filtroEstoque =
document.getElementById("filtroEstoque");

const ordenacao =
document.getElementById("ordenacao");

const limparFiltros =
document.getElementById("limparFiltros");

const contador =
document.getElementById("produtosCount");

const semResultados =
document.getElementById("semResultados");

/* =========================================
OBTER PRODUTOS
========================================= */

function obterProdutos() {

const dados =
    localStorage.getItem(CHAVE_PRODUTOS);

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
ESCAPAR HTML
========================================= */

function escaparHTML(valor) {

return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* =========================================
STATUS DO ESTOQUE
========================================= */

function obterSituacaoEstoque(produto) {

const quantidade =
    Number(produto.quantidade || 0);

const minimo =
    Number(produto.estoqueMinimo || 0);


if (quantidade <= 0) {

    return "zerado";

}


if (
    minimo > 0 &&
    quantidade < minimo
) {

    return "baixo";

}


return "normal";

}

/* =========================================
TEXTO DO STATUS
========================================= */

function obterStatus(produto) {

if (produto.ativo === false) {

    return {
        classe: "inactive",
        texto: "Inativo"
    };

}


const situacao =
    obterSituacaoEstoque(produto);


if (situacao === "zerado") {

    return {
        classe: "danger",
        texto: "Zerado"
    };

}


if (situacao === "baixo") {

    return {
        classe: "warning",
        texto: "Estoque baixo"
    };

}


return {
    classe: "success",
    texto: "Normal"
};

}

/* =========================================
CARREGAR CATEGORIAS
========================================= */

function carregarCategorias() {

const produtos =
    obterProdutos();


const categorias =
    [...new Set(

        produtos
            .map(function (produto) {

                return (
                    produto.categoria || ""
                ).trim();

            })
            .filter(Boolean)

    )];


categorias.sort(
    function (a, b) {

        return a.localeCompare(
            b,
            "pt-BR"
        );

    }
);


filtroCategoria.innerHTML = `
    <option value="">
        Todas
    </option>
`;


categorias.forEach(
    function (categoria) {

        const option =
            document.createElement("option");

        option.value =
            categoria;

        option.textContent =
            categoria;

        filtroCategoria.appendChild(
            option
        );

    }
);

}

/* =========================================
ORDENAR
========================================= */

function ordenarProdutos(produtos) {

const tipo =
    ordenacao.value;


return produtos.sort(
    function (a, b) {

        if (tipo === "nome") {

            return String(a.nome || "")
                .localeCompare(
                    String(b.nome || ""),
                    "pt-BR"
                );

        }


        if (tipo === "nome-desc") {

            return String(b.nome || "")
                .localeCompare(
                    String(a.nome || ""),
                    "pt-BR"
                );

        }


        if (tipo === "estoque-menor") {

            return Number(a.quantidade || 0)
                -
                Number(b.quantidade || 0);

        }


        if (tipo === "estoque-maior") {

            return Number(b.quantidade || 0)
                -
                Number(a.quantidade || 0);

        }


        if (tipo === "codigo") {

            return String(a.codigo || "")
                .localeCompare(
                    String(b.codigo || ""),
                    "pt-BR"
                );

        }


        return 0;

    }
);

}

/* =========================================
FILTRAR PRODUTOS
========================================= */

function filtrarProdutos() {

const produtos =
    obterProdutos();


const termo =
    pesquisa.value
        .trim()
        .toLowerCase();


const categoria =
    filtroCategoria.value;


const status =
    filtroStatus.value;


const estoque =
    filtroEstoque.value;


let resultado =
    produtos.filter(
        function (produto) {

            /* PESQUISA */

            const nome =
                String(
                    produto.nome || ""
                ).toLowerCase();


            const codigo =
                String(
                    produto.codigo || ""
                ).toLowerCase();


            const correspondePesquisa =
                !termo ||
                nome.includes(termo) ||
                codigo.includes(termo);


            if (!correspondePesquisa) {
                return false;
            }


            /* CATEGORIA */

            if (
                categoria &&
                produto.categoria !== categoria
            ) {

                return false;

            }


            /* STATUS */

            if (status === "ativo") {

                if (
                    produto.ativo === false
                ) {

                    return false;

                }

            }


            if (status === "inativo") {

                if (
                    produto.ativo !== false
                ) {

                    return false;

                }

            }


            /* ESTOQUE */

            if (estoque) {

                const situacao =
                    obterSituacaoEstoque(
                        produto
                    );


                if (
                    situacao !== estoque
                ) {

                    return false;

                }

            }


            return true;

        }
    );


resultado =
    ordenarProdutos(resultado);


renderizarProdutos(
    resultado
);

}

/* =========================================
RENDERIZAR TABELA
========================================= */

function renderizarProdutos(produtos) {

tabela.innerHTML = "";


contador.textContent =
    `${produtos.length} ${
        produtos.length === 1
            ? "produto"
            : "produtos"
    }`;


if (produtos.length === 0) {

    semResultados.style.display =
        "flex";

    return;

}


semResultados.style.display =
    "none";


produtos.forEach(
    function (produto) {

        const quantidade =
            Number(
                produto.quantidade || 0
            );


        const minimo =
            Number(
                produto.estoqueMinimo || 0
            );


        const maximo =
            Number(
                produto.estoqueMaximo || 0
            );


        const unidade =
            produto.unidade || "UN";


        const status =
            obterStatus(produto);


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>

                <div class="product-name">

                    <strong>
                        ${escaparHTML(
                            produto.nome
                        )}
                    </strong>

                    ${
                        produto.descricao
                            ? `
                                <small>
                                    ${escaparHTML(
                                        produto.descricao
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>
                ${
                    produto.codigo
                        ? escaparHTML(
                            produto.codigo
                          )
                        : "—"
                }
            </td>


            <td>
                ${
                    produto.categoria
                        ? escaparHTML(
                            produto.categoria
                          )
                        : "—"
                }
            </td>


            <td>

                <strong>
                    ${quantidade}
                </strong>

                <span class="unit">
                    ${escaparHTML(unidade)}
                </span>

            </td>


            <td>
                ${minimo}
                ${escaparHTML(unidade)}
            </td>


            <td>
                ${
                    maximo > 0
                        ? `${maximo} ${escaparHTML(unidade)}`
                        : "—"
                }
            </td>


            <td>

                <span class="stock-status ${status.classe}">
                    <span class="status-dot"></span>
                    ${status.texto}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="edit-button"
                    data-id="${escaparHTML(
                        produto.id
                    )}"
                >
                    ✎ Editar
                </button>

            </td>

        `;


        tabela.appendChild(tr);

    }
);

}

/* =========================================
EDITAR PRODUTO
========================================= */

tabela.addEventListener(
"click",
function (event) {

    const botao =
        event.target.closest(
            ".edit-button"
        );


    if (!botao) {
        return;
    }


    const id =
        botao.dataset.id;


    if (!id) {
        return;
    }


    /*
     * Envia o usuário para
     * o cadastro existente.
     *
     * O ID fica na URL para
     * o cadastro poder carregar
     * o produto posteriormente.
     */

    window.location.href =
        `../index.html?editar=${encodeURIComponent(id)}`;

}

);

/* =========================================
EVENTOS
========================================= */

pesquisa.addEventListener(
"input",
filtrarProdutos
);

filtroCategoria.addEventListener(
"change",
filtrarProdutos
);

filtroStatus.addEventListener(
"change",
filtrarProdutos
);

filtroEstoque.addEventListener(
"change",
filtrarProdutos
);

ordenacao.addEventListener(
"change",
filtrarProdutos
);

limparFiltros.addEventListener(
"click",
function () {

    pesquisa.value = "";

    filtroCategoria.value = "";

    filtroStatus.value = "";

    filtroEstoque.value = "";

    ordenacao.value = "nome";

    filtrarProdutos();

}

);

/* =========================================
ATUALIZAR QUANDO ESTOQUE MUDAR
========================================= */

window.addEventListener(
"storage",
function (event) {

    if (
        event.key === CHAVE_PRODUTOS
    ) {

        carregarCategorias();

        filtrarProdutos();

    }

}

);

/* =========================================
INICIALIZAÇÃO
========================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

    carregarCategorias();

    filtrarProdutos();

}

);