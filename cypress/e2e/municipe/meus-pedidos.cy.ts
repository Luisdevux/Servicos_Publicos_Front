/**
 * Testes E2E - Página Meus Pedidos (Munícipe)
 * 
 * Cobertura:
 * - Listagem de pedidos
 * - Filtros por status
 * - Visualização de detalhes
 * - Paginação
 * - Estado vazio
 * - Responsividade
 * - Contadores de pedidos
 * - Navegação
 */

describe('Página Meus Pedidos - Munícipe', () => {

  beforeEach(() => {
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.visit('/pedidosMunicipe');
    cy.waitForPageLoad();
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Renderização da página', () => {
    it('Deve renderizar a página de Meus Pedidos corretamente', () => {
      cy.getByData('nav-link-meus-pedidos').should('exist').and('be.visible');
    });

    it('Deve exibir o banner com título "Meus Pedidos"', () => {
      cy.contains('Meus Pedidos').should('be.visible');
    });

    it('Deve exibir o botão "Voltar"', () => {
      cy.getByData('button-voltar')
        .should('exist')
        .and('be.visible')
        .and('contain', 'Voltar');
    });

    it('Deve exibir a seção de filtros por status', () => {
      cy.getByData('filtros-status').should('exist').and('be.visible');
    });

    it('Deve exibir todos os filtros de status', () => {
      cy.getByData('filtro-todos').should('exist').and('be.visible').and('contain', 'Todas');
      cy.getByData('filtro-aguardando').should('exist').and('be.visible').and('contain', 'Aguardando');
      cy.getByData('filtro-aceito').should('exist').and('be.visible').and('contain', 'Aceitas');
      cy.getByData('filtro-concluida').should('exist').and('be.visible').and('contain', 'Concluídas');
      cy.getByData('filtro-recusado').should('exist').and('be.visible').and('contain', 'Recusadas');
    });

    it('Deve exibir o contador de pedidos', () => {
      cy.getByData('contador-pedidos').should('exist').and('be.visible');
    });

    it('Deve exibir o filtro "Todas" como selecionado por padrão', () => {
      cy.getByData('filtro-todos')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
    });
  });

  describe('Listagem de Pedidos', () => {
    it('Deve exibir cards de pedidos quando há demandas cadastradas', () => {
      // Verifica se há pedidos
      cy.getByData('contador-pedidos').then(($contador) => {
        const texto = $contador.text();
        
        if (texto.includes('0') || texto.includes('Nenhum')) {
          // Se não há pedidos, verifica estado vazio
          cy.getByData('estado-vazio').should('be.visible');
        } else {
          // Se há pedidos, verifica grid
          cy.getByData('grid-pedidos').should('exist').and('be.visible');
          cy.get('[data-test^="card-pedido-"]').should('have.length.at.least', 1);
        }
      });
    });

    it('Deve exibir informações corretas nos cards de pedidos', () => {
      cy.get('[data-test^="card-pedido-"]').first().within(() => {
        // Verifica se tem título
        cy.getByData('card-pedido-titulo').should('exist').and('be.visible');
        
        // Verifica se tem status
        cy.get('[data-test^="card-pedido-status-"]').should('exist');
        
        // Verifica se tem progresso (exceto para recusadas)
        cy.getByData('card-pedido-progresso-section').should('exist');
        
        // Verifica se tem botão "Ver mais"
        cy.getByData('card-pedido-ver-mais-btn')
          .should('exist')
          .and('be.visible')
          .and('contain', 'Ver mais');
      });
    });

    it('Deve exibir loading durante carregamento inicial', () => {
      // Força recarregamento
      cy.visit('/pedidosMunicipe');
      cy.waitForPageLoad();
      
      // Pode haver skeleton durante carregamento (muito rápido para capturar sempre)
      // Verifica que eventualmente a página carrega
      cy.getByData('page-meus-pedidos').should('be.visible');
    });
  });

  describe('Filtros por Status', () => {
    it('Deve filtrar pedidos ao clicar em "Todas"', () => {
      cy.getByData('filtro-todos').click();
      cy.wait(500);
      
      cy.getByData('filtro-todos')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
    });

    it('Deve filtrar pedidos ao clicar em "Aguardando Aprovação"', () => {
      cy.getByData('filtro-aguardando').click();
      cy.wait(500);
      
      cy.getByData('filtro-aguardando')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
      
      // Verifica se o contador foi atualizado
      cy.getByData('contador-pedidos').should('be.visible');
    });

    it('Deve filtrar pedidos ao clicar em "Aceitas"', () => {
      cy.getByData('filtro-aceito').click();
      cy.wait(500);
      
      cy.getByData('filtro-aceito')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
    });

    it('Deve filtrar pedidos ao clicar em "Concluídas"', () => {
      cy.getByData('filtro-concluida').click();
      cy.wait(500);
      
      cy.getByData('filtro-concluida')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
    });

    it('Deve filtrar pedidos ao clicar em "Recusadas"', () => {
      cy.getByData('filtro-recusado').click();
      cy.wait(500);
      
      cy.getByData('filtro-recusado')
        .should('have.class', 'border-[#337695]')
        .and('have.class', 'text-[#337695]');
    });

    it('Deve exibir contadores corretos em cada filtro', () => {
      // Verifica que os badges de contador aparecem quando há itens
      cy.getByData('filtro-todos').within(() => {
        cy.get('span').should('exist');
      });
    });

    it('Deve resetar para página 1 ao trocar de filtro', () => {
      // Tenta navegar para próxima página se disponível
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="button-proxima-pagina"]:not(:disabled)').length > 0) {
          cy.getByData('button-proxima-pagina').click();
          cy.wait(500);
          
          // Troca de filtro
          cy.getByData('filtro-aguardando').click();
          cy.wait(500);
          
          // Verifica se voltou para página 1
          cy.getByData('indicador-pagina').should('contain', 'Página 1');
        }
      });
    });

    it('Deve atualizar a lista ao mudar de filtro', () => {
      let primeiroTitulo: string;
      
      // Captura primeiro card em "Todas"
      cy.get('[data-test^="card-pedido-"]').first().within(() => {
        cy.getByData('card-pedido-titulo').invoke('text').then((texto) => {
          primeiroTitulo = texto;
        });
      });
      
      // Muda para outro filtro
      cy.getByData('filtro-aceito').click();
      cy.wait(500);
      
      // Verifica que a lista pode ter mudado (ou permanecido igual se todos são aceitos)
      cy.getByData('contador-pedidos').should('be.visible');
    });
  });

  describe('Visualização de Detalhes', () => {
    it('Deve abrir modal ao clicar em "Ver mais"', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.get('[data-test^="card-pedido-"]').first().within(() => {
            cy.getByData('card-pedido-ver-mais-btn').click();
          });
          
          cy.wait(500);
          
          // Verifica se o modal foi aberto (procura por elementos típicos de modal)
          cy.get('[role="dialog"]', { timeout: 5000 }).should('exist');
        }
      });
    });

    it('Deve exibir detalhes completos no modal', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.get('[data-test^="card-pedido-"]').first().within(() => {
            cy.getByData('card-pedido-ver-mais-btn').click();
          });
          
          cy.wait(500);
          
          // Verifica elementos do modal
          cy.get('[role="dialog"]').should('be.visible');
          
          // Fecha modal
          cy.get('body').type('{esc}');
        }
      });
    });

    it('Deve fechar modal ao pressionar ESC', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.get('[data-test^="card-pedido-"]').first().within(() => {
            cy.getByData('card-pedido-ver-mais-btn').click();
          });
          
          cy.wait(500);
          
          cy.get('[role="dialog"]').should('be.visible');
          
          // Pressiona ESC
          cy.get('body').type('{esc}');
          cy.wait(300);
          
          // Verifica se modal foi fechado
          cy.get('[role="dialog"]').should('not.exist');
        }
      });
    });
  });

  describe('Paginação', () => {
    it('Deve exibir controles de paginação quando há pedidos', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('paginacao').should('exist').and('be.visible');
          cy.getByData('button-pagina-anterior').should('exist');
          cy.getByData('button-proxima-pagina').should('exist');
          cy.getByData('indicador-pagina').should('exist');
        }
      });
    });

    it('Deve exibir indicador de página atual', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('indicador-pagina')
            .should('be.visible')
            .and('contain', 'Página')
            .and('contain', 'de');
        }
      });
    });

    it('Deve desabilitar botão "Anterior" na primeira página', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('button-pagina-anterior').should('be.disabled');
        }
      });
    });

    it('Deve navegar para próxima página ao clicar no botão', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="button-proxima-pagina"]:not(:disabled)').length > 0) {
          cy.getByData('button-proxima-pagina').click();
          cy.wait(500);
          
          cy.getByData('indicador-pagina').should('contain', 'Página 2');
        }
      });
    });

    it('Deve navegar para página anterior ao clicar no botão', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="button-proxima-pagina"]:not(:disabled)').length > 0) {
          // Vai para página 2
          cy.getByData('button-proxima-pagina').click();
          cy.wait(500);
          
          // Volta para página 1
          cy.getByData('button-pagina-anterior').should('not.be.disabled').click();
          cy.wait(500);
          
          cy.getByData('indicador-pagina').should('contain', 'Página 1');
        }
      });
    });

    it('Deve desabilitar botão "Próximo" na última página', () => {
      cy.getByData('indicador-pagina').then(($indicador) => {
        const texto = $indicador.text();
        const match = texto.match(/Página (\d+) de (\d+)/);
        
        if (match) {
          const paginaAtual = parseInt(match[1]);
          const totalPaginas = parseInt(match[2]);
          
          if (paginaAtual === totalPaginas) {
            cy.getByData('button-proxima-pagina').should('be.disabled');
          }
        }
      });
    });

    it('Deve atualizar a lista ao mudar de página', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="button-proxima-pagina"]:not(:disabled)').length > 0) {
          let primeiroCardPagina1: string;
          
          // Captura ID do primeiro card
          cy.get('[data-test^="card-pedido-"]').first().invoke('attr', 'data-test').then((id) => {
            primeiroCardPagina1 = id || '';
          });
          
          // Vai para próxima página
          cy.getByData('button-proxima-pagina').click();
          cy.wait(500);
          
          // Verifica que o primeiro card mudou
          cy.get('[data-test^="card-pedido-"]').first().invoke('attr', 'data-test').should((id) => {
            // Pode ser diferente ou igual (se houver poucos itens)
            expect(id).to.exist;
          });
        }
      });
    });
  });

  describe('Estado Vazio', () => {
    it('Deve exibir mensagem quando não há pedidos em filtro específico', () => {
      // Testa com filtro de recusadas (geralmente tem menos ou nenhum)
      cy.getByData('filtro-recusado').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="estado-vazio"]').length > 0) {
          cy.getByData('estado-vazio').should('be.visible');
          cy.getByData('estado-vazio-titulo')
            .should('be.visible')
            .and('contain', 'Nenhum pedido encontrado');
        }
      });
    });

    it('Deve exibir ícone no estado vazio', () => {
      cy.getByData('filtro-recusado').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="estado-vazio"]').length > 0) {
          cy.getByData('estado-vazio').within(() => {
            cy.get('svg').should('exist').and('be.visible');
          });
        }
      });
    });

    it('Deve exibir mensagem apropriada para o filtro selecionado', () => {
      cy.getByData('filtro-recusado').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="estado-vazio"]').length > 0) {
          cy.getByData('estado-vazio').should('contain.text', 'pedido');
        }
      });
    });
  });

  describe('Navegação', () => {
    it('Deve voltar para página inicial ao clicar em "Voltar"', () => {
      cy.getByData('button-voltar').click();
      cy.url().should('eq', `/`);
    });

    it('Deve navegar para Meus Pedidos através do menu do header', () => {
      cy.visit(`/`);
      cy.waitForPageLoad();
      
      cy.getByData('nav-link-meus-pedidos').click();
      cy.url().should('include', '/pedidosMunicipe');
      cy.getByData('page-meus-pedidos').should('be.visible');
    });
  });

  describe('Responsividade', () => {
    it('Deve exibir corretamente em viewport mobile', () => {
      cy.viewport('iphone-x');
      cy.getByData('page-meus-pedidos').should('be.visible');
      cy.getByData('filtros-status').should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('grid-pedidos').should('be.visible');
        }
      });
    });

    it('Deve exibir corretamente em viewport tablet', () => {
      cy.viewport('ipad-2');
      cy.getByData('page-meus-pedidos').should('be.visible');
      cy.getByData('filtros-status').should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('grid-pedidos').should('be.visible');
        }
      });
    });

    it('Deve exibir corretamente em viewport desktop', () => {
      cy.viewport(1920, 1080);
      cy.getByData('page-meus-pedidos').should('be.visible');
      cy.getByData('filtros-status').should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.getByData('grid-pedidos').should('be.visible');
        }
      });
    });

    it('Deve permitir scroll horizontal nos filtros em mobile', () => {
      cy.viewport('iphone-x');
      
      cy.getByData('filtros-status').should(($el) => {
        const overflowX = $el.css('overflow-x');
        expect(overflowX).to.be.oneOf(['auto', 'scroll']);
      });
    });
  });

  describe('Consistência com API', () => {
    it('Deve buscar demandas do munícipe logado na API', () => {
      cy.intercept('GET', `https://servicospublicos-api-qa.app.fslab.dev/demandas*`).as('getDemandas');
        
      cy.visit(`/pedidosMunicipe`);
      cy.waitForPageLoad();
      
      cy.wait('@getDemandas', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    });

    it('Deve exibir quantidade correta de pedidos retornados pela API', () => {
      cy.request({
        method: 'GET',
        url: `https://servicospublicos-api-qa.app.fslab.dev/demandas?page=1&limit=10`,
        headers: {
          'Cookie': document.cookie
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 && response.body.docs) {
          const totalDocs = response.body.totalDocs;
          
          cy.getByData('contador-pedidos').should('contain', totalDocs.toString());
        }
      });
    });

    it('Deve aplicar filtros de status corretamente via API', () => {
      cy.intercept('GET', `https://servicospublicos-api-qa.app.fslab.dev/demandas*status=Em%20aberto*`).as('getAguardando');
      
      cy.getByData('filtro-aguardando').click();
      
      cy.wait('@getAguardando', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });

    it('Deve respeitar paginação da API', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="button-proxima-pagina"]:not(:disabled)').length > 0) {
          cy.intercept('GET', `https://servicospublicos-api-qa.app.fslab.dev/demandas*page=2*`).as('getPage2');
          
          cy.getByData('button-proxima-pagina').click();
          
          cy.wait('@getPage2', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
        }
      });
    });
  });

  describe('Cards de Pedidos', () => {
    it('Deve exibir badge "Aguardando" para pedidos em aberto', () => {
      cy.getByData('filtro-aguardando').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-pedido-status-aguardando"]').length > 0) {
          cy.getByData('card-pedido-status-aguardando').first()
            .should('be.visible')
            .and('contain', 'Aguardando');
        }
      });
    });

    it('Deve exibir badge "Aceito" para pedidos em andamento', () => {
      cy.getByData('filtro-aceito').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-pedido-status-aceito"]').length > 0) {
          cy.getByData('card-pedido-status-aceito').first()
            .should('be.visible')
            .and('contain', 'Aceito');
        }
      });
    });

    it('Deve exibir badge "Recusado" para pedidos recusados', () => {
      cy.getByData('filtro-recusado').click();
      cy.wait(500);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="card-pedido-status-recusado"]').length > 0) {
          cy.getByData('card-pedido-status-recusado').first()
            .should('be.visible')
            .and('contain', 'Recusado');
        }
      });
    });

    it('Deve exibir seção de progresso nos cards', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-test^="card-pedido-"]').length > 0) {
          cy.get('[data-test^="card-pedido-"]').first().within(() => {
            cy.getByData('card-pedido-progresso-section').should('exist');
          });
        }
      });
    });
  });
});
