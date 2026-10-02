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
   CONFIGURAÇÃO SUPABASE
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
   MENSAGEM
========================================== */

function mostrarMensagem(texto, tipo){


    if(!adminMensagem) return;


    adminMensagem.className =
        "mensagem " + tipo;


    adminMensagem.textContent =
        texto;



    setTimeout(()=>{

        adminMensagem.textContent = "";

        adminMensagem.className =
            "mensagem";

    },4000);

}



/* ==========================================
   ESCAPAR HTML
========================================== */

function escaparHTML(texto){


    const div =
        document.createElement("div");


    div.textContent =
        texto ?? "";


    return div.innerHTML;

}



/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(data){


    if(!data){

        return "-";

    }


    const partes =
        data.split("-");


    if(partes.length !== 3){

        return data;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}



/* ==========================================
   VERIFICAR VALIDADE
========================================== */

function verificarValidade(usuario){


    if(!usuario.validade){

        return false;

    }


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
            usuario.validade +
            "T23:59:59"
        );


    return validade >= hoje;

}



/* ==========================================
   BUSCAR USUÁRIOS
========================================== */

async function obterUsuarios(){


    const {

        data,
        error

    } =
    await adminSupabase
        .from("usuarios")
        .select(
            "id,nome,usuario,email,validade,ativo,tipo"
        )
        .order(
            "nome",
            {
                ascending:true
            }
        );



    if(error){


        console.error(
            "Erro Supabase:",
            error
        );


        mostrarMensagem(
            "Erro ao carregar usuários",
            "erro"
        );


        return [];

    }


    return data || [];

}

/* ==========================================
   RENDERIZAR USUÁRIOS
========================================== */

async function renderizarUsuarios(){


    listaUsuarios.innerHTML = `

        <tr>
            <td colspan="5"
            style="text-align:center;padding:30px;">
                Carregando usuários...
            </td>
        </tr>

    `;



    const usuarios =
        await obterUsuarios();



    if(contadorUsuarios){

        contadorUsuarios.textContent =
            usuarios.length === 1
            ? "1 usuário"
            : `${usuarios.length} usuários`;

    }



    if(usuarios.length === 0){


        listaUsuarios.innerHTML = `

        <tr>

            <td colspan="5"
            style="text-align:center;padding:30px;">

                Nenhum usuário cadastrado.

            </td>

        </tr>

        `;


        return;

    }



    listaUsuarios.innerHTML = "";



    usuarios.forEach(usuario=>{


        const expirado =
            !verificarValidade(usuario);



        let status =
            "ATIVO";


        let classe =
            "status-ativo";



        if(usuario.ativo === false){

            status = "INATIVO";

            classe =
            "status-inativo";

        }
        else if(expirado){

            status = "EXPIRADO";

            classe =
            "status-expirado";

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

            <span class="status ${classe}">
                ${status}
            </span>

        </td>


        <td>


            <button
            class="btn-action"
            data-acao="alternar"
            data-id="${usuario.id}">
            
            ${usuario.ativo ? "Desativar" : "Ativar"}

            </button>



            <button
            class="btn-action btn-edit"
            data-acao="validade"
            data-id="${usuario.id}">

            📅 Editar validade

            </button>



            <button
            class="btn-action btn-delete"
            data-acao="excluir"
            data-id="${usuario.id}">

            Excluir

            </button>


        </td>


        `;



        listaUsuarios.appendChild(linha);



    });


}



/* ==========================================
   ALTERAR STATUS
========================================== */

async function alternarUsuario(id){


    console.log(
        "ID recebido:",
        id
    );



    const {

        data:usuario,
        error

    } =
    await adminSupabase
    .from("usuarios")
    .select("*")
    .eq("id",id)
    .maybeSingle();



    if(error || !usuario){


        console.error(error);


        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );


        return;

    }



    const novoStatus =
        !usuario.ativo;



    const {error:updateError} =
    await adminSupabase
    .from("usuarios")
    .update({

        ativo:
        novoStatus

    })
    .eq(
        "id",
        id
    );



    if(updateError){


        console.error(updateError);


        mostrarMensagem(
            "Erro ao alterar usuário.",
            "erro"
        );


        return;

    }



    mostrarMensagem(
        "Status alterado!",
        "sucesso"
    );



    renderizarUsuarios();


}
/* ==========================================
   EDITAR VALIDADE
========================================== */

async function editarValidade(id){


    const {

        data:usuario,
        error

    } =
    await adminSupabase
    .from("usuarios")
    .select("id,nome,validade")
    .eq("id",id)
    .maybeSingle();



    if(error || !usuario){


        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );


        return;

    }



    const novaValidade =
        prompt(
            "Nova validade (AAAA-MM-DD):",
            usuario.validade || ""
        );



    if(!novaValidade){

        return;

    }



    const {error:updateError} =
    await adminSupabase
    .from("usuarios")
    .update({

        validade:
        novaValidade

    })
    .eq(
        "id",
        id
    );



    if(updateError){


        console.error(updateError);


        mostrarMensagem(
            "Erro ao alterar validade.",
            "erro"
        );


        return;

    }



    mostrarMensagem(
        "Validade alterada com sucesso!",
        "sucesso"
    );



    renderizarUsuarios();


}



/* ==========================================
   EXCLUIR USUÁRIO
========================================== */

async function excluirUsuario(id){


    const confirmar =
        confirm(
            "Deseja excluir este usuário?"
        );


    if(!confirmar){

        return;

    }



    const {error} =
    await adminSupabase
    .from("usuarios")
    .delete()
    .eq(
        "id",
        id
    );



    if(error){


        console.error(error);


        mostrarMensagem(
            "Erro ao excluir.",
            "erro"
        );


        return;

    }



    mostrarMensagem(
        "Usuário excluído!",
        "sucesso"
    );



    renderizarUsuarios();


}



/* ==========================================
   CLIQUES DOS BOTÕES
========================================== */

listaUsuarios.addEventListener(
"click",
async function(event){


    const botao =
        event.target.closest("button");



    if(!botao){

        return;

    }



    const id =
        botao.getAttribute("data-id");



    const acao =
        botao.getAttribute("data-acao");



    console.log(
        "Botão:",
        acao,
        "ID:",
        id
    );



    if(acao==="alternar"){

        await alternarUsuario(id);

    }



    if(acao==="validade"){

        await editarValidade(id);

    }



    if(acao==="excluir"){

        await excluirUsuario(id);

    }


});



/* ==========================================
   CRIAR USUÁRIO
========================================== */

async function criarUsuario(event){


    event.preventDefault();



    mostrarMensagem(
        "Função de criação mantida.",
        "sucesso"
    );


}



/* ==========================================
   FORMULÁRIO
========================================== */

if(usuarioForm){


    usuarioForm.addEventListener(
        "submit",
        criarUsuario
    );

}



/* ==========================================
   INICIAR
========================================== */

renderizarUsuarios();