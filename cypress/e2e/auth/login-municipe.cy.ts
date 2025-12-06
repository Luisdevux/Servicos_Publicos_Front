/**
 * Testes E2E - Login de Munícipe
 * 
 * Cobertura:
 * - Renderização da página de login
 * - Validação de campos obrigatórios
 * - Login com credenciais válidas
 * - Login com credenciais inválidas (toast de erro)
 * - Navegação para cadastro e esqueci senha
 * - Toggle de visibilidade da senha
 */

describe('Login de Munícipe', () => {
  const FRONTEND_URL = 'https://servicospublicos-qa.app.fslab.dev';

  // Credenciais válidas de teste
  const MUNICIPE_EMAIL = Cypress.env('MUNICIPE_EMAIL') || 'municipe@exemplo.com';
  const MUNICIPE_SENHA = Cypress.env('MUNICIPE_SENHA') || 'Senha@123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(`${FRONTEND_URL}/login/municipe`);
  });

  describe('Renderização e elementos visuais', () => {
    it('Deve renderizar a página de login de munícipe corretamente', () => {
      cy.getByData('form-login-municipe').should('exist').and('be.visible');
    });

    it('Deve exibir o título "Acesso Munícipe"', () => {
      cy.getByData('titulo-login').should('exist').and('contain', 'Acesso Munícipe');
    });

    it('Deve exibir o subtítulo informativo', () => {
      cy.getByData('subtitulo-login').should('exist').and('contain', 'Entre com suas credenciais');
    });

    it('Deve exibir o campo de identificador (email/CPF/CNPJ)', () => {
      cy.getByData('input-identificador').should('exist').and('be.visible');
    });

    it('Deve exibir o campo de senha', () => {
      cy.getByData('input-senha').should('exist').and('be.visible');
    });

    it('Deve exibir o checkbox "Lembrar de mim"', () => {
      cy.getByData('checkbox-lembrar-de-mim').should('exist');
    });

    it('Deve exibir o link "Esqueceu sua senha?"', () => {
      cy.getByData('link-esqueceu-senha').should('exist').and('be.visible');
    });

    it('Deve exibir o botão de login "ACESSAR"', () => {
      cy.getByData('button-acessar').should('exist').and('contain', 'ACESSAR');
    });

    it('Deve exibir o link de cadastro', () => {
      cy.getByData('link-cadastro').should('exist').and('contain', 'Cadastre-se aqui');
    });

    it('Deve exibir o botão de toggle de visibilidade da senha', () => {
      cy.getByData('button-toggle-senha').should('exist');
    });
  });

  describe('Validação de campos obrigatórios', () => {
    it('Deve exibir erro ao submeter com campos vazios', () => {
      cy.getByData('button-acessar').click();
      
      // Aguarda toast de erro
      cy.contains('Por favor, preencha este campo', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com identificador', () => {
      cy.getByData('input-identificador').type('teste@email.com');
      cy.getByData('button-acessar').click();
      
      // Aguarda mensagem de erro para campo senha
      cy.contains('Por favor, digite sua senha', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com senha', () => {
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      // Aguarda mensagem de erro para identificador
      cy.contains('Por favor, preencha este campo', { timeout: 5000 }).should('be.visible');
    });

    it('Deve validar formato de email inválido', () => {
      cy.getByData('input-identificador').type('emailsemarroba');
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      // Aguarda erro de credenciais ou validação (API retorna erro para credenciais inválidas)
      cy.wait(5000);
      // Verifica que não saiu da página de login (pois é inválido)
      cy.url().should('include', '/login/municipe');
    });

    it('Deve validar CPF com dígitos insuficientes', () => {
      cy.getByData('input-identificador').type('12345');
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      // Mensagem de CPF incompleto
      cy.contains('número(s) a mais para completar o CPF', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Toggle de visibilidade da senha', () => {
    it('Deve mostrar a senha ao clicar no botão de toggle', () => {
      cy.getByData('input-senha').type('MinhaSenha123');
      cy.getByData('input-senha').should('have.attr', 'type', 'password');
      
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'text');
    });

    it('Deve ocultar a senha ao clicar novamente no toggle', () => {
      cy.getByData('input-senha').type('MinhaSenha123');
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'text');
      
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'password');
    });
  });

  describe('Login com credenciais inválidas (cenários tristes)', () => {
    it('Deve exibir toast de erro ao fazer login com email não cadastrado', () => {
      cy.getByData('input-identificador').type('email_nao_existe@teste.com');
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      // Aguarda toast de erro da API
      cy.contains('Credenciais inválidas', { timeout: 10000 }).should('be.visible');
    });

    it('Deve exibir toast de erro ao fazer login com senha incorreta', () => {
      cy.getByData('input-identificador').type(MUNICIPE_EMAIL);
      cy.getByData('input-senha').type('SenhaErrada@999');
      cy.getByData('button-acessar').click();
      
      // Aguarda toast de erro da API
      cy.contains('Credenciais inválidas', { timeout: 10000 }).should('be.visible');
    });

    it('Deve manter usuário na página de login após erro', () => {
      cy.getByData('input-identificador').type('email_invalido@teste.com');
      cy.getByData('input-senha').type('SenhaErrada@123');
      cy.getByData('button-acessar').click();
      
      cy.wait(3000);
      cy.url().should('include', '/login/municipe');
    });
  });

  describe('Login com credenciais válidas (cenário feliz)', () => {
    it('Deve fazer login com sucesso e redirecionar para home', () => {
      cy.getByData('input-identificador').type(MUNICIPE_EMAIL);
      cy.getByData('input-senha').type(MUNICIPE_SENHA);
      cy.getByData('button-acessar').click();
      
      // Verifica redirecionamento (sai da página de login)
      cy.url({ timeout: 15000 }).should('not.include', '/login');
    });

    it('Deve exibir loading durante o processo de login', () => {
      cy.getByData('input-identificador').type(MUNICIPE_EMAIL);
      cy.getByData('input-senha').type(MUNICIPE_SENHA);
      cy.getByData('button-acessar').click();
      
      // Verifica que o botão muda para estado de loading
      cy.getByData('button-acessar').should('contain', 'ENTRANDO');
    });

    it('Deve permitir login com checkbox "Lembrar de mim" marcado', () => {
      cy.getByData('input-identificador').type(MUNICIPE_EMAIL);
      cy.getByData('input-senha').type(MUNICIPE_SENHA);
      cy.getByData('checkbox-lembrar-de-mim').click({ force: true });
      cy.getByData('button-acessar').click();
      
      cy.url({ timeout: 15000 }).should('not.include', '/login');
    });
  });

  describe('Navegação', () => {
    it('Deve navegar para página de cadastro ao clicar no link', () => {
      cy.getByData('link-cadastro').click();
      cy.url().should('include', '/cadastro');
    });

    it('Deve navegar para página de esqueci senha ao clicar no link', () => {
      cy.getByData('link-esqueceu-senha').click();
      cy.url().should('include', '/esqueci-senha');
    });

    it('Deve navegar para login de funcionário ao clicar no link', () => {
      cy.contains('É funcionário da prefeitura?').should('exist');
      cy.contains('Clique aqui').click();
      cy.url().should('include', '/login/funcionario');
    });

    it('Deve voltar à tela inicial ao clicar no link "Voltar"', () => {
      cy.contains('Voltar à tela inicial').click();
      cy.url().should('eq', `${FRONTEND_URL}/`);
    });
  });
});
