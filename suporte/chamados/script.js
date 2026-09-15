/* =========================================
   GESTOK
   MEUS CHAMADOS
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

const ticketsList =
    document.getElementById("ticketsList");

const emptyState =
    document.getElementById("emptyState");

const buscaChamado =
    document.getElementById("buscaChamado");

const filtroStatus =
    document.getElementById("filtroStatus");

const totalChamados =
    document.getElementById("totalChamados");

const chamadosAbertos =
    document.getElementById("chamadosAbertos");

const chamadosResolvidos =
    document.getElementById("chamadosResolvidos");


/* =========================================
   MODAL DE DETALHES
========================================= */

const modalDetalhes =
    document.getElementById("modalDetalhes");

const fecharDetalhes =
    document.getElementById("fecharDetalhes");

const fecharDetalhesBtn =
    document.getElementById("fecharDetalhesBtn");

const detalheAssunto =
    document.getElementById("detalheAssunto");

const detalheNumero =
    document.getElementById("detalheNumero");

const detalheStatus =
    document.getElementById("detalheStatus");

const detalheCategoria =
    document.getElementById("detalheCategoria");

const detalheData =
    document.getElementById("detalheData");

const detalheMensagem =
    document.getElementById("detalheMensagem");

const respostaSuporte =
    document.getElementById("respostaSuporte");


/* =========================================
   MENU
========================================= */

function abrirMenu() {

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.add("active");

    overlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


function fecharMenu() {

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

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
   DADOS
========================================= */

const CHAMADOS_KEY =
    "gestok_chamados";


function obterChamados() {

    const dados =
        localStorage.getItem(
            CHAMADOS_KEY
        );

    if (!dados) {

        return [];

    }

    try {

        const chamados =
            JSON.parse(dados);

        if (!Array.isArray(chamados)) {

            return [];

        }

        return chamados;

    } catch (erro) {

        console.error(
            "Erro ao carregar chamados:",
            erro
        );

        return [];

    }

}


/* =========================================
   SALVAR
========================================= */

function salvarChamados(chamados) {

    localStorage.setItem(
        CHAMADOS_KEY,
        JSON.stringify(chamados)
    );

}


/* =========================================
   NORMALIZAR STATUS
========================================= */

function normalizarStatus(status) {

    return String(
        status || "Aberto"
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        );

}


/* =========================================
   TEXTO DO STATUS
========================================= */

function textoStatus(status) {

    if (!status) {

        return "Aberto";

    }

    return status;

}


/* =========================================
   ESCAPAR HTML
   Segurança contra conteúdo digitado
========================================= */

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
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


/* =========================================
   DATA
========================================= */

function formatarData(data) {

    if (!data) {

        return "—";

    }

    const dataObjeto =
        new Date(data);

    if (
        Number.isNaN(
            dataObjeto.getTime()
        )
    ) {

        return data;

    }

    return dataObjeto.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================
   ATUALIZAR RESUMO
========================================= */

function atualizarResumo(chamados) {

    const total =
        chamados.length;

    const abertos =
        chamados.filter(
            function (chamado) {

                const status =
                    normalizarStatus(
                        chamado.status
                    );

                return (
                    status === "aberto" ||
                    status === "em-analise"
                );

            }
        ).length;

    const resolvidos =
        chamados.filter(
            function (chamado) {

                const status =
                    normalizarStatus(
                        chamado.status
                    );

                return (
                    status === "resolvido" ||
                    status === "fechado"
                );

            }
        ).length;


    if (totalChamados) {

        totalChamados.textContent =
            total;

    }


    if (chamadosAbertos) {

        chamadosAbertos.textContent =
            abertos;

    }


    if (chamadosResolvidos) {

        chamadosResolvidos.textContent =
            resolvidos;

    }

}


/* =========================================
   FILTRAR CHAMADOS
========================================= */

function filtrarChamados(chamados) {

    const busca =
        (
            buscaChamado
                ? buscaChamado.value
                : ""
        )
            .trim()
            .toLowerCase();


    const statusSelecionado =
        filtroStatus
            ? filtroStatus.value
            : "";


    return chamados.filter(
        function (chamado) {

            const assunto =
                String(
                    chamado.assunto || ""
                ).toLowerCase();

            const numero =
                String(
                    chamado.numero || ""
                ).toLowerCase();

            const categoria =
                String(
                    chamado.categoria || ""
                ).toLowerCase();

            const mensagem =
                String(
                    chamado.mensagem || ""
                ).toLowerCase();


            const correspondeBusca =
                !busca ||
                assunto.includes(busca) ||
                numero.includes(busca) ||
                categoria.includes(busca) ||
                mensagem.includes(busca);


            const statusChamado =
                normalizarStatus(
                    chamado.status
                );


            const correspondeStatus =
                !statusSelecionado ||
                statusChamado ===
                    normalizarStatus(
                        statusSelecionado
                    );


            return (
                correspondeBusca &&
                correspondeStatus
            );

        }
    );

}


/* =========================================
   RENDERIZAR CHAMADOS
========================================= */

function renderizarChamados() {

    if (!ticketsList) {

        return;

    }


    const chamados =
        obterChamados();


    atualizarResumo(
        chamados
    );


    const filtrados =
        filtrarChamados(
            chamados
        );


    ticketsList.innerHTML = "";


    /* =====================================
       NENHUM RESULTADO
    ===================================== */

    if (filtrados.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "flex";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    /* =====================================
       ORDENAR DO MAIS RECENTE
    ===================================== */

    filtrados.sort(
        function (a, b) {

            const dataA =
                new Date(
                    a.data || 0
                ).getTime();

            const dataB =
                new Date(
                    b.data || 0
                ).getTime();

            return dataB - dataA;

        }
    );


    /* =====================================
       CRIAR CARDS
    ===================================== */

    filtrados.forEach(
        function (chamado) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "ticket-item";


            const status =
                chamado.status ||
                "Aberto";


            const statusClasse =
                normalizarStatus(
                    status
                );


            item.innerHTML = `

                <div class="ticket-main">

                    <div class="ticket-top">

                        <span class="ticket-number">

                            ${escaparHTML(
                                chamado.numero ||
                                "CHAMADO"
                            )}

                        </span>

                        <span class="ticket-subject">

                            ${escaparHTML(
                                chamado.assunto ||
                                "Sem assunto"
                            )}

                        </span>

                    </div>


                    <div class="ticket-message">

                        ${escaparHTML(
                            chamado.mensagem ||
                            "Nenhuma mensagem informada."
                        )}

                    </div>


                    <div class="ticket-meta">

                        <span>

                            ${escaparHTML(
                                chamado.categoria ||
                                "Geral"
                            )}

                        </span>

                        <span>

                            ${formatarData(
                                chamado.data
                            )}

                        </span>

                    </div>

                </div>


                <span
                    class="ticket-status ${statusClasse}"
                >

                    ${escaparHTML(
                        textoStatus(status)
                    )}

                </span>

            `;


            item.addEventListener(
                "click",
                function () {

                    abrirDetalhes(
                        chamado.id
                    );

                }
            );


            ticketsList.appendChild(
                item
            );

        }
    );

}


/* =========================================
   ABRIR DETALHES
========================================= */

function abrirDetalhes(id) {

    const chamados =
        obterChamados();


    const chamado =
        chamados.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!chamado) {

        return;

    }


    if (detalheAssunto) {

        detalheAssunto.textContent =
            chamado.assunto ||
            "Sem assunto";

    }


    if (detalheNumero) {

        detalheNumero.textContent =
            chamado.numero ||
            "—";

    }


    if (detalheStatus) {

        detalheStatus.textContent =
            chamado.status ||
            "Aberto";

        detalheStatus.className =
            "ticket-status " +
            normalizarStatus(
                chamado.status
            );

    }


    if (detalheCategoria) {

        detalheCategoria.textContent =
            chamado.categoria ||
            "Geral";

    }


    if (detalheData) {

        detalheData.textContent =
            formatarData(
                chamado.data
            );

    }


    if (detalheMensagem) {

        detalheMensagem.textContent =
            chamado.mensagem ||
            "Nenhuma mensagem informada.";

    }


    if (respostaSuporte) {

        const resposta =
            chamado.resposta ||
            chamado.respostaSuporte ||
            chamado.resposta_suporte ||
            "";


        if (resposta.trim()) {

            respostaSuporte.textContent =
                resposta;

            respostaSuporte.className =
                "support-response";

        } else {

            respostaSuporte.textContent =
                "O suporte ainda não respondeu este chamado.";

            respostaSuporte.className =
                "no-response";

        }

    }


    if (modalDetalhes) {

        modalDetalhes.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================
   FECHAR MODAL
========================================= */

function fecharModal() {

    if (!modalDetalhes) {

        return;

    }

    modalDetalhes.classList.remove(
        "active"
    );

    document.body.style.overflow = "";

}


if (fecharDetalhes) {

    fecharDetalhes.addEventListener(
        "click",
        fecharModal
    );

}


if (fecharDetalhesBtn) {

    fecharDetalhesBtn.addEventListener(
        "click",
        fecharModal
    );

}


/* =========================================
   CLICAR FORA DO MODAL
========================================= */

if (modalDetalhes) {

    modalDetalhes.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalDetalhes
            ) {

                fecharModal();

            }

        }
    );

}


/* =========================================
   BUSCA
========================================= */

if (buscaChamado) {

    buscaChamado.addEventListener(
        "input",
        renderizarChamados
    );

}


/* =========================================
   FILTRO
========================================= */

if (filtroStatus) {

    filtroStatus.addEventListener(
        "change",
        renderizarChamados
    );

}


/* =========================================
   NOVO CHAMADO
========================================= */

const novoChamado =
    document.getElementById(
        "novoChamado"
    );


if (novoChamado) {

    novoChamado.addEventListener(
        "click",
        function () {

            window.location.href =
                "../index.html#abrirChamado";

        }
    );

}


/* =========================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            CHAMADOS_KEY
        ) {

            renderizarChamados();

        }

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderizarChamados();

    }
);