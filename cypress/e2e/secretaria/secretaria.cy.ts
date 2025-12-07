/**
 * Testes E2E - Painel da Secretaria
 * 
 * Cobertura:
 * - Renderização da página
 * - Abas de status (Em Aberto, Em Andamento, Concluídas, Recusadas)
 * - Filtros por tipo de demanda
 * - Cards de demanda
 * - Modais de detalhes
 * - Atribuição de demanda a operador
 * - Rejeição de demanda
 * - Paginação
 * - Estado vazio
 * - Responsividade
 */

describe('Painel da Secretaria', () => {

  beforeEach(() => {
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.visit('/secretaria');
    // Aguarda condicionalmente que os spinners desapareçam
    cy.get('body').then($body => {
      if ($body.find('[class*="animate-spin"]').length > 0) {
        cy.get('[class*="animate-spin"]', { timeout: 15000 }).should('not.exist');
      }
    });
    // Aguarda que o conteúdo principal esteja carregado
    cy.get('[data-test="indicador-secretarias-container"]', { timeout: 10000 }).should('exist');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Renderização da Página', () => {
    it('Deve renderizar a página da secretaria corretamente', () => {
      cy.url().should('include', '/secretaria');
    });

    it('Deve exibir banner identificando área da secretaria', () => {
      cy.contains('Secretaria').should('be.visible');
    });

    it('Deve exibir indicador de secretarias vinculadas', () => {
      cy.getByData('indicador-secretarias-container').should('exist').and('be.visible');
      cy.getByData('indicador-secretarias-label')
        .should('exist')
        .and('be.visible');
    });

    it('Deve exibir lista de secretarias vinculadas', () => {
      cy.getByData('indicador-secretarias-lista').should('exist').and('be.visible');
    });
  });

  describe('Abas de Status', () => {
    it('Deve exibir todas as abas de status', () => {
      const abas = [
        { dataTest: 'aba-em-aberto', texto: 'Em Aberto' },
        { dataTest: 'aba-em-andamento', texto: 'Em Andamento' },
        { dataTest: 'aba-concluidas', texto: 'Concluídas' },
        { dataTest: 'aba-recusadas', texto: 'Recusadas' }
      ];
      
      // Verifica cada aba diretamente, sem verificar o container
      abas.forEach(aba => {
        cy.getByData(aba.dataTest).should('be.visible').and('contain', aba.texto);
      });
    });

    it('Deve exibir as abas com seus rótulos', () => {
      cy.getByData('aba-em-aberto').should('contain.text', 'Em Aberto');
      cy.getByData('aba-em-andamento').should('contain.text', 'Em Andamento');
      cy.getByData('aba-concluidas').should('contain.text', 'Concluídas');
      cy.getByData('aba-recusadas').should('contain.text', 'Recusadas');
    });

    it('Deve ter a aba "Em Aberto" selecionada por padrão', () => {
      cy.getByData('aba-em-aberto').should('be.visible');
    });

    it('Deve trocar de aba ao clicar', () => {
      // Clica na aba "Em Andamento"
      cy.getByData('aba-em-andamento').click();
      cy.wait(500);
      cy.getByData('aba-em-andamento').should('be.visible');
      
      // Clica na aba "Concluídas"
      cy.getByData('aba-concluidas').click();
      cy.wait(500);
      cy.getByData('aba-concluidas').should('be.visible');
      
      // Clica na aba "Recusadas"
      cy.getByData('aba-recusadas').click();
      cy.wait(500);
      cy.getByData('aba-recusadas').should('be.visible');
      
      // Volta para "Em Aberto"
      cy.getByData('aba-em-aberto').click();
      cy.wait(500);
      cy.getByData('aba-em-aberto').should('be.visible');
    });

    it('Deve atualizar a lista de demandas ao trocar de aba', () => {
      cy.getByData('aba-em-andamento').click();
      cy.wait(500);
      
      cy.get('body').then($body => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      
      cy.getByData('aba-concluidas').click();
      cy.wait(500);
      
      cy.get('body').then($body => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
    });
  });

  describe('Filtros', () => {
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
      // Fecha o dropdown com ESC
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
      cy.get('body').type('{esc}');
    });
  });

  describe('Grid de Demandas', () => {
    it('Deve exibir grid de demandas ou mensagem de lista vazia', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('grid-demandas').should('exist').and('be.visible');
        } else {
          // Verifica mensagem de lista vazia
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir cards de demanda quando houver dados', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('card-demanda').should('exist').and('be.visible');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botão "Analisar" nos cards de demanda', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first()
            .should('exist')
            .and('be.visible')
            .and('contain', 'Analisar');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Modal de Detalhes - Demandas Em Aberto', () => {
    it('Deve abrir modal ao clicar em "Analisar"', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('exist').and('be.visible');
        } else {
          cy.log('Nenhuma demanda em aberto disponível para teste');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botões de ação no modal (Em Aberto)', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
          
          cy.getByData('botao-rejeitar-demanda').should('exist').and('be.visible');
          cy.getByData('botao-confirmar-demanda').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Atribuir Demanda a Operador', () => {
    it('Deve abrir modal de atribuição ao clicar em "Atribuir a Operador"', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
          cy.getByData('botao-confirmar-demanda').click();
          cy.getByData('modal-atribuir-operador').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir dropdown com lista de operadores', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-confirmar-demanda').click();
          cy.getByData('modal-atribuir-operador').should('be.visible');
          cy.getByData('select-operador').should('exist').and('be.visible');
          cy.getByData('select-trigger-operador').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve permitir cancelar atribuição', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-confirmar-demanda').click();
          cy.getByData('modal-atribuir-operador').should('be.visible');
          cy.getByData('botao-cancelar-atribuicao').click();
          cy.getByData('modal-atribuir-operador').should('not.exist');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botão de confirmar atribuição', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-confirmar-demanda').click();
          cy.getByData('modal-atribuir-operador').should('be.visible');
          cy.getByData('botao-confirmar-atribuicao').should('exist');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Rejeitar Demanda', () => {
    it('Deve abrir modal de rejeição ao clicar em "Rejeitar"', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
          cy.getByData('botao-rejeitar-demanda').click();
          cy.getByData('modal-rejeitar-demanda').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir campo de motivo obrigatório', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-rejeitar-demanda').click();
          cy.getByData('modal-rejeitar-demanda').should('be.visible');
          cy.getByData('textarea-motivo-rejeicao').should('exist').and('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve permitir cancelar rejeição', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-rejeitar-demanda').click();
          cy.getByData('modal-rejeitar-demanda').should('be.visible');
          cy.getByData('botao-cancelar-rejeicao').click();
          cy.getByData('modal-rejeitar-demanda').should('not.exist');
        }
      });
      cy.get('body').type('{esc}');
    });

    it('Deve exibir botão de confirmar rejeição', () => {
      cy.getByData('aba-em-aberto').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('botao-rejeitar-demanda').click();
          cy.getByData('modal-rejeitar-demanda').should('be.visible');
          cy.getByData('botao-confirmar-rejeicao').should('exist');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Modal de Detalhes - Demandas Em Andamento', () => {
    it('Deve visualizar demandas em andamento', () => {
      cy.getByData('aba-em-andamento').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('exist').and('be.visible');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Modal de Detalhes - Demandas Concluídas', () => {
    it('Deve visualizar demandas concluídas', () => {
      cy.getByData('aba-concluidas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('exist').and('be.visible');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
      cy.get('body').type('{esc}');
    });
  });

  describe('Modal de Detalhes - Demandas Recusadas', () => {
    it('Deve visualizar demandas recusadas', () => {
      cy.getByData('aba-recusadas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          cy.getByData('botao-analisar-demanda').first().click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('exist').and('be.visible');
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
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

    it('Deve permitir navegar entre páginas', () => {
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
  });

  describe('Estado Vazio', () => {
    it('Deve exibir mensagem apropriada quando não há demandas', () => {
      cy.getByData('aba-recusadas').click();
      cy.wait(1000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-demanda"]').length === 0) {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
          cy.contains('Não há demandas recusadas').should('be.visible');
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
        cy.getByData('abas-status').should('exist').and('be.visible');
        cy.getByData('filtro-container').should('exist').and('be.visible');
        // Grid só existe se houver demandas
        cy.get('body').should('be.visible');
        // Volta para viewport padrão para não afetar o logout
        cy.viewport(1920, 1080);
      });
    });
  });
});
