/// <reference types="cypress" />
// ***********************************************
// Comandos customizados do Cypress para testes E2E
// do projeto Serviços Públicos de Vilhena
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Faz login no sistema
       * @param identificador - Email ou CPF do usuário
       * @param senha - Senha do usuário
       * @param tipo - Tipo de login: 'municipe' ou 'funcionario'
       */
      login(identificador: string, senha: string, tipo?: 'municipe' | 'funcionario'): Chainable<void>;

      /**
       * Seleciona elemento pelo atributo data-test
       * @param seletor - Valor do atributo data-test
       */
      getByData(seletor: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Faz logout do sistema
       */
      logout(): Chainable<void>;

      /**
       * Aguarda o carregamento da página
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Intercepta requisições através do proxy secure-fetch (usado pelo frontend)
       * @param endpointPattern - Padrão do endpoint a ser interceptado (ex: 'tipoDemanda', 'usuarios')
       * @param alias - Nome do alias para a interceptação
       * @param method - Método HTTP opcional (GET, POST, PATCH, DELETE)
       */
      interceptSecureFetch(endpointPattern: string, alias: string, method?: string): Chainable<void>;

      /**
       * Intercepta e aguarda uma requisição da API
       * @param method - Método HTTP (GET, POST, PATCH, DELETE)
       * @param urlPattern - Padrão da URL a ser interceptada
       * @param alias - Nome do alias para a interceptação
       */
      interceptApi(method: string, urlPattern: string, alias: string): Chainable<void>;

      /**
       * Preenche o formulário de criação de demanda
       * @param dados - Dados do formulário
       */
      preencherFormularioDemanda(dados: {
        cep?: string;
        bairro?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        descricao?: string;
        comImagem?: boolean;
      }): Chainable<void>;

      /**
       * Verifica se uma mensagem toast foi exibida
       * @param tipo - Tipo da mensagem: 'success', 'error', 'warning', 'info'
       * @param texto - Texto parcial ou completo da mensagem
       */
      verificarToast(tipo: 'success' | 'error' | 'warning' | 'info', texto?: string): Chainable<void>;
    }
  }
}

// ==========================================
// COMANDO: Login
// ==========================================
Cypress.Commands.add("login", (identificador: string, senha: string, tipo: 'municipe' | 'funcionario' = 'municipe') => {
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.visit(`/login/${tipo}`);

  // Aguarda o campo estar visível E habilitado antes de digitar
  cy.get('input[type="text"]', { timeout: 10000 })
    .should("be.visible")
    .should("not.be.disabled")
    .type(identificador);
  cy.get('input[type="password"]')
    .should("not.be.disabled")
    .type(senha);
  cy.get('button[type="submit"]').click();
  
  // Aguarda redirecionamento após login
  cy.url({ timeout: 15000 }).should("not.include", "/login");
});

Cypress.Commands.add("getByData", (seletor: string) => {
  return cy.get(`[data-test="${seletor}"]`);
});

// ==========================================
// COMANDO: Logout
// ==========================================
Cypress.Commands.add("logout", () => {
  // Tenta encontrar botão de logout no header desktop ou mobile
  cy.get('body').then(($body) => {
    if ($body.find('[data-test="header-logout-button"]').length > 0) {
      cy.getByData('header-logout-button').click();
    } else if ($body.find('[data-test="button-sair"]').length > 0) {
      cy.getByData('button-sair').click();
    } else {
      // Abre menu mobile e clica em logout
      cy.getByData('header-mobile-menu-button').click();
      cy.getByData('header-mobile-logout-button').click();
    }
  });
  
  cy.url().should('include', '/login');
});

// ==========================================
// COMANDO: Aguardar carregamento da página
// ==========================================
Cypress.Commands.add("waitForPageLoad", () => {
  cy.document().its('readyState').should('eq', 'complete');
  // Aguarda que não haja mais spinners/loaders visíveis
  cy.get('[class*="animate-spin"], [class*="loading"], [data-test*="loading"]', { timeout: 1000 })
    .should('not.exist');
});

// ==========================================
// COMANDO: Interceptar API
// ==========================================
Cypress.Commands.add("interceptApi", (method: string, urlPattern: string, alias: string) => {
  const apiUrl = Cypress.env('API_URL') || 'https://servicospublicos-api.app.fslab.dev';
  cy.intercept(method as Cypress.HttpMethod, `${apiUrl}${urlPattern}`).as(alias);
});

// ==========================================
// COMANDO: Interceptar via Secure Fetch (proxy do frontend)
// ==========================================
Cypress.Commands.add("interceptSecureFetch", (endpointPattern: string, alias: string, method?: string) => {
  cy.intercept('POST', '**/api/auth/secure-fetch', (req) => {
    const matchesEndpoint = req.body?.endpoint?.includes(endpointPattern);
    const matchesMethod = method ? req.body?.method === method : true;
    if (matchesEndpoint && matchesMethod) {
      req.alias = alias;
    }
  });
});

// ==========================================
// COMANDO: Preencher formulário de demanda
// ==========================================
Cypress.Commands.add("preencherFormularioDemanda", (dados) => {
  const {
    cep = '76980-000',
    bairro = 'Centro',
    logradouro = 'Major Amarante',
    numero = '1234',
    complemento = '',
    descricao = 'Descrição de teste para demanda',
    comImagem = true,
  } = dados;

  // Preenche CEP e aguarda busca automática
  cy.getByData('cep-input').clear().type(cep.replace(/\D/g, ''));
  cy.wait(1500); // Aguarda busca do CEP

  // Preenche campos de endereço
  cy.getByData('bairro-input').clear().type(bairro);
  cy.getByData('logradouro-input').clear().type(logradouro);
  cy.getByData('numero-input').clear().type(numero);
  
  if (complemento) {
    cy.getByData('complemento-input').clear().type(complemento);
  }

  // Preenche descrição
  cy.getByData('descricao-textarea').clear().type(descricao);

  // Upload de imagem (se necessário)
  if (comImagem) {
    cy.getByData('image-input').selectFile({
      contents: Cypress.Buffer.from('fake image content for testing'),
      fileName: 'test-image.jpg',
      mimeType: 'image/jpeg',
    }, { force: true });
  }
});

// ==========================================
// COMANDO: Verificar toast
// ==========================================
Cypress.Commands.add("verificarToast", (tipo: 'success' | 'error' | 'warning' | 'info', texto?: string) => {
  const seletoresPorTipo = {
    success: '[data-sonner-toast][data-type="success"], .toast-success, [class*="success"]',
    error: '[data-sonner-toast][data-type="error"], .toast-error, [class*="error"]',
    warning: '[data-sonner-toast][data-type="warning"], .toast-warning, [class*="warning"]',
    info: '[data-sonner-toast][data-type="info"], .toast-info, [class*="info"]',
  };

  if (texto) {
    cy.contains(texto).should('be.visible');
  } else {
    cy.get(seletoresPorTipo[tipo]).should('be.visible');
  }
});

export {};