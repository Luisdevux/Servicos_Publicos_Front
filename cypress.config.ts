import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // AMBIENTE QA - Testes Cypress
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Configurações de timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    // Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    // Retry para testes instáveis
    retries: {
      runMode: 2,
      openMode: 0,
    },
    // Variáveis de ambiente - AMBIENTE QA
    env: {
      API_URL: 'https://servicospublicos-api-qa.app.fslab.dev',
      FRONTEND_URL: 'http://localhost:3000',
    },
    // Ignorar erros de certificado
    chromeWebSecurity: false,
  },
});
