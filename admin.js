/* ==========================================
   CALCULA FÁCIL
   PAINEL ADMINISTRATIVO
   ADMIN.JS COMPLETO
========================================== */


/* ==========================================
   PROTEGER PAINEL
========================================== */

protegerAdmin();


/* ==========================================
   SUPABASE
========================================== */

const adminSupabase =
    supabaseClient;


/* ==========================================
   ELEMENTOS
========================================== */

const usuarioForm =
    document.getElementById(
        "usuarioForm"
    );


const listaUsuarios =
    document.getElementById(
        "listaUsuarios"
    );


const contadorUsuarios =
    document.getElementById(
        "contadorUsuarios"
    );


const adminMensagem =
    document.getElementById(
        "adminMensagem"
    );


/* ==========================================
   INDICADORES
========================================== */

const indicadorTotal =
    document.getElementById(
        "indicadorTotal"
    );


const indicadorAtivos =
    document.getElementById(
        "indicadorAtivos"
    );


const indicadorVencidos =
    document.getElementById(
        "indicadorVencidos"
    );


const indicadorInativos =
    document.getElementById(
        "indicadorInativos"
    );


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(
    texto,
    tipo
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
   ESCAPAR HTML
========================================== */

function escaparHTML(
    texto
){

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;

}


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(
    data
){

    if(!data){

        return "-";

    }


    const partes =
        data.split("-");


    if(
        partes.length !== 3
    ){

        return data;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* ==========================================
   VERIFICAR VALIDADE
========================================== */

function verificarValidade(
    usuario
){

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

    const resultado =
        await adminSupabase
            .from("usuarios")
            .select("*")
            .order(
                "nome",
                {
                    ascending:true
                }
            );


    if(resultado.error){

        console.error(
            resultado.error
        );


        mostrarMensagem(
            "Erro ao carregar usuários.",
            "erro"
        );


        return [];

    }


    return resultado.data || [];

}


/* ==========================================
   ATUALIZAR INDICADORES
========================================== */

function atualizarIndicadores(
    usuarios
){

    const total =
        usuarios.length;


    let ativos = 0;

    let vencidos = 0;

    let inativos = 0;


    usuarios.forEach(
        (usuario)=>{


            const expirado =
                !verificarValidade(
                    usuario
                );


            /*
               INATIVO tem prioridade
               sobre VENCIDO, igual ao
               status mostrado na tabela.
            */

            if(usuario.ativo === false){

                inativos++;

            }

            else if(expirado){

                vencidos++;

            }

            else{

                ativos++;

            }

        }
    );


    if(indicadorTotal){

        indicadorTotal.textContent =
            total;

    }


    if(indicadorAtivos){

        indicadorAtivos.textContent =
            ativos;

    }


    if(indicadorVencidos){

        indicadorVencidos.textContent =
            vencidos;

    }


    if(indicadorInativos){

        indicadorInativos.textContent =
            inativos;

    }

}


/* ==========================================
   RENDERIZAR USUÁRIOS
========================================== */

async function renderizarUsuarios(){

    listaUsuarios.innerHTML = `

        <tr>

            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:30px;
                "
            >

                Carregando usuários...

            </td>

        </tr>

    `;


    const usuarios =
        await obterUsuarios();


    /* ======================================
       ATUALIZAR INDICADORES
    ====================================== */

    atualizarIndicadores(
        usuarios
    );


    /* ======================================
       CONTADOR DA TABELA
    ====================================== */

    contadorUsuarios.textContent =
        usuarios.length === 1
            ? "1 usuário"
            : `${usuarios.length} usuários`;


    /* ======================================
       NENHUM USUÁRIO
    ====================================== */

    if(
        usuarios.length === 0
    ){

        listaUsuarios.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    Nenhum usuário cadastrado.

                </td>

            </tr>

        `;


        return;

    }


    listaUsuarios.innerHTML = "";


    /* ======================================
       CRIAR LINHAS
    ====================================== */

    usuarios.forEach(
        (usuario)=>{


            const expirado =
                !verificarValidade(
                    usuario
                );


            let classeStatus;

            let textoStatus;


            /* ==================================
               STATUS
            ================================== */

            if(
                usuario.ativo === false
            ){

                classeStatus =
                    "status-inativo";


                textoStatus =
                    "INATIVO";

            }

            else if(
                expirado
            ){

                classeStatus =
                    "status-expirado";


                textoStatus =
                    "EXPIRADO";

            }

            else{

                classeStatus =
                    "status-ativo";


                textoStatus =
                    "ATIVO";

            }


            /* ==================================
               LINHA
            ================================== */

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>

                    ${escaparHTML(
                        usuario.nome
                    )}

                </td>


                <td>

                    ${escaparHTML(
                        usuario.usuario
                    )}

                </td>


                <td>

                    ${formatarData(
                        usuario.validade
                    )}

                </td>


                <td>

                    <span
                        class="
                            status
                            ${classeStatus}
                        "
                    >

                        ${textoStatus}

                    </span>

                </td>


                <td>


                    <button
                        class="
                            btn-action
                            ${
                                usuario.ativo
                                ? "btn-deactivate"
                                : "btn-activate"
                            }
                        "
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
                        class="
                            btn-action
                            btn-edit
                        "
                        data-acao="validade"
                        data-id="${usuario.id}"
                    >

                        📅 Editar validade

                    </button>



                    <button
                        class="
                            btn-action
                            btn-delete
                        "
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

        }
    );

}


/* ==========================================
   ALTERAR STATUS
========================================== */

async function alternarUsuario(
    id
){

    const busca =
        await adminSupabase
            .from("usuarios")
            .select(
                "id,nome,ativo"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if(
        busca.error ||
        !busca.data
    ){

        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );


        return;

    }


    const novoStatus =
        busca.data.ativo === true
            ? false
            : true;


    const atualizacao =
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


    if(atualizacao.error){

        console.error(
            atualizacao.error
        );


        mostrarMensagem(
            "Erro ao alterar status.",
            "erro"
        );


        return;

    }


    mostrarMensagem(

        novoStatus
            ? "Usuário ativado!"
            : "Usuário desativado!",

        "sucesso"

    );


    await renderizarUsuarios();

}


/* ==========================================
   EDITAR VALIDADE
========================================== */

async function editarValidade(
    id
){

    const busca =
        await adminSupabase
            .from("usuarios")
            .select(
                "id,nome,validade"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if(
        busca.error ||
        !busca.data
    ){

        mostrarMensagem(
            "Usuário não encontrado.",
            "erro"
        );


        return;

    }


    const novaValidade =
        prompt(

            "Digite a nova validade (AAAA-MM-DD):",

            busca.data.validade || ""

        );


    if(!novaValidade){

        return;

    }


    const atualizacao =
        await adminSupabase
            .from("usuarios")
            .update({

                validade:
                    novaValidade,

                ativo:
                    true

            })
            .eq(
                "id",
                id
            );


    if(atualizacao.error){

        console.error(
            atualizacao.error
        );


        mostrarMensagem(
            "Erro ao atualizar validade.",
            "erro"
        );


        return;

    }


    mostrarMensagem(
        "Validade atualizada!",
        "sucesso"
    );


    await renderizarUsuarios();

}


/* ==========================================
   EXCLUIR USUÁRIO
========================================== */

async function excluirUsuario(
    id
){

    const confirmar =
        confirm(
            "Deseja excluir este usuário?"
        );


    if(!confirmar){

        return;

    }


    const resultado =
        await adminSupabase
            .from("usuarios")
            .delete()
            .eq(
                "id",
                id
            );


    if(resultado.error){

        console.error(
            resultado.error
        );


        mostrarMensagem(
            "Erro ao excluir usuário.",
            "erro"
        );


        return;

    }


    mostrarMensagem(
        "Usuário excluído!",
        "sucesso"
    );


    await renderizarUsuarios();

}


/* ==========================================
   BOTÕES DA TABELA
========================================== */

listaUsuarios.addEventListener(
    "click",
    async function(event){


        const botao =
            event.target.closest(
                "button"
            );


        if(!botao){

            return;

        }


        const id =
            botao.dataset.id;


        const acao =
            botao.dataset.acao;


        if(
            acao === "alternar"
        ){

            await alternarUsuario(
                id
            );

        }


        if(
            acao === "validade"
        ){

            await editarValidade(
                id
            );

        }


        if(
            acao === "excluir"
        ){

            await excluirUsuario(
                id
            );

        }

    }
);


/* ==========================================
   CRIAR USUÁRIO
========================================== */

async function criarUsuario(
    event
){

    event.preventDefault();


    const nome =
        document.getElementById(
            "nome"
        ).value.trim();


    const usuario =
        document.getElementById(
            "novoUsuario"
        ).value.trim();


    const senha =
        document.getElementById(
            "novaSenha"
        ).value;


    const validade =
        document.getElementById(
            "validade"
        ).value;


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


    const sessao =
        await adminSupabase.auth
            .getSession();


    const token =
        sessao.data.session?.access_token;


    if(!token){

        mostrarMensagem(
            "Sessão expirada.",
            "erro"
        );


        return;

    }


    try{


        const resposta =
            await fetch(

                "https://ggfgtyimojehbagpcgeh.supabase.co/functions/v1/criar-usuario",

                {

                    method:"POST",

                    headers:{

                        "Authorization":
                            "Bearer " +
                            token,

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


        const retorno =
            await resposta.json();


        if(!resposta.ok){

            console.error(
                retorno
            );


            mostrarMensagem(
                retorno.erro ||
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


        await renderizarUsuarios();


    }
    catch(erro){


        console.error(
            erro
        );


        mostrarMensagem(
            "Erro de conexão.",
            "erro"
        );

    }

}


/* ==========================================
   ATIVAR FORMULÁRIO
========================================== */

usuarioForm.addEventListener(
    "submit",
    criarUsuario
);


/* ==========================================
   INICIAR
========================================== */

renderizarUsuarios();