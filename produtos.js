/* ==========================================
   CALCULA FÁCIL
   MEUS PRODUTOS
========================================== */


/* ==========================================
   PROTEGER CLIENTE
========================================== */

protegerCliente();


/* ==========================================
   SUPABASE
========================================== */

const PRODUTOS_SUPABASE_URL =
    "https://ggfgtyimojehbagpcgeh.supabase.co";


const PRODUTOS_SUPABASE_ANON_KEY =
    "sb_publishable_rXqWNIrp8Tx9qPBhveoEGA_WPD6pGxi";


const produtosSupabase =
    window.supabase.createClient(
        PRODUTOS_SUPABASE_URL,
        PRODUTOS_SUPABASE_ANON_KEY
    );


/* ==========================================
   VARIÁVEIS
========================================== */

let produtoEditandoId = null;

let todosProdutos = [];


/* ==========================================
   ELEMENTOS
========================================== */

const formProduto =
    document.getElementById("formProduto");


const formTitulo =
    document.getElementById("formTitulo");


const produtoNome =
    document.getElementById("produtoNome");


const produtoSku =
    document.getElementById("produtoSku");


const produtoCategoria =
    document.getElementById("produtoCategoria");


const produtoPB =
    document.getElementById("produtoPB");


const produtoDescontoCusto =
    document.getElementById("produtoDescontoCusto");


const produtoCusto =
    document.getElementById("produtoCusto");


const produtoLucro =
    document.getElementById("produtoLucro");


const produtoTaxa =
    document.getElementById("produtoTaxa");


const produtoDesconto =
    document.getElementById("produtoDesconto");


const produtoImposto =
    document.getElementById("produtoImposto");


const produtoMensagem =
    document.getElementById("produtoMensagem");


const listaProdutos =
    document.getElementById("listaProdutos");


const buscarProduto =
    document.getElementById("buscarProduto");


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarMoeda(valor){

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escaparHTML(texto){

    return String(texto ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ==========================================
   LER NÚMERO
========================================== */

function lerNumero(campo){

    const valor =
        String(campo.value || "")
            .trim()
            .replace(",", ".");


    if(valor === ""){

        return NaN;

    }


    return Number(valor);

}


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(texto,tipo=""){

    produtoMensagem.className =
        "produto-mensagem " + tipo;

    produtoMensagem.textContent =
        texto;

}


/* ==========================================
   USUÁRIO
========================================== */

async function obterUsuarioAuth(){

    const {
        data,
        error
    } =
        await produtosSupabase.auth.getUser();


    if(error){

        console.error(
            "Erro ao obter usuário:",
            error
        );

        return null;

    }


    return data.user || null;

}


/* ==========================================
   CALCULAR PREÇO DE CUSTO
========================================== */

function calcularPrecoCustoProduto(){

    const PB =
        lerNumero(produtoPB);


    const D =
        lerNumero(produtoDescontoCusto);


    if(
        !Number.isFinite(PB) ||
        !Number.isFinite(D)
    ){

        produtoCusto.value = "";

        return {

            erro:null,

            pb:PB,

            descontoCusto:D,

            pc:null

        };

    }


    if(PB < 0){

        produtoCusto.value = "";

        return {

            erro:
                "O preço bruto não pode ser negativo.",

            pb:PB,

            descontoCusto:D,

            pc:null

        };

    }


    if(
        D < 0 ||
        D >= 100
    ){

        produtoCusto.value = "";

        return {

            erro:
                "O desconto deve estar entre 0% e 99,99%.",

            pb:PB,

            descontoCusto:D,

            pc:null

        };

    }


    const PC =
        PB * (1 - D / 100);


    produtoCusto.value =
        PC.toFixed(6);


    return {

        erro:null,

        pb:PB,

        descontoCusto:D,

        pc:PC

    };

}


/* ==========================================
   ATUALIZAR PC NA TELA
========================================== */

function atualizarPrecoCustoProduto(){

    calcularPrecoCustoProduto();

}


/* ==========================================
   CALCULAR VALORES DO PRODUTO
========================================== */

function calcularValoresProduto(){

    const precoCusto =
        calcularPrecoCustoProduto();


    if(
        precoCusto.erro
    ){

        return precoCusto;

    }


    if(
        precoCusto.pc === null
    ){

        return {

            erro:
                "Informe o preço bruto e o desconto."

        };

    }


    const L =
        lerNumero(produtoLucro);


    const TF =
        lerNumero(produtoTaxa);


    const PD =
        lerNumero(produtoDesconto);


    const I =
        lerNumero(produtoImposto);


    if(
        !Number.isFinite(L) ||
        !Number.isFinite(TF) ||
        !Number.isFinite(PD) ||
        !Number.isFinite(I)
    ){

        return {

            erro:
                "Preencha todos os campos.",

            pb:
                precoCusto.pb,

            descontoCusto:
                precoCusto.descontoCusto,

            pc:
                precoCusto.pc

        };

    }


    if(L < 0){

        return {

            erro:
                "O lucro não pode ser negativo."

        };

    }


    if(TF < 0){

        return {

            erro:
                "A taxa fixa não pode ser negativa."

        };

    }


    if(
        PD < 0 ||
        PD >= 100
    ){

        return {

            erro:
                "O desconto da venda deve estar entre 0% e 99,99%."

        };

    }


    if(
        I < 0 ||
        I >= 100
    ){

        return {

            erro:
                "O imposto deve estar entre 0% e 99,99%."

        };

    }


    const PC =
        precoCusto.pc;


    const lucroPC =
        PC * (L / 100);


    const numerador =
        PC +
        lucroPC +
        TF;


    const divisor =
        100 -
        PD -
        I;


    if(divisor <= 0){

        return {

            erro:
                "Desconto e imposto inválidos."

        };

    }


    const precoVenda =
        numerador /
        (divisor / 100);


    const desconto =
        precoVenda *
        (PD / 100);


    const imposto =
        precoVenda *
        (I / 100);


    const lucroLiquido =
        precoVenda -
        PC -
        TF -
        desconto -
        imposto;


    return {

        erro:null,

        pb:
            precoCusto.pb,

        descontoCusto:
            precoCusto.descontoCusto,

        pc:
            PC,

        precoVenda:
            precoVenda,

        lucroLiquido:
            lucroLiquido

    };

}


/* ==========================================
   NOVO PRODUTO
========================================== */

function novoProduto(){

    produtoEditandoId = null;


    formTitulo.textContent =
        "Cadastrar Produto";


    limparFormulario();


    mostrarMensagem("");


    formProduto.classList.add(
        "ativo"
    );


    produtoNome.focus();

}


/* ==========================================
   LIMPAR
========================================== */

function limparFormulario(){

    produtoNome.value = "";

    produtoSku.value = "";

    produtoCategoria.value = "";

    produtoPB.value = "";

    produtoDescontoCusto.value = "";

    produtoCusto.value = "";

    produtoLucro.value = "";

    produtoTaxa.value = "";

    produtoDesconto.value = "";

    produtoImposto.value = "";

}


/* ==========================================
   CANCELAR
========================================== */

function cancelarProduto(){

    produtoEditandoId = null;


    limparFormulario();


    formProduto.classList.remove(
        "ativo"
    );


    mostrarMensagem("");

}


/* ==========================================
   SALVAR
========================================== */

async function salvarProduto(){

    const nome =
        produtoNome.value.trim();


    if(!nome){

        mostrarMensagem(
            "Informe o nome do produto.",
            "erro"
        );

        return;

    }


    const usuario =
        await obterUsuarioAuth();


    if(!usuario){

        mostrarMensagem(
            "Sessão expirada.",
            "erro"
        );

        return;

    }


    const calculo =
        calcularValoresProduto();


    if(calculo.erro){

        mostrarMensagem(
            calculo.erro,
            "erro"
        );

        return;

    }


    const dados = {

        usuario_id:
            usuario.id,


        nome:
            nome,


        sku:
            produtoSku.value.trim() || null,


        categoria:
            produtoCategoria.value.trim() || null,


        preco_bruto:
            Number(
                calculo.pb
            ),


        desconto_custo_percentual:
            Number(
                calculo.descontoCusto
            ),


        preco_custo:
            Number(
                calculo.pc
            ),


        lucro_percentual:
            lerNumero(
                produtoLucro
            ),


        taxa_fixa:
            lerNumero(
                produtoTaxa
            ),


        desconto_percentual:
            lerNumero(
                produtoDesconto
            ),


        imposto_percentual:
            lerNumero(
                produtoImposto
            ),


        preco_venda:
            Number(
                calculo.precoVenda.toFixed(2)
            ),


        lucro_liquido:
            Number(
                calculo.lucroLiquido.toFixed(2)
            ),


        atualizado_em:
            new Date().toISOString()

    };


    /* ======================================
       EDITAR
    ====================================== */

    if(produtoEditandoId){

        const {
            error
        } =
            await produtosSupabase

                .from("produtos")

                .update(dados)

                .eq(
                    "id",
                    produtoEditandoId
                );


        if(error){

            console.error(
                "Erro ao atualizar:",
                error
            );


            mostrarMensagem(
                "Erro ao atualizar.",
                "erro"
            );


            return;

        }


        mostrarMensagem(
            "Produto atualizado!",
            "sucesso"
        );

    }


    /* ======================================
       NOVO
    ====================================== */

    else{

        const {
            error
        } =
            await produtosSupabase

                .from("produtos")

                .insert(dados);


        if(error){

            console.error(
                "Erro ao cadastrar:",
                error
            );


            mostrarMensagem(
                "Erro ao cadastrar.",
                "erro"
            );


            return;

        }


        mostrarMensagem(
            "Produto cadastrado!",
            "sucesso"
        );

    }


    produtoEditandoId = null;


    limparFormulario();


    setTimeout(()=>{

        formProduto.classList.remove(
            "ativo"
        );

    },700);


    carregarProdutos();

}


/* ==========================================
   CARREGAR PRODUTOS
========================================== */

async function carregarProdutos(){

    listaProdutos.innerHTML =
    `
        <div class="lista-vazia">
            Carregando produtos...
        </div>
    `;


    const usuario =
        await obterUsuarioAuth();


    if(!usuario){

        listaProdutos.innerHTML =
        `
            <div class="lista-vazia">
                Sessão não encontrada.
            </div>
        `;


        return;

    }


    const {
        data,
        error
    } =
        await produtosSupabase

            .from("produtos")

            .select("*")

            .order(
                "criado_em",
                {
                    ascending:false
                }
            );


    if(error){

        console.error(
            "Erro ao carregar:",
            error
        );


        listaProdutos.innerHTML =
        `
            <div class="lista-vazia">
                Erro ao carregar produtos.
            </div>
        `;


        return;

    }


    todosProdutos =
        data || [];


    mostrarProdutos(
        todosProdutos
    );

}


/* ==========================================
   MOSTRAR PRODUTOS
========================================== */

function mostrarProdutos(produtos){

    if(
        !produtos ||
        produtos.length === 0
    ){

        listaProdutos.innerHTML =
        `
            <div class="lista-vazia">

                📦

                <br><br>

                Nenhum produto encontrado.

            </div>
        `;

        return;

    }


    listaProdutos.innerHTML = "";


    produtos.forEach(produto=>{

        const item =
            document.createElement("div");


        item.className =
            "produto-item";


        item.innerHTML = `

            <div class="produto-nome">

                ${escaparHTML(produto.nome)}

            </div>


            <div class="produto-sku">

                SKU:

                ${escaparHTML(
                    produto.sku || ""
                )}

                <br>

                Categoria:

                ${escaparHTML(
                    produto.categoria || ""
                )}

            </div>


            <div class="produto-valores">


                <!-- CUSTO BRUTO -->

                <div class="produto-valor">

                    <span>

                        CUSTO BRUTO

                    </span>


                    <strong>

                        ${formatarMoeda(
                            produto.preco_bruto ??
                            produto.preco_custo
                        )}

                    </strong>

                </div>



                <!-- CUSTO LÍQUIDO -->

                <div class="produto-valor">

                    <span>

                        CUSTO LÍQUIDO

                    </span>


                    <strong>

                        ${formatarMoeda(
                            produto.preco_custo
                        )}

                    </strong>

                </div>



                <!-- VENDA -->

                <div class="produto-valor">

                    <span>

                        VENDA

                    </span>


                    <strong>

                        ${formatarMoeda(
                            produto.preco_venda
                        )}

                    </strong>

                </div>



                <!-- LUCRO -->

                <div class="produto-valor produto-lucro">

                    <span>

                        💰 LUCRO

                    </span>


                    <strong>

                        ${formatarMoeda(
                            produto.lucro_liquido
                        )}

                    </strong>

                </div>


            </div>


            <div class="produto-acoes">


                <button
                    class="btn-produto btn-editar"
                    onclick="editarProduto('${produto.id}')"
                >

                    ✏️ Editar

                </button>



                <button
                    class="btn-produto btn-recalcular"
                    onclick="recalcularProduto('${produto.id}')"
                >

                    🔄 Recalcular

                </button>



                <button
                    class="btn-produto btn-excluir"
                    onclick="excluirProduto('${produto.id}')"
                >

                    🗑️ Excluir

                </button>


            </div>

        `;


        listaProdutos.appendChild(
            item
        );

    });

}


/* ==========================================
   BUSCA
========================================== */

if(buscarProduto){

    buscarProduto.addEventListener(
        "input",
        function(){

            const termo =
                this.value
                    .toLowerCase()
                    .trim();


            if(!termo){

                mostrarProdutos(
                    todosProdutos
                );

                return;

            }


            const filtrados =
                todosProdutos.filter(
                    produto=>{

                        return (

                            (produto.nome || "")
                                .toLowerCase()
                                .includes(
                                    termo
                                )

                            ||

                            (produto.sku || "")
                                .toLowerCase()
                                .includes(
                                    termo
                                )

                            ||

                            (produto.categoria || "")
                                .toLowerCase()
                                .includes(
                                    termo
                                )

                        );

                    }
                );


            mostrarProdutos(
                filtrados
            );

        }
    );

}


/* ==========================================
   EDITAR
========================================== */

async function editarProduto(id){

    const produto =
        todosProdutos.find(
            p=>p.id == id
        );


    if(!produto){

        alert(
            "Produto não encontrado."
        );

        return;

    }


    produtoEditandoId =
        produto.id;


    formTitulo.textContent =
        "Editar Produto";


    produtoNome.value =
        produto.nome || "";


    produtoSku.value =
        produto.sku || "";


    produtoCategoria.value =
        produto.categoria || "";


    const custoAntigo =
        Number(
            produto.preco_custo || 0
        );


    const PB =
        produto.preco_bruto !== null &&
        produto.preco_bruto !== undefined
            ? produto.preco_bruto
            : custoAntigo;


    const D =
        produto.desconto_custo_percentual !== null &&
        produto.desconto_custo_percentual !== undefined
            ? produto.desconto_custo_percentual
            : 0;


    produtoPB.value =
        PB;


    produtoDescontoCusto.value =
        D;


    calcularPrecoCustoProduto();


    produtoLucro.value =
        produto.lucro_percentual ?? "";


    produtoTaxa.value =
        produto.taxa_fixa ?? "";


    produtoDesconto.value =
        produto.desconto_percentual ?? "";


    produtoImposto.value =
        produto.imposto_percentual ?? "";


    mostrarMensagem("");


    formProduto.classList.add(
        "ativo"
    );


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* ==========================================
   RECALCULAR
========================================== */

async function recalcularProduto(id){

    const produto =
        todosProdutos.find(
            p=>p.id == id
        );


    if(!produto){

        return;

    }


    const PB =
        Number(
            produto.preco_bruto ??
            produto.preco_custo ??
            0
        );


    const D =
        Number(
            produto.desconto_custo_percentual ??
            0
        );


    const PC =
        PB *
        (1 - D / 100);


    const L =
        Number(
            produto.lucro_percentual
        );


    const TF =
        Number(
            produto.taxa_fixa
        );


    const PD =
        Number(
            produto.desconto_percentual
        );


    const I =
        Number(
            produto.imposto_percentual
        );


    const lucroPC =
        PC *
        (L / 100);


    const numerador =
        PC +
        lucroPC +
        TF;


    const divisor =
        100 -
        PD -
        I;


    if(divisor <= 0){

        alert(
            "Desconto e imposto inválidos."
        );

        return;

    }


    const precoVenda =
        numerador /
        (divisor / 100);


    const desconto =
        precoVenda *
        (PD / 100);


    const imposto =
        precoVenda *
        (I / 100);


    const lucroLiquido =
        precoVenda -
        PC -
        TF -
        desconto -
        imposto;


    const {
        error
    } =
        await produtosSupabase

            .from("produtos")

            .update({

                preco_bruto:
                    PB,

                desconto_custo_percentual:
                    D,

                preco_custo:
                    Number(
                        PC.toFixed(6)
                    ),

                preco_venda:
                    Number(
                        precoVenda.toFixed(2)
                    ),

                lucro_liquido:
                    Number(
                        lucroLiquido.toFixed(2)
                    ),

                atualizado_em:
                    new Date().toISOString()

            })

            .eq(
                "id",
                id
            );


    if(error){

        console.error(
            "Erro ao recalcular:",
            error
        );

        alert(
            "Erro ao recalcular produto."
        );

        return;

    }


    carregarProdutos();

}


/* ==========================================
   EXCLUIR
========================================== */

async function excluirProduto(id){

    const confirmar =
        confirm(
            "Deseja excluir este produto?"
        );


    if(!confirmar){

        return;

    }


    const {
        error
    } =
        await produtosSupabase

            .from("produtos")

            .delete()

            .eq(
                "id",
                id
            );


    if(error){

        console.error(
            "Erro ao excluir:",
            error
        );

        alert(
            "Erro ao excluir produto."
        );

        return;

    }


    carregarProdutos();

}


/* ==========================================
   VOLTAR
========================================== */

function voltarCalculadora(){

    window.location.href =
        "calculadora.html";

}


/* ==========================================
   MOSTRAR USUÁRIO
========================================== */

async function mostrarUsuario(){

    const sessao =
        obterSessao();


    const usuario =
        document.getElementById(
            "usuarioLogado"
        );


    if(
        usuario &&
        sessao
    ){

        usuario.textContent =
            sessao.nome ||
            sessao.usuario ||
            "Cliente";

    }

}


/* ==========================================
   EVENTOS DO PB E D
========================================== */

produtoPB.addEventListener(
    "input",
    atualizarPrecoCustoProduto
);


produtoDescontoCusto.addEventListener(
    "input",
    atualizarPrecoCustoProduto
);


/* ==========================================
   INICIAR
========================================== */

async function iniciarProdutos(){

    await mostrarUsuario();

    await carregarProdutos();

}


iniciarProdutos();