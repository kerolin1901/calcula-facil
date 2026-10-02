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



function escaparHTML(texto){

return String(texto ?? "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

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
}
=
await produtosSupabase.auth.getUser();



if(error){

console.error(error);

return null;

}



return data.user || null;


}





/* ==========================================
   CALCULO
========================================== */


function calcularValoresProduto(){


const PC =
Number(produtoCusto.value);


const L =
Number(produtoLucro.value);


const TF =
Number(produtoTaxa.value);


const PD =
Number(produtoDesconto.value);


const I =
Number(produtoImposto.value);



if(
!Number.isFinite(PC) ||
!Number.isFinite(L) ||
!Number.isFinite(TF) ||
!Number.isFinite(PD) ||
!Number.isFinite(I)
){


return {
erro:"Preencha todos os campos."
};


}



const lucroPC =
PC * (L / 100);



const numerador =
PC + lucroPC + TF;



const divisor =
100 - PD - I;



if(divisor <= 0){

return {
erro:"Desconto e imposto inválidos."
};

}



const precoVenda =
numerador / (divisor / 100);



const desconto =
precoVenda * (PD/100);



const imposto =
precoVenda * (I/100);



const lucroLiquido =
precoVenda -
PC -
TF -
desconto -
imposto;



return {

precoVenda,

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



preco_custo:

Number(produtoCusto.value),



lucro_percentual:

Number(produtoLucro.value),



taxa_fixa:

Number(produtoTaxa.value),



desconto_percentual:

Number(produtoDesconto.value),



imposto_percentual:

Number(produtoImposto.value),



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





/* EDITAR */


if(produtoEditandoId){


const {
error
}
=
await produtosSupabase
.from("produtos")
.update(dados)
.eq(
"id",
produtoEditandoId
);



if(error){

console.error(error);

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





/* NOVO */


else{


const {
error
}
=
await produtosSupabase
.from("produtos")
.insert(dados);



if(error){

console.error(error);

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
}
=
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


console.error(error);



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


if(!produtos || produtos.length === 0){


listaProdutos.innerHTML =
`
<div class="lista-vazia">

📦

<br>

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
${escaparHTML(produto.sku || "")}

<br>

Categoria:
${escaparHTML(produto.categoria || "")}

</div>



<div class="produto-valores">


<div class="produto-valor">

<span>
CUSTO
</span>

<strong>
${formatarMoeda(produto.preco_custo)}
</strong>

</div>



<div class="produto-valor">

<span>
VENDA
</span>

<strong>
${formatarMoeda(produto.preco_venda)}
</strong>

</div>



<div class="produto-valor">

<span>
💰 LUCRO
</span>

<strong>
${formatarMoeda(produto.lucro_liquido)}
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



listaProdutos.appendChild(item);



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
todosProdutos.filter(produto=>{


return (

(produto.nome || "")
.toLowerCase()
.includes(termo)

||

(produto.sku || "")
.toLowerCase()
.includes(termo)

||

(produto.categoria || "")
.toLowerCase()
.includes(termo)

);


});



mostrarProdutos(
filtrados
);



});


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



produtoCusto.value =
produto.preco_custo || "";



produtoLucro.value =
produto.lucro_percentual || "";



produtoTaxa.value =
produto.taxa_fixa || "";



produtoDesconto.value =
produto.desconto_percentual || "";



produtoImposto.value =
produto.imposto_percentual || "";



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



const calculo =
{

precoVenda:

Number(produto.preco_custo)
+
(
Number(produto.preco_custo)
*
Number(produto.lucro_percentual)
/100
)
+
Number(produto.taxa_fixa)



};



await produtosSupabase
.from("produtos")
.update({

preco_venda:
Number(calculo.precoVenda.toFixed(2)),

atualizado_em:
new Date().toISOString()

})
.eq(
"id",
id
);



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
}
=
await produtosSupabase
.from("produtos")
.delete()
.eq(
"id",
id
);



if(error){

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



if(usuario && sessao){


usuario.textContent =
sessao.nome ||
sessao.usuario ||
"Cliente";


}



}







/* ==========================================
   INICIAR
========================================== */


async function iniciarProdutos(){


await mostrarUsuario();


await carregarProdutos();



}



iniciarProdutos();