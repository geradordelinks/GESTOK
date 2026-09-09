/* =========================================
   GESTOK
   Entrada de estoque
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
const CHAVE_MOVIMENTACOES =
    "gestok_movimentacoes";

const form =
    document.getElementById("entradaForm");

const selectProduto =
    document.getElementById("produto");

const estoqueAtual =
    document.getElementById("estoqueAtual");

const unidadeProduto =
    document.getElementById("unidadeProduto");

const quantidadeEntrada =
    document.getElementById("quantidade");

const novoEstoque =
    document.getElementById("novoEstoque");


/* =========================================
   CONFIGURAÇÃO
========================================= */

const CHAVE_PRODUTOS =
    "gestok_produtos";


/* =========================================
   OBTER PRODUTOS
========================================= */

function obterProdutos() {

    const produtosSalvos =
        localStorage.getItem(
            CHAVE_PRODUTOS
        );

    if (!produtosSalvos) {
        return [];
    }

    try {

        return JSON.parse(
            produtosSalvos
        );

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
   CARREGAR PRODUTOS NO SELECT
========================================= */

function carregarProdutos() {

    const produtos =
        obterProdutos();

    selectProduto.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;


    if (produtos.length === 0) {

        selectProduto.innerHTML = `
            <option value="">
                Nenhum produto cadastrado
            </option>
        `;

        return;

    }


    produtos.forEach(function (produto) {

        /*
         * Produtos inativos não aparecem
         * para movimentação de estoque.
         */

        if (produto.ativo === false) {
            return;
        }


        const option =
            document.createElement("option");

        option.value =
            produto.id;

        option.textContent =
            produto.codigo
                ? `${produto.nome} — ${produto.codigo}`
                : produto.nome;

        selectProduto.appendChild(
            option
        );

    });

}


/* =========================================
   BUSCAR PRODUTO SELECIONADO
========================================= */

function obterProdutoSelecionado() {

    const id =
        selectProduto.value;

    if (!id) {
        return null;
    }

    const produtos =
        obterProdutos();

    return produtos.find(function (produto) {

        return produto.id === id;

    }) || null;

}


/* =========================================
   ATUALIZAR INFORMAÇÕES
========================================= */

function atualizarInformacoes() {

    const produto =
        obterProdutoSelecionado();


    if (!produto) {

        estoqueAtual.textContent =
            "-";

        unidadeProduto.textContent =
            "-";

        novoEstoque.textContent =
            "-";

        return;

    }


    const estoque =
        Number(
            produto.quantidade || 0
        );

    const quantidade =
        Number(
            quantidadeEntrada.value || 0
        );


    estoqueAtual.textContent =
        estoque;

    unidadeProduto.textContent =
        produto.unidade || "UN";


    if (quantidade > 0) {

        novoEstoque.textContent =
            estoque + quantidade;

    } else {

        novoEstoque.textContent =
            "-";

    }

}


/* =========================================
   SELECIONAR PRODUTO
========================================= */

selectProduto.addEventListener(
    "change",
    function () {

        quantidadeEntrada.value = "";

        atualizarInformacoes();

        quantidadeEntrada.focus();

    }
);


/* =========================================
   DIGITAR QUANTIDADE
========================================= */

quantidadeEntrada.addEventListener(
    "input",
    function () {

        atualizarInformacoes();

    }
);


/* =========================================
   REGISTRAR ENTRADA
========================================= */

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const produto =
            obterProdutoSelecionado();


        if (!produto) {

            alert(
                "Selecione um produto."
            );

            selectProduto.focus();

            return;

        }


        const quantidade =
            Number(
                quantidadeEntrada.value
            );


        /* =================================
           VALIDAR QUANTIDADE
        ================================= */

        if (
            !Number.isFinite(quantidade) ||
            quantidade <= 0
        ) {

            alert(
                "Informe uma quantidade válida para a entrada."
            );

            quantidadeEntrada.focus();

            return;

        }


        /* =================================
           OBTER PRODUTOS ATUAIS
        ================================= */

        const produtos =
            obterProdutos();


        const produtoAtual =
            produtos.find(function (item) {

                return item.id === produto.id;

            });


        if (!produtoAtual) {

            alert(
                "Produto não encontrado."
            );

            carregarProdutos();

            return;

        }


        /* =================================
           ESTOQUE ANTERIOR
        ================================= */

        const estoqueAnterior =
            Number(
                produtoAtual.quantidade || 0
            );


        /* =================================
           NOVO ESTOQUE
        ================================= */

        const estoqueNovo =
            estoqueAnterior +
            quantidade;


        produtoAtual.quantidade =
            estoqueNovo;


        /* =================================
           DADOS DA MOVIMENTAÇÃO
        ================================= */

        const motivo =
            document
                .getElementById("motivo")
                .value;

        const observacao =
            document
                .getElementById("observacao")
                .value
                .trim();


        /*
         * Guardamos a última entrada
         * no próprio produto.
         *
         * Depois podemos criar uma
         * estrutura separada para
         * histórico de movimentações.
         */

        produtoAtual.ultimaEntrada = {

            quantidade:
                quantidade,

            estoqueAnterior:
                estoqueAnterior,

            estoqueNovo:
                estoqueNovo,

            motivo:
                motivo,

            observacao:
                observacao,

            data:
                new Date().toISOString()

        };


        produtoAtual.dataAtualizacao =
            new Date().toISOString();


        /* =================================
           SALVAR
        ================================= */

        salvarProdutos(produtos);


        /* =================================
           CONFIRMAÇÃO
        ================================= */

        alert(
            `Entrada registrada com sucesso!\n\n` +
            `Produto: ${produtoAtual.nome}\n` +
            `Entrada: ${quantidade} ${produtoAtual.unidade || "UN"}\n` +
            `Estoque anterior: ${estoqueAnterior}\n` +
            `Novo estoque: ${estoqueNovo}`
        );


        /* =================================
           LIMPAR FORMULÁRIO
        ================================= */

        form.reset();


        estoqueAtual.textContent =
            "-";

        unidadeProduto.textContent =
            "-";

        novoEstoque.textContent =
            "-";


        carregarProdutos();

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarProdutos();

        atualizarInformacoes();

    }
);
