/* ==========================================
   CALCULA FÁCIL
   PAINEL ADMINISTRATIVO
   ADMIN.JS
========================================== */


/* ==========================================
   PROTEGER ADMIN
========================================== */

protegerAdmin();



/* ==========================================
   SUPABASE
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

function formatarData(data){

    if(!data){

        return "-";

    }


    const partes =
        data.split("-");


    if(partes.length !== 3){

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
   VALIDADE
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
   MENSAGEM
========================================== */

function mostrarMensagem(
    texto,
    tipo=""
){


    if(!adminMensagem){

        return;

    }


    adminMensagem.className =
        "mensagem " + tipo;


    adminMensagem.textContent =
        texto;



    setTimeout(()=>{


        adminMensagem.textContent =
            "";


        adminMensagem.className =
            "mensagem";


    },4000);


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
            "*"
        )
        .order(
            "nome",
            {
                ascending:true
            }
        );



    if(error){


        console.error(
            "Erro usuários:",
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
   MOSTRAR USUÁRIOS
========================================== */

async function renderizarUsuarios(){


    listaUsuarios.innerHTML = `

    <tr>

        <td colspan="5">
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



    if(
        usuarios.length === 0
    ){


        listaUsuarios.innerHTML = `

        <tr>

            <td colspan="5">

                Nenhum usuário encontrado.

            </td>

        </tr>

        `;


        return;

    }



    listaUsuarios.innerHTML =
        "";



    usuarios.forEach(usuario=>{


        const expirado =
            !verificarValidade(usuario);



        let status =
            "";

        let classe =
            "";



        if(usuario.ativo === false){


            status =
                "INATIVO";


            classe =
                "status-inativo";


        }
        else if(expirado){


            status =
                "EXPIRADO";


            classe =
                "status-expirado";


        }
        else{


            status =
                "ATIVO";


            classe =
                "status-ativo";


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

data-id="${usuario.id}"

>

${usuario.ativo ? "Desativar" : "Ativar"}

</button>



<button

class="btn-action"

data-acao="validade"

data-id="${usuario.id}"

>

📅 Editar validade

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



        listaUsuarios.appendChild(
            linha
        );


    });


}
/* ==========================================
   CRIAR USUÁRIO
========================================== */

async function criarUsuario(event){

    event.preventDefault();


    const nome =
        document.getElementById("nome").value.trim();


    const usuario =
        document.getElementById("novoUsuario").value.trim();


    const senha =
        document.getElementById("novaSenha").value;


    const validade =
        document.getElementById("validade").value;



    if(
        !nome ||
        !usuario ||
        !senha ||
        !validade
    ){

        mostrarMensagem(
            "Preencha todos os campos.",
            "erro"
        );

        return;

    }



    const email =
        usuario.toLowerCase() +
        "@calculafacil.local";



    try{


        const {
            data: sessaoData
        } =
        await adminSupabase.auth.getSession();



        const token =
            sessaoData.session?.access_token;



        if(!token){


            mostrarMensagem(
                "Sessão expirada.",
                "erro"
            );

            return;

        }



        const resposta =
            await fetch(

"https://ggfgtyimojehbagpcgeh.supabase.co/functions/v1/criar-usuario",

            {

                method:"POST",

                headers:{


                    "Authorization":
                    "Bearer " + token,


                    "apikey":
                    SUPABASE_ANON_KEY,


                    "Content-Type":
                    "application/json"


                },


                body:JSON.stringify({

                    nome,

                    usuario,

                    email,

                    senha,

                    validade

                })

            }

        );



        const resultado =
            await resposta.json();



        if(!resposta.ok){


            console.error(resultado);


            mostrarMensagem(
                resultado.erro ||
                "Erro ao criar usuário.",
                "erro"
            );


            return;

        }



        mostrarMensagem(
            "Usuário criado com sucesso!",
            "sucesso"
        );


        usuarioForm.reset();


        renderizarUsuarios();



    }

    catch(erro){


        console.error(erro);


        mostrarMensagem(
            "Erro de conexão.",
            "erro"
        );


    }


}





/* ==========================================
   ATIVAR / DESATIVAR
========================================== */

async function alternarUsuario(id){


    const {

        data:usuario,

        error

    } =
    await adminSupabase
        .from("usuarios")
        .select(
            "ativo"
        )
        .eq(
            "id",
            id
        )
        .maybeSingle();



    if(error || !usuario){


        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );

        return;

    }



    const novoStatus =
        !usuario.ativo;



    const {
        error:updateError
    } =
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
            "Erro ao alterar status.",
            "erro"
        );


        return;

    }



    mostrarMensagem(
        novoStatus
        ? "Usuário ativado."
        : "Usuário desativado.",
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
        .select(
            "nome,validade"
        )
        .eq(
            "id",
            id
        )
        .maybeSingle();



    if(error || !usuario){

        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );

        return;

    }



    const nova =
        prompt(

            "Nova validade (AAAA-MM-DD):",

            usuario.validade || ""

        );



    if(!nova){

        return;

    }



    const {
        error:updateError
    } =
    await adminSupabase
        .from("usuarios")
        .update({

            validade:
            nova,

            ativo:
            true

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
        "Validade atualizada!",
        "sucesso"
    );


    renderizarUsuarios();


}







/* ==========================================
   EXCLUIR
========================================== */

async function excluirUsuario(id){


    const confirmar =
        confirm(
            "Excluir este usuário?"
        );



    if(!confirmar){

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



    if(error){


        console.error(error);


        mostrarMensagem(
            "Erro ao excluir.",
            "erro"
        );


        return;

    }



    mostrarMensagem(
        "Usuário excluído.",
        "sucesso"
    );


    renderizarUsuarios();


}






/* ==========================================
   BOTÕES DA TABELA
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
        botao.dataset.id;


    const acao =
        botao.dataset.acao;



    if(acao==="alternar"){

        await alternarUsuario(id);

    }



    if(acao==="validade"){

        await editarValidade(id);

    }



    if(acao==="excluir"){

        await excluirUsuario(id);

    }


}

);






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