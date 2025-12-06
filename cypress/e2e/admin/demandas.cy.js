/// <reference types="cypress"/>

describe('Página de Demandas - Caminho Feliz', () => {

    beforeEach(() => {
      cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
      cy.wait(1500);
  
      cy.visit('/admin/demanda');
      cy.contains('Carregando demandas...').should('not.exist', { timeout: 20000 });
      cy.get('table').should('be.visible');
    });
  
    it('Deve exibir os elementos principais da página', () => {
      cy.getByData('input-search-demanda').should('be.visible');
      cy.contains('button', 'Todos os tipos').should('be.visible');
      cy.contains('button', 'Todos os status').should('be.visible');
  
      cy.get('thead').within(() => {
        cy.contains('th', 'TIPO').should('be.visible');
        cy.contains('th', 'SECRETARIA').should('be.visible');
        cy.contains('th', 'STATUS').should('be.visible');
        cy.contains('th', 'BAIRRO').should('be.visible');
        cy.contains('th', 'DATA').should('be.visible');
      });
    });
  
    it('Deve exibir pelo menos 1 demanda ou mensagem de vazio', () => {
      cy.get('tbody tr').then(($rows) => {
        if ($rows.length > 0) {
          cy.get('td').first().should('not.contain', 'Carregando');
        } else {
          cy.contains('Nenhuma demanda encontrada').should('be.visible');
        }
      });
    });
  
    it('Deve filtrar demanda pelo campo de busca', () => {
      cy.getByData('input-search-demanda').type('Saneamento');
      cy.wait(500);
  
      cy.contains('td', 'Saneamento').should('exist');
    });
  
    it('Deve filtrar demanda pelo tipo', () => {
        cy.contains('button', 'Todos os tipos').click();
        cy.get('div[role="option"]').contains('Coleta').click();
        
        cy.wait(500);
        cy.get('tbody tr').should('have.length.at.least', 1);
    });
  
    it('Deve filtrar demanda por status', () => {
        cy.contains('button', 'Todos os status').click();
        cy.get('div[role="option"]').contains('Em aberto').click();
        
        cy.wait(500);
        cy.get('tbody tr').should('have.length.at.least', 1);
    });
  
    it.skip('Deve abrir detalhes da demanda ao clicar em uma linha', () => {
        cy.get('tbody tr:first td:first', { timeout: 10000 })
          .should('not.contain', 'Carregando')
          .should('not.contain', 'Nenhuma demanda encontrada')
          .invoke('text')
          .then((nomeTabela) => {
            const tipoDemanda = nomeTabela.trim();
            
            expect(tipoDemanda).to.not.be.empty;
            expect(tipoDemanda).to.not.equal('Carregando demandas...');
    
            cy.getByData('button-ver-detalhes-demanda').first().click();
    
            cy.getByData('detalhe-demanda-modal').should('be.visible');
            
            cy.getByData('modal-titulo', { timeout: 10000 }).should('be.visible').invoke('text')
              .then((tituloModal) => {
                const tituloLimpo = tituloModal.trim();
                expect(tituloLimpo).to.contain(tipoDemanda);
            });
          });
      });

      it('Deve deletar uma demanda com sucesso', () => {    
        cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
          if (req.body.method === 'DELETE' && req.body.endpoint.includes('/demanda')) {
            req.alias = 'deleteDemanda';
          }
        });

        cy.get('tbody tr').last().within(() => {
          cy.get('button:has(svg.lucide-trash)').click({ force: true });
        });
        
        cy.wait(500);
        cy.getByData('delete-demanda-confirm-button').click();
        
        cy.wait('@deleteDemanda').then((interception) => {
          expect(interception.request.body.method).to.equal('DELETE');
          expect(interception.response.statusCode).to.equal(200);
        });
        
        cy.contains('[data-sonner-toast]', 'Demanda excluída com sucesso!', { timeout: 5000 }).should('be.visible');
      });
  });
  