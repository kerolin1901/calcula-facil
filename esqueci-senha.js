/* ==========================================
   CALCULA FÁCIL
   RECUPERAÇÃO DE SENHA
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
   ELEMENTOS DA PÁGINA
========================================== */

const form =
    document.getElementById(
        "recuperarForm"
    );


const campoUsuario =
    document.getElementById(
        "usuario"
    );


const mensagem =
    document.getElementById(
        "mensagem"
    );


/* ==========================================
   RECUPERAR SENHA
========================================== */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const usuario =
            campoUsuario.value.trim();


        mensagem.className =
            "mensagem";


        mensagem.textContent =
            "Verificando usuário...";


        /* ======================================
           VALIDAR USUÁRIO
        ====================================== */

        if (!usuario) {

            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "Digite seu usuário.";


            return;

        }


        /* ======================================
           ENCONTRAR E-MAIL PELO USUÁRIO
        ====================================== */

        const {
            data: emailUsuario,
            error: erroUsuario
        } =
            await supabaseClient
                .rpc(
                    "obter_email_por_usuario",
                    {
                        p_usuario: usuario
                    }
                );


        /* ======================================
           ERRO NA CONSULTA
        ====================================== */

        if (erroUsuario) {

            console.error(
                "Erro ao buscar usuário:",
                erroUsuario
            );


            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "Erro ao verificar usuário.";


            return;

        }


        /* ======================================
           USUÁRIO NÃO ENCONTRADO
        ====================================== */

        if (!emailUsuario) {

            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "Usuário não encontrado ou acesso expirado.";


            return;

        }


        /* ======================================
           ENVIAR E-MAIL DE RECUPERAÇÃO
        ====================================== */

        const {
            error
        } =
            await supabaseClient.auth
                .resetPasswordForEmail(
                    emailUsuario,
                    {

                        redirectTo:
                            "https://kerolin1901.github.io/calculafacil/redefinir-senha.html"

                    }
                );


        /* ======================================
           ERRO AO ENVIAR E-MAIL
        ====================================== */

        if (error) {

            console.error(
                "Erro ao enviar recuperação:",
                error
            );


            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "Não foi possível enviar o e-mail.";


            return;

        }


        /* ======================================
           SUCESSO
        ====================================== */

        mensagem.className =
            "mensagem sucesso";


        mensagem.textContent =
            "E-mail enviado! Verifique sua caixa de entrada.";

    }
);