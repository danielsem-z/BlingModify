// ==UserScript==
// @name         Lançar Estoque Geral
// @namespace    https://github.com/danielsem-z
// @version      0.1
// @description  script para lançar estoque de todas as vendas realizadas no PDV
// @author       danielsem.z
// @updateURL    https://raw.githubusercontent.com/danielsem-z/BlingModify/main/vendas/lancar_estoque.js
// @downloadURL  https://raw.githubusercontent.com/danielsem-z/BlingModify/main/vendas/lancar_estoque.js
// @match        https://www.bling.com.br/vendas.php*
// @grant        none
// ==/UserScript==

const intervalo = setInterval(()=>{
	const container = document.querySelector('[class="main-actions"]');
    if(container){
		const button = container.insertBefore(document.createElement("button"), container.querySelector("button:first-child"));
		button.textContent = "Lançar estoque de todos os itens";
		button.style.color = "black";
		button.style.backgroundColor = "lightblue";
		button.style.fontWeight = "bold";
		button.style.textAlign = "center";
		button.addEventListener("click", ()=>{
			vendas.venda.displayWait();
			fetch("http://127.0.0.1:5000/lancar_estoque", {"mode":"no-cors"}).then(()=>{
				vendas.venda.closeWait();
				document.querySelector('[class="refresh-button"]').click();
			});
		});
		
        clearInterval(intervalo);
    }
}, 500);
