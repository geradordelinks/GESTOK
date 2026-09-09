/* =========================================
GESTOK
Saída de estoque
========================================= */

/* =========================================
CHAVES
========================================= */

const CHAVE_PRODUTOS = "gestok_produtos";
const CHAVE_MOVIMENTACOES = "gestok_movimentacoes";
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

const form = document.getElementById("saidaForm");
const selectProduto = document.getElementById("produto");
const estoqueAtual = document.getElementById("estoqueAtual");
const unidadeProduto = document.getElementById("unidadeProduto");
const quantidadeSaida = document.getElementById("quantidade");
const novoEstoque = document.getElementById("novoEstoque");
const motivo = document.getElementById("motivo");
const observacao = document.getElementById("observacao");

/* =========================================
VERIFICAR ELEMENTOS
========================================= */

if (!form) {
console.error("ERRO: elemento #saidaForm não encontrado.");
}

if (!selectProduto) {
console.error("ERRO: elemento #produto não encontrado.");
}

/* =========================================
OBTER PRODUTOS
========================================= */

function obterProdutos() {

const dados =
    localStorage.getItem(CHAVE_PRODUTOS);


if (!dados) {

    console.warn(
        "Nenhum produto encontrado no localStorage."
    );

    return [];

}


try {

    const produtos =
        JSON.parse(dados);


    if (!Array.isArray(produtos)) {

        console.error(
            "gestok_produtos não contém uma lista de produtos."
        );

        return [];

    }


    return produtos;

} catch (erro) {

    console.error(
        "Erro ao ler gestok_produtos:",
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
CARREGAR PRODUTOS
========================================= */

function carregarProdutos() {

const produtos =
    obterProdutos();


selectProduto.innerHTML = "";


/* =====================================
   OPÇÃO INICIAL
====================================== */

const opcaoInicial =
    document.createElement("option");

opcaoInicial.value = "";

opcaoInicial.textContent =
    "Selecione um produto";

selectProduto.appendChild(
    opcaoInicial
);


/* =====================================
   NENHUM PRODUTO
====================================== */

if (produtos.length === 0) {

    const opcao =
        document.createElement("option");

    opcao.value = "";

    opcao.textContent =
        "Nenhum produto cadastrado";

    opcao.disabled = true;

    selectProduto.appendChild(
        opcao
    );

    return;

}


/* =====================================
   ADICIONAR PRODUTOS
====================================== */

produtos.forEach(function (produto) {

    /*
     * Não mostrar produtos inativos.
     */

    if (produto.ativo === false) {
        return;
    }


    const option =
        document.createElement("option");


    /*
     * O ID será usado para localizar
     * o produto posteriormente.
     */

    option.value =
        String(produto.id);


    /*
     * Mostra:
     *
     * Produto — Código
     *
     * ou somente:
     *
     * Produto
     */

    if (produto.codigo) {

        option.textContent =
            `${produto.nome} — ${produto.codigo}`;

    } else {

        option.textContent =
            produto.nome;

    }


    selectProduto.appendChild(
        option
    );

});


console.log(
    "Produtos carregados na saída:",
    produtos
);

}

/* =========================================
OBTER PRODUTO SELECIONADO
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

    return String(produto.id) === String(id);

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
    Number(produto.quantidade || 0);


const quantidade =
    Number(quantidadeSaida.value || 0);


estoqueAtual.textContent =
    estoque;


unidadeProduto.textContent =
    produto.unidade || "UN";


if (quantidade > 0) {

    const resultado =
        estoque - quantidade;


    if (resultado < 0) {

        novoEstoque.textContent =
            "Estoque insuficiente";

    } else {

        novoEstoque.textContent =
            resultado;

    }

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

    quantidadeSaida.value = "";

    atualizarInformacoes();

    quantidadeSaida.focus();

}

);

/* =========================================
DIGITAR QUANTIDADE
========================================= */

quantidadeSaida.addEventListener(
"input",
function () {

    atualizarInformacoes();

}

);

/* =========================================
REGISTRAR SAÍDA
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
            quantidadeSaida.value
        );


    /* =================================
       VALIDAR QUANTIDADE
    ================================= */

    if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0
    ) {

        alert(
            "Informe uma quantidade válida para a saída."
        );

        quantidadeSaida.focus();

        return;

    }


    /* =================================
       OBTER PRODUTOS ATUAIS
    ================================= */

    const produtos =
        obterProdutos();


    const produtoAtual =
        produtos.find(function (item) {

            return String(item.id) ===
                String(produto.id);

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
       VERIFICAR ESTOQUE
    ================================= */

    if (quantidade > estoqueAnterior) {

        alert(
            "Estoque insuficiente!\n\n" +
            "Produto: " +
            produtoAtual.nome +
            "\n" +
            "Estoque atual: " +
            estoqueAnterior +
            " " +
            (produtoAtual.unidade || "UN") +
            "\n" +
            "Quantidade solicitada: " +
            quantidade +
            " " +
            (produtoAtual.unidade || "UN")
        );

        quantidadeSaida.focus();

        return;

    }


    /* =================================
       CALCULAR NOVO ESTOQUE
    ================================= */

    const estoqueNovo =
        estoqueAnterior - quantidade;


    /* =================================
       ATUALIZAR PRODUTO
    ================================= */

    produtoAtual.quantidade =
        estoqueNovo;


    produtoAtual.ultimaSaida = {

        quantidade:
            quantidade,

        estoqueAnterior:
            estoqueAnterior,

        estoqueNovo:
            estoqueNovo,

        motivo:
            motivo
                ? motivo.value
                : "",

        observacao:
            observacao
                ? observacao.value.trim()
                : "",

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
        "Saída registrada com sucesso!\n\n" +
        "Produto: " +
        produtoAtual.nome +
        "\n" +
        "Saída: " +
        quantidade +
        " " +
        (produtoAtual.unidade || "UN") +
        "\n" +
        "Estoque anterior: " +
        estoqueAnterior +
        "\n" +
        "Novo estoque: " +
        estoqueNovo
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

carregarProdutos();

atualizarInformacoes();