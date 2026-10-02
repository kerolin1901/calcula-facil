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
   CAMPOS
========================================== */

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
   RESULTADO
========================================== */

const resultado =
    document.getElementById("resultado");

const detalhes =
    document.getElementById("detalhes");


/* ==========================================
   FORMATAÇÃO DE NÚMEROS
========================================== */

function formatarNumero(numero) {

    return Number(numero).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    });

}


/* ==========================================
   CALCULAR
========================================== */

function calcular() {

    const PC =
        parseFloat(campoPC.value);

    const L =
        parseFloat(campoLucro.value);

    const TF =
        parseFloat(campoTF.value);

    const PD =
        parseFloat(campoPD.value);

    const I =
        parseFloat(campoImposto.value);


    /* ======================================
       CAMPOS VAZIOS
    ====================================== */

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
            "Preencha os cinco campos para realizar o cálculo.";

        return;
    }


    /* ======================================
       VALIDAÇÕES
    ====================================== */

    if (PC < 0) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "O preço de custo não pode ser negativo.";

        return;
    }


    if (L < 0) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "O lucro não pode ser negativo.";

        return;
    }


    if (TF < 0) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "A taxa fixa não pode ser negativa.";

        return;
    }


    if (PD < 0 || PD >= 100) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "O desconto deve estar entre 0% e 99,99%.";

        return;
    }


    if (I < 0 || I >= 100) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "O imposto deve estar entre 0% e 99,99%.";

        return;
    }


    /* ======================================
       LUCRO SOBRE O PREÇO DE CUSTO
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


    /* ======================================
       VALIDAR DENOMINADOR
    ====================================== */

    if (percentualDenominador <= 0) {

        resultado.textContent = "Erro";

        detalhes.textContent =
            "O desconto + imposto não podem resultar em um denominador igual ou menor que zero.";

        return;
    }


    /* ======================================
       CONVERTER DENOMINADOR
    ====================================== */

    const denominador =
        percentualDenominador / 100;


    /* ======================================
       CÁLCULO FINAL
    ====================================== */

    const resultadoFinal =
        numerador / denominador;


    /* ======================================
       VALORES EM REAIS
    ====================================== */

    const valorLucro =
        lucroSobrePC;


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


    /* ======================================
       MOSTRAR RESULTADO
    ====================================== */

    resultado.textContent =
        "R$ " + formatarNumero(resultadoFinal);


    /* ======================================
       LIMPAR DETALHES
    ====================================== */

    detalhes.innerHTML = "";


    /* ======================================
       PC
    ====================================== */

    const linhaPC =
        document.createElement("div");

    linhaPC.innerHTML =
        "<strong>PC — Preço de Custo:</strong> " +
        "R$ " +
        formatarNumero(PC);

    detalhes.appendChild(linhaPC);


    /* ======================================
       LUCRO
    ====================================== */

    const linhaLucro =
        document.createElement("div");

    linhaLucro.innerHTML =
        "<strong>L — Lucro Líquido:</strong> " +
        "R$ " +
        formatarNumero(valorLucro);

    detalhes.appendChild(linhaLucro);


    /* ======================================
       TAXA FIXA
    ====================================== */

    const linhaTF =
        document.createElement("div");

    linhaTF.innerHTML =
        "<strong>TF — Taxa Fixa:</strong> " +
        "R$ " +
        formatarNumero(TF);

    detalhes.appendChild(linhaTF);


    /* ======================================
       DESCONTO
    ====================================== */

    const linhaPD =
        document.createElement("div");

    linhaPD.innerHTML =
        "<strong>PD — Desconto:</strong> " +
        "R$ " +
        formatarNumero(valorDesconto);

    detalhes.appendChild(linhaPD);


    /* ======================================
       IMPOSTO
    ====================================== */

    const linhaI =
        document.createElement("div");

    linhaI.innerHTML =
        "<strong>I — Imposto:</strong> " +
        "R$ " +
        formatarNumero(valorImposto);

    detalhes.appendChild(linhaI);


    /* ======================================
       LUCRO LÍQUIDO FINAL
    ====================================== */

    const linhaLiquido =
        document.createElement("div");

    linhaLiquido.innerHTML =
        "<strong>💰 LUCRO LÍQUIDO:</strong> " +
        "R$ " +
        formatarNumero(valorLiquido);

    detalhes.appendChild(linhaLiquido);

}


/* ==========================================
   CALCULAR AUTOMATICAMENTE
========================================== */

campoPC.addEventListener(
    "input",
    calcular
);

campoLucro.addEventListener(
    "input",
    calcular
);

campoTF.addEventListener(
    "input",
    calcular
);

campoPD.addEventListener(
    "input",
    calcular
);

campoImposto.addEventListener(
    "input",
    calcular
);


/* ==========================================
   CALCULAR AO ABRIR
========================================== */

calcular();