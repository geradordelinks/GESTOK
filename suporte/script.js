/* =========================================
   GESTOK
   ÁREA DE SUPORTE
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

const buscaSuporte =
    document.getElementById("buscaSuporte");

const faqItems =
    document.querySelectorAll(".faq-item");

const supportCards =
    document.querySelectorAll(".support-card");

const btnAbrirChamado =
    document.getElementById("btnAbrirChamado");

const modalChamado =
    document.getElementById("modalChamado");

const fecharChamado =
    document.getElementById("fecharChamado");

const cancelarChamado =
    document.getElementById("cancelarChamado");

const formChamado =
    document.getElementById("formChamado");

const meusChamados =
    document.getElementById("meusChamados");


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

            fecharModal();

        }

    }
);


/* =========================================
   MODAL
========================================= */

function abrirModal() {

    if (!modalChamado) {
        return;
    }

    modalChamado.classList.add("active");

    document.body.style.overflow = "hidden";

}


function fecharModal() {

    if (!modalChamado) {
        return;
    }

    modalChamado.classList.remove("active");

    document.body.style.overflow = "";

}


if (btnAbrirChamado) {

    btnAbrirChamado.addEventListener(
        "click",
        abrirModal
    );

}


if (fecharChamado) {

    fecharChamado.addEventListener(
        "click",
        fecharModal
    );

}


if (cancelarChamado) {

    cancelarChamado.addEventListener(
        "click",
        fecharModal
    );

}


/* =========================================
   FECHAR MODAL CLICANDO FORA
========================================= */

if (modalChamado) {

    modalChamado.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modalChamado
            ) {

                fecharModal();

            }

        }
    );

}


/* =========================================
   FAQ
========================================= */

faqItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const answer =
                    this.nextElementSibling;

                const jaAberto =
                    this.classList.contains(
                        "open"
                    );


                faqItems.forEach(
                    function (outroItem) {

                        outroItem.classList.remove(
                            "open"
                        );

                        const outraResposta =
                            outroItem.nextElementSibling;

                        if (
                            outraResposta &&
                            outraResposta.classList.contains(
                                "faq-answer"
                            )
                        ) {

                            outraResposta.classList.remove(
                                "open"
                            );

                        }

                    }
                );


                if (
                    !jaAberto &&
                    answer
                ) {

                    this.classList.add("open");

                    answer.classList.add("open");

                }

            }
        );

    }
);


/* =========================================
   DADOS DO FAQ
========================================= */

const perguntasFAQ = [

    {
        pergunta:
            "Como cadastrar um produto?",

        resposta:
            "Acesse o menu Criar produto, preencha as informações do produto e salve o cadastro."
    },

    {
        pergunta:
            "Como registrar uma entrada?",

        resposta:
            "Acesse Entrada, selecione o produto, informe a quantidade e confirme a movimentação."
    },

    {
        pergunta:
            "Como registrar uma saída?",

        resposta:
            "Acesse Saída, selecione o produto, informe a quantidade retirada e confirme a operação."
    },

    {
        pergunta:
            "Onde vejo o histórico do estoque?",

        resposta:
            "Acesse Movimentações para consultar todas as entradas e saídas registradas."
    },

    {
        pergunta:
            "Como gerar um relatório?",

        resposta:
            "Acesse Relatórios, escolha o tipo de relatório, aplique os filtros desejados e clique em Gerar PDF."
    }

];


/* =========================================
   BUSCAR FAQ
========================================= */

function pesquisarFAQ() {

    if (!buscaSuporte) {
        return;
    }

    const termo =
        buscaSuporte.value
            .trim()
            .toLowerCase();


    faqItems.forEach(
        function (item) {

            const pergunta =
                item
                    .textContent
                    .trim()
                    .toLowerCase();

            const answer =
                item.nextElementSibling;


            if (
                !termo ||
                pergunta.includes(termo)
            ) {

                item.style.display = "flex";

                if (answer) {
                    answer.style.display = "";
                }

            } else {

                item.style.display = "none";

                if (answer) {
                    answer.style.display = "none";
                }

            }

        }
    );

}


if (buscaSuporte) {

    buscaSuporte.addEventListener(
        "input",
        pesquisarFAQ
    );

}


/* =========================================
   CARDS DE SUPORTE
========================================= */

supportCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function (event) {

                const destino =
                    this.dataset.open;


                /* =============================
                   MEUS CHAMADOS
                ============================= */

                if (
                    this.id === "meusChamados"
                ) {

                    event.preventDefault();

                    window.location.href =
                        "chamados/index.html";

                    return;

                }


                /* =============================
                   FAQ
                ============================= */

                if (
                    destino === "faq"
                ) {

                    const faq =
                        document.getElementById(
                            "faq"
                        );

                    if (faq) {

                        faq.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                    return;

                }


                /* =============================
                   ABRIR CHAMADO
                ============================= */

                if (
                    destino === "chamado"
                ) {

                    abrirModal();

                    return;

                }

            }
        );

    }
);


/* =========================================
   LOCAL STORAGE
========================================= */

const CHAVE_CHAMADOS =
    "gestok_chamados";


function obterChamados() {

    const dados =
        localStorage.getItem(
            CHAVE_CHAMADOS
        );


    if (!dados) {
        return [];
    }


    try {

        const chamados =
            JSON.parse(dados);

        return Array.isArray(chamados)
            ? chamados
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar chamados:",
            erro
        );

        return [];

    }

}


/* =========================================
   SALVAR CHAMADOS
========================================= */

function salvarChamados(chamados) {

    localStorage.setItem(
        CHAVE_CHAMADOS,
        JSON.stringify(chamados)
    );

}


/* =========================================
   GERAR ID
========================================= */

function gerarIdChamado() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 7)
    );

}


/* =========================================
   DATA DO CHAMADO
========================================= */

function obterDataAtual() {

    const agora =
        new Date();


    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");


    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");


    const ano =
        agora.getFullYear();


    const hora =
        String(
            agora.getHours()
        ).padStart(2, "0");


    const minuto =
        String(
            agora.getMinutes()
        ).padStart(2, "0");


    return (
        `${dia}/${mes}/${ano} ${hora}:${minuto}`
    );

}


/* =========================================
   ENVIAR CHAMADO
========================================= */

if (formChamado) {

    formChamado.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const assunto =
                document
                    .getElementById("assunto")
                    ?.value
                    .trim();


            const categoria =
                document
                    .getElementById("categoria")
                    ?.value
                    .trim();


            const mensagem =
                document
                    .getElementById("mensagem")
                    ?.value
                    .trim();


            if (
                !assunto ||
                !categoria ||
                !mensagem
            ) {

                mostrarMensagem(
                    "Preencha todos os campos do chamado."
                );

                return;

            }


            const chamados =
                obterChamados();


            const novoChamado = {

                id:
                    gerarIdChamado(),

                numero:
                    gerarNumeroChamado(
                        chamados
                    ),

                assunto:
                    assunto,

                categoria:
                    categoria,

                mensagem:
                    mensagem,

                status:
                    "Aberto",

                data:
                    obterDataAtual()

            };


            chamados.unshift(
                novoChamado
            );


            salvarChamados(
                chamados
            );


            formChamado.reset();

            fecharModal();


            mostrarMensagem(
                `Chamado #${novoChamado.numero} enviado com sucesso!`
            );


            console.log(
                "Novo chamado:",
                novoChamado
            );

        }
    );

}


/* =========================================
   NÚMERO DO CHAMADO
========================================= */

function gerarNumeroChamado(
    chamados
) {

    let maiorNumero = 0;


    chamados.forEach(
        function (chamado) {

            const numero =
                Number(
                    chamado.numero
                );


            if (
                Number.isFinite(numero) &&
                numero > maiorNumero
            ) {

                maiorNumero = numero;

            }

        }
    );


    return String(
        maiorNumero + 1
    ).padStart(4, "0");

}


/* =========================================
   MENSAGEM / TOAST
========================================= */

function mostrarMensagem(
    mensagem
) {

    const existente =
        document.querySelector(
            ".gestok-toast"
        );


    if (existente) {
        existente.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "gestok-toast";


    toast.innerHTML = `

        <div class="toast-icon">
            ✓
        </div>

        <div class="toast-content">

            <strong>
                Gestok
            </strong>

            <span>
                ${mensagem}
            </span>

        </div>

    `;


    Object.assign(
        toast.style,
        {
            position: "fixed",
            right: "22px",
            bottom: "22px",
            zIndex: "20000",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            width: "min(380px, calc(100% - 32px))",
            padding: "13px 15px",
            background: "#ffffff",
            border: "1px solid #e5eaf1",
            borderRadius: "12px",
            boxShadow:
                "0 15px 40px rgba(15, 23, 42, .14)",
            animation:
                "gestokToastIn .25s ease"
        }
    );


    const estilo =
        document.createElement(
            "style"
        );


    estilo.textContent = `

        @keyframes gestokToastIn {

            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }

        }

        .gestok-toast .toast-icon {

            width: 30px;
            height: 30px;

            border-radius: 8px;

            background: #ecfdf3;

            color: #16a34a;

            display: flex;
            align-items: center;
            justify-content: center;

            font-weight: 700;

            flex-shrink: 0;

        }

        .gestok-toast .toast-content strong {

            display: block;

            color: #1e293b;

            font-size: 11px;

            margin-bottom: 2px;

        }

        .gestok-toast .toast-content span {

            display: block;

            color: #64748b;

            font-size: 10px;

            line-height: 1.4;

        }

    `;


    document.head.appendChild(
        estilo
    );


    document.body.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateY(10px)";

            toast.style.transition =
                "all .25s ease";


            setTimeout(
                function () {

                    toast.remove();

                    estilo.remove();

                },
                250
            );

        },
        3500
    );

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Gestok - Área de suporte carregada."
        );

    }
);