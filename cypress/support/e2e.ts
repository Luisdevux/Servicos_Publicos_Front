// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// VERIFICAÇÃO DE SEGURANÇA - AMBIENTE QA
// Verifica se o Cypress está apontando para o ambiente QA
// ANTES de qualquer teste rodar

before(() => {
  const baseUrl = Cypress.config('baseUrl') || '';
  const apiUrl = Cypress.env('API_URL') || '';
  
  // URLs devem conter "-qa" ou ser localhost
  const urlSegura = baseUrl.includes('-qa') || 
                    baseUrl.includes('localhost') || 
                    baseUrl.includes('127.0.0.1');
  
  if (!urlSegura) {
    throw new Error(`
      ERRO DE SEGURANÇA: Cypress NÃO está no ambiente QA!
      
      Base URL: ${baseUrl}
      API URL: ${apiUrl}
      
      NUNCA execute testes Cypress em produção!
      
      Configure o cypress.config.ts para usar:
      - baseUrl: https://servicospublicos-qa.app.fslab.dev
      - API_URL: https://servicospublicos-api-qa.app.fslab.dev
    `);
  }
  
  cy.log(`Ambiente QA verificado: ${baseUrl}`);
});