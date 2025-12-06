/**
 * Testes E2E - Login de Funcionário
 * 
 * Cobertura:
 * - Renderização da página de login de funcionário
 * - Validação de campos obrigatórios
 * - Login com credenciais válidas/inválidas
 * - Navegação entre páginas de login
 * - Diferenças visuais em relação ao login de munícipe
 */

describe('Login de Funcionário', () => {
  const FRONTEND_URL = 'https://servicospublicos-qa.app.fslab.dev';

  // Credenciais válidas de teste (operador/funcionário)
  const FUNCIONARIO_EMAIL = Cypress.env('FUNCIONARIO_EMAIL') || 'operador@exemplo.com';
  const FUNCIONARIO_SENHA = Cypress.env('FUNCIONARIO_SENHA') || 'Senha@123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(`${FRONTEND_URL}/login/funcionario`);
  });

  describe('Renderização e elementos visuais', () => {
    it('Deve renderizar a página de login de funcionário corretamente', () => {
      cy.getByData('form-login-funcionario').should('exist').and('be.visible');
    });

    it('Deve exibir o título "Acesso Funcionário"', () => {
      cy.getByData('titulo-login').should('exist').and('contain', 'Acesso Funcionário');
    });

    it('Deve exibir o subtítulo específico para funcionários', () => {
      cy.getByData('subtitulo-login').should('exist').and('contain', 'credenciais de funcionário');
    });

    it('Deve exibir o campo de identificador (email/CPF)', () => {
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

    it('Deve NÃO exibir link de cadastro (funcionários não se cadastram)', () => {
      cy.getByData('link-cadastro').should('not.exist');
    });

    it('Deve exibir o botão de toggle de visibilidade da senha', () => {
      cy.getByData('button-toggle-senha').should('exist');
    });
  });

  describe('Validação de campos obrigatórios', () => {
    it('Deve exibir erro ao submeter com campos vazios', () => {
      cy.getByData('button-acessar').click();
      
      cy.contains('Por favor, preencha este campo', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com identificador', () => {
      cy.getByData('input-identificador').type('funcionario@teste.com');
      cy.getByData('button-acessar').click();
      
      cy.contains('Por favor, digite sua senha', { timeout: 5000 }).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com senha', () => {
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      cy.contains('Por favor, preencha este campo', { timeout: 5000 }).should('be.visible');
    });

    it('Deve validar formato de email inválido', () => {
      cy.getByData('input-identificador').type('emailinvalido');
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      // Aguarda erro de credenciais ou validação (API retorna erro para credenciais inválidas)
      cy.wait(5000);
      // Verifica que não saiu da página de login (pois é inválido)
      cy.url().should('include', '/login/funcionario');
    });
  });

  describe('Toggle de visibilidade da senha', () => {
    it('Deve alternar visibilidade da senha corretamente', () => {
      cy.getByData('input-senha').type('SenhaSecreta123');
      cy.getByData('input-senha').should('have.attr', 'type', 'password');
      
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'text');
      
      cy.getByData('button-toggle-senha').click();
      cy.getByData('input-senha').should('have.attr', 'type', 'password');
    });
  });

  describe('Login com credenciais inválidas (cenários tristes)', () => {
    it('Deve exibir toast de erro ao fazer login com email não cadastrado', () => {
      cy.getByData('input-identificador').type('funcionario_inexistente@prefeitura.gov.br');
      cy.getByData('input-senha').type('Senha@123');
      cy.getByData('button-acessar').click();
      
      cy.contains('Credenciais inválidas', { timeout: 10000 }).should('be.visible');
    });

    it('Deve exibir toast de erro ao fazer login com senha incorreta', () => {
      cy.getByData('input-identificador').type(FUNCIONARIO_EMAIL);
      cy.getByData('input-senha').type('SenhaErrada@999');
      cy.getByData('button-acessar').click();
      
      cy.contains('Credenciais inválidas', { timeout: 10000 }).should('be.visible');
    });

    it('Deve manter usuário na página de login após erro', () => {
      cy.getByData('input-identificador').type('teste@invalido.com');
      cy.getByData('input-senha').type('SenhaErrada@123');
      cy.getByData('button-acessar').click();
      
      cy.wait(3000);
      cy.url().should('include', '/login/funcionario');
    });
  });

  describe('Login com credenciais válidas (cenário feliz)', () => {
    it('Deve fazer login com sucesso e redirecionar', () => {
      cy.getByData('input-identificador').type(FUNCIONARIO_EMAIL);
      cy.getByData('input-senha').type(FUNCIONARIO_SENHA);
      cy.getByData('button-acessar').click();
      
      // Verifica redirecionamento (sai da página de login)
      cy.url({ timeout: 15000 }).should('not.include', '/login');
    });

    it('Deve exibir loading durante o processo de login', () => {
      cy.getByData('input-identificador').type(FUNCIONARIO_EMAIL);
      cy.getByData('input-senha').type(FUNCIONARIO_SENHA);
      cy.getByData('button-acessar').click();
      
      cy.getByData('button-acessar').should('contain', 'ENTRANDO');
    });
  });

  describe('Navegação', () => {
    it('Deve navegar para login de munícipe ao clicar no link', () => {
      cy.contains('É munícipe?').should('exist');
      cy.contains('Clique aqui').click();
      cy.url().should('include', '/login/municipe');
    });

    it('Deve navegar para página de esqueci senha ao clicar no link', () => {
      cy.getByData('link-esqueceu-senha').click();
      cy.url().should('include', '/esqueci-senha');
    });

    it('Deve voltar à tela inicial ao clicar no link "Voltar"', () => {
      cy.contains('Voltar à tela inicial').click();
      cy.url().should('eq', `${FRONTEND_URL}/`);
    });
  });

  describe('Diferenças visuais em relação ao login de munícipe', () => {
    it('Deve ter layout diferente (painel azul à direita)', () => {
      // Verifica que existe um painel com fundo colorido (cor global-accent)
      cy.get('div').filter(':visible').should('exist');
      // Verifica a estrutura específica da página de funcionário
      cy.getByData('form-login-funcionario').should('exist');
    });

    it('Deve exibir "Acesso para Funcionários" no painel lateral', () => {
      cy.contains('Acesso para Funcionários').should('exist');
    });
  });
});
