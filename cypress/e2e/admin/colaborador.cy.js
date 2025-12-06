/// <reference types="cypress"/>

function gerarCPF() {
  const base = '05109';
  const resto = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  let cpf = base + resto;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digito1 = 11 - (soma % 11);
  if (digito1 >= 10) digito1 = 0;
  cpf += digito1;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digito2 = 11 - (soma % 11);
  if (digito2 >= 10) digito2 = 0;
  cpf += digito2;

  return cpf;
}

function gerarCNH() {
  const base = '05109';
  const resto = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return base + resto;
}

describe('Dashboard Admin - Página de Colaborador - Caminho feliz', () => {
  let colaboradorCriado = null;
  
  beforeEach(() => {
    cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(2000);
    cy.url().should('include', '/admin/dashboard');
    cy.visit(`/admin/colaborador`);
    cy.wait(1000);

    cy.get('table').should('be.visible');
    cy.contains('Carregando colaboradores...').should('not.exist', { timeout: 30000 });
  });

  it('Deve exibir os elementos principais da página', () => {
    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]').should('be.visible');
    cy.contains('button', 'Nível de acesso').should('be.visible');
    cy.contains('button', 'Status').should('be.visible');
    cy.contains('button', 'Adicionar colaborador').should('be.visible');

    cy.get('table', { timeout: 10000 }).should('be.visible');

    cy.get('thead').within(() => {
      cy.contains('th', 'Nome').should('be.visible');
      cy.contains('th', 'Email').should('be.visible');
      cy.contains('th', 'CPF').should('be.visible');
      cy.contains('th', 'Telefone').should('be.visible');
      cy.contains('th', 'Portaria').should('be.visible');
      cy.contains('th', 'Cargo').should('be.visible');
      cy.contains('th', 'Status').should('be.visible');
    });
  });

  it('Deve exibir pelo menos um colaborador na tabela ou mensagem de "Nenhum colaborador encontrado"', () => {
    cy.get('tbody').within(() => {
      cy.get('tr').then(($rows) => {
        if ($rows.length > 0) {
          cy.get('td').first().should('not.contain', 'Carregando colaboradores...');
        } else {
          cy.contains('Nenhum colaborador encontrado.').should('be.visible');
        }
      });
    });
  });

  it('Deve filtrar colaborador pelo campo de busca por nome', () => {
    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]')
      .type('Administrador');
    
    cy.wait(500);
    
    cy.contains('td', 'Administrador').should('exist');
  });

  it('Deve filtrar colaborador pelo campo de busca por CPF', () => {
    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]')
      .type('00000000191');
    
    cy.wait(500);
    
    cy.contains('td', '000.000.001-91').should('exist');
  });

  it('Deve filtrar colaborador pelo campo de busca por portaria', () => {
    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]')
      .type('ADM-2020');
    
    cy.wait(500);
    
    cy.contains('td', 'ADM-2020').should('exist');
  });

  it('Deve filtrar colaboradores por nível de acesso - Operador', () => {
    cy.contains('button', 'Nível de acesso').click();
    cy.get('div[role="option"]').contains('Operador').click();
    
    cy.wait(500);
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('Deve filtrar colaboradores por nível de acesso - Secretário', () => {
    cy.contains('button', 'Nível de acesso').click();
    cy.get('div[role="option"]').contains('Secretário').click();
    
    cy.wait(500);
    
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('Deve filtrar colaboradores por nível de acesso - Administrador', () => {
    cy.contains('button', 'Nível de acesso').click();
    cy.get('div[role="option"]').contains('Administrador').click();
    
    cy.wait(500);
    
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('Deve filtrar colaboradores por status - Ativo', () => {
    cy.contains('button', 'Status').click();
    cy.get('div[role="option"]').contains('Ativo').click();
    
    cy.wait(500);
    
    cy.get('tbody tr').should('have.length.at.least', 1);
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).within(() => {
        cy.contains('span', 'Ativo').should('exist');
      });
    });
  });

  it('Deve filtrar colaboradores por status - Inativo', () => {
    cy.contains('button', 'Status').click();
    cy.get('div[role="option"]').contains('Inativo').click();
    
    cy.wait(500);
    
    cy.get('tbody').within(() => {
      cy.get('tr').then(($rows) => {
        if ($rows.length > 0) {
          cy.get('td').first().should('not.contain', 'Carregando colaboradores...');
        } else {
          cy.contains('Nenhum colaborador encontrado').should('be.visible');
        }
      });
    });
  });

  it('Deve criar um novo colaborador com sucesso', () => {
    cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
      if (req.body.method === 'POST' && req.body.endpoint.includes('/usuarios')) {
        req.alias = 'postColaborador';
      }
    });
    
    cy.contains('button', 'Adicionar colaborador').click();

    cy.getByData('dialog-content-criar-colaborador').should('be.visible');

    const nome = `Colaborador Teste ${Date.now()}`;
    colaboradorCriado = nome;

    const email = `colaborador${Date.now()}@teste.com`;
    const cpf = gerarCPF();
    const celular = '(69) 99999-9999';
    const cnh = gerarCNH();

    cy.getByData('input-nome').type(colaboradorCriado);
    cy.getByData('input-email').type(email);
    cy.getByData('input-cpf').type(cpf);
    cy.getByData('input-celular').type(celular);
    cy.getByData('input-cnh').type(cnh);
    cy.getByData('input-data-nascimento').type('2000-01-01');
    cy.getByData('input-cargo').type('Cargo Teste');
    cy.getByData('input-portaria').type('PORT-TEST-2025');
    cy.getByData('select-grupo').click();
    cy.get('div[role="option"]').contains('Operador').click();

    cy.getByData('input-cep').type('76980632');
    cy.wait(500);
    cy.getByData('input-numero').type('1111');
    cy.getByData('lista-secretarias').find('label').first().click();

    cy.getByData('button-criar-colaborador').click();

    cy.wait('@postColaborador').then((interception) => {
      expect(interception.request.body.method).to.equal('POST');
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.contains('[data-sonner-toast]', 'Colaborador criado com sucesso!').should('be.visible');

    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]').type(colaboradorCriado);
    cy.wait(500);
    cy.contains(colaboradorCriado).should('be.visible');
  });

  it('Deve editar um colaborador com sucesso', () => {
    cy.then(() => {
      expect(colaboradorCriado).to.not.be.null;
    });
    cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
      if (req.body.method === 'PATCH' && req.body.endpoint.includes('/usuarios')) {
        req.alias = 'editColaborador';
      }
    });

    cy.getByData('input-search-colaborador').type(colaboradorCriado);
    cy.wait(500);

    cy.get('tbody tr').last().within(() => {
      cy.get('button:has(svg.lucide-pencil)').click({ force: true });
    });

    cy.getByData('dialog-content-criar-colaborador').should('be.visible');

    const novoNome = `Colaborador Editado ${Date.now()}`;
    colaboradorCriado = novoNome;
    const novoCargo = `Cargo Editado ${Date.now()}`;
    const telefone = '(69) 99999-9999';
    const cep = ('76980632');

    cy.getByData('input-nome').clear().type(novoNome);
    cy.getByData('input-cargo').clear().type(novoCargo);
    cy.getByData('input-celular').clear().type(telefone);
    cy.getByData('input-cep').clear().type(cep);
    cy.wait(1000);

    cy.getByData('button-criar-colaborador').click();

    cy.wait('@editColaborador').then((interception) => {
      expect(interception.request.body.method).to.equal('PATCH');
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.message).to.eq('Usuário atualizado com sucesso.');
    });

    cy.contains('[data-sonner-toast]', 'Colaborador atualizado com sucesso!').should('be.visible');

    cy.get('input[placeholder="Pesquisar por nome, CPF ou portaria"]').clear().type(novoNome);
    cy.wait(500);
    cy.contains(novoNome).should('be.visible');
  });

  it('Deve deletar um colaborador com sucesso', () => {
    cy.then(() => {
      expect(colaboradorCriado).to.not.be.null;
    });

    cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
      if (req.body.method === 'DELETE' && req.body.endpoint.includes('/usuarios')) {
        req.alias = 'deleteColaborador';
      }
    });

    cy.getByData('input-search-colaborador').clear().type(colaboradorCriado);
    cy.wait(1000);

    cy.get('tbody tr').last().within(() => {
      cy.get('button:has(svg.lucide-trash)').click({ force: true });
    });
    
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.contains('button', 'Excluir').click({ force: true });
    
    cy.wait('@deleteColaborador', { timeout: 10000 }).then((interception) => {
      expect(interception.request.body.method).to.equal('DELETE');
      expect(interception.response.statusCode).to.equal(200);
    });
    
    cy.contains('[data-sonner-toast]', 'Colaborador excluído com sucesso!', { timeout: 5000 }).should('be.visible');
  });

  it('Deve abrir modal de detalhes ao clicar em uma linha da tabela', () => {
    cy.get('table').should('be.visible')
    cy.wait(2000);

    cy.get('tbody tr:first td:first').invoke('text').then((nomeTabela) => {
      const nomeLimpo = nomeTabela.trim();

      cy.get('tbody tr').first().click();

      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').find('div').contains(nomeLimpo).should('exist');
    });
  });
});

describe('Caminho de erro', () => {
  beforeEach(() => {
    cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(2000);
    cy.url().should('include', '/admin/dashboard');
    cy.visit(`/admin/colaborador`);
    cy.wait(1000);

    cy.get('table').should('be.visible');
    cy.contains('Carregando colaboradores...').should('not.exist', { timeout: 30000 });
  });


  it('Não deve criar um colaborador com campos obrigatórios vazios', () => {
    cy.contains('button', 'Adicionar colaborador').click();

    cy.getByData('dialog-content-criar-colaborador').should('be.visible');

    cy.getByData('button-criar-colaborador').click();

    cy.getByData('erro-nome').should('contain', 'Nome é obrigatório');
    cy.getByData('erro-email').should('contain', 'Email é obrigatório');
    cy.getByData('erro-cpf').should('contain', 'CPF é obrigatório');
    cy.getByData('erro-celular').should('contain', 'Celular é obrigatório');
    cy.getByData('erro-data-nascimento').should('contain', 'Data de nascimento é obrigatória');
    cy.getByData('erro-grupo').should('contain', 'Selecione um grupo de permissões');
    cy.getByData('erro-cep').should('contain', 'CEP é obrigatório');
    cy.getByData('erro-logradouro').should('contain', 'Logradouro é obrigatório');
    cy.getByData('erro-numero').should('contain', 'Número é obrigatório');
    cy.getByData('erro-bairro').should('contain', 'Bairro é obrigatório');
  });

  it('Não deve criar um colaborador com dados inválidos', () => {
    cy.contains('button', 'Adicionar colaborador').click();
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');

    cy.getByData('input-nome').type('A');
    cy.getByData('input-cpf').type('123');
    cy.getByData('input-celular').type('123');
    cy.getByData('input-cnh').type('123');

    cy.getByData('button-criar-colaborador').click();

    cy.getByData('erro-nome').should('contain', 'Nome deve ter pelo menos 3 caracteres');
    cy.getByData('erro-cpf').should('contain', 'CPF deve conter 11 dígitos');
    cy.getByData('erro-celular').should('contain', 'Celular deve conter 11 dígitos no formato (69) 99999-9999');
    cy.getByData('erro-cnh').should('contain', 'CNH deve conter 11 dígitos');
  });

  it('Deve exibir mensagem de erro ao falhar ao deletar colaborador', () => {
    cy.intercept('POST', '/api/auth/secure-fetch', (req) => {
      if (req.body.method === 'DELETE' && req.body.endpoint.includes('/usuarios')) {
        req.reply({
          statusCode: 400,
          body: { message: 'Erro ao excluir colaborador.' }
        });
      }
    }).as('deleteErro');

    cy.get('tbody tr').then(($rows) => {
      let $rowToDelete = null;
      let nomeColaborador = '';
      let emailColaborador = '';
      
      for (let i = 0; i < $rows.length; i++) {
        const nome = $rows.eq(i).find('td').eq(0).text().trim();
        const email = $rows.eq(i).find('td').eq(1).text().trim();
        
        const isAdministrador = nome === 'Administrador' || email === 'admin@exemplo.com';
        
        if (!isAdministrador) {
          $rowToDelete = $rows.eq(i);
          nomeColaborador = nome;
          emailColaborador = email;
          break;
        }
      }
      
      if (!$rowToDelete) {
        cy.log('Nenhum colaborador encontrado para deletar (apenas Administrador existe)');
        return;
      }
      
      expect(nomeColaborador).not.to.equal('Administrador');
      expect(emailColaborador).not.to.equal('admin@exemplo.com');
      
      cy.wrap($rowToDelete).within(() => {
        cy.get('button:has(svg.lucide-trash)').click({ force: true });
      });

      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
      cy.getByData('delete-secretaria-confirm-button').click();

      cy.wait('@deleteErro').then((interception) => {
        expect(interception.request.body.method).to.equal('DELETE');
        expect(interception.response.statusCode).to.equal(400);
        expect(interception.response.body.message).to.eq('Erro ao excluir colaborador.')
      });
    });
  });
});




  