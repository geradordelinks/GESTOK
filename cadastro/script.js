document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.querySelector("form");

        const mensagem =
            document.getElementById(
                "mensagemCadastro"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                const nome =
                    document.getElementById(
                        "nome"
                    )?.value || "";


                const email =
                    document.getElementById(
                        "email"
                    )?.value || "";


                const senha =
                    document.getElementById(
                        "senha"
                    )?.value || "";


                const confirmar =
                    document.getElementById(
                        "confirmarSenha"
                    )?.value || "";


                /* -----------------------------
                   VALIDAÇÕES
                ----------------------------- */

                if (!nome.trim()) {

                    mostrarMensagem(
                        "Digite seu nome.",
                        true
                    );

                    return;

                }


                if (!email.trim()) {

                    mostrarMensagem(
                        "Digite seu e-mail.",
                        true
                    );

                    return;

                }


                if (senha.length < 6) {

                    mostrarMensagem(
                        "A senha precisa ter pelo menos 6 caracteres.",
                        true
                    );

                    return;

                }


                if (senha !== confirmar) {

                    mostrarMensagem(
                        "As senhas não conferem.",
                        true
                    );

                    return;

                }


                /* -----------------------------
                   CRIAR CONTA
                ----------------------------- */

                const resultado =
                    criarContaGestok(
                        nome,
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


                mostrarMensagem(
                    "Conta criada! Vamos para o pagamento...",
                    false
                );


                /* -----------------------------
                   PAGAMENTO
                ----------------------------- */

                setTimeout(
                    function () {

                        window.location.href =
                            "../pagamento/index.html";

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