describe('Fluxo de testes da pagina de secretaria', () => {
  
  beforeEach(() => {
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Deve carregar as demandas cadastradas na secretaria do usuario (por status)', () => {
    cy.getByData('indicador-secretarias-container').should('be.visible');
    cy.getByData('aba-em-aberto').should('be.visible').click();
    cy.getByData('aba-em-andamento').should('be.visible').click();
    cy.getByData('aba-concluidas').should('be.visible').click();
    cy.getByData('aba-recusadas').should('be.visible').click();

    if(cy.contains('Demanda')) {
      cy.getByData('card-demanda').first().should('be.visible');
      cy.getByData('botao-analisar-demanda').first().should('be.visible');
    }
    else {
      cy.contains('Nenhum pedido encontrado').should('be.visible');
    }
  });

  it('Deve visualizar completamente a demanda selecionada', () => {
    const statusDemanda = [
      { aba: 'aba-em-aberto', nome: 'Em Aberto' },
      { aba: 'aba-em-andamento', nome: 'Em Andamento' },
      { aba: 'aba-concluidas', nome: 'Concluídas' },
      { aba: 'aba-recusadas', nome: 'Recusadas' }
    ];

    let demandaEncontrada = false;

    for (let status of statusDemanda) {
      cy.getByData(status.aba).should('be.visible').click();
      cy.wait(500);

      cy.get('body').then($body => {
        if ($body.find('[data-test="card-demanda"]').length > 0) {
          demandaEncontrada = true;
          cy.getByData('card-demanda').first().should('be.visible');
          cy.getByData('botao-analisar-demanda').first().should('be.visible').click();
          cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
          cy.contains('Descrição da demanda').should('be.visible');
          cy.get('body').type('{esc}');
          cy.wait(300);
        } else {
          cy.contains('Nenhum pedido encontrado').should('be.visible');
        }
      });
    }
    cy.then(() => {
      if (!demandaEncontrada) {
        cy.log('Nenhuma demanda encontrada em nenhuma aba. Teste finalizado.');
      }
    });
  });
  it('Deve atribuir uma demanda a um operador da mesma secretaria', () => {
    
  });
  it('Deve recusar uma demanda', () => {
    
  });
});
