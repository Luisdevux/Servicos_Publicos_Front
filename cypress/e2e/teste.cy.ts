describe('Teste de Login', () => {
  it('Deve fazer login com sucesso', () => {
    cy.login('operador@exemplo.com', 'Senha@123', 'funcionario');
  });
});