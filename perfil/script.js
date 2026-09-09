/* =========================================
   SIDEBAR
========================================= */

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menuButton");
const closeSidebar = document.getElementById("closeSidebar");


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
    menuButton.addEventListener("click", abrirMenu);
}


if (closeSidebar) {
    closeSidebar.addEventListener("click", fecharMenu);
}


if (overlay) {
    overlay.addEventListener("click", fecharMenu);
}


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        fecharMenu();
    }

});



/* =========================================
   ABAS
========================================= */

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");


tabs.forEach(function(tab) {

    tab.addEventListener("click", function() {

        const target = tab.dataset.tab;


        tabs.forEach(function(item) {
            item.classList.remove("active");
        });


        tabContents.forEach(function(content) {
            content.classList.remove("active");
        });


        tab.classList.add("active");


        const targetContent = document.getElementById(target);

        if (targetContent) {
            targetContent.classList.add("active");
        }

    });

});



/* =========================================
   PERFIL
========================================= */

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");

const headerName = document.getElementById("headerName");
const headerAvatar = document.getElementById("headerAvatar");

const saveProfile = document.getElementById("saveProfile");
const savedMessage = document.getElementById("savedMessage");


/* Carrega dados salvos */

const savedName = localStorage.getItem("gestok_nome");
const savedEmail = localStorage.getItem("gestok_email");


if (savedName) {

    nameInput.value = savedName;

    headerName.textContent = savedName;

    headerAvatar.textContent =
        savedName.charAt(0).toUpperCase();

}


if (savedEmail) {
    emailInput.value = savedEmail;
}



/* Salvar perfil */

if (saveProfile) {

    saveProfile.addEventListener("click", function() {

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();


        if (!name) {

            alert("Digite seu nome.");

            return;
        }


        localStorage.setItem(
            "gestok_nome",
            name
        );


        localStorage.setItem(
            "gestok_email",
            email
        );


        headerName.textContent = name;

        headerAvatar.textContent =
            name.charAt(0).toUpperCase();


        savedMessage.textContent =
            "Dados salvos!";


        setTimeout(function() {

            savedMessage.textContent = "";

        }, 2500);

    });

}



/* =========================================
   ALTERAR SENHA
========================================= */

const changePassword =
    document.getElementById("changePassword");


const passwordInput =
    document.getElementById("passwordInput");


if (changePassword) {

    changePassword.addEventListener("click", function() {

        const password =
            passwordInput.value.trim();


        if (!password) {

            alert("Digite uma nova senha.");

            return;
        }


        if (password.length < 6) {

            alert(
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }


        localStorage.setItem(
            "gestok_senha",
            password
        );


        passwordInput.value = "";


        alert("Senha alterada com sucesso!");

    });

}



/* =========================================
   ASSINATURA
========================================= */

const subscriptionStatus =
    document.getElementById("subscriptionStatus");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const daysRemaining =
    document.getElementById("daysRemaining");

const subscribeButton =
    document.getElementById("subscribeButton");



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

        subscriptionStatus.textContent =
            "Inativo";

        subscriptionStatus.classList.remove(
            "active"
        );

        startDate.textContent = "—";

        endDate.textContent = "—";

        daysRemaining.textContent = "—";

        subscribeButton.textContent =
            "Assinar por R$ 30,00";

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

        subscriptionStatus.textContent =
            "Ativo";

        subscriptionStatus.classList.add(
            "active"
        );

        startDate.textContent =
            localStorage.getItem(
                "gestok_inicio_assinatura"
            ) || "—";

        endDate.textContent =
            formatarData(dataFinal);

        daysRemaining.textContent =
            dias + " dias";

        subscribeButton.textContent =
            "Renovar por R$ 30,00";

    } else {

        subscriptionStatus.textContent =
            "Expirada";

        subscriptionStatus.classList.remove(
            "active"
        );

        daysRemaining.textContent =
            "0 dias";

        subscribeButton.textContent =
            "Assinar novamente - R$ 30,00";

    }

}



atualizarAssinatura();



/* =========================================
   ASSINAR
========================================= */

if (subscribeButton) {

    subscribeButton.addEventListener(
        "click",
        function() {

            /*
             * TEMPORÁRIO:
             * Aqui depois vamos colocar
             * o pagamento PIX/cartão real.
             */

            const agora =
                new Date();


            const vencimento =
                new Date(agora);


            vencimento.setDate(
                vencimento.getDate() + 30
            );


            localStorage.setItem(
                "gestok_inicio_assinatura",
                formatarData(agora)
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