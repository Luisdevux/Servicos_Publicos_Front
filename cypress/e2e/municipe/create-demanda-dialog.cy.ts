/**
 * Testes E2E - Modal CreateDemandaDialog
 * Foco: Fluxos críticos de criação de demanda pelo munícipe
 * 
 * Cobertura:
 * - Abertura e fechamento do modal
 * - Validação de CEP (range Vilhena)
 * - Validação de campos obrigatórios
 * - Upload de imagem
 * - Submissão com sucesso (fluxo completo)
 */

describe('Modal CreateDemandaDialog', () => {
  const FRONTEND_URL = 'https://servicospublicos-qa.app.fslab.dev';
  
  // CEPs para teste
  const CEP_VILHENA_VALIDO = '76982-306';
  const CEP_FORA_VILHENA = '01310-100'; 

  // Dados válidos para criação
  const DADOS_VALIDOS = {
    logradouro: 'Major Amarante',
    numero: '100',
    descricao: 'Teste automático Cypress - Demanda para validação do fluxo completo de criação.',
  };

  before(() => {
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
  });

  beforeEach(() => {
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.interceptSecureFetch('tipoDemanda', 'getTiposDemanda');
    cy.visit(`${FRONTEND_URL}/demanda/coleta`);
    cy.wait('@getTiposDemanda', { timeout: 10000 });
  });

  // CENÁRIOS POSITIVOS

  describe('Cenários Positivos', () => {
    it('deve abrir o modal ao clicar em "Criar demanda"', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('create-demanda-form').should('be.visible');
      cy.getByData('create-demanda-title').should('be.visible');
    });

    it('deve exibir todos os campos obrigatórios no formulário', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      
      // Campos de endereço
      cy.getByData('cep-input').should('exist');
      cy.getByData('bairro-input').should('exist');
      cy.getByData('logradouro-input').should('exist');
      cy.getByData('numero-input').should('exist');
      
      // Campo de descrição
      cy.getByData('descricao-textarea').should('exist');
      
      // Upload de imagem
      cy.getByData('image-input').should('exist');
      
      // Botões
      cy.getByData('submit-button').should('exist');
      cy.getByData('cancel-button').should('exist');
    });

    it('deve preencher endereço automaticamente com CEP válido de Vilhena', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('cep-input').type(CEP_VILHENA_VALIDO);
      
      // Aguardar API do ViaCEP
      cy.wait(2000);
      
      // Bairro deve ser preenchido automaticamente
      cy.getByData('bairro-input').should('not.have.value', '');
    });

    it('deve fazer upload de imagem e exibir preview', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      
      cy.getByData('image-input').selectFile('cypress/fixtures/test-image.png', { force: true });
      cy.wait(500);
      
      // Verificar que imagem foi adicionada (através do preview)
      cy.get('img[alt*="Preview"]').should('exist');
    });

    it('deve fechar o modal ao clicar em cancelar', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('create-demanda-form').should('be.visible');
      
      cy.getByData('cancel-button').click();
      
      cy.getByData('create-demanda-form').should('not.exist');
    });

    it('deve criar demanda com sucesso (fluxo completo)', () => {
      const descricaoUnica = `Teste Cypress - ${Date.now()}`;

      cy.getByData('card-demanda-botao-criar').first().click();
      
      // Preencher CEP e aguardar autocomplete
      cy.getByData('cep-input').type(CEP_VILHENA_VALIDO);
      cy.wait(2000);
      
      // Preencher campos
      cy.getByData('logradouro-input').clear().type(DADOS_VALIDOS.logradouro);
      cy.getByData('numero-input').type(DADOS_VALIDOS.numero);
      cy.getByData('descricao-textarea').type(descricaoUnica);
      
      // Upload de imagem
      cy.getByData('image-input').selectFile('cypress/fixtures/test-image.png', { force: true });
      cy.wait(500);

      // Submeter
      cy.getByData('submit-button').click();
      
      // Verificar toast de sucesso
      cy.verificarToast('success');
      
      // Modal deve fechar após sucesso
      cy.wait(2000);
      cy.getByData('create-demanda-form').should('not.exist');
    });
  });

  // CENÁRIOS NEGATIVOS

  describe('Cenários Negativos', () => {
    it('deve rejeitar CEP fora da região de Vilhena', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('cep-input').type(CEP_FORA_VILHENA);
      
      // Forçar blur para validação
      cy.getByData('bairro-input').click();
      
      // Deve exibir erro de CEP
      cy.contains(/76980-000 a 76999-999|Vilhena/i).should('be.visible');
    });

    it('deve exibir erro para CEP incompleto', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('cep-input').type('7698');
      
      // Submeter para disparar validação
      cy.getByData('submit-button').click();
      
      cy.contains(/8 dígitos|obrigatório/i).should('be.visible');
    });

    it('deve exibir erros ao submeter formulário sem campos obrigatórios', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      cy.getByData('submit-button').click();
      
      // Deve exibir mensagens de erro
      cy.contains(/obrigatório|obrigatória/i).should('exist');
    });

    it('deve exibir erro para descrição muito curta', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      
      // Preencher CEP válido
      cy.getByData('cep-input').type(CEP_VILHENA_VALIDO);
      cy.wait(2000);
      
      cy.getByData('logradouro-input').clear().type(DADOS_VALIDOS.logradouro);
      cy.getByData('numero-input').type(DADOS_VALIDOS.numero);
      
      // Descrição muito curta (menos de 10 caracteres)
      cy.getByData('descricao-textarea').type('Curto');
      
      cy.getByData('submit-button').click();
      
      cy.contains(/10 caracteres|muito curta/i).should('be.visible');
    });

    it('deve exibir erro ao submeter sem imagem', () => {
      cy.getByData('card-demanda-botao-criar').first().click();
      
      // Preencher todos os campos exceto imagem
      cy.getByData('cep-input').type(CEP_VILHENA_VALIDO);
      cy.wait(2000);
      
      cy.getByData('logradouro-input').clear().type(DADOS_VALIDOS.logradouro);
      cy.getByData('numero-input').type(DADOS_VALIDOS.numero);
      cy.getByData('descricao-textarea').type(DADOS_VALIDOS.descricao);
      
      cy.getByData('submit-button').click();
      
      // Deve exigir imagem
      cy.contains(/imagem|obrigatóri/i).should('be.visible');
    });
  });
});
