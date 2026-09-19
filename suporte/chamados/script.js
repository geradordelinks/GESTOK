/* =========================================
   GESTOK
   MEUS CHAMADOS
   FIRESTORE
========================================= */


/* =========================================
   ELEMENTOS
========================================= */

const ticketsList =
    document.getElementById(
        "ticketsList"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const buscaChamado =
    document.getElementById(
        "buscaChamado"
    );

const filtroStatus =
    document.getElementById(
        "filtroStatus"
    );

const totalChamados =
    document.getElementById(
        "totalChamados"
    );

const chamadosAbertos =
    document.getElementById(
        "chamadosAbertos"
    );

const chamadosResolvidos =
    document.getElementById(
        "chamadosResolvidos"
    );


/* =========================================
   MODAL
========================================= */

const modalDetalhes =
    document.getElementById(
        "modalDetalhes"
    );

const fecharDetalhes =
    document.getElementById(
        "fecharDetalhes"
    );

const fecharDetalhesBtn =
    document.getElementById(
        "fecharDetalhesBtn"
    );

const detalheAssunto =
    document.getElementById(
        "detalheAssunto"
    );

const detalheNumero =
    document.getElementById(
        "detalheNumero"
    );

const detalheStatus =
    document.getElementById(
        "detalheStatus"
    );

const detalheCategoria =
    document.getElementById(
        "detalheCategoria"
    );

const detalheData =
    document.getElementById(
        "detalheData"
    );

const detalheMensagem =
    document.getElementById(
        "detalheMensagem"
    );

const respostaSuporte =
    document.getElementById(
        "respostaSuporte"
    );


/* =========================================
   NOVO CHAMADO
========================================= */

const novoChamado =
    document.getElementById(
        "novoChamado"
    );


/* =========================================
   CONTROLE FIRESTORE
========================================= */

let chamadosCache = [];

let unsubscribeChamados = null;

let firestoreChamadosInicializado =
    false;


/* =========================================
   CONTA LOCAL
========================================= */

function obterContaGestokChamados() {

    try {

        const dados =
            localStorage.getItem(
                "gestok_conta"
            );


        if (!dados) {

            return null;

        }


        const conta =
            JSON.parse(
                dados
            );


        if (
            !conta ||
            typeof conta !== "object"
        ) {

            return null;

        }


        return conta;

    } catch (erro) {

        console.error(
            "Erro ao carregar conta Gestok:",
            erro
        );

        return null;

    }

}


/* =========================================
   USUÁRIO FIREBASE
========================================= */

function obterUsuarioFirebaseChamados() {

    try {

        if (
            typeof firebase ===
                "undefined" ||
            !firebase.auth
        ) {

            return null;

        }


        return firebase
            .auth()
            .currentUser || null;

    } catch (erro) {

        console.error(
            "Erro ao obter usuário Firebase:",
            erro
        );

        return null;

    }

}


/* =========================================
   NORMALIZAR STATUS
========================================= */

function normalizarStatus(
    status
) {

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
   TEXTO STATUS
========================================= */

function textoStatus(
    status
) {

    if (!status) {

        return "Aberto";

    }


    return status;

}


/* =========================================
   ESCAPAR HTML
========================================= */

function escaparHTML(
    valor
) {

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
   CONVERTER DATA FIRESTORE
========================================= */

function converterDataFirestore(
    valor
) {

    if (!valor) {

        return null;

    }


    /*
     * Timestamp do Firestore
     */

    if (
        typeof valor.toDate ===
        "function"
    ) {

        return valor.toDate();

    }


    /*
     * Timestamp serializado
     */

    if (
        typeof valor === "object" &&
        typeof valor.seconds === "number"
    ) {

        return new Date(
            valor.seconds * 1000
        );

    }


    /*
     * Date
     */

    if (
        valor instanceof Date
    ) {

        return valor;

    }


    /*
     * String / número
     */

    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return null;

    }


    return data;

}


/* =========================================
   FORMATAR DATA
========================================= */

function formatarData(
    valor
) {

    const data =
        converterDataFirestore(
            valor
        );


    if (!data) {

        return "—";

    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =========================================
   OBTER DATA PARA ORDENAÇÃO
========================================= */

function obterTimestampData(
    chamado
) {

    const data =
        converterDataFirestore(
            chamado.criadoEm ||
            chamado.data ||
            chamado.atualizadoEm
        );


    if (!data) {

        return 0;

    }


    return data.getTime();

}


/* =========================================
   ATUALIZAR RESUMO
========================================= */

function atualizarResumo(
    chamados
) {

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
                    status ===
                        "aberto" ||

                    status ===
                        "em-atendimento" ||

                    status ===
                        "em-analise"
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
                    status ===
                        "resolvido" ||

                    status ===
                        "fechado"
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

function filtrarChamados(
    chamados
) {

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
                    chamado.assunto ||
                    ""
                ).toLowerCase();


            const numero =
                String(
                    chamado.numero ||
                    ""
                ).toLowerCase();


            const categoria =
                String(
                    chamado.categoria ||
                    ""
                ).toLowerCase();


            const mensagem =
                String(
                    chamado.mensagem ||
                    ""
                ).toLowerCase();


            const correspondeBusca =
                !busca ||

                assunto.includes(
                    busca
                ) ||

                numero.includes(
                    busca
                ) ||

                categoria.includes(
                    busca
                ) ||

                mensagem.includes(
                    busca
                );


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
        [...chamadosCache];


    atualizarResumo(
        chamados
    );


    const filtrados =
        filtrarChamados(
            chamados
        );


    ticketsList.innerHTML =
        "";


    /*
     * Mais recentes primeiro
     */

    filtrados.sort(
        function (a, b) {

            return (
                obterTimestampData(b) -
                obterTimestampData(a)
            );

        }
    );


    /*
     * Nenhum resultado
     */

    if (
        filtrados.length === 0
    ) {

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


    /*
     * Criar cards
     */

    filtrados.forEach(
        function (chamado) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "ticket-item";


            /*
             * Guardamos o ID real
             * do documento Firestore
             */

            item.dataset.id =
                chamado.id ||
                "";


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
                                chamado.criadoEm ||
                                chamado.data
                            )}

                        </span>

                    </div>

                </div>


                <span
                    class="ticket-status ${statusClasse}"
                >

                    ${escaparHTML(
                        textoStatus(
                            status
                        )
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
   BUSCAR CHAMADO NO CACHE
========================================= */

function encontrarChamado(
    id
) {

    return chamadosCache.find(
        function (chamado) {

            return String(
                chamado.id
            ) === String(
                id
            );

        }
    ) || null;

}


/* =========================================
   ABRIR DETALHES
========================================= */

function abrirDetalhes(
    id
) {

    const chamado =
        encontrarChamado(
            id
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

        const status =
            chamado.status ||
            "Aberto";


        detalheStatus.textContent =
            textoStatus(
                status
            );


        detalheStatus.className =
            "ticket-status " +
            normalizarStatus(
                status
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
                chamado.criadoEm ||
                chamado.data
            );

    }


    if (detalheMensagem) {

        detalheMensagem.textContent =
            chamado.mensagem ||
            "Nenhuma mensagem informada.";

    }


    /*
     * RESPOSTA DO SUPORTE
     *
     * Aceitamos alguns nomes de campo
     * para deixar compatível com futuras
     * versões do Admin.
     */

    if (respostaSuporte) {

        const resposta =
            String(
                chamado.resposta ||
                chamado.respostaSuporte ||
                chamado.resposta_suporte ||
                chamado.ultimaResposta ||
                ""
            ).trim();


        if (resposta) {

            respostaSuporte.className =
                "support-response";


            respostaSuporte.innerHTML = `
                <p>
                    ${escaparHTML(
                        resposta
                    )}
                </p>
            `;

        } else {

            respostaSuporte.className =
                "no-response";


            respostaSuporte.innerHTML = `
                <p>
                    O suporte ainda não respondeu
                    este chamado.
                </p>
            `;

        }

    }


    /*
     * ABRIR MODAL
     */

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


    document.body.style.overflow =
        "";

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
   CARREGAR CHAMADOS DO FIRESTORE
========================================= */

async function iniciarListenerChamados() {

    if (
        firestoreChamadosInicializado
    ) {

        return;

    }


    if (
        typeof firebase ===
            "undefined" ||
        !firebase.auth ||
        !firebase.firestore
    ) {

        console.error(
            "Firebase Auth/Firestore não está disponível."
        );

        if (emptyState) {

            emptyState.style.display =
                "flex";

        }

        return;

    }


    const usuario =
        obterUsuarioFirebaseChamados();


    const conta =
        obterContaGestokChamados();


    if (
        !usuario ||
        !conta ||
        !conta.lojaId
    ) {

        console.warn(
            "Usuário ou loja não encontrados. Aguardando autenticação."
        );

        return;

    }


    firestoreChamadosInicializado =
        true;


    /*
     * Caminho:
     *
     * lojas/{lojaId}/chamados
     */

    const referencia =
        firebase
            .firestore()
            .collection(
                "lojas"
            )
            .doc(
                conta.lojaId
            )
            .collection(
                "chamados"
            )
            .where(
                "uid",
                "==",
                usuario.uid
            );


    /*
     * Listener em tempo real
     */

    unsubscribeChamados =
        referencia.onSnapshot(
            function (snapshot) {

                chamadosCache =
                    snapshot.docs.map(
                        function (doc) {

                            return {

                                id:
                                    doc.id,

                                ...doc.data()

                            };

                        }
                    );


                renderizarChamados();

            },

            function (erro) {

                console.error(
                    "Erro ao acompanhar chamados:",
                    erro
                );


                chamadosCache =
                    [];


                renderizarChamados();


                if (
                    emptyState
                ) {

                    emptyState.style.display =
                        "flex";

                }

            }
        );

}


/* =========================================
   PARAR LISTENER
========================================= */

function pararListenerChamados() {

    if (
        typeof unsubscribeChamados ===
        "function"
    ) {

        unsubscribeChamados();

        unsubscribeChamados =
            null;

    }


    firestoreChamadosInicializado =
        false;

}


/* =========================================
   AUTENTICAÇÃO
========================================= */

function iniciarAutenticacaoChamados() {

    if (
        typeof firebase ===
            "undefined" ||
        !firebase.auth
    ) {

        return;

    }


    firebase
        .auth()
        .onAuthStateChanged(
            async function (usuario) {

                if (!usuario) {

                    pararListenerChamados();

                    chamadosCache =
                        [];

                    renderizarChamados();

                    return;

                }


                /*
                 * Espera o contexto local
                 * estar disponível.
                 */

                let tentativas =
                    0;


                const maxTentativas =
                    30;


                while (
                    tentativas <
                    maxTentativas
                ) {

                    const conta =
                        obterContaGestokChamados();


                    if (
                        conta &&
                        conta.lojaId
                    ) {

                        break;

                    }


                    await new Promise(
                        function (resolve) {

                            setTimeout(
                                resolve,
                                200
                            );

                        }
                    );


                    tentativas++;

                }


                iniciarListenerChamados();

            }
        );

}


/* =========================================
   LIMPEZA AO SAIR
========================================= */

window.addEventListener(
    "beforeunload",
    function () {

        pararListenerChamados();

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Deixa a tela inicialmente vazia
         * enquanto o Firebase restaura
         * a sessão.
         */

        chamadosCache =
            [];

        renderizarChamados();


        iniciarAutenticacaoChamados();

    }
);


/* =========================================
   VOLTAR PARA A PÁGINA
========================================= */

window.addEventListener(
    "pageshow",
    function () {

        iniciarListenerChamados();

    }
);