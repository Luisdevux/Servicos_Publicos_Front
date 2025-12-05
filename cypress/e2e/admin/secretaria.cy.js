/// <reference types="cypress"/>

describe('Dashboard Admin - Página de Secretaria', () => {
  
  beforeEach(() => {
    cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(2000);
    cy.url().should('include', '/admin/dashboard');
    cy.visit(`/admin/secretaria`);
    cy.wait(1000);
  });


    it.skip('Deve exibir a tabela de secretarias com todas as colunas', () => {
      cy.get('table', { timeout: 10000 }).should('be.visible');

      cy.get('thead').within(() => {
        cy.contains('th', 'Nome').should('be.visible');
        cy.contains('th', 'Sigla').should('be.visible');
        cy.contains('th', 'Email').should('be.visible');
        cy.contains('th', 'Telefone').should('be.visible');
        cy.contains('th', 'Tipo').should('be.visible');
      });
    });

    it.skip('Deve exibir pelo menos uma secretaria na tabela ou mensagem de "Nenhuma secretaria encontrada"', () => {
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

    it.skip('Deve criar uma nova secretaria com sucesso', () => {
      cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
        if (req.body.method === 'POST' && req.body.endpoint.includes('/secretaria')) {
          req.alias = 'postSecretaria';
        }
      });
      
      cy.getByData('secretaria-add-button').click();

      cy.getByData('create-secretaria-dialog').should('be.visible');

      const nome = `Secretaria Teste ${Date.now()}`;
      const sigla = `SIG${Math.floor(Math.random() * 1000)}`;
      const email = `email${Date.now()}@teste.com`;
      const telefone = '(69) 99999-9999';

      cy.getByData('nome-secretaria-input').type(nome);
      cy.getByData('sigla-secretaria-input').type(sigla);
      cy.getByData('email-secretaria-input').type(email);
      cy.getByData('telefone-secretaria-input').type(telefone);

      cy.getByData('tipo-secretaria-select').click();
      cy.get('div[role="option"]').first().click();

      cy.getByData('submit-button').click();

      cy.wait('@postSecretaria').then((interception) => {
        expect(interception.request.body.method).to.equal('POST');
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.message).to.eq('Recurso criado com sucesso')
      });

      cy.contains('[data-sonner-toast]', 'Secretaria criada com sucesso!').should('be.visible');

      cy.getByData('secretaria-search-input').type(nome);
      cy.contains(nome).should('be.visible');

    });

    it.skip('Deve editar uma secreatria com sucesso', () => {
      cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
        if (req.body.method === 'PATCH' && req.body.endpoint.includes('/secretaria')) {
          req.alias = 'editSecretaria';
        }
      });

      cy.get('[data-test="secretaria-table"]').should('be.visible');

      cy.get('[data-test="secretaria-table-body"] tr').first().within(() => {cy.get('[data-test^="secretaria-edit-button"]').click();});
    
      const novoNome = `Secretaria Editada ${Date.now()}`;
      const novaSigla = `SIG${Math.floor(Math.random() * 900 + 100)}`;
    
      cy.getByData('create-secretaria-dialog').should('be.visible');
    
      cy.getByData('nome-secretaria-input').clear().type(novoNome);
      cy.getByData('sigla-secretaria-input').clear().type(novaSigla);
    
      cy.getByData('submit-button').click();

      cy.wait('@editSecretaria').then((interception) => {
        expect(interception.request.body.method).to.equal('PATCH');
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.message).to.eq('Secretaria atualizada com sucesso.')
      });
    
      cy.contains('[data-sonner-toast]', 'Secretaria atualizada com sucesso!').should('be.visible');

      cy.getByData('secretaria-search-input').clear().type(novoNome);
      cy.contains(novoNome).should('be.visible');
    });

    it.skip(('Deve deletar uma secretaria com sucesso'), () => {
      cy.intercept('POST', '/api/auth/secure-fetch').as('deleteSecretaria');

      cy.get('[data-test="secretaria-table-body"] tr').first().within(() => {cy.get('[data-test^="secretaria-delete-button"]').click();});

      cy.getByData('delete-secretaria-dialog').should('be.visible');
      cy.getByData('delete-secretaria-confirm-button').click();

      cy.wait('@deleteSecretaria').then((interception) => {
        expect(interception.request.body.method).to.equal('DELETE');
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.message).to.eq('Secretaria excluída com sucesso.')
      });
      cy.contains('[data-sonner-toast]', 'Secretaria excluída com sucesso!').should('be.visible');
    }) 


});

describe('Caminho infeliz', () => {
  beforeEach(() => {
    cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(2000);
    cy.url().should('include', '/admin/dashboard');
    cy.visit(`/admin/secretaria`);
    cy.wait(1000);
  });

  it('Não deve criar uma secretaria com campos obrigatórios vazios', () => {
    cy.getByData('secretaria-add-button').click();

    cy.getByData('create-secretaria-dialog').should('be.visible');
  
    cy.getByData('submit-button').click();
    cy.get('button:has(.lucide-x)').click();
  
    cy.contains('[data-sonner-toast]', 'Campo obrigatório: Nome').should('be.visible');
  });
  
});
