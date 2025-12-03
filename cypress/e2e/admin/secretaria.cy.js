/// <reference types="cypress"/>

describe('Dashboard Admin - Página de Secretaria', () => {
  
  beforeEach(() => {
    cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(2000);
    cy.url().should('include', '/admin/dashboard');
    cy.visit(`/admin/secretaria`);
    cy.wait(1000);
  });

    it('Deve exibir a tabela de secretarias com todas as colunas', () => {
      cy.get('table', { timeout: 10000 }).should('be.visible');

      cy.get('thead').within(() => {
        cy.contains('th', 'Nome').should('be.visible');
        cy.contains('th', 'Sigla').should('be.visible');
        cy.contains('th', 'Email').should('be.visible');
        cy.contains('th', 'Telefone').should('be.visible');
        cy.contains('th', 'Tipo').should('be.visible');
      });
    });

    it('Deve exibir pelo menos uma secretaria na tabela ou mensagem de "Nenhuma secretaria encontrada"', () => {
      cy.get('tbody').within(() => {
        cy.get('tr').then(($rows) => {
          if ($rows.length > 0) {
            cy.get('td').first().should('not.contain', 'Carregando secretarias...');
          } else {
            cy.contains('Nenhuma secretaria encontrada').should('be.visible');
          }
        });
      });
    });
});
