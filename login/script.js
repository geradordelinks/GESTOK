/* =========================================
   GESTOK
   LOGIN
   CÓDIGO DA LOJA + USUÁRIO + SENHA
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================
           ELEMENTOS
        ===================================== */

        const form =
            document.querySelector("form");


        const mensagem =
            document.getElementById(
                "mensagemLogin"
            );


        const codigoLojaInput =
            document.getElementById(
                "codigoLoja"
            );


        const usuarioInput =
            document.getElementById(
                "usuario"
            );


        const senhaInput =
            document.getElementById(
                "senha"
            );


        if (!form) {

            return;

        }


        /* =====================================
           FORMATAR CÓDIGO DA LOJA
        ===================================== */

        if (codigoLojaInput) {

            codigoLojaInput.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(/\D/g, "")
                            .slice(0, 4);

                }
            );

        }


        /* =====================================
           ENVIO DO LOGIN
        ===================================== */

        form.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                /* =================================
                   OBTER DADOS
                ================================= */

                const codigoLoja =
                    codigoLojaInput?.value
                        .trim() || "";


                const usuario =
                    usuarioInput?.value
                        .trim() || "";


                const senha =
                    senhaInput?.value || "";


                /* =================================
                   VALIDAR CÓDIGO
                ================================= */

                if (
                    !codigoLoja
                ) {

                    mostrarMensagem(
                        "Digite o Código da Loja.",
                        true
                    );

                    return;

                }


                if (
                    codigoLoja.length !== 4
                ) {

                    mostrarMensagem(
                        "O Código da Loja deve ter 4 dígitos.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAR USUÁRIO
                ================================= */

                if (
                    !usuario
                ) {

                    mostrarMensagem(
                        "Digite seu usuário.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAR SENHA
                ================================= */

                if (
                    !senha
                ) {

                    mostrarMensagem(
                        "Digite sua senha.",
                        true
                    );

                    return;

                }


                /* =================================
                   DESABILITAR BOTÃO
                ================================= */

                const botao =
                    form.querySelector(
                        "button[type='submit']"
                    );


                if (botao) {

                    botao.disabled =
                        true;

                    botao.textContent =
                        "Entrando...";

                }


                /* =================================
                   REALIZAR LOGIN
                ================================= */

                const resultado =
                    await entrarGestok(

                        codigoLoja,

                        usuario,

                        senha

                    );
/* =================================
                   LOGIN INVÁLIDO
                ================================= */

                if (!resultado.ok) {

                    mostrarMensagem(
                        resultado.mensagem,
                        true
                    );


                    if (botao) {

                        botao.disabled =
                            false;

                        botao.textContent =
                            "Entrar no Gestok →";

                    }


                    return;

                }


                /* =================================
                   PAGAMENTO PENDENTE
                ================================= */

                if (
                    !pagamentoAprovadoGestok(
                        resultado.conta
                    )
                ) {

                    mostrarMensagem(

                        "Login realizado. Finalize o pagamento para liberar o sistema.",

                        false

                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "../pagamento/index.html";

                        },
                        700
                    );


                    return;

                }


                /* =================================
                   ASSINATURA EXPIRADA
                ================================= */

                if (
                    !assinaturaAtivaGestok(
                        resultado.conta
                    )
                ) {

                    mostrarMensagem(

                        "Sua assinatura expirou. Renove para continuar.",

                        true

                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "../pagamento/index.html";

                        },
                        1000
                    );


                    return;

                }


                /* =================================
                   LOGIN CONCLUÍDO
                ================================= */

                mostrarMensagem(

                    "Login realizado! Abrindo o sistema...",

                    false

                );


                setTimeout(
                    function () {

                        window.location.href =
                            "../sistema/index.html";

                    },
                    600
                );

            }
        );


        /* =====================================
           MENSAGEM
        ===================================== */

        function mostrarMensagem(
            texto,
            erro
        ) {

            if (!mensagem) {

                alert(texto);

                return;

            }


            mensagem.textContent =
                texto;


            mensagem.className =
                erro
                    ? "form-message error"
                    : "form-message success";


            mensagem.hidden =
                false;

        }

    }
);