import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Configurações de timeout para ambiente de produção
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
    // Variáveis de ambiente
    env: {
      API_URL: 'http://localhost:8000',
      FRONTEND_URL: 'http://localhost:3000',
    },
    // Ignorar erros de certificado
    chromeWebSecurity: false,
  },
});
