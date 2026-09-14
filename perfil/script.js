/* =========================================
   GESTOK - PERFIL
========================================= */


/* =========================================
   SIDEBAR
========================================= */

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const menuButton =
    document.getElementById("menuButton");

const closeSidebar =
    document.getElementById("closeSidebar");

const codigoLoja =
    document.getElementById("codigoLoja");
function abrirMenu() {

    if (sidebar) {
        sidebar.classList.add("active");
    }

    if (overlay) {
        overlay.classList.add("active");
    }

    document.body.style.overflow =
        "hidden";

}


function fecharMenu() {

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.style.overflow =
        "";

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
   ABAS
========================================= */

const tabs =
    document.querySelectorAll(".tab");

const tabContents =
    document.querySelectorAll(
        ".tab-content"
    );


tabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            const target =
                tab.dataset.tab;


            tabs.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            tabContents.forEach(
                function (content) {

                    content.classList.remove(
                        "active"
                    );

                }
            );


            tab.classList.add(
                "active"
            );


            const targetContent =
                document.getElementById(
                    target
                );


            if (targetContent) {

                targetContent.classList.add(
                    "active"
                );

            }

        }
    );

});


/* =========================================
   ELEMENTOS DO PERFIL
========================================= */

const nameInput =
    document.getElementById(
        "nameInput"
    );

const emailInput =
    document.getElementById(
        "emailInput"
    );

const headerName =
    document.getElementById(
        "nomeUsuarioMenu"
    );

const headerAvatar =
    document.getElementById(
        "headerAvatar"
    );

const saveProfile =
    document.getElementById(
        "saveProfile"
    );

const savedMessage =
    document.getElementById(
        "savedMessage"
    );


/* =========================================
   CARREGAR CONTA DO USUÁRIO
========================================= */

function obterContaGestokPerfil() {

    try {

        const dados =
            localStorage.getItem(
                "gestok_conta"
            );


        if (!dados) {

            return null;

        }


        const conta =
            JSON.parse(dados);


        if (
            !conta ||
            typeof conta !== "object"
        ) {

            return null;

        }


        return conta;

    } catch (erro) {

        console.error(
            "Erro ao carregar conta:",
            erro
        );

        return null;

    }

}


/* =========================================
   ATUALIZAR NOME NO PERFIL
========================================= */

function atualizarDadosPerfil() {

    const conta =
        obterContaGestokPerfil();


    if (!conta) {

        console.warn(
            "Conta Gestok não encontrada."
        );

        return;

    }


    /* =====================================
       CÓDIGO DA LOJA
    ===================================== */

    const codigoLoja =
        document.getElementById("codigoLoja");


    if (codigoLoja) {

        codigoLoja.textContent =
            conta.codigoLoja || "----";

    }


    const nome =
        String(
            conta.nome || ""
        ).trim();


    const email =
        String(
            conta.email || ""
        ).trim();


    /* =====================================
       CAMPO NOME
    ===================================== */

    if (
        nameInput &&
        nome
    ) {

        nameInput.value =
            nome;

    }


    /* =====================================
       CAMPO E-MAIL
    ===================================== */

    if (
        emailInput &&
        email
    ) {

        emailInput.value =
            email;

    }


    /* =====================================
       NOME NO HEADER
    ===================================== */

    if (
        headerName &&
        nome
    ) {

        headerName.textContent =
            nome;

    }


    /* =====================================
       AVATAR
    ===================================== */

    if (
        headerAvatar &&
        nome
    ) {

        headerAvatar.textContent =
            nome
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================
   SALVAR ALTERAÇÕES DO PERFIL
========================================= */

if (saveProfile) {

    saveProfile.addEventListener(
        "click",
        function () {

            const nome =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!nome) {

                alert(
                    "Digite seu nome."
                );

                return;

            }


            const conta =
                obterContaGestokPerfil();


            if (!conta) {

                alert(
                    "Conta do usuário não encontrada."
                );

                return;

            }


            /* Atualiza os dados da conta */

            conta.nome =
                nome;

            conta.email =
                email.toLowerCase();


            /* Salva a conta atualizada */

            localStorage.setItem(
                "gestok_conta",
                JSON.stringify(conta)
            );


            /* Atualiza também as chaves antigas
               para manter compatibilidade */

            localStorage.setItem(
                "gestok_nome",
                nome
            );


            localStorage.setItem(
                "gestok_email",
                email
            );


            /* Atualiza a tela */

            if (headerName) {

                headerName.textContent =
                    nome;

            }


            if (headerAvatar) {

                headerAvatar.textContent =
                    nome
                        .charAt(0)
                        .toUpperCase();

            }


            if (savedMessage) {

                savedMessage.textContent =
                    "Dados salvos!";


                setTimeout(
                    function () {

                        savedMessage.textContent =
                            "";

                    },
                    2500
                );

            }

        }
    );

}


/* =========================================
   ALTERAR SENHA
========================================= */

const changePassword =
    document.getElementById(
        "changePassword"
    );

const passwordInput =
    document.getElementById(
        "passwordInput"
    );


if (changePassword) {

    changePassword.addEventListener(
        "click",
        function () {

            const password =
                passwordInput
                    ? passwordInput.value.trim()
                    : "";


            if (!password) {

                alert(
                    "Digite uma nova senha."
                );

                return;

            }


            if (
                password.length < 6
            ) {

                alert(
                    "A senha precisa ter pelo menos 6 caracteres."
                );

                return;

            }


            const conta =
                obterContaGestokPerfil();


            if (!conta) {

                alert(
                    "Conta do usuário não encontrada."
                );

                return;

            }


            /* Atualiza a senha na conta */

            conta.senha =
                password;


            localStorage.setItem(
                "gestok_conta",
                JSON.stringify(conta)
            );


            /* Mantém compatibilidade */

            localStorage.setItem(
                "gestok_senha",
                password
            );


            if (passwordInput) {

                passwordInput.value =
                    "";

            }


            alert(
                "Senha alterada com sucesso!"
            );

        }
    );

}


/* =========================================
   ASSINATURA
========================================= */

const subscriptionStatus =
    document.getElementById(
        "subscriptionStatus"
    );

const startDate =
    document.getElementById(
        "startDate"
    );

const endDate =
    document.getElementById(
        "endDate"
    );

const daysRemaining =
    document.getElementById(
        "daysRemaining"
    );

const subscribeButton =
    document.getElementById(
        "subscribeButton"
    );


function formatarData(data) {

    return data.toLocaleDateString(
        "pt-BR"
    );

}


function atualizarAssinatura() {

    const assinatura =
        localStorage.getItem(
            "gestok_assinatura"
        );


    if (!assinatura) {

        if (subscriptionStatus) {

            subscriptionStatus.textContent =
                "Inativo";

            subscriptionStatus.classList.remove(
                "active"
            );

        }


        if (startDate) {
            startDate.textContent = "—";
        }


        if (endDate) {
            endDate.textContent = "—";
        }


        if (daysRemaining) {
            daysRemaining.textContent = "—";
        }


        if (subscribeButton) {

            subscribeButton.textContent =
                "Assinar por R$ 30,00";

        }


        return;

    }


    const dataFinal =
        new Date(assinatura);


    const agora =
        new Date();


    const diferenca =
        dataFinal - agora;


    const dias =
        Math.ceil(
            diferenca /
            (1000 * 60 * 60 * 24)
        );


    if (dias > 0) {

        if (subscriptionStatus) {

            subscriptionStatus.textContent =
                "Ativo";

            subscriptionStatus.classList.add(
                "active"
            );

        }


        if (startDate) {

            startDate.textContent =
                localStorage.getItem(
                    "gestok_inicio_assinatura"
                ) || "—";

        }


        if (endDate) {

            endDate.textContent =
                formatarData(
                    dataFinal
                );

        }


        if (daysRemaining) {

            daysRemaining.textContent =
                dias + " dias";

        }


        if (subscribeButton) {

            subscribeButton.textContent =
                "Renovar por R$ 30,00";

        }

    } else {

        if (subscriptionStatus) {

            subscriptionStatus.textContent =
                "Expirada";

            subscriptionStatus.classList.remove(
                "active"
            );

        }


        if (daysRemaining) {

            daysRemaining.textContent =
                "0 dias";

        }


        if (subscribeButton) {

            subscribeButton.textContent =
                "Assinar novamente - R$ 30,00";

        }

    }

}


/* =========================================
   ASSINAR
========================================= */

if (subscribeButton) {

    subscribeButton.addEventListener(
        "click",
        function () {

            const agora =
                new Date();


            const vencimento =
                new Date(
                    agora
                );


            vencimento.setDate(
                vencimento.getDate() + 30
            );


            localStorage.setItem(
                "gestok_inicio_assinatura",
                formatarData(
                    agora
                )
            );


            localStorage.setItem(
                "gestok_assinatura",
                vencimento.toISOString()
            );


            atualizarAssinatura();


            alert(
                "Assinatura ativada por 30 dias."
            );

        }
    );

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarDadosPerfil();

        atualizarAssinatura();

    }
);


/* =========================================
   ATUALIZAR SE A CONTA MUDAR
========================================= */

window.addEventListener(
    "storage",
    function (evento) {

        if (
            evento.key ===
            "gestok_conta"
        ) {

            atualizarDadosPerfil();

        }

    }
);


/* =========================================
   ATUALIZAR AO VOLTAR PARA A PÁGINA
========================================= */

window.addEventListener(
    "pageshow",
    function () {

        atualizarDadosPerfil();

        atualizarAssinatura();

    }
);