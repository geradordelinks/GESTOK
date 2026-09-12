document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.querySelector("form");

        const mensagem =
            document.getElementById(
                "mensagemLogin"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                const email =
                    document.getElementById(
                        "email"
                    )?.value || "";


                const senha =
                    document.getElementById(
                        "senha"
                    )?.value || "";


                const resultado =
                    entrarGestok(
                        email,
                        senha
                    );


                if (!resultado.ok) {

                    mostrarMensagem(
                        resultado.mensagem,
                        true
                    );

                    return;

                }


                /*
                 * Se ainda não pagou,
                 * vai para o pagamento.
                 */

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
                        600
                    );


                    return;

                }


                /* -----------------------------
                   PAGAMENTO JÁ APROVADO
                ----------------------------- */

                mostrarMensagem(
                    "Login realizado. Abrindo o sistema...",
                    false
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "../sistema/index.html";

                    },
                    500
                );

            }
        );


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