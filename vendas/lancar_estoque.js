// ==UserScript==
// @name         Lançar Estoque Geral
// @namespace    https://github.com/danielsem-z
// @version      0.2
// @description  script para lançar estoque de todas as vendas realizadas no PDV
// @author       danielsem.z
// @updateURL    https://raw.githubusercontent.com/danielsem-z/BlingModify/main/vendas/lancar_estoque.js
// @downloadURL  https://raw.githubusercontent.com/danielsem-z/BlingModify/main/vendas/lancar_estoque.js
// @match        https://www.bling.com.br/vendas.php*
// @grant        none
// ==/UserScript==

const intervalo = setInterval(()=>{
    const container = document.querySelector('[class="new-side-bar side-bar-overflow"]');
    if(container){
        const button = container.insertBefore(document.createElement("button"), container.querySelector("div:first-child"));
        button.textContent = "Lançar estoque de todos os itens";
        button.style.backgroundColor = "lightblue";
        button.style.fontWeight = "bold";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.style.display = "flex";
        button.style.width = "100%";
        button.style.height = "40px";

        button.addEventListener("click", ()=>{
            window.vendas.venda.displayWait();
            fetch("http://127.0.0.1:5000/lancar_estoque", {"mode":"no-cors"}).then(()=>{
                window.vendas.venda.closeWait();
                document.querySelector('[class="refresh-button"]').click();
            });
        });

        clearInterval(intervalo);
    }
}, 500);
