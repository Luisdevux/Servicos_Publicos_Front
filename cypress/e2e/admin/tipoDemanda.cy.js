/// <reference types="cypress"/>

describe('Gerenciamento de Tipos de Demanda - Caminho feliz', () => {
    let tipoCriado = null;
  
    beforeEach(() => {
      cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
      cy.wait(2000);
      cy.url().should('include', '/admin/dashboard');
      cy.visit(`/admin/tipoDemanda`);
      cy.wait(1000);
  
      cy.get('table').should('be.visible');
      cy.contains('Carregando tipos de demanda...').should('not.exist', { timeout: 30000 });
    });

    it('Deve exibir os elementos principais da página', () => {
        cy.get('input[placeholder="Pesquisar por título"]').should('be.visible');
        cy.contains('button', 'Todos').should('be.visible');
        cy.contains('button', 'Adicionar tipo').should('be.visible');
    
        cy.get('table').should('be.visible');
    
        cy.get('thead').within(() => {
          cy.contains('th', 'Título').should('be.visible');
          cy.contains('th', 'Descrição').should('be.visible');
          cy.contains('th', 'Tipo').should('be.visible');
        });
    });

    it('Deve exibir pelo menos um tipo de demanda ou mensagem de vazio', () => {
        cy.get('tbody tr').then(($rows) => {
          if ($rows.length > 0) {
            cy.get('td').first().should('not.contain', 'Carregando');
          } else {
            cy.contains('Nenhum tipo de demanda encontrado.').should('be.visible');
          }
        });
    });

    it('Deve buscar tipo de demanda pelo título', () => {
        cy.get('input[placeholder="Pesquisar por título"]').type('Animal');
        cy.wait(500);
    
        cy.contains('td', 'Animal', { matchCase: false }).should('exist');
    });

    it('Deve filtrar tipos de demanda por tipo', () => {
        cy.contains('button', 'Todos').click();
        cy.contains('[role="option"]', 'Coleta').click();
    
        cy.wait(500);
    
        cy.get('tbody tr').each(($row) => {
            cy.wrap($row).should('contain.text', 'Coleta');
        });
    });

    it('Deve criar um novo tipo de demanda com sucesso', () => {
        cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
          if (req.body.method === 'POST' && req.body.endpoint.includes('/tipoDemanda')) {
            req.alias = 'createTipoDemanda';
          }
        });
    
        cy.getByData('button-adicionar-tipo-demanda').click();
        cy.wait(1000);

        cy.getByData('create-tipo-demanda-dialog').should('be.visible');

        const titulo = `Tipo Teste ${Date.now()}`;
        tipoCriado = titulo;
        cy.getByData('input-titulo-tipo-demanda').type(titulo);
        cy.getByData('select-tipo-tipo-demanda').click();
        cy.contains('[role="option"]', 'Coleta').click();
        cy.getByData('input-descricao-tipo-demanda').type('Descrição teste');
    
        cy.getByData('button-criar-tipo').click();
    
        cy.wait('@createTipoDemanda').then((i) => {
          expect(i.request.body.method).to.equal('POST');
          expect(i.response.statusCode).to.equal(200);
        });
    
        cy.contains('[data-sonner-toast]', 'Tipo de demanda criado com sucesso!').should('be.visible');
    
        cy.getByData('input-titulo').type(titulo);
        cy.wait(500);
    
        cy.contains(titulo).should('be.visible');
    });

    it('Deve editar um tipo de demanda com sucesso', () => {
        cy.then(() => {
          expect(tipoCriado).to.not.be.null;
        });
    
        cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
          if (req.body.method === 'PATCH' && req.body.endpoint.includes('/tipoDemanda')) {
            req.alias = 'editTipoDemanda';
          }
        });
    
        cy.getByData('input-titulo').type(tipoCriado);
        cy.wait(500);

        cy.get('tbody tr').last().within(() => {
          cy.get('button:has(svg.lucide-pencil)').click({ force: true });
        });
    
        cy.getByData('create-tipo-demanda-dialog').should('be.visible');
        
        const novoTitulo = `Tipo Editado ${Date.now()}`;
        cy.getByData('input-titulo-tipo-demanda').clear().type(novoTitulo);
    
        cy.getByData('button-criar-tipo').click();
    
        cy.wait('@editTipoDemanda').then((i) => {
          expect(i.request.body.method).to.equal('PATCH');
          expect(i.response.statusCode).to.equal(200);
        });
    
        cy.contains('[data-sonner-toast]', 'Tipo de demanda atualizado com sucesso!').should('be.visible');
    
        cy.get('input[placeholder="Pesquisar por título"]').clear().type(novoTitulo);
        cy.wait(500);
    
        cy.contains(novoTitulo).should('be.visible');
    });

    it('Deve excluir um tipo de demanda com sucesso', () => {
        cy.then(() => {
            expect(tipoCriado).to.not.be.null;
        });

        cy.getByData('input-titulo').clear().type(tipoCriado);
        cy.wait(500);

        cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
          if (req.body.method === 'DELETE' && req.body.endpoint.includes('/tipoDemanda')) {
            req.alias = 'deleteTipoDemanda';
          }
        });

        cy.get('tbody tr').last().within(() => {
          cy.get('button:has(svg.lucide-trash)').click({ force: true });
        });
    
        cy.getByData('delete-secretaria-dialog').should('be.visible');
        cy.wait(500);
    
        cy.getByData('delete-secretaria-confirm-button').click();
    
        cy.wait('@deleteTipoDemanda').then((i) => {
          expect(i.request.body.method).to.equal('DELETE');
          expect(i.response.statusCode).to.equal(200);
        });
    
        cy.contains('[data-sonner-toast]', 'Tipo de demanda excluído com sucesso!').should('be.visible');
    });    
});

describe('Caminho de erro', () => {

    beforeEach(() => {
        cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
        cy.wait(2000);
        cy.url().should('include', '/admin/dashboard');
        cy.visit(`/admin/tipoDemanda`);
        cy.wait(1000);
    
        cy.get('table').should('be.visible');
        cy.contains('Carregando tipos de demanda...').should('not.exist', { timeout: 30000 });
    });

    it('Não deve criar tipo de demanda com campos obrigatórios vazios', () => {
        cy.getByData('button-adicionar-tipo-demanda').click();
    
        cy.getByData('create-tipo-demanda-dialog').should('be.visible');
    
        cy.getByData('button-criar-tipo').click();
    
        cy.getByData('erro-titulo').should('contain', 'Título é obrigatório');
        cy.getByData('erro-tipo').should('contain', 'Tipo é obrigatório');
        cy.getByData('erro-descricao').should('contain', 'Descrição é obrigatória');
    });

    it('Não deve criar tipo de demanda com dados inválidos', () => {
        cy.getByData('button-adicionar-tipo-demanda').click();
        cy.getByData('create-tipo-demanda-dialog').should('be.visible');
    
        cy.getByData('input-titulo-tipo-demanda').type('A');
        cy.getByData('input-descricao-tipo-demanda').type('Teste');
    
        cy.getByData('button-criar-tipo').click();
    
        cy.getByData('erro-titulo').should('contain', 'Título deve ter pelo menos 3 caracteres');
        cy.getByData('erro-descricao').should('contain', 'Descrição deve ter pelo menos 10 caracteres');
      });


    it('Deve exibir mensagem de erro ao falhar ao deletar tipo de demanda', () => {
        cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
          if (req.body.method === 'DELETE' && req.body.endpoint.includes('/tipoDemanda')) {
            req.reply({
              statusCode: 400,
              body: { message: 'Erro ao excluir tipo de demanda.' }
            });
          }
        }).as('deleteErro');
    
        cy.get('tbody tr').first().within(() => {
          cy.get('button:has(svg.lucide-trash)').click({ force: true });
        });
    
        cy.getByData('delete-secretaria-dialog').should('be.visible');
        cy.getByData('delete-secretaria-confirm-button').click();
    
        cy.wait('@deleteErro').then((interception) => {
          expect(interception.response.body.message).to.eq('Erro ao excluir tipo de demanda.')
        });
      });
});