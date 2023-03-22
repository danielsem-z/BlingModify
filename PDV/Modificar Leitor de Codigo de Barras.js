// ==UserScript==
// @name         Modificar Leitor de Codigo de Barras
// @namespace    https://github.com/danielsem-z
// @version      0.11
// @description  Script para permitir ao buscador de produtos do PDV procurar codigo de barras com mais informação alem do codigo
// @author       danielsem.z
// @match        https://www.bling.com.br/pdv.php
// @grant        none
// ==/UserScript==

console.log("update test");
const intervalo = setInterval(()=>{
    if(window.frenteCaixa){
        window.valor_total = -1;

        frenteCaixa.vendaProdutos.getProductByCode = function(element, callback) {
            var search = element.val();
            var indexOfAsterisk = search.indexOf('*');

            // BEGIN modificado
            // var code = search;
            var _code = search;
            var code = _code;
            if(_code.length == 13 && _code.startsWith("2")){
                code = _code.slice(1,5);
                window.valor_total = parseInt(_code.slice(5,-1)) / 100;
                /*
					n_padrao | codigo | preço | n_aleatorio

					exemplo: 2001800018006

					n_padrao = 2
					code = 0018
					preco = 0001800
					n_aleatorio = 6
                */
            }
            // END modificado

            var quantidade = 1;
            if (indexOfAsterisk != -1) {
                code = search.substr(indexOfAsterisk + 1, search.length);
                quantidade = parseInt(search.substr(0, indexOfAsterisk)) || 1;
            }

            $.ajax({
                'type': 'POST',
                'dataType': 'json',
                'url': 'services/produtos.lookup.php?apenasVenda=S&type=CODIGO&codeBar=true&term=' + encodeURIComponent(code),
                'success': function(data) {
                    if (data.length == 1 && data[0].codigo == code) {
                        var responseData = {
                            'id': data[0].id,
                            'quantidade': quantidade
                        };
                        callback(responseData, element);
                    } else {
                        element.autocomplete('enable');
                    }
                }
            });
        }

        // mudando a função original
        frenteCaixa.insertItem = function(leitor) {
            var that = this;
            let pendingSale = store.state.orderData.id && !store.state.orderData.mesa.numero;

            if (store.getParams().tableManagement && !parseInt(store.state.orderData.mesa.numero) && !store.state.changeTableSalesToSales && !pendingSale) {
                DialogMessage.warning({
                    'description': 'Antes de inserir um item, digite o número da mesa no campo Abrir/Buscar e pressione enter.',
                });

                return false;
            }


            leitor = leitor || false;
            if (!that.getGlobalVar('isSavingOrder')) {
                if (store.state.modulesPermissions.PDVRegistroItens) {
                    if ($('#id_produto').val() != 0) {
                        if (!store.state.modulesPermissions.deleteItem && !nroUsaFloat($('#qtde').val())) {
                            $('#qtde').parent().addClass('group-item-form-error');
                        } else {
                            
                            // BEGIN modificado
                            let quantidade = nroUsa($('#qtde').val());
                            if(window.valor_total != -1){
                                quantidade = window.valor_total / parseFloat($('#valor_unitario').val().replace(",","."));
                                quantidade = quantidade / 1000;
                                quantidade = nroUsa(quantidade.toString().replace(".",","));
                                window.valor_total = -1;
                            }
                            // END modificado

                            var newItem = {
                                'id': 0,
                                'idProduto': $('#id_produto').val(),
                                'codigo': $('#codigo_produto').val(),
                                'descricao': $('#nome_produto').text(),
                                'dataCriacao': formatDate(getDataAtual() + ' ' + getHoraAtual(true)),
                                'descontoItem': nroUsa($('#aba_produto input[data-desconto]').val()),
                                'precoLista': nroUsa($('#valor_lista').val()),
                                
                                // BEGIN modificado
                                // 'quantidade': nroUsa($('#qtde').val()),
                                'quantidade': quantidade,
                                // END modificado
                                
                                'valor': nroUsa($('#valor_unitario').val()),
                                'obs': $.trim($('#comentario').val()),
                                'unidade': $('#unidade_produto').val(),
                                'formatoProduto': $('#formato_produto').val(),
                                'descricaoDetalhada': $('#descricao_detalhada').val(),
                                'gtin': $('#gtin_produto').val(),
                                'gtinEmbalagem': $('#gtin_embalagem_produto').val(),
                                'localizacao': $('#localizacao').val(),
                                'estoque': $('#info_estoque_produto').attr('data-current-stock'),
                                'estoqueMinimo': $('#info_estoque_produto').attr('data-min-stock'),
                                'estoqueMaximo': $('#info_estoque_produto').attr('data-max-stock'),
                                'idLinhaProduto': $('#id_linha_produto').val(),
                                'precoOriginal': $('[data-lista-preco-original]').attr('data-lista-preco-original'),
                                'precoLoja': $('#preco_loja').val(),
                            };

                            var toSaleItem = function(newItem) {
                                return {
                                    'id': newItem.id,
                                    'quantidade': newItem.quantidade,
                                    'valor': newItem.valor,
                                    'dataCriacao': newItem.dataCriacao,
                                    'desconto': newItem.descontoItem,
                                    'descricaoDetalhada': newItem.descricaoDetalhada,
                                    'obs': newItem.obs,
                                    'unidade': newItem.unidade,
                                    'produto': {
                                        'id': newItem.idProduto,
                                        'idLinhaProduto': newItem.idLinhaProduto,
                                        'precoLista': newItem.precoLista,
                                        'codigo': newItem.codigo,
                                        'descricao': newItem.descricao,
                                        'formato': newItem.formatoProduto,
                                        'precoOriginal': newItem.precoOriginal,
                                        'precoLoja': newItem.precoLoja,
                                        'codigo': newItem.codigo,
                                        'gtin': newItem.gtin,
                                        'gtinEmbalagem': newItem.gtinEmbalagem,
                                        'localizacao': newItem.localizacao
                                    }
                                };
                            };

                            store.insertItem(toSaleItem(newItem));
                        }

                        that.calculateFinalPrice();

                        if (!leitor) {
                            that.clearItemTab();
                        }

                        that.saveOrder().fail(function(error) {
                            if (PdvApiHelper.isPDVError(error, PdvApi.ERROR_CODES.PDV.ESTOQUE_NEGATIVO)) {
                                store.undoAddItem(newItem.idProduto, newItem.quantidade);
                                that.calculateFinalPrice(true);
                            }
                        });

                        $('#busca_produto').val('').focus();

                        $('#tabela_produtos').animate({'scrollTop': $('#tabela_produtos')[0].scrollHeight}, 150);

                        if ($(window).width() > 991) {
                            $('#body_produtos').parent().animate({scrollTop: $('#body_produtos').height()}, 1000);
                        }
                    } else {
                        DialogMessage.warning({
                            'description': 'Nenhum produto selecionado. Por favor, busque por um produto e após insira-o na ' + that.getTitle().toLowerCase() + '.',
                            'fnAfterDestroy': function() {
                                $('#busca_produto').focus();
                            }
                        });
                    }
                } else {
                    DialogMessage.warning({'description': 'Usuário não possui permissão para inserir produtos na venda.'});
                }
            }
        }
        clearInterval(intervalo);
    }
}, 500);
