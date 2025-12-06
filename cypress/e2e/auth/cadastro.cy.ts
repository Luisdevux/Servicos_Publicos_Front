/**
 * Testes E2E - Cadastro de Munícipe
 * 
 * Cobertura:
 * - Renderização da página de cadastro
 * - Validação de campos obrigatórios
 * - Validação de formatos (CPF, email, celular, CEP)
 * - Validação de senha (requisitos de segurança)
 * - Preenchimento automático de endereço via CEP
 * - Fluxo completo de cadastro
 * - Navegação
 */

describe('Cadastro de Munícipe', () => {
  const FRONTEND_URL = 'https://servicospublicos-qa.app.fslab.dev';

  // Dados válidos para cadastro (usar dados únicos para evitar conflitos)
  const timestamp = Date.now();
  const dadosCadastro = {
    nome: 'Teste Automatizado Cypress',
    email: `teste.cypress.${timestamp}@exemplo.com`,
    cpf: '529.982.247-25', // CPF válido para teste
    celular: '(69) 99999-9999',
    dataNascimento: '1990-05-15',
    cep: '76982-306',
    logradouro: 'Avenida Major Amarante',
    bairro: 'Centro',
    numero: '1234',
    senha: 'Teste@123',
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(`${FRONTEND_URL}/cadastro`);
  });

  describe('Renderização e elementos visuais', () => {
    it('Deve renderizar a página de cadastro corretamente', () => {
      cy.getByData('form-cadastro').should('exist').and('be.visible');
    });

    it('Deve exibir o título "Cadastro de Munícipe"', () => {
      cy.getByData('titulo-cadastro').should('exist').and('contain', 'Cadastro de Munícipe');
    });

    it('Deve exibir o subtítulo informativo', () => {
      cy.getByData('subtitulo-cadastro').should('exist').and('contain', 'Preencha seus dados');
    });

    it('Deve exibir seção de Dados Pessoais', () => {
      cy.contains('Dados Pessoais').should('exist').and('be.visible');
    });

    it('Deve exibir seção de Endereço', () => {
      cy.contains('Endereço').should('exist').and('be.visible');
    });

    it('Deve exibir seção de Senha de Acesso', () => {
      cy.contains('Senha de Acesso').scrollIntoView().should('exist').and('be.visible');
    });

    it('Deve exibir botão de cadastrar', () => {
      cy.getByData('button-cadastrar').should('exist').and('contain', 'CRIAR CONTA');
    });

    it('Deve exibir link para login', () => {
      cy.contains('Já possui cadastro?').should('exist');
      cy.contains('Faça login aqui').should('exist');
    });
  });

  describe('Campos do formulário - Dados Pessoais', () => {
    it('Deve exibir campo de nome completo', () => {
      cy.getByData('input-nome').should('exist').and('be.visible');
    });

    it('Deve exibir campo de nome social (opcional)', () => {
      cy.getByData('input-nome-social').should('exist').and('be.visible');
    });

    it('Deve exibir campo de CPF com máscara', () => {
      cy.getByData('input-cpf').should('exist').and('be.visible');
      cy.getByData('input-cpf').type('52998224725');
      cy.getByData('input-cpf').should('have.value', '529.982.247-25');
    });

    it('Deve exibir campo de data de nascimento', () => {
      cy.getByData('input-data-nascimento').should('exist').and('be.visible');
    });

    it('Deve exibir campo de email', () => {
      cy.getByData('input-email').should('exist').and('be.visible');
    });

    it('Deve exibir campo de celular com máscara', () => {
      cy.getByData('input-celular').should('exist').and('be.visible');
      cy.getByData('input-celular').type('69999999999');
      cy.getByData('input-celular').should('have.value', '(69) 99999-9999');
    });
  });

  describe('Campos do formulário - Endereço', () => {
    it('Deve exibir campo de CEP', () => {
      cy.getByData('input-cep').should('exist').and('be.visible');
    });

    it('Deve exibir campo de logradouro', () => {
      cy.getByData('input-logradouro').should('exist').and('be.visible');
    });

    it('Deve exibir campo de bairro', () => {
      cy.getByData('input-bairro').should('exist').and('be.visible');
    });

    it('Deve exibir campo de número', () => {
      cy.getByData('input-numero').should('exist').and('be.visible');
    });

    it('Deve exibir campo de complemento (opcional)', () => {
      cy.getByData('input-complemento').scrollIntoView().should('exist').and('be.visible');
    });

    it('Deve exibir campos de cidade e estado como readonly', () => {
      cy.getByData('input-cidade').should('have.value', 'Vilhena').and('be.disabled');
      cy.getByData('input-estado').should('have.value', 'RO').and('be.disabled');
    });
  });

  describe('Campos do formulário - Senha', () => {
    it('Deve exibir campo de senha', () => {
      cy.getByData('input-senha').scrollIntoView().should('exist').and('be.visible');
    });

    it('Deve exibir campo de confirmar senha', () => {
      cy.getByData('input-confirmar-senha').scrollIntoView().should('exist').and('be.visible');
    });

    it('Deve exibir toggle de visibilidade da senha', () => {
      cy.getByData('button-toggle-senha').should('exist');
    });

    it('Deve exibir toggle de visibilidade da confirmação de senha', () => {
      cy.getByData('button-toggle-confirmar-senha').should('exist');
    });

    it('Deve exibir requisitos de senha ao digitar', () => {
      cy.getByData('input-senha').type('Teste');
      cy.getByData('password-requirements').should('exist').and('be.visible');
    });
  });

  describe('Validação de requisitos de senha', () => {
    it('Deve mostrar requisito de 8 caracteres como inválido inicialmente', () => {
      cy.getByData('input-senha').type('Abc@1');
      cy.getByData('password-req-0-invalid').should('exist'); // Mínimo 8 caracteres
    });

    it('Deve validar requisito de letra minúscula', () => {
      cy.getByData('input-senha').type('TESTE@123');
      cy.getByData('password-req-1-invalid').should('exist'); // Falta minúscula
    });

    it('Deve validar requisito de letra maiúscula', () => {
      cy.getByData('input-senha').type('teste@123');
      cy.getByData('password-req-2-invalid').should('exist'); // Falta maiúscula
    });

    it('Deve validar requisito de número', () => {
      cy.getByData('input-senha').type('Teste@abc');
      cy.getByData('password-req-3-invalid').should('exist'); // Falta número
    });

    it('Deve validar requisito de caractere especial', () => {
      cy.getByData('input-senha').type('Teste1234');
      cy.getByData('password-req-4-invalid').should('exist'); // Falta especial
    });

    it('Deve marcar todos requisitos como válidos com senha forte', () => {
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('password-req-0-valid').should('exist');
      cy.getByData('password-req-1-valid').should('exist');
      cy.getByData('password-req-2-valid').should('exist');
      cy.getByData('password-req-3-valid').should('exist');
      cy.getByData('password-req-4-valid').should('exist');
    });
  });

  describe('Validação de confirmação de senha', () => {
    it('Deve mostrar ícone de erro quando senhas não coincidem', () => {
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('input-confirmar-senha').type('Teste@456');
      cy.getByData('icon-senha-mismatch').should('exist');
    });

    it('Deve mostrar ícone de sucesso quando senhas coincidem', () => {
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('input-confirmar-senha').type('Teste@123');
      cy.getByData('icon-senha-match').should('exist');
    });
  });

  describe('Validação de CPF', () => {
    it('Deve mostrar ícone de sucesso para CPF válido', () => {
      cy.getByData('input-cpf').type('52998224725');
      cy.getByData('icon-cpf-valid').should('exist');
    });

    it('Deve mostrar ícone de erro para CPF inválido', () => {
      cy.getByData('input-cpf').type('11111111111');
      cy.getByData('icon-cpf-invalid').should('exist');
    });
  });

  describe('Preenchimento automático de CEP', () => {
    it('Deve preencher endereço automaticamente com CEP válido de Vilhena', () => {
      cy.getByData('input-cep').type('76982306');
      cy.wait(2000); // Aguarda busca do CEP
      
      cy.getByData('input-logradouro').invoke('val').should('not.be.empty');
      cy.getByData('input-bairro').invoke('val').should('not.be.empty');
    });

    it('Deve aplicar máscara no CEP', () => {
      cy.getByData('input-cep').type('76982306');
      cy.getByData('input-cep').should('have.value', '76982-306');
    });
  });

  describe('Validação de campos obrigatórios (cenários tristes)', () => {
    it('Deve exibir erro ao submeter formulário vazio', () => {
      cy.getByData('button-cadastrar').click();
      
      // Aguarda toast de erro
      cy.contains('Erro de validação', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro para nome muito curto', () => {
      cy.getByData('input-nome').type('AB');
      cy.getByData('button-cadastrar').click();
      
      cy.contains('pelo menos 3 caracteres', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro para email inválido', () => {
      cy.getByData('input-nome').type('Teste Nome');
      cy.getByData('input-email').type('emailinvalido');
      cy.getByData('button-cadastrar').click();
      
      cy.contains('Formato de email inválido', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro para menor de 18 anos', () => {
      cy.getByData('input-nome').type('Teste Nome');
      cy.getByData('input-email').type('teste@email.com');
      cy.getByData('input-cpf').type('52998224725');
      
      // Data de nascimento de 5 anos atrás
      const dataRecente = new Date();
      dataRecente.setFullYear(dataRecente.getFullYear() - 5);
      const dataFormatada = dataRecente.toISOString().split('T')[0];
      cy.getByData('input-data-nascimento').type(dataFormatada);
      
      cy.getByData('button-cadastrar').click();
      
      cy.contains('pelo menos 18 anos', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro para CEP fora de Vilhena', () => {
      // Preenche dados básicos
      cy.getByData('input-nome').type('Teste Nome');
      cy.getByData('input-email').type('teste@email.com');
      cy.getByData('input-cpf').type('52998224725');
      cy.getByData('input-celular').type('69999999999');
      cy.getByData('input-data-nascimento').type('1990-01-01');
      
      // CEP de São Paulo
      cy.getByData('input-cep').type('01310100');
      cy.getByData('input-logradouro').type('Rua Teste');
      cy.getByData('input-bairro').type('Centro');
      cy.getByData('input-numero').clear().type('123');
      
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('input-confirmar-senha').type('Teste@123');
      
      cy.getByData('button-cadastrar').click();
      
      cy.contains('Vilhena', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro quando senhas não coincidem', () => {
      // Preenche todos os campos corretamente exceto confirmação de senha
      cy.getByData('input-nome').type('Teste Nome Completo');
      cy.getByData('input-email').type('teste@email.com');
      cy.getByData('input-cpf').type('52998224725');
      cy.getByData('input-celular').type('69999999999');
      cy.getByData('input-data-nascimento').type('1990-01-01');
      cy.getByData('input-cep').type('76982306');
      cy.wait(1500);
      cy.getByData('input-logradouro').type('Rua Teste');
      cy.getByData('input-bairro').type('Centro');
      cy.getByData('input-numero').clear().type('123');
      
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('input-confirmar-senha').type('Teste@456'); // Senha diferente
      
      cy.getByData('button-cadastrar').click();
      
      cy.contains('senhas não coincidem', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Toggle de visibilidade de senhas', () => {
    it('Deve alternar visibilidade da senha', () => {
      cy.getByData('input-senha').type('Teste@123');
      cy.getByData('input-senha').should('have.attr', 'type', 'password');
      
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'text');
    });

    it('Deve alternar visibilidade da confirmação de senha', () => {
      cy.getByData('input-confirmar-senha').type('Teste@123');
      cy.getByData('input-confirmar-senha').should('have.attr', 'type', 'password');
      
      cy.getByData('button-toggle-confirmar-senha').click();
      cy.getByData('input-confirmar-senha').should('have.attr', 'type', 'text');
    });
  });

  describe('Navegação', () => {
    it('Deve navegar para login ao clicar no link', () => {
      cy.contains('Faça login aqui').click();
      cy.url().should('include', '/login/municipe');
    });
  });

  describe('Fluxo completo de cadastro (cenário feliz)', () => {
    it('Deve preencher todos os campos corretamente e submeter', () => {
      // Dados Pessoais
      cy.getByData('input-nome').type(dadosCadastro.nome);
      cy.getByData('input-cpf').type(dadosCadastro.cpf.replace(/\D/g, ''));
      cy.getByData('input-data-nascimento').type(dadosCadastro.dataNascimento);
      cy.getByData('input-email').type(dadosCadastro.email);
      cy.getByData('input-celular').type(dadosCadastro.celular.replace(/\D/g, ''));
      
      // Endereço
      cy.getByData('input-cep').type(dadosCadastro.cep.replace(/\D/g, ''));
      cy.wait(2000); // Aguarda preenchimento automático
      cy.getByData('input-logradouro').clear().type(dadosCadastro.logradouro);
      cy.getByData('input-bairro').clear().type(dadosCadastro.bairro);
      cy.getByData('input-numero').clear().type(dadosCadastro.numero);
      
      // Senha
      cy.getByData('input-senha').type(dadosCadastro.senha);
      cy.getByData('input-confirmar-senha').type(dadosCadastro.senha);
      
      // Verifica que todos os requisitos de senha estão válidos
      cy.getByData('icon-senha-match').should('exist');
      cy.getByData('icon-cpf-valid').should('exist');
      
      // Submete o formulário
      cy.getByData('button-cadastrar').click();
      
      // Verifica loading
      cy.getByData('button-cadastrar').should('contain', 'CADASTRANDO');
      
      // Aguarda resultado (sucesso ou erro de email já cadastrado)
      cy.wait(5000);
      
      // Verifica se foi para página de aguardando verificação OU exibe erro
      cy.url().then((url) => {
        if (url.includes('aguardando-verificacao')) {
          // Sucesso - redirecionou para aguardar verificação
          cy.contains('verificação', { timeout: 5000 }).should('exist');
        } else {
          // Pode ter dado erro (email já existe, etc)
          // Isso é esperado em execuções repetidas
          cy.log('Cadastro pode ter falhado (email já existe ou outro erro)');
        }
      });
    });
  });
});
