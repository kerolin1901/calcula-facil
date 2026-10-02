/* ==========================================
   CALCULA FÁCIL
   MEUS PRODUTOS
========================================== */


/* ==========================================
   PROTEGER CLIENTE
========================================== */

protegerCliente();


/* ==========================================
   CONFIGURAÇÃO SUPABASE
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
   ESTADO
========================================== */

let produtoEditandoId = null;

let usuarioAuthAtual = null;


/* ==========================================
   ELEMENTOS
========================================== */

const formProduto =
    document.getElementById(
        "formProduto"
    );


const formTitulo =
    document.getElementById(
        "formTitulo"
    );


const produtoNome =
    document.getElementById(
        "produtoNome"
    );


const produtoSku =
    document.getElementById(
        "produtoSku"
    );


const produtoCusto =
    document.getElementById(
        "produtoCusto"
    );


const produtoLucro =
    document.getElementById(
        "produtoLucro"
    );


const produtoTaxa =
    document.getElementById(
        "produtoTaxa"
    );


const produtoDesconto =
    document.getElementById(
        "produtoDesconto"
    );


const produtoImposto =
    document.getElementById(
        "produtoImposto"
    );


const produtoMensagem =
    document.getElementById(
        "produtoMensagem"
    );


const listaProdutos =
    document.getElementById(
        "listaProdutos"
    );


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function formatarData(data) {

    if (!data) {
        return "";
    }


    return new Date(data).toLocaleDateString(
        "pt-BR"
    );

}


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(
    texto,
    tipo = ""
) {

    produtoMensagem.className =
        "produto-mensagem " +
        tipo;

    produtoMensagem.textContent =
        texto;

}


/* ==========================================
   OBTER USUÁRIO AUTH
========================================== */

async function obterUsuarioAuth() {

    const {
        data,
        error
    } =
        await produtosSupabase.auth.getUser();


    if (error) {

        console.error(
            "Erro ao obter usuário:",
            error
        );

        return null;

    }


    return data.user || null;

}


/* ==========================================
   CALCULAR PRODUTO
========================================== */

function calcularValoresProduto() {

    const PC =
        parseFloat(
            produtoCusto.value
        );


    const L =
        parseFloat(
            produtoLucro.value
        );


    const TF =
        parseFloat(
            produtoTaxa.value
        );


    const PD =
        parseFloat(
            produtoDesconto.value
        );


    const I =
        parseFloat(
            produtoImposto.value
        );


    /* ======================================
       VALIDAR CAMPOS
    ====================================== */

    if (
        !Number.isFinite(PC) ||
        !Number.isFinite(L) ||
        !Number.isFinite(TF) ||
        !Number.isFinite(PD) ||
        !Number.isFinite(I)
    ) {

        return {
            erro:
                "Preencha todos os campos do cálculo."
        };

    }


    if (PC < 0) {

        return {
            erro:
                "O preço de custo não pode ser negativo."
        };

    }


    if (L < 0) {

        return {
            erro:
                "O lucro não pode ser negativo."
        };

    }


    if (TF < 0) {

        return {
            erro:
                "A taxa fixa não pode ser negativa."
        };

    }


    if (
        PD < 0 ||
        PD >= 100
    ) {

        return {
            erro:
                "O desconto deve estar entre 0% e 99,99%."
        };

    }


    if (
        I < 0 ||
        I >= 100
    ) {

        return {
            erro:
                "O imposto deve estar entre 0% e 99,99%."
        };

    }


    /* ======================================
       LUCRO
    ====================================== */

    const lucroSobrePC =
        PC * (L / 100);


    /* ======================================
       NUMERADOR
    ====================================== */

    const numerador =
        PC +
        lucroSobrePC +
        TF;


    /* ======================================
       DENOMINADOR
    ====================================== */

    const percentualDenominador =
        100 -
        PD -
        I;


    if (
        percentualDenominador <= 0
    ) {

        return {
            erro:
                "O desconto + imposto não podem resultar em um denominador igual ou menor que zero."
        };

    }


    const denominador =
        percentualDenominador / 100;


    /* ======================================
       PREÇO FINAL
    ====================================== */

    const precoVenda =
        numerador /
        denominador;


    /* ======================================
       DESCONTO
    ====================================== */

    const valorDesconto =
        precoVenda *
        (PD / 100);


    /* ======================================
       IMPOSTO
    ====================================== */

    const valorImposto =
        precoVenda *
        (I / 100);


    /* ======================================
       LUCRO LÍQUIDO
    ====================================== */

    const lucroLiquido =
        precoVenda -
        PC -
        TF -
        valorDesconto -
        valorImposto;


    return {

        precoVenda:
            precoVenda,

        lucroLiquido:
            lucroLiquido

    };

}


/* ==========================================
   NOVO PRODUTO
========================================== */

function novoProduto() {

    produtoEditandoId =
        null;


    formTitulo.textContent =
        "Cadastrar Produto";


    limparFormulario();


    mostrarMensagem(
        ""
    );


    formProduto.classList.add(
        "ativo"
    );


    produtoNome.focus();

}


/* ==========================================
   LIMPAR FORMULÁRIO
========================================== */

function limparFormulario() {

    produtoNome.value =
        "";

    produtoSku.value =
        "";

    produtoCusto.value =
        "";

    produtoLucro.value =
        "";

    produtoTaxa.value =
        "";

    produtoDesconto.value =
        "";

    produtoImposto.value =
        "";

}


/* ==========================================
   CANCELAR
========================================== */

function cancelarProduto() {

    produtoEditandoId =
        null;


    limparFormulario();


    mostrarMensagem(
        ""
    );


    formProduto.classList.remove(
        "ativo"
    );

}


/* ==========================================
   SALVAR PRODUTO
========================================== */

async function salvarProduto() {

    mostrarMensagem(
        ""
    );


    /* ======================================
       NOME
    ====================================== */

    const nome =
        produtoNome.value.trim();


    if (!nome) {

        mostrarMensagem(
            "Informe o nome do produto.",
            "erro"
        );

        produtoNome.focus();

        return;

    }


    /* ======================================
       USUÁRIO AUTH
    ====================================== */

    const usuario =
        await obterUsuarioAuth();


    if (!usuario) {

        mostrarMensagem(
            "Sua sessão expirou. Faça login novamente.",
            "erro"
        );

        return;

    }


    usuarioAuthAtual =
        usuario;


    /* ======================================
       CALCULAR
    ====================================== */

    const calculo =
        calcularValoresProduto();


    if (calculo.erro) {

        mostrarMensagem(
            calculo.erro,
            "erro"
        );

        return;

    }


    /* ======================================
       DADOS
    ====================================== */

    const dadosProduto = {

        usuario_id:
            usuario.id,

        nome:
            nome,

        sku:
            produtoSku.value.trim() || null,

        preco_custo:
            Number(
                produtoCusto.value
            ),

        lucro_percentual:
            Number(
                produtoLucro.value
            ),

        taxa_fixa:
            Number(
                produtoTaxa.value
            ),

        desconto_percentual:
            Number(
                produtoDesconto.value
            ),

        imposto_percentual:
            Number(
                produtoImposto.value
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

    if (produtoEditandoId) {

        const {
            error
        } =
            await produtosSupabase
                .from("produtos")
                .update(
                    dadosProduto
                )
                .eq(
                    "id",
                    produtoEditandoId
                );


        if (error) {

            console.error(
                "Erro ao atualizar produto:",
                error
            );


            mostrarMensagem(
                "Não foi possível atualizar o produto.",
                "erro"
            );

            return;

        }


        mostrarMensagem(
            "Produto atualizado com sucesso!",
            "sucesso"
        );

    }


    /* ======================================
       NOVO
    ====================================== */

    else {

        const {
            error
        } =
            await produtosSupabase
                .from("produtos")
                .insert(
                    dadosProduto
                );


        if (error) {

            console.error(
                "Erro ao cadastrar produto:",
                error
            );


            mostrarMensagem(
                "Não foi possível cadastrar o produto.",
                "erro"
            );

            return;

        }


        mostrarMensagem(
            "Produto cadastrado com sucesso!",
            "sucesso"
        );

    }


    /* ======================================
       FINALIZAR
    ====================================== */

    produtoEditandoId =
        null;


    limparFormulario();


    setTimeout(
        function () {

            formProduto.classList.remove(
                "ativo"
            );

        },
        500
    );


    carregarProdutos();

}


/* ==========================================
   CARREGAR PRODUTOS
========================================== */

async function carregarProdutos() {

    listaProdutos.innerHTML =
        '<div class="lista-vazia">Carregando produtos...</div>';


    const usuario =
        await obterUsuarioAuth();


    if (!usuario) {

        listaProdutos.innerHTML =
            '<div class="lista-vazia">Sessão não encontrada.</div>';

        return;

    }


    usuarioAuthAtual =
        usuario;


    /* ======================================
       BUSCAR PRODUTOS
       
       O RLS do Supabase garante que
       somente os produtos deste usuário
       sejam retornados.
    ====================================== */

    const {
        data,
        error
    } =
        await produtosSupabase
            .from("produtos")
            .select(
                "*"
            )
            .order(
                "criado_em",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );


        listaProdutos.innerHTML =
            '<div class="lista-vazia">Erro ao carregar os produtos.</div>';

        return;

    }


    /* ======================================
       NENHUM PRODUTO
    ====================================== */

    if (
        !data ||
        data.length === 0
    ) {

        listaProdutos.innerHTML = `

            <div class="lista-vazia">

                <div style="font-size:32px;">
                    📦
                </div>

                <div style="margin-top:8px;">
                    Você ainda não cadastrou nenhum produto.
                </div>

                <div style="margin-top:6px;font-size:13px;">
                    Clique em "Cadastrar Produto" para começar.
                </div>

            </div>

        `;

        return;

    }


    /* ======================================
       RENDERIZAR
    ====================================== */

    listaProdutos.innerHTML =
        "";


    data.forEach(
        function (produto) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "produto-item";


            item.innerHTML = `

                <div class="produto-item-topo">

                    <div>

                        <div class="produto-nome">

                            ${escaparHTML(
                                produto.nome
                            )}

                        </div>

                        ${
                            produto.sku
                                ? `
                                    <div class="produto-sku">
                                        SKU:
                                        ${escaparHTML(
                                            produto.sku
                                        )}
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <div class="produto-valores">


                    <div class="produto-valor">

                        <span>
                            PREÇO DE CUSTO
                        </span>

                        <strong>
                            ${formatarMoeda(
                                produto.preco_custo
                            )}
                        </strong>

                    </div>


                    <div class="produto-valor">

                        <span>
                            PREÇO DE VENDA
                        </span>

                        <strong>
                            ${formatarMoeda(
                                produto.preco_venda
                            )}
                        </strong>

                    </div>


                    <div class="produto-valor produto-lucro">

                        <span>
                            💰 LUCRO LÍQUIDO
                        </span>

                        <strong>
                            ${formatarMoeda(
                                produto.lucro_liquido
                            )}
                        </strong>

                    </div>


                </div>


                <div
                    style="
                        margin-top:10px;
                        font-size:12px;
                        color:#888;
                    "
                >

                    Lucro:
                    ${Number(
                        produto.lucro_percentual
                    ).toLocaleString("pt-BR")}
                    %

                    &nbsp; • &nbsp;

                    Desconto:
                    ${Number(
                        produto.desconto_percentual
                    ).toLocaleString("pt-BR")}
                    %

                    &nbsp; • &nbsp;

                    Imposto:
                    ${Number(
                        produto.imposto_percentual
                    ).toLocaleString("pt-BR")}
                    %

                </div>


                <div class="produto-acoes">


                    <button
                        type="button"
                        class="btn-produto btn-editar"
                        onclick="editarProduto('${produto.id}')"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        type="button"
                        class="btn-produto btn-recalcular"
                        onclick="recalcularProduto('${produto.id}')"
                    >
                        🔄 Recalcular
                    </button>


                    <button
                        type="button"
                        class="btn-produto btn-excluir"
                        onclick="excluirProduto('${produto.id}')"
                    >
                        🗑️ Excluir
                    </button>


                </div>


                <div
                    style="
                        margin-top:8px;
                        font-size:11px;
                        color:#aaa;
                    "
                >
                    Cadastrado em:
                    ${formatarData(
                        produto.criado_em
                    )}
                </div>

            `;


            listaProdutos.appendChild(
                item
            );

        }
    );

}


/* ==========================================
   EDITAR PRODUTO
========================================== */

async function editarProduto(
    id
) {

    const {
        data: produto,
        error
    } =
        await produtosSupabase
            .from("produtos")
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (error) {

        console.error(
            error
        );

        alert(
            "Não foi possível carregar o produto."
        );

        return;

    }


    if (!produto) {

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


    produtoCusto.value =
        produto.preco_custo ?? "";


    produtoLucro.value =
        produto.lucro_percentual ?? "";


    produtoTaxa.value =
        produto.taxa_fixa ?? "";


    produtoDesconto.value =
        produto.desconto_percentual ?? "";


    produtoImposto.value =
        produto.imposto_percentual ?? "";


    mostrarMensagem(
        ""
    );


    formProduto.classList.add(
        "ativo"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    produtoNome.focus();

}


/* ==========================================
   RECALCULAR
========================================== */

async function recalcularProduto(
    id
) {

    const {
        data: produto,
        error
    } =
        await produtosSupabase
            .from("produtos")
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (error) {

        console.error(
            error
        );

        alert(
            "Não foi possível carregar o produto."
        );

        return;

    }


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const PC =
        Number(
            produto.preco_custo
        );


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


    const percentualDenominador =
        100 -
        PD -
        I;


    if (
        percentualDenominador <= 0
    ) {

        alert(
            "Não é possível recalcular: desconto + imposto resultam em denominador inválido."
        );

        return;

    }


    const lucroSobrePC =
        PC *
        (L / 100);


    const numerador =
        PC +
        lucroSobrePC +
        TF;


    const precoVenda =
        numerador /
        (
            percentualDenominador /
            100
        );


    const valorDesconto =
        precoVenda *
        (PD / 100);


    const valorImposto =
        precoVenda *
        (I / 100);


    const lucroLiquido =
        precoVenda -
        PC -
        TF -
        valorDesconto -
        valorImposto;


    const {
        error: erroUpdate
    } =
        await produtosSupabase
            .from("produtos")
            .update({

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


    if (erroUpdate) {

        console.error(
            erroUpdate
        );


        alert(
            "Não foi possível recalcular o produto."
        );

        return;

    }


    carregarProdutos();

}


/* ==========================================
   EXCLUIR PRODUTO
========================================== */

async function excluirProduto(
    id
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este produto?"
        );


    if (!confirmar) {

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


    if (error) {

        console.error(
            "Erro ao excluir:",
            error
        );


        alert(
            "Não foi possível excluir o produto."
        );

        return;

    }


    carregarProdutos();

}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================
   VOLTAR PARA CALCULADORA
========================================== */

function voltarCalculadora() {

    window.location.href =
        "calculadora.html";

}


/* ==========================================
   MOSTRAR USUÁRIO
========================================== */

async function mostrarUsuario() {

    const sessao =
        obterSessao();


    const usuarioLogado =
        document.getElementById(
            "usuarioLogado"
        );


    if (
        usuarioLogado &&
        sessao
    ) {

        usuarioLogado.textContent =
            sessao.nome ||
            sessao.usuario ||
            "Cliente";

    }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarProdutos() {

    await mostrarUsuario();

    await carregarProdutos();

}


/* ==========================================
   INICIAR
========================================== */

iniciarProdutos();