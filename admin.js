/* ==========================================
   CALCULA FÁCIL
   PAINEL ADMINISTRATIVO
   SUPABASE
========================================== */


/* ==========================================
   PROTEGER PAINEL
========================================== */

protegerAdmin();


/* ==========================================
   CONFIGURAÇÃO
========================================== */

const adminSupabase = supabaseClient;


/* ==========================================
   ELEMENTOS
========================================== */

const usuarioForm =
    document.getElementById("usuarioForm");

const listaUsuarios =
    document.getElementById("listaUsuarios");

const contadorUsuarios =
    document.getElementById("contadorUsuarios");

const adminMensagem =
    document.getElementById("adminMensagem");


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}


/* ==========================================
   VERIFICAR VALIDADE
========================================== */

function verificarValidade(usuario) {

    if (!usuario.validade) {
        return false;
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const validade =
        new Date(
            usuario.validade + "T23:59:59"
        );

    return validade >= hoje;
}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto ?? "";

    return div.innerHTML;
}


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(texto, tipo) {

    adminMensagem.className =
        "mensagem " + tipo;

    adminMensagem.textContent =
        texto;

    setTimeout(() => {

        adminMensagem.textContent = "";

        adminMensagem.className =
            "mensagem";

    }, 4000);
}


/* ==========================================
   CARREGAR USUÁRIOS
========================================== */

async function obterUsuarios() {

    const {
        data,
        error
    } =
        await adminSupabase
            .from("usuarios")
            .select(
                "id, nome, usuario, email, validade, ativo, tipo"
            )
            .eq(
                "tipo",
                "cliente"
            )
            .order(
                "nome",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar usuários:",
            error
        );

        mostrarMensagem(
            "Erro ao carregar usuários.",
            "erro"
        );

        return [];
    }


    return data || [];
}


/* ==========================================
   RENDERIZAR USUÁRIOS
========================================== */

async function renderizarUsuarios() {

    listaUsuarios.innerHTML = `

        <tr>

            <td
                colspan="5"
                style="text-align:center;padding:30px;"
            >
                Carregando usuários...
            </td>

        </tr>

    `;


    const usuarios =
        await obterUsuarios();


    contadorUsuarios.textContent =
        usuarios.length === 1
            ? "1 usuário"
            : `${usuarios.length} usuários`;


    if (usuarios.length === 0) {

        listaUsuarios.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:30px;"
                >
                    Nenhum usuário cadastrado.
                </td>

            </tr>

        `;

        return;
    }


    listaUsuarios.innerHTML = "";


    usuarios.forEach((usuario) => {

        const expirado =
            !verificarValidade(usuario);


        let statusClass;

        let statusTexto;


        if (!usuario.ativo) {

            statusClass =
                "status-inativo";

            statusTexto =
                "INATIVO";

        }

        else if (expirado) {

            statusClass =
                "status-expirado";

            statusTexto =
                "EXPIRADO";

        }

        else {

            statusClass =
                "status-ativo";

            statusTexto =
                "ATIVO";
        }


        const linha =
            document.createElement("tr");


        linha.innerHTML = `

            <td>
                ${escaparHTML(usuario.nome)}
            </td>

            <td>
                ${escaparHTML(usuario.usuario)}
            </td>

            <td>
                ${formatarData(usuario.validade)}
            </td>

            <td>

                <span
                    class="status ${statusClass}"
                >
                    ${statusTexto}
                </span>

            </td>

            <td>

                <button
                    class="btn-action ${
                        usuario.ativo
                            ? "btn-deactivate"
                            : "btn-activate"
                    }"
                    data-acao="alternar"
                    data-id="${usuario.id}"
                >

                    ${
                        usuario.ativo
                            ? "Desativar"
                            : "Ativar"
                    }

                </button>


                <button
                    class="btn-action btn-delete"
                    data-acao="excluir"
                    data-id="${usuario.id}"
                >
                    Excluir
                </button>

            </td>

        `;


        listaUsuarios.appendChild(linha);

    });
}


/* ==========================================
   CRIAR USUÁRIO
========================================== */

async function criarUsuario(event) {

    event.preventDefault();


    const nome =
        document.getElementById("nome").value.trim();

    const usuario =
        document.getElementById("novoUsuario").value.trim();

    const senha =
        document.getElementById("novaSenha").value;

    const validade =
        document.getElementById("validade").value;


    if (
        !nome ||
        !usuario ||
        !senha ||
        !validade
    ) {

        mostrarMensagem(
            "Preencha todos os campos.",
            "erro"
        );

        return;
    }


    /*
      O cadastro precisa de um e-mail para
      criar o usuário no Supabase Auth.

      Por enquanto vamos gerar um e-mail interno
      baseado no nome de usuário.
    */

    const email =
        usuario.toLowerCase() +
        "@calculafacil.local";


    mostrarMensagem(
        "Criando usuário...",
        "sucesso"
    );


    const {
        data: sessaoData
    } =
        await adminSupabase.auth.getSession();


    const accessToken =
        sessaoData.session?.access_token;


    if (!accessToken) {

        mostrarMensagem(
            "Sua sessão expirou. Faça login novamente.",
            "erro"
        );

        return;
    }


    try {

        const resposta =
            await fetch(
                "https://ggfgtyimojehbagpcgeh.supabase.co/functions/v1/criar-usuario",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " + accessToken,

                        "apikey":
                            SUPABASE_ANON_KEY,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        nome:
                            nome,

                        usuario:
                            usuario,

                        email:
                            email,

                        senha:
                            senha,

                        validade:
                            validade

                    })
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            console.error(
                "Erro da função:",
                resultado
            );

            mostrarMensagem(
                resultado.erro ||
                "Não foi possível criar o usuário.",
                "erro"
            );

            return;
        }


        mostrarMensagem(
            "Usuário criado com sucesso!",
            "sucesso"
        );


        usuarioForm.reset();


        await renderizarUsuarios();


    } catch (erro) {

        console.error(
            "Erro:",
            erro
        );

        mostrarMensagem(
            "Erro de conexão com o servidor.",
            "erro"
        );

    }
}


/* ==========================================
   ATIVAR / DESATIVAR
========================================== */

async function alternarUsuario(id) {

    const {
        data: usuario,
        error: erroBusca
    } =
        await adminSupabase
            .from("usuarios")
            .select(
                "id, nome, ativo"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (erroBusca || !usuario) {

        mostrarMensagem(
            "Não foi possível localizar o usuário.",
            "erro"
        );

        return;
    }


    const novoStatus =
        !usuario.ativo;


    const {
        error
    } =
        await adminSupabase
            .from("usuarios")
            .update({
                ativo: novoStatus
            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        mostrarMensagem(
            "Não foi possível alterar o status.",
            "erro"
        );

        return;
    }


    mostrarMensagem(
        novoStatus
            ? "Usuário ativado com sucesso!"
            : "Usuário desativado com sucesso!",
        "sucesso"
    );


    await renderizarUsuarios();
}


/* ==========================================
   EXCLUIR
========================================== */

async function excluirUsuario(id) {

    const {
        data: usuario,
        error: erroBusca
    } =
        await adminSupabase
            .from("usuarios")
            .select(
                "id, nome, email"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (erroBusca || !usuario) {

        mostrarMensagem(
            "Não foi possível localizar o usuário.",
            "erro"
        );

        return;
    }


    const confirmar =
        confirm(
            `Deseja excluir o cadastro de "${usuario.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await adminSupabase
            .from("usuarios")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        mostrarMensagem(
            "Não foi possível excluir o usuário.",
            "erro"
        );

        return;
    }


    mostrarMensagem(
        "Cadastro excluído com sucesso!",
        "sucesso"
    );


    await renderizarUsuarios();
}


/* ==========================================
   BOTÕES DA TABELA
========================================== */

listaUsuarios.addEventListener(
    "click",
    async function (event) {

        const botao =
            event.target.closest("button");


        if (!botao) {
            return;
        }


        const id =
            botao.dataset.id;

        const acao =
            botao.dataset.acao;


        if (!id || !acao) {
            return;
        }


        if (acao === "alternar") {

            await alternarUsuario(id);

        }


        if (acao === "excluir") {

            await excluirUsuario(id);

        }

    }
);


/* ==========================================
   FORMULÁRIO
========================================== */

if (usuarioForm) {

    usuarioForm.addEventListener(
        "submit",
        criarUsuario
    );

}


/* ==========================================
   INICIALIZAR
========================================== */

renderizarUsuarios();