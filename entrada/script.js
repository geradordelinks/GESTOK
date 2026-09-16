/* =========================================
   GESTOK
   ENTRADA DE ESTOQUE - FIRESTORE
   MULTI-LOJA / SAAS
========================================= */

/* =========================================
   MENU LATERAL
========================================= */

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menuButton");
const closeSidebar = document.getElementById("closeSidebar");

function abrirMenu() {
    if (sidebar) sidebar.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function fecharMenu() {
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (menuButton) menuButton.addEventListener("click", abrirMenu);
if (closeSidebar) closeSidebar.addEventListener("click", fecharMenu);
if (overlay) overlay.addEventListener("click", fecharMenu);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") fecharMenu();
});

/* =========================================
   ELEMENTOS
========================================= */

const form = document.getElementById("entradaForm");
const selectProduto = document.getElementById("produto");
const estoqueAtual = document.getElementById("estoqueAtual");
const unidadeProduto = document.getElementById("unidadeProduto");
const quantidadeEntrada = document.getElementById("quantidade");
const novoEstoque = document.getElementById("novoEstoque");
const motivo = document.getElementById("motivo");
const observacao = document.getElementById("observacao");

let produtosCache = [];

/* =========================================
   LOJA ATUAL
========================================= */

function obterLojaAtualEntradaGestok() {

    const conta = obterContaGestok();
    const usuario = usuarioFirebaseAtualGestok();

    if (!conta || !conta.lojaId || !usuario) {
        return null;
    }

    if (conta.firebaseUid && conta.firebaseUid !== usuario.uid) {
        return null;
    }

    return conta.lojaId;
}

function referenciaProdutosEntradaGestok() {

    const lojaId = obterLojaAtualEntradaGestok();

    if (!lojaId) {
        throw new Error("Loja atual não identificada.");
    }

    return referenciaProdutos(lojaId);
}

function referenciaMovimentacoesEntradaGestok() {

    const lojaId = obterLojaAtualEntradaGestok();

    if (!lojaId) {
        throw new Error("Loja atual não identificada.");
    }

    return referenciaMovimentacoes(lojaId);
}

/* =========================================
   CARREGAR PRODUTOS
========================================= */

async function carregarProdutos() {

    if (!selectProduto) return;

    try {

        const snapshot = await referenciaProdutosEntradaGestok()
            .orderBy("nome")
            .get();

        produtosCache = snapshot.docs.map(function (doc) {
            return {
                id: doc.id,
                ...doc.data()
            };
        }).filter(function (produto) {
            return produto.ativo !== false;
        });

        selectProduto.innerHTML = `
            <option value="">Selecione um produto</option>
        `;

        if (produtosCache.length === 0) {

            selectProduto.innerHTML = `
                <option value="">Nenhum produto cadastrado</option>
            `;

            atualizarInformacoes();
            return;
        }

        produtosCache.forEach(function (produto) {

            const option = document.createElement("option");

            option.value = produto.id;

            option.textContent = produto.codigo
                ? `${produto.nome} — ${produto.codigo}`
                : produto.nome;

            selectProduto.appendChild(option);
        });

        atualizarInformacoes();

    } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

        alert(
            mensagemErroFirebaseGestok(erro)
        );

    }
}

/* =========================================
   BUSCAR PRODUTO SELECIONADO
========================================= */

function obterProdutoSelecionado() {

    const id = selectProduto ? selectProduto.value : "";

    if (!id) return null;

    return produtosCache.find(function (produto) {
        return produto.id === id;
    }) || null;
}

/* =========================================
   ATUALIZAR INFORMAÇÕES
========================================= */

function atualizarInformacoes() {

    const produto = obterProdutoSelecionado();

    if (!produto) {

        if (estoqueAtual) estoqueAtual.textContent = "-";
        if (unidadeProduto) unidadeProduto.textContent = "-";
        if (novoEstoque) novoEstoque.textContent = "-";
        return;
    }

    const estoque = Number(produto.quantidade || 0);
    const quantidade = Number(quantidadeEntrada?.value || 0);

    if (estoqueAtual) estoqueAtual.textContent = estoque;
    if (unidadeProduto) unidadeProduto.textContent = produto.unidade || "UN";

    if (novoEstoque) {
        novoEstoque.textContent = quantidade > 0
            ? estoque + quantidade
            : "-";
    }
}

/* =========================================
   SELEÇÃO DO PRODUTO
========================================= */

if (selectProduto) {

    selectProduto.addEventListener("change", function () {

        if (quantidadeEntrada) quantidadeEntrada.value = "";

        atualizarInformacoes();

        if (quantidadeEntrada) quantidadeEntrada.focus();
    });
}

/* =========================================
   QUANTIDADE
========================================= */

if (quantidadeEntrada) {

    quantidadeEntrada.addEventListener("input", function () {
        atualizarInformacoes();
    });
}

/* =========================================
   REGISTRAR ENTRADA
========================================= */

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const produto = obterProdutoSelecionado();

        if (!produto) {
            alert("Selecione um produto.");
            if (selectProduto) selectProduto.focus();
            return;
        }

        const quantidade = Number(
            quantidadeEntrada?.value
        );

        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            alert("Informe uma quantidade válida para a entrada.");
            if (quantidadeEntrada) quantidadeEntrada.focus();
            return;
        }

        const lojaId = obterLojaAtualEntradaGestok();

        if (!lojaId) {
            alert("Não foi possível identificar a loja atual.");
            return;
        }

        const motivoValor = motivo ? motivo.value.trim() : "";
        const observacaoValor = observacao ? observacao.value.trim() : "";

        const botao = form.querySelector("button[type='submit']");
        const textoOriginal = botao ? botao.textContent : "";

        try {

            if (botao) {
                botao.disabled = true;
                botao.textContent = "Registrando...";
            }

            const produtoRef = referenciaProdutosEntradaGestok()
                .doc(produto.id);

            const movimentacaoRef =
                referenciaMovimentacoesEntradaGestok()
                    .doc();

            const usuario = usuarioFirebaseAtualGestok();

            let resultadoEntrada = null;

            /* =================================
               TRANSAÇÃO ATÔMICA
               Atualiza produto e histórico juntos.
            ================================= */

            await db.runTransaction(async function (transaction) {

                const produtoSnap =
                    await transaction.get(produtoRef);

                if (!produtoSnap.exists) {
                    throw new Error("Produto não encontrado.");
                }

                const produtoAtual = produtoSnap.data();

                if (produtoAtual.ativo === false) {
                    throw new Error("Este produto está inativo.");
                }

                const estoqueAnterior = Number(
                    produtoAtual.quantidade || 0
                );

                const estoqueNovo =
                    estoqueAnterior + quantidade;

                const agora =
                    new Date().toISOString();

                const ultimaEntrada = {
                    quantidade: quantidade,
                    estoqueAnterior: estoqueAnterior,
                    estoqueNovo: estoqueNovo,
                    motivo: motivoValor,
                    observacao: observacaoValor,
                    data: agora
                };

                transaction.update(produtoRef, {
                    quantidade: estoqueNovo,
                    ultimaEntrada: ultimaEntrada,
                    dataAtualizacao: agora
                });

                transaction.set(movimentacaoRef, {
                    tipo: "Entrada",
                    produtoId: produtoRef.id,
                    produto: produtoAtual.nome || "",
                    codigo: produtoAtual.codigo || "",
                    quantidade: quantidade,
                    unidade: produtoAtual.unidade || "UN",
                    estoqueAnterior: estoqueAnterior,
                    estoqueNovo: estoqueNovo,
                    motivo: motivoValor,
                    observacao: observacaoValor,
                    usuarioUid: usuario ? usuario.uid : null,
                    data: agora
                });

                resultadoEntrada = {
                    nome: produtoAtual.nome || "",
                    unidade: produtoAtual.unidade || "UN",
                    estoqueAnterior: estoqueAnterior,
                    estoqueNovo: estoqueNovo
                };
            });

            alert(
                `Entrada registrada com sucesso!\n\n` +
                `Produto: ${resultadoEntrada.nome}\n` +
                `Entrada: ${quantidade} ${resultadoEntrada.unidade}\n` +
                `Estoque anterior: ${resultadoEntrada.estoqueAnterior}\n` +
                `Novo estoque: ${resultadoEntrada.estoqueNovo}`
            );

            form.reset();

            if (estoqueAtual) estoqueAtual.textContent = "-";
            if (unidadeProduto) unidadeProduto.textContent = "-";
            if (novoEstoque) novoEstoque.textContent = "-";

            await carregarProdutos();

        } catch (erro) {

            console.error(
                "Erro ao registrar entrada:",
                erro
            );

            alert(
                mensagemErroFirebaseGestok(erro)
            );

        } finally {

            if (botao) {
                botao.disabled = false;
                botao.textContent = textoOriginal || "↓ Registrar entrada";
            }
        }
    });
}

/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    observarAutenticacaoGestok(function (usuario) {

        if (!usuario) {
            return;
        }

        carregarProdutos();
    });

});
