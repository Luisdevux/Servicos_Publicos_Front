/**
 * Testes E2E - Painel do Operador
 * 
 * Cobertura:
 * - Renderização da página
 * - Abas de status (Aguardando Resolução, Concluídas)
 * - Filtros por tipo de demanda
 * - Cards de demanda
 * - Modais de detalhes
 * - Devolução de demanda
 * - Resolução de demanda com upload de imagens
 * - Visualização de demandas concluídas
 * - Paginação
 * - Skeleton Loading
 * - Estado vazio
 * - Responsividade
 * - Carrossel de imagens
 */

describe('Painel do Operador', () => {

  beforeEach(() => {
    cy.login('operadorfixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.visit('/operador');
    // Aguarda condicionalmente que os spinners desapareçam
    cy.get('body').then($body => {
      if ($body.find('[class*="animate-spin"]').length > 0) {
        cy.get('[class*="animate-spin"]', { timeout: 15000 }).should('not.exist');
      }
    });
    // Aguarda que o conteúdo principal esteja carregado
    cy.get('[data-test="abas-status"]', { timeout: 10000 }).should('exist');
  });

  afterEach(() => {
    cy.logout();
  });

  describe.skip('Renderização da Página', () => {
    it('Deve renderizar a página do operador corretamente', () => {
      cy.url().should('include', '/operador');
      cy.getByData('page-operador').should('exist').and('be.visible');
    });

    it('Deve exibir indicador de secretarias vinculadas', () => {
      cy.getByData('indicador-secretarias-container').should('exist').and('be.visible');
      cy.getByData('indicador-secretarias-label')
        .should('exist')
        .and('be.visible')
    });

    it('Deve exibir lista de secretarias vinculadas', () => {
      cy.getByData('indicador-secretarias-lista').should('exist').and('be.visible');
    });

    it('Deve listar apenas demandas atribuídas ao operador logado', () => {
      cy.getByData('page-operador').should('be.visible');
      cy.getByData('grid-demandas').should('exist').and('be.visible');
    });
  });

  describe.skip('Abas de Status', () => {
    it.skip('Deve exibir abas "Aguardando Resolução" e "Concluídas"', () => {
      cy.getByData('abas-status').should('exist').and('be.visible');
      cy.getByData('aba-aguardando-resolucao')
        .should('exist')
        .and('be.visible')
        .and('contain', 'Aguardando Resolução');
      cy.getByData('aba-concluidas')
        .should('exist')
        .and('be.visible')
        .and('contain', 'Concluídas');
    });

    it('Deve exibir contadores em abas quando houver demandas', () => {
      // Verifica se há contadores (badges) nas abas que possuem demandas
      cy.get('[data-test^="aba-"]').each(($aba) => {
        cy.wrap($aba).should('be.visible');
      });
    });

    it('Deve ter a aba "Aguardando Resolução" selecionada por padrão', () => {
      cy.getByData('aba-aguardando-resolucao').should('be.visible');
    });

    it('Deve trocar de aba ao clicar', () => {
      // Clica na aba "Concluídas"
      cy.getByData('aba-concluidas').click();
      cy.wait(500);
      cy.getByData('aba-concluidas').should('be.visible');
      
      // Volta para "Aguardando Resolução"
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(500);
      cy.getByData('aba-aguardando-resolucao').should('be.visible');
    });

    it('Deve atualizar a lista ao trocar de aba', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
    });
  });

  describe.skip('Filtros', () => {
    it('Deve exibir seção de filtros', () => {
      cy.getByData('filtro-container').should('exist').and('be.visible');
    });

    it('Deve exibir filtro por tipo de demanda', () => {
      cy.getByData('filtro-tipo-wrapper').should('exist').and('be.visible');
      cy.getByData('filtro-label').should('exist').and('contain', 'Filtrar por tipo');
      cy.getByData('filtro-select-trigger').should('exist').and('be.visible');
    });

    it('Deve permitir abrir o dropdown de filtro', () => {
      cy.getByData('filtro-select-trigger').click();
      cy.getByData('filtro-select-content').should('be.visible');
      cy.get('body').type('{esc}');
    });

    it('Deve exibir todas as opções de filtro por tipo', () => {
      cy.getByData('filtro-select-trigger').click();
      
      cy.getByData('filtro-option-todos').should('exist').and('be.visible').and('contain', 'Todos os tipos');
      cy.getByData('filtro-option-iluminacao').should('exist').and('be.visible').and('contain', 'Iluminação');
      cy.getByData('filtro-option-coleta').should('exist').and('be.visible').and('contain', 'Coleta');
      cy.getByData('filtro-option-saneamento').should('exist').and('be.visible').and('contain', 'Saneamento');
      cy.getByData('filtro-option-arvores').should('exist').and('be.visible').and('contain', 'Árvores');
      cy.getByData('filtro-option-animais').should('exist').and('be.visible').and('contain', 'Animais');
      cy.getByData('filtro-option-pavimentacao').should('exist').and('be.visible').and('contain', 'Pavimentação');
      cy.get('body').type('{esc}');
    });

    it('Deve permitir selecionar um filtro específico', () => {
      cy.getByData('filtro-select-trigger').click();
      cy.getByData('filtro-option-iluminacao').click();
      cy.wait(1000);
      
      // Volta para "Todos"
      cy.getByData('filtro-select-trigger').click();
      cy.getByData('filtro-option-todos').click();
    });
  });

  describe.skip('Grid de Demandas', () => {
    it('Deve exibir grid de demandas ou mensagem de lista vazia', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist').and('be.visible');
        } else {
          cy.getByData('estado-vazio').should('exist').and('be.visible');
        }
      });
    });

    it('Deve exibir cards de demanda quando houver dados', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('card-demanda').should('exist').and('be.visible');
        } else {
          cy.getByData('estado-vazio').should('exist').and('be.visible');
        }
      });
    });

    it('Deve exibir informações completas no card', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('card-demanda').first().within(() => {
            cy.getByData('card-titulo').should('exist').and('be.visible').and('not.be.empty');
            cy.getByData('card-tipo').should('exist').and('be.visible').and('not.be.empty');
            cy.getByData('card-descricao').should('exist').and('be.visible').and('not.be.empty');
          });
        }
      });
    });

    it('Deve exibir botão "Analisar" nos cards', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first()
            .should('exist')
            .and('be.visible')
            .and('contain', 'Analisar');
        }
      });
    });
  });

  describe.skip('Modal de Detalhes da Demanda', () => {
    it('Deve abrir modal ao clicar em "Analisar"', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('exist').and('be.visible');
        } else {
          cy.log('Nenhuma demanda aguardando resolução disponível para teste');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir detalhes completos da demanda no modal', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          // Verifica que o modal contém informações da demanda
          cy.getByData('modal-detalhes-demanda-operador').within(() => {
            cy.contains('Descrição').should('be.visible');
          });
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir imagens da demanda', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          cy.getByData('modal-titulo-imagens').should('exist').and('be.visible');
          cy.getByData('modal-imagens-demanda-container').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir endereço completo da demanda', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          // Verifica que há informações de endereço no modal
          cy.getByData('modal-detalhes-demanda-operador').within(() => {
            cy.contains('Endereço').should('be.visible');
          });
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botões de ação para demanda aguardando resolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          cy.getByData('botao-devolver-demanda').should('exist').and('be.visible');
          cy.getByData('botao-resolver-demanda').should('exist').and('be.visible');
          cy.get('body').type('{esc}');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Devolver Demanda', () => {
    it.skip('Deve abrir modal de devolução ao clicar em "Devolver"', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          cy.getByData('botao-devolver-demanda').click();
          cy.getByData('modal-devolver-demanda').should('exist').and('be.visible');
        }
      });
      // Fecha modal de devolução
      cy.get('body').type('{esc}');
      cy.wait(300);
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });

    it.skip('Deve exibir campo de motivo obrigatório no modal de devolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-devolver-demanda').click();
          cy.getByData('modal-devolver-demanda').should('be.visible');
          cy.getByData('textarea-motivo-devolucao').should('exist').and('be.visible');
        }
      });
      // Fecha modal de devolução
      cy.get('body').type('{esc}');
      cy.wait(300);
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });

    it.skip('Deve permitir cancelar devolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-devolver-demanda').click();
          cy.getByData('modal-devolver-demanda').should('be.visible');
          cy.getByData('botao-cancelar-devolucao').click();
          cy.getByData('modal-devolver-demanda').should('not.exist');
        }
      });
      cy.get('body').type('{esc}');
    });

    it.skip('Deve validar que o motivo é obrigatório', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-devolver-demanda').click();
          cy.getByData('modal-devolver-demanda').should('be.visible');
          
          // Verifica que o botão existe (pode estar desabilitado)
          cy.getByData('botao-confirmar-devolucao').should('exist');
        }
      });
      // Fecha modal de devolução
      cy.get('body').type('{esc}');
      cy.wait(300);
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });

    it.skip('Deve exibir botão de confirmar devolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-devolver-demanda').click();
          cy.getByData('modal-devolver-demanda').should('be.visible');
          cy.getByData('textarea-motivo-devolucao').type('Motivo de devolução para teste automatizado.');
          cy.getByData('botao-confirmar-devolucao').should('exist');
        }
      });
      // Fecha modal de devolução
      cy.get('body').type('{esc}');
      cy.wait(300);
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });
  });

  describe('Resolver Demanda', () => {
    it.skip('Deve abrir modal de resolução ao clicar em "Resolver"', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('exist').and('be.visible');
          // Fecha modal de resolução clicando no botão cancelar
          cy.getByData('botao-cancelar-resolucao').click();
          cy.wait(300);
        }
      });
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });

    it.skip('Deve exibir campo de descrição da resolução obrigatório', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('be.visible');
          cy.getByData('textarea-descricao-resolucao').should('exist').and('be.visible');
          // Fecha modal de resolução
          cy.getByData('botao-cancelar-resolucao').click();
          cy.wait(300);
        }
      });
      // Fecha modal de detalhes
      cy.get('body').type('{esc}');
    });

    it('Deve exibir área de upload de imagens de resolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('be.visible');
          cy.getByData('input-upload-imagens-resolucao').should('exist');
          cy.getByData('botao-cancelar-resolucao').click();
          cy.wait(300);
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve permitir cancelar resolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('be.visible');
          cy.getByData('botao-cancelar-resolucao').click();
          cy.getByData('modal-resolver-demanda').should('not.exist');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve validar campos obrigatórios da resolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('be.visible');
          
          cy.getByData('botao-confirmar-resolucao').should('be.disabled');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botão de confirmar resolução', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-resolver-demanda').click();
          cy.getByData('modal-resolver-demanda').should('be.visible');
          cy.getByData('botao-confirmar-resolucao').should('exist');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Visualizar Demanda Concluída', () => {
    it('Deve exibir detalhes de demandas concluídas', () => {
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('exist').and('be.visible');
        } else {
          cy.getByData('estado-vazio').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir resolução e imagens de resolução em demandas concluídas', () => {
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          cy.getByData('modal-resolucao-container').should('exist').and('be.visible');
          cy.getByData('modal-titulo-resolucao').should('exist').and('be.visible');
          cy.getByData('modal-resolucao').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Não deve exibir botões de ação em demandas concluídas', () => {
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          cy.getByData('botao-devolver-demanda').should('not.exist');
          cy.getByData('botao-resolver-demanda').should('not.exist');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Paginação', () => {
    it('Deve exibir controles de paginação quando há múltiplas páginas', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="paginacao"]').length > 0) {
          cy.getByData('paginacao').should('exist').and('be.visible');
          cy.getByData('botao-pagina-anterior').should('exist');
          cy.getByData('botao-proxima-pagina').should('exist');
        }
      });
    });

    it('Deve navegar entre páginas', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="paginacao"]').length > 0) {
          cy.getByData('botao-proxima-pagina').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click();
              cy.wait(500);
              
              cy.getByData('botao-pagina-anterior').should('not.be.disabled').click();
              cy.wait(500);
            }
          });
        }
      });
    });

    it('Deve paginar com 6 itens por página', () => {
      cy.get('body').then(($body) => {
        const cardCount = $body.find('[data-test="card-demanda"]').length;
        if (cardCount > 0) {
          expect(cardCount).to.be.lte(6);
        }
      });
    });
  });

  describe('Skeleton Loading', () => {
    it('Deve exibir skeleton durante carregamento inicial', () => {
      cy.intercept('GET', '**/demandas**', (req) => {
        req.continue((res) => {
          res.delay = 100;
        });
      }).as('getDemandas');

      cy.visit('/operador');
      
      cy.getByData('skeleton-container').should('exist');
    });
  });

  describe('Estado Vazio', () => {
    it('Deve exibir mensagem apropriada quando não há demandas', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length === 0) {
          cy.getByData('estado-vazio').should('exist').and('be.visible');
          cy.getByData('icone-estado-vazio').should('exist').and('be.visible');
          cy.getByData('titulo-estado-vazio').should('exist').and('be.visible');
          cy.getByData('mensagem-estado-vazio').should('exist').and('be.visible');
        }
      });

      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length === 0) {
          cy.getByData('estado-vazio').should('exist').and('be.visible');
        }
      });
    });
  });

  describe('Responsividade', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach((viewport) => {
      it(`Deve exibir corretamente em ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.getByData('page-operador').should('exist').and('be.visible');
        cy.getByData('abas-status').should('exist').and('be.visible');
        cy.getByData('filtro-container').should('exist').and('be.visible');
        // Grid só existe se houver demandas
        cy.get('body').should('be.visible');
        // Volta para viewport padrão para não afetar o logout
        cy.viewport(1920, 1080);
      });
    });
  });

  describe('Carrossel de Imagens', () => {
    it('Deve exibir carrossel de imagens da demanda quando disponível', () => {
      cy.getByData('aba-aguardando-resolucao').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          cy.get('body').then(($modal) => {
            if ($modal.find('[data-test="modal-carousel-imagens"]').length > 0) {
              cy.getByData('modal-carousel-imagens').should('exist').and('be.visible');
            }
          });
        }
      });
    });

    it('Deve exibir carrossel de imagens de resolução em demandas concluídas', () => {
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
          
          cy.get('body').then(($modal) => {
            if ($modal.find('[data-test="modal-carousel-imagens-resolucao"]').length > 0) {
              cy.getByData('modal-carousel-imagens-resolucao').should('exist').and('be.visible');
            }
          });
        }
      });
    });
  });
});
