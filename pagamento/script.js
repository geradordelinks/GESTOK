document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btnPagamento =
            document.getElementById(
                "btnPagamento"
            );

        const mensagem =
            document.getElementById(
                "mensagemPagamento"
            );

        const pixArea =
            document.getElementById(
                "pixArea"
            );


        const conta =
            obterContaGestok();


        /* -----------------------------------------
           VERIFICAR CONTA
        ----------------------------------------- */

        if (!conta) {

            window.location.replace(
                "../cadastro/index.html"
            );

            return;

        }


        /* -----------------------------------------
           SE JÁ PAGOU
        ----------------------------------------- */

        if (
            pagamentoAprovadoGestok(
                conta
            )
        ) {

            mostrarMensagem(
                "Sua assinatura já está ativa.",
                false
            );

            btnPagamento.textContent =
                "Acessar o sistema →";


            btnPagamento.onclick =
                function () {

                    window.location.href =
                        "../sistema/index.html";

                };

            return;

        }


        /* -----------------------------------------
           PIX
        ----------------------------------------- */

        if (pixArea) {

            pixArea.style.display =
                "grid";

        }


        /* -----------------------------------------
           CONFIRMAR PAGAMENTO
        ----------------------------------------- */

        if (btnPagamento) {

            btnPagamento.addEventListener(
                "click",
                async function () {

                    btnPagamento.disabled =
                        true;


                    btnPagamento.textContent =
                        "Processando pagamento...";


                    /*
                     * DEMONSTRAÇÃO
                     *
                     * Aqui estamos simulando a
                     * aprovação do pagamento.
                     *
                     * Quando você colocar PIX
                     * ou cartão real, esta função
                     * será substituída pela resposta
                     * do gateway de pagamento.
                     */

                    setTimeout(
                        function () {

                            const resultado =
                                await aprovarPagamentoGestok();


                            if (!resultado.ok) {

                                mostrarMensagem(
                                    resultado.mensagem,
                                    true
                                );

                                btnPagamento.disabled =
                                    false;

                                btnPagamento.innerHTML =
                                    'Confirmar pagamento <span>→</span>';

                                return;

                            }


                            mostrarMensagem(
                                "Pagamento aprovado! Seu Gestok foi liberado.",
                                false
                            );


                            btnPagamento.textContent =
                                "Pagamento aprovado";


                            setTimeout(
                                function () {

                                    window.location.href =
                                        "../sistema/index.html";

                                },
                                800
                            );

                        },
                        1000
                    );

                }
            );

        }


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
                    ? "payment-message error"
                    : "payment-message success";


            mensagem.hidden =
                false;

        }

    }
);