// ==UserScript==
// @name         Imprimir Comprovante Não Fiscal Customizado
// @namespace    https://github.com/danielsem-z
// @version      0.1
// @description  script para imprimir um comprovante não fiscal customizavel
// @author       danielsem.z
// @updateURL    https://raw.githubusercontent.com/danielsem-z/BlingModify/main/PDV/custom_comprovante_nao_fiscal.js
// @downloadURL  https://raw.githubusercontent.com/danielsem-z/BlingModify/main/PDV/custom_comprovante_nao_fiscal.js
// @match        https://www.bling.com.br/pdv.php*
// @match        https://www.bling.com.br/vendas.php*
// @grant        none
// ==/UserScript==


const intervalo = setInterval(()=>{
    if(window.imprimirComprovanteNaoFiscal){
        window.imprimirComprovanteNaoFiscal = (params) => {
            const id = params.vendas[Object.keys(params.vendas)[0]].numeroPedido;
            const iframe = document.createElement('iframe');

            iframe.src = 'http://127.0.0.1:5000/invoice?id_pedido=' + id;

            document.body.append(iframe);
            setTimeout(()=>iframe.remove(), 10000);
            window.closeWait(params.closeWait);
        }
        clearInterval(intervalo);
    }
}, 500);
