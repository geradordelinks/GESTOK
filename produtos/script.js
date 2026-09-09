/* =========================================
   GESTOK
   Cadastro e gerenciamento de produtos
========================================= */
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

const form =
    document.getElementById("produtoForm");

const produtosLista =
    document.getElementById("produtosLista");

const produtosVazio =
    document.getElementById("produtosVazio");

const produtosCount =
    document.getElementById("produtosCount");


/* =========================================
   CONFIGURAÇÃO
========================================= */

const CHAVE_PRODUTOS =
    "gestok_produtos";


/* =========================================
   ID DO PRODUTO EM EDIÇÃO
========================================= */

let produtoEditandoId = null;

/* =========================================
   OBTER PRODUTOS
========================================= */

function obterProdutos() {

    const produtosSalvos =
        localStorage.getItem(CHAVE_PRODUTOS);

    if (!produtosSalvos) {
        return [];
    }

    try {

        const produtos =
            JSON.parse(produtosSalvos);

        return Array.isArray(produtos)
            ? produtos
            : [];

    } catch (erro) {

        console.error(
            "Erro ao ler produtos:",
            erro
        );

        return [];

    }

}


/* =========================================
   SALVAR PRODUTOS
========================================= */

function salvarProdutos(produtos) {

    localStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(produtos)
    );

}


/* =========================================
   GERAR ID
========================================= */

function gerarId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================
   FORMATAR PREÇO
========================================= */

function formatarPreco(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

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
   RENDERIZAR PRODUTOS
========================================= */

function renderizarProdutos() {

    const produtos =
        obterProdutos();


    produtosLista.innerHTML = "";


    /* =====================================
       CONTADOR
    ====================================== */

    const quantidade =
        produtos.length;

    produtosCount.textContent =
        quantidade === 1
            ? "1 produto"
            : `${quantidade} produtos`;


    /* =====================================
       ESTADO VAZIO
    ====================================== */

    if (produtos.length === 0) {

        produtosVazio.style.display =
            "flex";

        return;

    }


    produtosVazio.style.display =
        "none";


    /* =====================================
       CRIAR PRODUTOS
    ====================================== */

    produtos.forEach(function (produto) {

        const card =
            document.createElement("div");


        /* =================================
           STATUS DO PRODUTO
        ================================= */

        const statusAtivo =
            produto.ativo !== false;


        /* =================================
           ESTOQUE
        ================================= */

        const quantidadeEstoque =
            Number(produto.quantidade || 0);

        const minimo =
            Number(produto.estoqueMinimo || 0);


        const estoqueBaixo =
            statusAtivo &&
            minimo > 0 &&
            quantidadeEstoque < minimo;


        /* =================================
           CLASSE DO CARD
        ================================= */

        card.className =
            estoqueBaixo
                ? "product-item stock-low"
                : "product-item";


        /* =================================
           HTML DO PRODUTO
        ================================= */

        card.innerHTML = `

            <div class="product-main">

                <div class="product-icon">
                    📦
                </div>

                <div class="product-info">

                    <strong>
                        ${escaparHTML(produto.nome)}
                    </strong>

                    <span>
                        ${escaparHTML(
                            produto.codigo ||
                            "Sem código"
                        )}
                    </span>

                </div>

            </div>


            <div class="product-details">

                <div>

                    <small>
                        Categoria
                    </small>

                    <strong>
                        ${escaparHTML(
                            produto.categoria ||
                            "Não definida"
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Estoque
                    </small>

                    <strong>
                        ${quantidadeEstoque}
                        ${escaparHTML(
                            produto.unidade || "UN"
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Preço
                    </small>

                    <strong>
                        ${formatarPreco(
                            produto.preco
                        )}
                    </strong>

                </div>

            </div>


            <div class="product-status">

                <span class="${
                    statusAtivo
                        ? "status-active"
                        : "status-inactive"
                }">

                    ● ${
                        statusAtivo
                            ? "Ativo"
                            : "Inativo"
                    }

                </span>


                ${
                    estoqueBaixo
                        ? `
                            <span class="stock-warning">
                                ⚠ Estoque baixo
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="product-actions">

                <button
                    type="button"
                    class="product-action edit"
                    data-action="editar"
                    data-id="${produto.id}"
                    title="Editar produto">

                    ✎

                </button>


                <button
                    type="button"
                    class="product-action toggle"
                    data-action="toggle"
                    data-id="${produto.id}"
                    title="${
                        statusAtivo
                            ? "Desativar produto"
                            : "Ativar produto"
                    }">

                    ${
                        statusAtivo
                            ? "⏸"
                            : "▶"
                    }

                </button>


                <button
                    type="button"
                    class="product-action delete"
                    data-action="excluir"
                    data-id="${produto.id}"
                    title="Excluir produto">

                    🗑

                </button>

            </div>

        `;


        produtosLista.appendChild(card);

    });

}


/* =========================================
   VERIFICAR SKU DUPLICADO
========================================= */

function codigoExiste(
    codigo,
    idAtual = null
) {

    if (!codigo) {
        return false;
    }


    const produtos =
        obterProdutos();


    return produtos.some(function (produto) {

        return (
            produto.codigo &&
            produto.codigo.toLowerCase() ===
                codigo.toLowerCase() &&
            produto.id !== idAtual
        );

    });

}


/* =========================================
   EDITAR PRODUTO
========================================= */

function editarProduto(id) {

    const produtos =
        obterProdutos();


    const produto =
        produtos.find(function (item) {

            return item.id === id;

        });


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    produtoEditandoId = id;


    document.getElementById("nome").value =
        produto.nome || "";

    document.getElementById("codigo").value =
        produto.codigo || "";

    document.getElementById("categoria").value =
        produto.categoria || "";

    document.getElementById("quantidade").value =
        produto.quantidade ?? 0;

    document.getElementById("unidade").value =
        produto.unidade || "UN";

    document.getElementById("estoqueMinimo").value =
        produto.estoqueMinimo ?? 0;

    document.getElementById("estoqueMaximo").value =
        produto.estoqueMaximo ?? 0;

    document.getElementById("preco").value =
        produto.preco ?? 0;

    document.getElementById("descricao").value =
        produto.descricao || "";


    document.querySelector(
        ".form-header h2"
    ).textContent =
        "Editar produto";


    document.querySelector(
        ".form-header p"
    ).textContent =
        "Altere as informações do produto e salve as modificações.";


    document.querySelector(
        '#produtoForm button[type="submit"]'
    ).textContent =
        "✓ Salvar alterações";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   ATIVAR / DESATIVAR
========================================= */

function alternarStatusProduto(id) {

    const produtos =
        obterProdutos();


    const produto =
        produtos.find(function (item) {

            return item.id === id;

        });


    if (!produto) {
        return;
    }


    produto.ativo =
        produto.ativo === false;


    produto.dataAtualizacao =
        new Date().toISOString();


    salvarProdutos(produtos);

    renderizarProdutos();

}


/* =========================================
   EXCLUIR PRODUTO
========================================= */

function excluirProduto(id) {

    const produtos =
        obterProdutos();


    const produto =
        produtos.find(function (item) {

            return item.id === id;

        });


    if (!produto) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir o produto "${produto.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    const novosProdutos =
        produtos.filter(function (item) {

            return item.id !== id;

        });


    salvarProdutos(novosProdutos);

    renderizarProdutos();

}


/* =========================================
   AÇÕES DOS PRODUTOS
========================================= */

produtosLista.addEventListener(
    "click",
    function (event) {

        const botao =
            event.target.closest(
                "button[data-action]"
            );


        if (!botao) {
            return;
        }


        const acao =
            botao.dataset.action;

        const id =
            botao.dataset.id;


        if (acao === "editar") {

            editarProduto(id);

        }


        if (acao === "toggle") {

            alternarStatusProduto(id);

        }


        if (acao === "excluir") {

            excluirProduto(id);

        }

    }
);


/* =========================================
   CADASTRAR / ATUALIZAR
========================================= */

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const produtos =
            obterProdutos();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const codigo =
            document
                .getElementById("codigo")
                .value
                .trim();


        /* =================================
           VALIDAR SKU
        ================================= */

        if (
            codigoExiste(
                codigo,
                produtoEditandoId
            )
        ) {

            alert(
                "Já existe um produto com este código / SKU."
            );


            document
                .getElementById("codigo")
                .focus();


            return;

        }


        /* =================================
           MODO EDIÇÃO
        ================================= */

        if (produtoEditandoId) {

            const produto =
                produtos.find(function (item) {

                    return (
                        item.id ===
                        produtoEditandoId
                    );

                });


            if (!produto) {

                alert(
                    "Produto não encontrado."
                );

                return;

            }


            produto.nome =
                nome;


            produto.codigo =
                codigo;


            produto.categoria =
                document
                    .getElementById("categoria")
                    .value;


            produto.quantidade =
                Number(
                    document
                        .getElementById("quantidade")
                        .value
                );


            produto.unidade =
                document
                    .getElementById("unidade")
                    .value;


            produto.estoqueMinimo =
                Number(
                    document
                        .getElementById("estoqueMinimo")
                        .value
                );


            produto.estoqueMaximo =
                Number(
                    document
                        .getElementById("estoqueMaximo")
                        .value
                );


            produto.preco =
                Number(
                    document
                        .getElementById("preco")
                        .value || 0
                );


            produto.descricao =
                document
                    .getElementById("descricao")
                    .value
                    .trim();


            produto.dataAtualizacao =
                new Date().toISOString();


            salvarProdutos(produtos);


            alert(
                `Produto "${produto.nome}" atualizado com sucesso!`
            );

        }


        /* =================================
           MODO NOVO PRODUTO
        ================================= */

        else {

            const produto = {

                id:
                    gerarId(),

                nome:
                    nome,

                codigo:
                    codigo,

                categoria:
                    document
                        .getElementById("categoria")
                        .value,

                quantidade:
                    Number(
                        document
                            .getElementById("quantidade")
                            .value
                    ),

                unidade:
                    document
                        .getElementById("unidade")
                        .value,

                estoqueMinimo:
                    Number(
                        document
                            .getElementById("estoqueMinimo")
                            .value
                    ),

                estoqueMaximo:
                    Number(
                        document
                            .getElementById("estoqueMaximo")
                            .value
                    ),

                preco:
                    Number(
                        document
                            .getElementById("preco")
                            .value || 0
                    ),

                descricao:
                    document
                        .getElementById("descricao")
                        .value
                        .trim(),

                ativo:
                    true,

                dataCadastro:
                    new Date().toISOString(),

                dataAtualizacao:
                    new Date().toISOString()

            };


            produtos.push(produto);


            salvarProdutos(produtos);


            alert(
                `Produto "${produto.nome}" cadastrado com sucesso!`
            );

        }


        /* =================================
           LIMPAR MODO
        ================================= */

        produtoEditandoId = null;


        form.reset();


        document.getElementById(
            "quantidade"
        ).value = 0;


        document.getElementById(
            "estoqueMinimo"
        ).value = 0;


        document.getElementById(
            "estoqueMaximo"
        ).value = 0;


        document.querySelector(
            ".form-header h2"
        ).textContent =
            "Cadastrar produto";


        document.querySelector(
            ".form-header p"
        ).textContent =
            "Preencha as informações abaixo para adicionar um novo produto.";


        document.querySelector(
            '#produtoForm button[type="submit"]'
        ).textContent =
            "✓ Cadastrar produto";


        renderizarProdutos();

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderizarProdutos();


        /* =====================================
           ABRIR PRODUTO DIRETAMENTE PARA EDIÇÃO
        ====================================== */

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const idParaEditar =
            parametros.get("editar");


        if (idParaEditar) {

            editarProduto(idParaEditar);

        }

    }
);