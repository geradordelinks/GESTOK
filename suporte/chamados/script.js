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

let autenticacaoChamadosIniciada =
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
   CONTEXTO CENTRAL DO GESTOK
========================================= */

function obterContextoGestokChamados() {

    try {

        if (
            typeof obterContextoGestok ===
            "function"
        ) {

            return (
                obterContextoGestok() ||
                null
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao obter contexto Gestok:",
            erro
        );

    }

    return null;

}


/* =========================================
   OBTER LOJA PELO CONTEXTO
========================================= */

function obterLojaAtualChamados() {

    try {

        if (
            typeof obterLojaAtualGestok ===
            "function"
        ) {

            const lojaId =
                obterLojaAtualGestok();

            if (lojaId) {

                return lojaId;

            }

        }

    } catch (erro) {

        console.error(
            "Erro ao obter loja atual Gestok:",
            erro
        );

    }


    const contexto =
        obterContextoGestokChamados();


    if (
        contexto &&
        contexto.lojaId
    ) {

        return contexto.lojaId;

    }


    const conta =
        obterContaGestokChamados();


    if (
        conta &&
        conta.lojaId
    ) {

        return conta.lojaId;

    }


    return null;

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
   ESPERAR AUTENTICAÇÃO + CONTEXTO
========================================= */

function aguardarUsuarioEContextoChamados() {

    return new Promise(
        function (resolve, reject) {

            let finalizado =
                false;

            let unsubscribeAuth =
                null;

            let tentativas =
                0;

            const maxTentativas =
                50;


            function finalizar(
                sucesso,
                valor
            ) {

                if (finalizado) {

                    return;

                }

                finalizado =
                    true;


                if (
                    typeof unsubscribeAuth ===
                    "function"
                ) {

                    unsubscribeAuth();

                }


                clearInterval(
                    intervalo
                );


                clearTimeout(
                    timeout
                );


                if (sucesso) {

                    resolve(
                        valor
                    );

                } else {

                    reject(
                        valor
                    );

                }

            }


            async function verificar() {

                if (finalizado) {

                    return;

                }


                const usuario =
                    obterUsuarioFirebaseChamados();


                const lojaId =
                    obterLojaAtualChamados();


                if (
                    usuario &&
                    lojaId
                ) {

                    finalizar(
                        true,
                        {
                            usuario,
                            lojaId
                        }
                    );

                    return;

                }


                tentativas++;


                if (
                    tentativas >=
                    maxTentativas
                ) {

                    finalizar(
                        false,
                        new Error(
                            "Não foi possível restaurar a autenticação e a loja do usuário."
                        )
                    );

                }

            }


            const intervalo =
                setInterval(
                    verificar,
                    200
                );


            const timeout =
                setTimeout(
                    function () {

                        finalizar(
                            false,
                            new Error(
                                "Tempo limite aguardando autenticação da conta."
                            )
                        );

                    },
                    12000
                );


            try {

                if (
                    typeof firebase !==
                        "undefined" &&
                    firebase.auth
                ) {

                    unsubscribeAuth =
                        firebase
                            .auth()
                            .onAuthStateChanged(
                                function () {

                                    verificar();

                                }
                            );

                }

            } catch (erro) {

                console.error(
                    "Erro ao observar autenticação:",
                    erro
                );

            }


            verificar();

        }
    );

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


    if (
        typeof valor.toDate ===
        "function"
    ) {

        return valor.toDate();

    }


    if (
        typeof valor === "object" &&
        typeof valor.seconds === "number"
    ) {

        return new Date(
            valor.seconds * 1000
        );

    }


    if (
        valor instanceof Date
    ) {

        return valor;

    }


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


    filtrados.sort(
        function (a, b) {

            return (
                obterTimestampData(b) -
                obterTimestampData(a)
            );

        }
    );


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


    filtrados.forEach(
        function (chamado) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "ticket-item";


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

        return;

    }


    try {

        /*
         * ESPERAR AUTENTICAÇÃO E CONTEXTO
         */

        const resultado =
            await aguardarUsuarioEContextoChamados();


        if (
            !resultado ||
            !resultado.usuario ||
            !resultado.lojaId
        ) {

            throw new Error(
                "Usuário ou loja não encontrados."
            );

        }


        const usuario =
            resultado.usuario;

        const lojaId =
            resultado.lojaId;


        console.log(
            "Meus chamados:",
            {
                uid:
                    usuario.uid,

                lojaId:
                    lojaId
            }
        );


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
                    lojaId
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


    } catch (erro) {

        console.error(
            "Erro ao iniciar chamados:",
            erro
        );


        firestoreChamadosInicializado =
            false;


        if (
            erro.message &&
            erro.message.includes(
                "Tempo limite"
            )
        ) {

            console.warn(
                "O Firebase demorou para restaurar a sessão."
            );

        }

    }

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
        autenticacaoChamadosIniciada
    ) {

        return;

    }


    if (
        typeof firebase ===
            "undefined" ||
        !firebase.auth
    ) {

        console.error(
            "Firebase Authentication não está disponível."
        );

        return;

    }


    autenticacaoChamadosIniciada =
        true;


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
                 * Aguarda automaticamente
                 * usuário + contexto + loja.
                 */

                try {

                    await aguardarUsuarioEContextoChamados();

                    await iniciarListenerChamados();

                } catch (erro) {

                    console.warn(
                        "Aguardando contexto do Gestok:",
                        erro
                    );

                }

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

        chamadosCache =
            [];

        renderizarChamados();

        iniciarAutenticacaoChamados();

    }
);


/* =========================================
   PÁGINA VOLTOU AO FOCO
========================================= */

window.addEventListener(
    "pageshow",
    function () {

        if (
            firebase &&
            firebase.auth &&
            firebase.auth().currentUser
        ) {

            iniciarListenerChamados();

        }

    }
);