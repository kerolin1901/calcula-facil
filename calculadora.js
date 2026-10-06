/* ==========================================
   CALCULA FÁCIL
   CALCULADORA
========================================== */


/* ==========================================
   PROTEGER CLIENTE
========================================== */

protegerCliente();


/* ==========================================
   SESSÃO
========================================== */

const sessao = obterSessao();

if (sessao) {

    const usuarioLogado =
        document.getElementById("usuarioLogado");

    if (usuarioLogado) {

        usuarioLogado.textContent =
            sessao.nome || sessao.usuario;

    }

}


/* ==========================================
   CAMPOS DA CALCULADORA
========================================== */

const campoPB =
    document.getElementById("pb");

const campoD =
    document.getElementById("d");

const campoPC =
    document.getElementById("pc");

const campoLucro =
    document.getElementById("lucro");

const campoTF =
    document.getElementById("tf");

const campoPD =
    document.getElementById("pd");

const campoImposto =
    document.getElementById("imposto");


/* ==========================================
   SELEÇÃO DE PRODUTO
========================================== */

const produtoSelecionado =
    document.getElementById("produtoSelecionado");


let produtosCalculadora = [];


/* ==========================================
   BOTÃO SALVAR
========================================== */

const btnSalvarProdutoCalculadora =
    document.getElementById(
        "btnSalvarProdutoCalculadora"
    );


const mensagemSalvarProduto =
    document.getElementById(
        "mensagemSalvarProduto"
    );


/* ==========================================
   PRODUTO ATUAL
========================================== */

let produtoAtualId = null;


/* ==========================================
   RESULTADO
========================================== */

const resultado =
    document.getElementById("resultado");


const detalhes =
    document.getElementById("detalhes");


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNumero(numero) {

    return Number(numero).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }
    );

}


/* ==========================================
   MENSAGEM DO BOTÃO
========================================== */

function mostrarMensagemSalvar(
    texto,
    erro = false
) {

    if (!mensagemSalvarProduto) {
        return;
    }


    mensagemSalvarProduto.textContent =
        texto;


    mensagemSalvarProduto.style.color =
        erro
            ? "#c62828"
            : "#168544";

}


/* ==========================================
   MARCAR ALTERAÇÃO
========================================== */

function marcarAlteracaoProduto() {

    if (
        !produtoAtualId ||
        !btnSalvarProdutoCalculadora
    ) {

        return;

    }


    btnSalvarProdutoCalculadora.disabled =
        false;


    mostrarMensagemSalvar(
        "Existem alterações não salvas."
    );

}


/* ==========================================
   CARREGAR PRODUTOS
========================================== */

async function carregarProdutosCalculadora() {

    if (!produtoSelecionado) {

        return;

    }


    produtoSelecionado.innerHTML = `
        <option value="">
            Carregando produtos...
        </option>
    `;


    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Erro ao identificar usuário:",
            error
        );


        produtoSelecionado.innerHTML = `
            <option value="">
                Erro ao carregar produtos
            </option>
        `;


        return;

    }


    const usuario =
        data.user;


    if (!usuario) {

        produtoSelecionado.innerHTML = `
            <option value="">
                Usuário não identificado
            </option>
        `;


        return;

    }


    const {
        data: produtos,
        error: erroProdutos
    } =
        await supabaseClient
            .from("produtos")
            .select(`
                id,
                nome,
                preco_bruto,
                desconto_custo_percentual,
                preco_custo,
                lucro_percentual,
                taxa_fixa,
                desconto_percentual,
                imposto_percentual
            `)
            .eq(
                "usuario_id",
                usuario.id
            )
            .order(
                "nome",
                {
                    ascending: true
                }
            );


    if (erroProdutos) {

        console.error(
            "Erro ao carregar produtos:",
            erroProdutos
        );


        produtoSelecionado.innerHTML = `
            <option value="">
                Erro ao carregar produtos
            </option>
        `;


        return;

    }


    produtosCalculadora =
        produtos || [];


    if (
        produtosCalculadora.length === 0
    ) {

        produtoSelecionado.innerHTML = `
            <option value="">
                Nenhum produto cadastrado
            </option>
        `;


        return;

    }


    produtoSelecionado.innerHTML = `
        <option value="">
            Selecione um produto cadastrado
        </option>
    `;


    produtosCalculadora.forEach(
        function(produto) {

            const opcao =
                document.createElement("option");


            opcao.value =
                produto.id;


            opcao.textContent =
                produto.nome;


            produtoSelecionado.appendChild(
                opcao
            );

        }
    );

}


/* ==========================================
   SELECIONAR PRODUTO
========================================== */

function preencherCalculadoraComProduto() {

    const id =
        produtoSelecionado.value;


    produtoAtualId =
        id || null;


    if (!id) {

        btnSalvarProdutoCalculadora.disabled =
            true;


        mostrarMensagemSalvar("");

        return;

    }


    const produto =
        produtosCalculadora.find(
            function(item) {

                return String(item.id) === String(id);

            }
        );


    if (!produto) {

        return;

    }


    const PB =
        produto.preco_bruto !== null &&
        produto.preco_bruto !== undefined
            ? produto.preco_bruto
            : produto.preco_custo;


    const D =
        produto.desconto_custo_percentual !== null &&
        produto.desconto_custo_percentual !== undefined
            ? produto.desconto_custo_percentual
            : 0;


    campoPB.value =
        PB !== null &&
        PB !== undefined
            ? PB
            : "";


    campoD.value =
        D;


    campoLucro.value =
        produto.lucro_percentual !== null &&
        produto.lucro_percentual !== undefined
            ? produto.lucro_percentual
            : "";


    campoTF.value =
        produto.taxa_fixa !== null &&
        produto.taxa_fixa !== undefined
            ? produto.taxa_fixa
            : "";


    campoPD.value =
        produto.desconto_percentual !== null &&
        produto.desconto_percentual !== undefined
            ? produto.desconto_percentual
            : "";


    campoImposto.value =
        produto.imposto_percentual !== null &&
        produto.imposto_percentual !== undefined
            ? produto.imposto_percentual
            : "";


    btnSalvarProdutoCalculadora.disabled =
        true;


    mostrarMensagemSalvar(
        "Produto carregado. Altere algum campo para salvar."
    );


    calcular();

}


/* ==========================================
   VALIDAR E CALCULAR VALORES
========================================== */

function obterValoresCalculadora() {

    const PB =
        parseFloat(campoPB.value);


    const D =
        parseFloat(campoD.value);


    const L =
        parseFloat(campoLucro.value);


    const TF =
        parseFloat(campoTF.value);


    const PD =
        parseFloat(campoPD.value);


    const I =
        parseFloat(campoImposto.value);


    if (
        isNaN(PB) ||
        isNaN(D) ||
        isNaN(L) ||
        isNaN(TF) ||
        isNaN(PD) ||
        isNaN(I)
    ) {

        return {
            erro:
                "Preencha todos os campos."
        };

    }


    if (PB < 0) {

        return {
            erro:
                "O preço bruto não pode ser negativo."
        };

    }


    if (
        D < 0 ||
        D >= 100
    ) {

        return {
            erro:
                "O desconto deve estar entre 0% e 99,99%."
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
                "O desconto da venda deve estar entre 0% e 99,99%."
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


    const PC =
        PB * (1 - D / 100);


    const lucroSobrePC =
        PC * (L / 100);


    const numerador =
        PC +
        lucroSobrePC +
        TF;


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


    const resultadoFinal =
        numerador / denominador;


    const valorDesconto =
        resultadoFinal * (PD / 100);


    const valorImposto =
        resultadoFinal * (I / 100);


    const valorLiquido =
        resultadoFinal -
        PC -
        TF -
        valorDesconto -
        valorImposto;


    return {

        erro: null,

        PB: PB,

        D: D,

        PC: PC,

        L: L,

        TF: TF,

        PD: PD,

        I: I,

        precoVenda:
            resultadoFinal,

        lucroLiquido:
            valorLiquido

    };

}


/* ==========================================
   SALVAR ALTERAÇÕES
========================================== */

async function salvarAlteracoesProduto() {

    if (!produtoAtualId) {

        mostrarMensagemSalvar(
            "Selecione um produto primeiro.",
            true
        );

        return;

    }


    btnSalvarProdutoCalculadora.disabled =
        true;


    mostrarMensagemSalvar(
        "Salvando..."
    );


    const valores =
        obterValoresCalculadora();


    if (valores.erro) {

        btnSalvarProdutoCalculadora.disabled =
            false;


        mostrarMensagemSalvar(
            valores.erro,
            true
        );


        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !data.user) {

        btnSalvarProdutoCalculadora.disabled =
            false;


        mostrarMensagemSalvar(
            "Sessão expirada.",
            true
        );


        return;

    }


    const usuario =
        data.user;


    const {
        error: erroSalvar
    } =
        await supabaseClient
            .from("produtos")
            .update({

                preco_bruto:
                    Number(
                        valores.PB
                    ),

                desconto_custo_percentual:
                    Number(
                        valores.D
                    ),

                preco_custo:
                    Number(
                        valores.PC.toFixed(6)
                    ),

                lucro_percentual:
                    Number(
                        valores.L
                    ),

                taxa_fixa:
                    Number(
                        valores.TF
                    ),

                desconto_percentual:
                    Number(
                        valores.PD
                    ),

                imposto_percentual:
                    Number(
                        valores.I
                    ),

                preco_venda:
                    Number(
                        valores.precoVenda.toFixed(2)
                    ),

                lucro_liquido:
                    Number(
                        valores.lucroLiquido.toFixed(2)
                    ),

                atualizado_em:
                    new Date().toISOString()

            })
            .eq(
                "id",
                produtoAtualId
            )
            .eq(
                "usuario_id",
                usuario.id
            );


    if (erroSalvar) {

        console.error(
            "Erro ao salvar produto:",
            erroSalvar
        );


        btnSalvarProdutoCalculadora.disabled =
            false;


        mostrarMensagemSalvar(
            "Erro ao salvar as alterações.",
            true
        );


        return;

    }


    /* ======================================
       ATUALIZAR PRODUTO NA MEMÓRIA
    ====================================== */

    const indice =
        produtosCalculadora.findIndex(
            function(produto) {

                return String(produto.id) ===
                    String(produtoAtualId);

            }
        );


    if (indice !== -1) {

        produtosCalculadora[indice] = {

            ...produtosCalculadora[indice],

            preco_bruto:
                valores.PB,

            desconto_custo_percentual:
                valores.D,

            preco_custo:
                valores.PC,

            lucro_percentual:
                valores.L,

            taxa_fixa:
                valores.TF,

            desconto_percentual:
                valores.PD,

            imposto_percentual:
                valores.I

        };

    }


    btnSalvarProdutoCalculadora.disabled =
        true;


    mostrarMensagemSalvar(
        "✅ Alterações salvas com sucesso!"
    );

}


/* ==========================================
   CÁLCULO
========================================== */

function calcular() {

    const PB =
        parseFloat(campoPB.value);


    const D =
        parseFloat(campoD.value);


    const L =
        parseFloat(campoLucro.value);


    const TF =
        parseFloat(campoTF.value);


    const PD =
        parseFloat(campoPD.value);


    const I =
        parseFloat(campoImposto.value);


    if (
        !isNaN(PB) &&
        !isNaN(D) &&
        PB >= 0 &&
        D >= 0 &&
        D < 100
    ) {

        const PC =
            PB * (1 - D / 100);


        campoPC.value =
            PC.toFixed(6);

    } else {

        campoPC.value =
            "";

    }


    const PC =
        parseFloat(
            campoPC.value
        );


    if (
        isNaN(PC) ||
        isNaN(L) ||
        isNaN(TF) ||
        isNaN(PD) ||
        isNaN(I)
    ) {

        resultado.textContent =
            "R$ 0,00";


        detalhes.innerHTML =
            "Preencha PB, D, L, TF, PD e I para realizar o cálculo.";


        return;

    }


    if (PB < 0) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O preço bruto não pode ser negativo.";

        return;

    }


    if (
        D < 0 ||
        D >= 100
    ) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O desconto deve estar entre 0% e 99,99%.";

        return;

    }


    if (L < 0) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O lucro não pode ser negativo.";

        return;

    }


    if (TF < 0) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "A taxa fixa não pode ser negativa.";

        return;

    }


    if (
        PD < 0 ||
        PD >= 100
    ) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O desconto da venda deve estar entre 0% e 99,99%.";

        return;

    }


    if (
        I < 0 ||
        I >= 100
    ) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O imposto deve estar entre 0% e 99,99%.";

        return;

    }


    const lucroSobrePC =
        PC * (L / 100);


    const numerador =
        PC +
        lucroSobrePC +
        TF;


    const percentualDenominador =
        100 -
        PD -
        I;


    if (
        percentualDenominador <= 0
    ) {

        resultado.textContent =
            "Erro";

        detalhes.textContent =
            "O desconto + imposto não podem resultar em um denominador igual ou menor que zero.";

        return;

    }


    const denominador =
        percentualDenominador / 100;


    const resultadoFinal =
        numerador / denominador;


    const valorDesconto =
        resultadoFinal *
        (PD / 100);


    const valorImposto =
        resultadoFinal *
        (I / 100);


    const valorLiquido =
        resultadoFinal -
        PC -
        TF -
        valorDesconto -
        valorImposto;


    resultado.textContent =
        "R$ " +
        formatarNumero(
            resultadoFinal
        );


    detalhes.innerHTML =
        "";


    const linhaPB =
        document.createElement("div");

    linhaPB.innerHTML =
        "<strong>PB — Preço Bruto:</strong> " +
        "R$ " +
        formatarNumero(PB);

    detalhes.appendChild(
        linhaPB
    );


    const linhaD =
        document.createElement("div");

    linhaD.innerHTML =
        "<strong>D — Desconto:</strong> " +
        formatarNumero(D) +
        "%";

    detalhes.appendChild(
        linhaD
    );


    const linhaPC =
        document.createElement("div");

    linhaPC.innerHTML =
        "<strong>PC — Preço de Custo:</strong> " +
        "R$ " +
        formatarNumero(PC);

    detalhes.appendChild(
        linhaPC
    );


    const linhaLucro =
        document.createElement("div");

    linhaLucro.innerHTML =
        "<strong>L — Lucro Líquido:</strong> " +
        "R$ " +
        formatarNumero(lucroSobrePC);

    detalhes.appendChild(
        linhaLucro
    );


    const linhaTF =
        document.createElement("div");

    linhaTF.innerHTML =
        "<strong>TF — Taxa Fixa:</strong> " +
        "R$ " +
        formatarNumero(TF);

    detalhes.appendChild(
        linhaTF
    );


    const linhaPD =
        document.createElement("div");

    linhaPD.innerHTML =
        "<strong>PD — Desconto:</strong> " +
        "R$ " +
        formatarNumero(valorDesconto);

    detalhes.appendChild(
        linhaPD
    );


    const linhaI =
        document.createElement("div");

    linhaI.innerHTML =
        "<strong>I — Imposto:</strong> " +
        "R$ " +
        formatarNumero(valorImposto);

    detalhes.appendChild(
        linhaI
    );


    const linhaLiquido =
        document.createElement("div");

    linhaLiquido.innerHTML =
        "<strong>💰 LUCRO LÍQUIDO:</strong> " +
        "R$ " +
        formatarNumero(valorLiquido);

    detalhes.appendChild(
        linhaLiquido
    );

}


/* ==========================================
   EVENTOS DA CALCULADORA
========================================== */

campoPB.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


campoD.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


campoLucro.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


campoTF.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


campoPD.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


campoImposto.addEventListener(
    "input",
    function() {

        calcular();

        marcarAlteracaoProduto();

    }
);


/* ==========================================
   EVENTO SELECIONAR PRODUTO
========================================== */

if (produtoSelecionado) {

    produtoSelecionado.addEventListener(
        "change",
        preencherCalculadoraComProduto
    );

}


/* ==========================================
   EVENTO SALVAR
========================================== */

if (
    btnSalvarProdutoCalculadora
) {

    btnSalvarProdutoCalculadora.addEventListener(
        "click",
        salvarAlteracoesProduto
    );

}


/* ==========================================
   INICIAR
========================================== */

async function iniciarCalculadora() {

    await carregarProdutosCalculadora();

    calcular();

}


iniciarCalculadora();