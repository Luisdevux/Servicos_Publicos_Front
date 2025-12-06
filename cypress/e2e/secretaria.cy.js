
describe('Fluxo de testes da pagina de secretaria', () => {
  
  beforeEach(() => {
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
  });

  afterEach(() => {
    cy.logout();
  });

  it.skip('Deve carregar as demandas cadastradas na secretaria do usuario (por status)', () => {
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

  it.skip('Deve visualizar completamente a demanda selecionada', () => {
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
  it.skip('Deve atribuir uma demanda a um operador da mesma secretaria', () => {
      cy.logout();
      cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
      cy.getByData('card-servico-coleta').click();
      cy.wait(10000);
      cy.url().should('include', '/demanda/coleta');
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('cep-input').type('76980008');
      cy.getByData('numero-input').type('371');
      cy.getByData('descricao-textarea').type('Descrição da demanda de coleta');
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
      cy.wait(1000);
      cy.getByData('submit-button').click();
      cy.contains('Demanda criada com sucesso', { timeout: 15000 }).should('be.visible');
      cy.wait(2000);
      cy.logout();

      cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
      cy.wait(1000);
      cy.getByData('aba-em-aberto').should('be.visible').click();
      cy.wait(500);
      cy.getByData('card-demanda').first().should('be.visible');
      cy.getByData('botao-analisar-demanda').first().should('be.visible').click();
      cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
      cy.getByData('botao-confirmar-demanda').click();
      cy.getByData('modal-atribuir-operador').should('be.visible');
      cy.wait(500);
      cy.getByData('select-trigger-operador').click();
      cy.get('div[role="option"]').contains('Operador Fixo').click();
      cy.getByData('botao-confirmar-atribuicao').should('not.be.disabled').click();
      cy.contains('Demanda atribuída com sucesso').should('be.visible');
  });

  it.skip('Deve recusar uma demanda', () => {
    cy.logout();
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.getByData('card-servico-coleta').click();
    cy.wait(10000);
    cy.url().should('include', '/demanda/coleta');
    cy.getByData('card-demanda-botao-criar').first().click();
    cy.getByData('cep-input').type('76980008');
    cy.getByData('numero-input').type('371');
    cy.getByData('descricao-textarea').type('Descrição da demanda de coleta');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.wait(1000);
    cy.getByData('submit-button').click();
    cy.contains('Demanda criada com sucesso', { timeout: 15000 }).should('be.visible');
    cy.wait(2000);
    cy.logout();
      
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);
    cy.getByData('aba-em-aberto').should('be.visible').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().should('be.visible');
    cy.getByData('botao-analisar-demanda').first().should('be.visible').click();
    cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
    cy.getByData('botao-rejeitar-demanda').click();
    cy.getByData('modal-rejeitar-demanda').should('be.visible');
    cy.getByData('textarea-motivo-rejeicao').type('Motivo da recusa da demanda');
    cy.getByData('botao-confirmar-rejeicao').should('not.be.disabled').click();
    cy.contains('Demanda rejeitada').should('be.visible');
  });
});

describe('Fluxo de testes pagina secretaria - casos de erro', () => {
  
  beforeEach(() => {
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Não deve permitir atribuir uma demanda sem selecionar um operador', () => {
    /*
    cy.logout();
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.getByData('card-servico-coleta').click();
    cy.wait(10000);
    cy.url().should('include', '/demanda/coleta');
    cy.getByData('card-demanda-botao-criar').first().click();
    cy.getByData('cep-input').type('76980008');
    cy.getByData('numero-input').type('371');
    cy.getByData('descricao-textarea').type('Descrição da demanda de coleta');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.wait(1000);
    cy.getByData('submit-button').click();
    cy.contains('Demanda criada com sucesso', { timeout: 15000 }).should('be.visible');
    cy.wait(2000);
    cy.logout();

    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);*/
    cy.getByData('aba-em-aberto').should('be.visible').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().should('be.visible');
    cy.getByData('botao-analisar-demanda').first().should('be.visible').click();
    cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
    cy.getByData('botao-confirmar-demanda').click();
    cy.getByData('modal-atribuir-operador').should('be.visible');
    cy.getByData('botao-confirmar-atribuicao').should('be.disabled');
    cy.getByData('botao-cancelar-atribuicao').click();
    cy.getByData('modal-atribuir-operador').should('not.exist');
    cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
    cy.get('body').type('{esc}');
      cy.wait(300);
      cy.getByData('modal-detalhes-demanda-secretaria').should('not.exist');
  });
  it('Deve exibir mensagem de erro ao tentar recusar uma demanda sem informar o motivo', () => {
    
  });
});
describe('Fluxo de testes pagina secretaria - consistencia API e FRONT ', () => {


});
