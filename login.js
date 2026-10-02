/* ==========================================
   CALCULA FÁCIL
   LOGIN POR USUÁRIO + SENHA
   SUPABASE
========================================== */


/* ==========================================
   CONFIGURAÇÃO SUPABASE
========================================== */

const SUPABASE_URL =
    "https://ggfgtyimojehbagpcgeh.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_rXqWNIrp8Tx9qPBhveoEGA_WPD6pGxi";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ==========================================
   SESSÃO LOCAL
========================================== */

function obterSessao() {

    const dados =
        localStorage.getItem(
            "calculafacilSessao"
        );

    if (!dados) {
        return null;
    }

    try {

        return JSON.parse(dados);

    } catch {

        return null;

    }

}


function salvarSessao(sessao) {

    localStorage.setItem(
        "calculafacilSessao",
        JSON.stringify(sessao)
    );

}


function limparSessao() {

    localStorage.removeItem(
        "calculafacilSessao"
    );

}


/* ==========================================
   LOGIN
========================================== */

async function realizarLogin(event) {

    event.preventDefault();


    const campoUsuario =
        document.getElementById("usuario");


    const campoSenha =
        document.getElementById("senha");


    const mensagem =
        document.getElementById("loginMensagem");


    const usuario =
        campoUsuario.value.trim();


    const senha =
        campoSenha.value;


    mensagem.className =
        "mensagem";


    mensagem.textContent =
        "Verificando acesso...";


    /* ======================================
       VALIDAR CAMPOS
    ====================================== */

    if (!usuario || !senha) {

        mensagem.className =
            "mensagem erro";

        mensagem.textContent =
            "Digite usuário e senha.";

        return;

    }


    /* ======================================
       1. ENCONTRAR O E-MAIL PELO USUÁRIO
       
       O cliente digita somente:
       
       USUÁRIO + SENHA
       
       O e-mail fica escondido no sistema.
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
       ERRO AO BUSCAR USUÁRIO
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
            "Usuário ou senha incorretos.";


        return;

    }


    /* ======================================
       2. FAZER LOGIN NO SUPABASE AUTH
       
       Aqui usamos o e-mail interno
       encontrado pelo usuário.
    ====================================== */

    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email:
                emailUsuario,

            password:
                senha

        });


    /* ======================================
       ERRO DE LOGIN
    ====================================== */

    if (error) {

        console.error(
            "Erro Supabase Auth:",
            error
        );


        mensagem.className =
            "mensagem erro";


        mensagem.textContent =
            "Usuário ou senha incorretos.";


        return;

    }


    /* ======================================
       USUÁRIO AUTENTICADO
    ====================================== */

    const usuarioAuth =
        data.user;


    if (!usuarioAuth) {

        mensagem.className =
            "mensagem erro";


        mensagem.textContent =
            "Não foi possível identificar o usuário.";


        return;

    }


    /* ======================================
       3. BUSCAR CADASTRO DO CLIENTE/ADMIN
       
       Agora o usuário já está autenticado,
       então a política RLS permite consultar
       o próprio cadastro.
    ====================================== */

    const {
        data: cadastro,
        error: erroCadastro
    } =
        await supabaseClient
            .from("usuarios")
            .select(
                "id, nome, usuario, email, validade, ativo, tipo"
            )
            .eq(
                "email",
                usuarioAuth.email
            )
            .maybeSingle();


    /* ======================================
       ERRO AO CONSULTAR CADASTRO
    ====================================== */

    if (erroCadastro) {

        console.error(
            "Erro ao consultar cadastro:",
            erroCadastro
        );


        await supabaseClient.auth.signOut();


        mensagem.className =
            "mensagem erro";


        mensagem.textContent =
            "Erro ao verificar cadastro.";


        return;

    }


    /* ======================================
       CADASTRO NÃO ENCONTRADO
    ====================================== */

    if (!cadastro) {

        await supabaseClient.auth.signOut();


        mensagem.className =
            "mensagem erro";


        mensagem.textContent =
            "Cadastro do usuário não encontrado.";


        return;

    }


    /* ======================================
       USUÁRIO DESATIVADO
    ====================================== */

    if (!cadastro.ativo) {

        await supabaseClient.auth.signOut();


        mensagem.className =
            "mensagem erro";


        mensagem.textContent =
            "Este usuário está desativado.";


        return;

    }


    /* ======================================
       VERIFICAR VALIDADE
       
       Administrador não depende da validade.
    ====================================== */

    if (cadastro.tipo !== "admin") {

        const hoje =
            new Date();


        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const validade =
            new Date(
                cadastro.validade +
                "T23:59:59"
            );


        if (
            validade < hoje
        ) {

            await supabaseClient.auth.signOut();


            mensagem.className =
                "mensagem erro";


            mensagem.textContent =
                "A validade deste acesso expirou.";


            return;

        }

    }


    /* ======================================
       LOGIN APROVADO
    ====================================== */

    salvarSessao({

        tipo:
            cadastro.tipo,

        usuario:
            cadastro.usuario,

        nome:
            cadastro.nome,

        email:
            cadastro.email,

        validade:
            cadastro.validade

    });


    mensagem.className =
        "mensagem sucesso";


    mensagem.textContent =
        "Acesso autorizado. Entrando...";


    /* ======================================
       DIRECIONAR CONFORME O TIPO
    ====================================== */

    setTimeout(
        function () {

            if (
                cadastro.tipo === "admin"
            ) {

                window.location.href =
                    "admin.html";

            } else {

                window.location.href =
                    "calculadora.html";

            }

        },
        500
    );

}


/* ==========================================
   PROTEGER ADMIN
========================================== */

function protegerAdmin() {

    const sessao =
        obterSessao();


    if (
        !sessao ||
        sessao.tipo !== "admin"
    ) {

        window.location.href =
            "index.html";

    }


}


/* ==========================================
   PROTEGER CLIENTE
========================================== */

function protegerCliente() {

    const sessao =
        obterSessao();


    if (
        !sessao ||
        sessao.tipo !== "cliente"
    ) {

        window.location.href =
            "index.html";

    }


}


/* ==========================================
   SAIR
========================================== */

async function sair() {

    await supabaseClient.auth.signOut();


    limparSessao();


    window.location.href =
        "index.html";

}


/* ==========================================
   FORMULÁRIO DE LOGIN
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "loginForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                realizarLogin
            );

        }

    }
);