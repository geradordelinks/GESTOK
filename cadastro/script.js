/* =========================================
   GESTOK
   CADASTRO DE EMPRESA
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
                "mensagemCadastro"
            );


        if (!form) {

            return;

        }


        /* =====================================
           ENVIO DO FORMULÁRIO
        ===================================== */

        form.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                /* =================================
                   OBTER CAMPOS
                ================================= */

                const nome =
                    document.getElementById(
                        "nome"
                    )?.value || "";


                const email =
                    document.getElementById(
                        "email"
                    )?.value || "";


                const usuario =
                    document.getElementById(
                        "usuario"
                    )?.value || "";


                const senha =
                    document.getElementById(
                        "senha"
                    )?.value || "";


                const confirmar =
                    document.getElementById(
                        "confirmarSenha"
                    )?.value || "";


                /* =================================
                   VALIDAÇÃO DO NOME
                ================================= */

                if (!nome.trim()) {

                    mostrarMensagem(
                        "Digite o nome da empresa.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAÇÃO DO E-MAIL
                ================================= */

                if (!email.trim()) {

                    mostrarMensagem(
                        "Digite seu e-mail.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAÇÃO DO USUÁRIO
                ================================= */

                const usuarioLimpo =
                    usuario
                        .trim()
                        .toLowerCase();


                if (!usuarioLimpo) {

                    mostrarMensagem(
                        "Digite um nome de usuário.",
                        true
                    );

                    return;

                }


                if (
                    usuarioLimpo.length < 3
                ) {

                    mostrarMensagem(
                        "O usuário precisa ter pelo menos 3 caracteres.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAR USUÁRIO
                ================================= */

                const usuarioValido =
                    /^[a-z0-9._-]+$/i.test(
                        usuarioLimpo
                    );


                if (!usuarioValido) {

                    mostrarMensagem(
                        "O usuário pode conter apenas letras, números, ponto, hífen e underline.",
                        true
                    );

                    return;

                }


                /* =================================
                   VALIDAÇÃO DA SENHA
                ================================= */

                if (
                    senha.length < 6
                ) {

                    mostrarMensagem(
                        "A senha precisa ter pelo menos 6 caracteres.",
                        true
                    );

                    return;

                }


                /* =================================
                   CONFIRMAR SENHA
                ================================= */

                if (
                    senha !== confirmar
                ) {

                    mostrarMensagem(
                        "As senhas não conferem.",
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
                        "Criando conta...";

                }


                /* =================================
                   CRIAR CONTA
                ================================= */

                const resultado =
                    criarContaGestok(

                        nome,

                        email,

                        usuarioLimpo,

                        senha

                    );


                /* =================================
                   ERRO
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
                            "Criar minha conta →";

                    }


                    return;

                }


                /* =================================
                   SUCESSO
                ================================= */

                mostrarMensagem(
                    "Conta criada com sucesso! Vamos para o pagamento...",
                    false
                );


                /* =================================
                   IR PARA PAGAMENTO
                ================================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "../pagamento/index.html";

                    },
                    700
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