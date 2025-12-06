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

    if(cy.getByData('grid-demandas').its('length').then(len => len > 0)) {
      cy.getByData('card-demanda').first().should('be.visible');
      cy.getByData('botao-analisar-demanda').first().should('be.visible');
    }
    else {
      cy.contains('Nenhum pedido encontrado').should('be.visible');
    }
  });

  it('Deve visualizar completamente a demanda selecionada', () => {

    if(cy.getByData('grid-demandas').its('length').then(len => len > 0)) {
      cy.getByData('card-demanda').first().should('be.visible');
      cy.getByData('botao-analisar-demanda').first().should('be.visible');
      cy.getByData('botao-analisar-demanda').first().click();

      cy.getByData('detalhes-demanda-secretaria-modal').should('be.visible');

      cy.contains('Descrição da demanda').should('be.visible');
      cy.contains('Imagens da demanda').should('be.visible');
      cy.contains('Endereço da demanda').should('be.visible');
    }
    else {
      cy.contains('Nenhum pedido encontrado').should('be.visible');
    }
    
  });
  it('Deve atribuir uma demanda a um operador da mesma secretaria', () => {
    
  });
  it('Deve recusar uma demanda', () => {
    
  });
});
