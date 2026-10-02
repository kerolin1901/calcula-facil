/* ==========================================
   CALCULA FÁCIL
   REDEFINIÇÃO DE SENHA
========================================== */


/* ==========================================
   SUPABASE
========================================== */

const SUPABASE_URL =
    "https://qgfgtyimojehbgpcgeh.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_rXqWNIrp8Tx9qPBhveoEGA_WPD6pGxi";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ==========================================
   ELEMENTOS
========================================== */

const form =
    document.getElementById(
        "redefinirSenhaForm"
    );


const campoNovaSenha =
    document.getElementById(
        "novaSenha"
    );


const campoConfirmarSenha =
    document.getElementById(
        "confirmarSenha"
    );


const mensagem =
    document.getElementById(
        "mensagem"
    );


/* ==========================================
   VERIFICAR RECUPERAÇÃO
========================================== */

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        console.log(
            "Evento Supabase:",
            event
        );


        if (
            event === "PASSWORD_RECOVERY"
        ) {

            console.log(
                "Modo de recuperação de senha ativado."
            );

        }

    }
);


/* ==========================================
   ALTERAR SENHA
========================================== */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const novaSenha =
            campoNovaSenha.value;


        const confirmarSenha =
            campoConfirmarSenha.value;


        mensagem.className =
            "mensagem";


        mensagem.textContent =
            "Alterando senha...";


        /* ======================================
           VALIDAR SENHAS
        ====================================== */

        if (
            novaSenha.length < 6
        ) {

            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "A senha deve ter pelo menos 6 caracteres.";


            return;

        }


        if (
            novaSenha !== confirmarSenha
        ) {

            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "As senhas não são iguais.";


            return;

        }


        /* ======================================
           ATUALIZAR SENHA NO SUPABASE
        ====================================== */

        const {
            data,
            error
        } =
            await supabaseClient.auth.updateUser({

                password:
                    novaSenha

            });


        /* ======================================
           ERRO
        ====================================== */

        if (error) {

            console.error(
                "Erro ao alterar senha:",
                error
            );


            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "Não foi possível alterar a senha. O link pode ter expirado.";


            return;

        }


        /* ======================================
           SUCESSO
        ====================================== */

        mensagem.className =
            "mensagem sucesso";


        mensagem.textContent =
            "Senha alterada com sucesso!";


        campoNovaSenha.value =
            "";


        campoConfirmarSenha.value =
            "";


        /* ======================================
           SAIR DA SESSÃO DE RECUPERAÇÃO
        ====================================== */

        setTimeout(
            async function () {

                await supabaseClient.auth.signOut();


                window.location.href =
                    "index.html";

            },
            1500
        );

    }
);