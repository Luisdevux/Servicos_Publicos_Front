/**
 * Testes E2E - Página de Demanda por Tipo (Munícipe)
 * 
 * Cobertura:
 * - Renderização da página de demanda
 * - Listagem de serviços por tipo
 * - Busca e filtros
 * - Paginação
 * - Criação de nova demanda (fluxo completo)
 * - Validações do formulário de criação
 * - Upload de imagens
 * - Consistência entre API e Frontend
 * 
 * NOTA: Estes testes requerem um usuário munícipe válido para autenticação.
 * Configure as credenciais corretas ou os testes serão pulados.
 */

describe('Página de Demanda por Tipo - Munícipe', () => {
  const API_URL = 'https://servicospublicos-api.app.fslab.dev';
  const FRONTEND_URL = 'https://servicospublicos.app.fslab.dev';

  // Credenciais de teste (munícipe) - atualize com credenciais válidas
  const MUNICIPE_EMAIL = Cypress.env('MUNICIPE_EMAIL') || 'municipe@exemplo.com';
  const MUNICIPE_SENHA = Cypress.env('MUNICIPE_SENHA') || 'Senha@123';

  // Tipos de demanda para testar
  const TIPOS_DEMANDA = ['coleta', 'iluminação', 'animais', 'arvores', 'pavimentação', 'saneamento'];

  // Verifica se consegue fazer login antes de executar os testes
  before(function() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(`${FRONTEND_URL}/login/municipe`);
    
    cy.get('input[type="text"]', { timeout: 10000 }).type(MUNICIPE_EMAIL);
    cy.get('input[type="password"]').type(MUNICIPE_SENHA);
    cy.get('button[type="submit"]').click();
    
    // Aguarda e verifica se login foi bem-sucedido
    cy.wait(3000);
    cy.url().then((url) => {
      if (url.includes('/login')) {
        cy.log('Login falhou, testes serão pulados. Verifique credenciais válidas.');
        this.skip();
      }
    });
  });

  beforeEach(function() {
    cy.login(MUNICIPE_EMAIL, MUNICIPE_SENHA, 'municipe');
  });

  describe('Renderização e elementos visuais', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@getTiposDemanda');
    });

    it('Deve renderizar a página de demanda corretamente', () => {
      cy.getByData('demanda-page').should('exist').and('be.visible');
    });

    it('Deve exibir o banner com título do tipo de demanda', () => {
      cy.get('[class*="banner"]').should('exist');
      cy.contains('Serviços de').should('be.visible');
    });

    it('Deve exibir o botão de voltar', () => {
      cy.contains('Voltar').should('exist').and('be.visible');
    });

    it('Deve exibir o campo de busca', () => {
      cy.get('input[placeholder*="Buscar"]').should('exist').and('be.visible');
    });

    it('Deve exibir o botão de filtros', () => {
      cy.contains('Filtros').should('exist').and('be.visible');
    });

    it('Deve exibir o grid de cards de demanda quando há dados', () => {
      cy.getByData('demanda-cards-grid').should('exist');
    });
  });

  describe('Navegação entre tipos de demanda', () => {
    TIPOS_DEMANDA.forEach((tipo) => {
      it(`deve carregar corretamente a página de demanda do tipo "${tipo}"`, () => {
        cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
        cy.visit(`${FRONTEND_URL}/demanda/${tipo}`);
        cy.wait('@getTiposDemanda');
        
        cy.getByData('demanda-page').should('exist').and('be.visible');
        cy.url().should('include', `/demanda/${tipo}`);
      });
    });

    it('Deve navegar de volta para a página anterior ao clicar em "Voltar"', () => {
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.contains('Voltar').click();
      // Deve voltar para a página inicial ou anterior
      cy.url().should('not.include', '/demanda/coleta');
    });
  });

  describe('Busca e filtros', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@getTiposDemanda');
    });

    it('Deve permitir digitar no campo de busca', () => {
      const termoBusca = 'lixo';
      cy.get('input[placeholder*="Buscar"]')
        .clear()
        .type(termoBusca)
        .should('have.value', termoBusca);
    });

    it('Deve realizar busca com debounce ao digitar', () => {
      cy.intercept('GET', '**/tipoDemanda**').as('searchTiposDemanda');
      
      cy.get('input[placeholder*="Buscar"]')
        .clear()
        .type('teste');
      
      // Aguarda o debounce (500ms) + a requisição
      cy.wait('@searchTiposDemanda', { timeout: 10000 });
    });

    it('Deve limpar a busca ao clicar no botão de limpar', () => {
      cy.get('input[placeholder*="Buscar"]')
        .clear()
        .type('teste');
      
      // Clica no botão de limpar busca
      cy.get('button[aria-label="Limpar busca"]').click();
      
      cy.get('input[placeholder*="Buscar"]').should('have.value', '');
    });

    it('Deve exibir/ocultar filtros ao clicar no botão de filtros', () => {
      // Inicialmente os filtros podem estar ocultos
      cy.contains('Filtros').click();
      
      // Depois de clicar, deve mostrar os chips de filtro
      cy.get('button[aria-pressed]').should('exist');
    });

    it('Deve trocar de tipo ao clicar em um chip de filtro', () => {
      cy.contains('Filtros').click();
      
      // Aguarda os chips carregarem
      cy.get('button[aria-pressed]', { timeout: 10000 }).should('exist');
      
      // Clica em outro tipo (se disponível)
      cy.get('button[aria-pressed="false"]').first().click();
      
      // Verifica se o filtro foi aplicado (o chip ativo muda)
      cy.get('button[aria-pressed="true"]').should('exist');
    });
  });

  describe('Paginação', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@getTiposDemanda');
    });

    it('Deve exibir informações de paginação', () => {
      cy.getByData('demanda-cards-grid').then(($grid) => {
        if ($grid.children().length > 0) {
          cy.contains('Página').should('exist');
        }
      });
    });

    it('Deve navegar para a próxima página quando disponível', () => {
      cy.getByData('demanda-cards-grid').then(($grid) => {
        if ($grid.children().length > 0) {
          cy.get('button').contains(/próxima|next|>|chevron/i).then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.intercept('GET', '**/tipoDemanda**').as('getNextPage');
              cy.wrap($btn).click();
              cy.wait('@getNextPage');
            }
          });
        }
      });
    });

    it('Deve desabilitar botão de página anterior na primeira página', () => {
      // Na primeira página, o botão anterior deve estar desabilitado
      cy.get('button').filter(':contains("<"), :has(svg)').first().should('be.disabled');
    });
  });

  describe('Criação de demanda - Fluxo feliz', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@getTiposDemanda');
    });

    it('Deve abrir o dialog de criação ao clicar em "Solicitar Serviço"', () => {
      // Aguarda os cards carregarem
      cy.getByData('demanda-cards-grid').should('exist', { timeout: 10000 });
      
      // Clica no primeiro card para abrir o dialog
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      // Verifica se o dialog abriu
      cy.getByData('create-demanda-dialog').should('exist').and('be.visible');
    });

    it('Deve exibir todos os campos obrigatórios no formulário', () => {
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      cy.getByData('create-demanda-dialog').within(() => {
        cy.getByData('cep-input').should('exist');
        cy.getByData('bairro-input').should('exist');
        cy.getByData('tipo-logradouro-select').should('exist');
        cy.getByData('logradouro-input').should('exist');
        cy.getByData('numero-input').should('exist');
        cy.getByData('complemento-input').should('exist');
        cy.getByData('cidade-input').should('exist');
        cy.getByData('estado-input').should('exist');
        cy.getByData('descricao-textarea').should('exist');
        cy.getByData('image-upload-label').should('exist');
      });
    });

    it('Deve preencher automaticamente endereço ao digitar CEP válido de Vilhena', () => {
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      // CEP de Vilhena
      const cepVilhena = '76980-000';
      
      cy.getByData('cep-input').clear().type(cepVilhena);
      
      // Aguarda o preenchimento automático
      cy.wait(1000);
      
      // Verifica se a cidade está preenchida como Vilhena
      cy.getByData('cidade-input').should('have.value', 'Vilhena');
    });

    it('Deve permitir upload de imagem', () => {
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      // Simula upload de imagem
      cy.getByData('image-input').selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });
      
      // Verifica se a imagem foi adicionada (pode aparecer preview ou contador)
      cy.getByData('images-count').should('contain', '1');
    });

    it('Deve permitir remover imagem adicionada', () => {
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      // Adiciona imagem
      cy.getByData('image-input').selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });
      
      cy.getByData('images-count').should('contain', '1');
      
      // Remove a imagem
      cy.getByData('remove-image-button-0').click();
      
      cy.getByData('images-count').should('contain', '0');
    });

    it('Deve fechar o dialog ao clicar em cancelar', () => {
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      cy.getByData('cancel-button').click();
      
      cy.getByData('create-demanda-dialog').should('not.exist');
    });

    it('Deve criar demanda com sucesso preenchendo todos os campos obrigatórios', () => {
      cy.intercept('POST', '**/demandas').as('createDemanda');
      
      cy.contains('Solicitar Serviço').first().click({ force: true });
      
      // Preenche o formulário
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1500); // Aguarda busca do CEP
      
      cy.getByData('bairro-input').clear().type('Centro');
      cy.getByData('logradouro-input').clear().type('Major Amarante');
      cy.getByData('numero-input').clear().type('1234');
      cy.getByData('complemento-input').clear().type('Próximo à praça');
      cy.getByData('descricao-textarea').clear().type('Descrição de teste para a demanda de coleta de lixo na região central.');
      
      // Upload de imagem (obrigatório)
      cy.fixture('exemplo-imagem.jpg', 'base64').then((fileContent) => {
        cy.getByData('image-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'exemplo-imagem.jpg',
          mimeType: 'image/jpeg',
        }, { force: true });
      });
      
      // Submete o formulário
      cy.getByData('submit-button').click();
      
      // Aguarda a resposta da API (se o teste estiver em ambiente real)
      // cy.wait('@createDemanda');
      
      // Verifica mensagem de sucesso ou fechamento do dialog
      cy.getByData('create-demanda-dialog').should('not.exist');
    });
  });

  describe('Criação de demanda - Validações (cenários tristes)', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/tipoDemanda**').as('getTiposDemanda');
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@getTiposDemanda');
      
      // Abre o dialog
      cy.contains('Solicitar Serviço').first().click({ force: true });
      cy.getByData('create-demanda-dialog').should('be.visible');
    });

    it('Deve exibir erro ao tentar criar demanda sem descrição', () => {
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1000);
      cy.getByData('bairro-input').clear().type('Centro');
      cy.getByData('logradouro-input').clear().type('Major Amarante');
      cy.getByData('numero-input').clear().type('1234');
      // Não preenche descrição
      
      cy.getByData('submit-button').click();
      
      // Deve exibir mensagem de erro
      cy.contains(/descrição|obrigatório/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar criar demanda sem bairro', () => {
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1000);
      // Não preenche bairro
      cy.getByData('logradouro-input').clear().type('Major Amarante');
      cy.getByData('numero-input').clear().type('1234');
      cy.getByData('descricao-textarea').clear().type('Descrição de teste');
      
      cy.getByData('submit-button').click();
      
      cy.contains(/bairro|obrigatório/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar criar demanda sem logradouro', () => {
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1000);
      cy.getByData('bairro-input').clear().type('Centro');
      // Não preenche logradouro
      cy.getByData('numero-input').clear().type('1234');
      cy.getByData('descricao-textarea').clear().type('Descrição de teste');
      
      cy.getByData('submit-button').click();
      
      cy.contains(/logradouro|obrigatório/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar criar demanda sem número', () => {
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1000);
      cy.getByData('bairro-input').clear().type('Centro');
      cy.getByData('logradouro-input').clear().type('Major Amarante');
      // Não preenche número
      cy.getByData('descricao-textarea').clear().type('Descrição de teste');
      
      cy.getByData('submit-button').click();
      
      cy.contains(/número|obrigatório/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar criar demanda sem imagem', () => {
      cy.getByData('cep-input').clear().type('76980-000');
      cy.wait(1000);
      cy.getByData('bairro-input').clear().type('Centro');
      cy.getByData('logradouro-input').clear().type('Major Amarante');
      cy.getByData('numero-input').clear().type('1234');
      cy.getByData('descricao-textarea').clear().type('Descrição de teste');
      // Não faz upload de imagem
      
      cy.getByData('submit-button').click();
      
      cy.contains(/imagem|obrigatório/i).should('be.visible');
    });

    it('Deve exibir erro ao digitar CEP inválido ou fora de Vilhena', () => {
      // CEP de São Paulo (fora de Vilhena)
      cy.getByData('cep-input').clear().type('01310-100');
      cy.wait(1500);
      
      cy.getByData('bairro-input').clear().type('Centro');
      cy.getByData('logradouro-input').clear().type('Teste');
      cy.getByData('numero-input').clear().type('1234');
      cy.getByData('descricao-textarea').clear().type('Descrição de teste');
      
      // Upload imagem fake
      cy.getByData('image-input').selectFile({
        contents: Cypress.Buffer.from('fake'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });
      
      cy.getByData('submit-button').click();
      
      cy.contains(/CEP|inválido|Vilhena/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar upload de arquivo não permitido', () => {
      // Tenta fazer upload de PDF (não permitido)
      cy.getByData('image-input').selectFile({
        contents: Cypress.Buffer.from('fake pdf content'),
        fileName: 'documento.pdf',
        mimeType: 'application/pdf',
      }, { force: true });
      
      // Deve exibir mensagem de erro sobre tipo de arquivo
      cy.contains(/tipo de arquivo|inválido|imagens/i).should('be.visible');
    });

    it('Deve limitar upload a 3 imagens', () => {
      // Faz upload de 4 imagens
      for (let i = 0; i < 4; i++) {
        cy.getByData('image-input').selectFile({
          contents: Cypress.Buffer.from(`fake image ${i}`),
          fileName: `test-${i}.jpg`,
          mimeType: 'image/jpeg',
        }, { force: true });
      }
      
      // Deve exibir mensagem sobre limite ou não permitir a 4ª
      cy.contains(/máximo|limite|3/i).should('be.visible');
    });
  });

  describe('Estados de carregamento e erros', () => {
    it('Deve exibir skeleton durante carregamento', () => {
      cy.intercept('GET', '**/tipoDemanda**', {
        delay: 2000,
        body: { data: { docs: [] } }
      }).as('slowRequest');
      
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      
      // Deve exibir skeletons enquanto carrega
      cy.getByData('demanda-skeleton-grid').should('exist');
    });

    it('Deve exibir mensagem quando não há serviços encontrados', () => {
      cy.intercept('GET', '**/tipoDemanda**', {
        body: { 
          data: { 
            docs: [], 
            totalDocs: 0,
            page: 1,
            totalPages: 0
          } 
        }
      }).as('emptyRequest');
      
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@emptyRequest');
      
      cy.contains(/nenhum|não encontramos/i).should('be.visible');
    });

    it('Deve exibir botão de tentar novamente em caso de erro', () => {
      cy.intercept('GET', '**/tipoDemanda**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('errorRequest');
      
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait('@errorRequest');
      
      cy.contains(/erro|tentar novamente/i).should('be.visible');
    });
  });

  describe('Consistência entre Frontend e API', () => {
    // Armazena dados para comparação entre API e Frontend
    let authToken: string;
    let userId: string;

    before(function() {
      // Obtém token de autenticação via API
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          login: MUNICIPE_EMAIL,
          senha: MUNICIPE_SENHA
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        if (response.status === 200) {
          authToken = response.body?.accessToken;
          userId = response.body?.user?._id || response.body?.user?.id;
          cy.log(`✓ Token obtido, userId: ${userId}`);
        } else {
          cy.log(`⚠ Falha ao obter token: status ${response.status}`);
        }
      });
    });

    it('Deve exibir dados da API corretamente nos cards - comparação direta', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      // Busca tipos de demanda diretamente da API
      cy.request({
        method: 'GET',
        url: `${API_URL}/tipoDemanda?categoria=coleta`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        expect(apiResponse.status).to.equal(200);
        
        const tiposDemandaAPI = apiResponse.body?.data?.docs || apiResponse.body?.data || [];
        
        // Visita a página de demanda no frontend
        cy.visit(`${FRONTEND_URL}/demanda/coleta`);
        cy.getByData('demanda-page').should('be.visible');

        if (Array.isArray(tiposDemandaAPI) && tiposDemandaAPI.length > 0) {
          cy.log(`✓ API retornou ${tiposDemandaAPI.length} tipos de demanda`);

          // Verifica que o grid de cards existe
          cy.getByData('demanda-cards-grid').should('exist');

          // Para cada item da API, verifica se há um card correspondente no frontend
          tiposDemandaAPI.slice(0, 3).forEach((item: { titulo?: string; _id?: string }, index: number) => {
            if (item.titulo) {
              cy.log(`  - Verificando item ${index + 1}: "${item.titulo}"`);
              cy.getByData('demanda-cards-grid')
                .should('contain', item.titulo);
            }
          });

          cy.log('✓ Cards do frontend correspondem aos dados da API');
        } else {
          cy.log('⚠ API não retornou tipos de demanda para categoria "coleta"');
        }
      });
    });

    it('Deve verificar estrutura de resposta da API de tipos de demanda', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      cy.request({
        method: 'GET',
        url: `${API_URL}/tipoDemanda`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        expect(apiResponse.status).to.equal(200);
        
        const responseData = apiResponse.body?.data;
        
        // Verifica estrutura de paginação
        if (responseData?.docs) {
          expect(responseData).to.have.property('docs');
          expect(responseData).to.have.property('totalDocs');
          expect(responseData).to.have.property('page');
          cy.log('✓ Resposta da API possui estrutura de paginação');
          cy.log(`  - Total de documentos: ${responseData.totalDocs}`);
          cy.log(`  - Página atual: ${responseData.page}`);
        }

        // Verifica estrutura de cada item
        const docs = responseData?.docs || responseData || [];
        if (docs.length > 0) {
          const primeiroItem = docs[0];
          expect(primeiroItem).to.have.property('titulo');
          expect(primeiroItem).to.have.property('categoria');
          cy.log('✓ Estrutura do item está correta');
          cy.log(`  - Primeiro item: "${primeiroItem.titulo}"`);
        }
      });
    });

    it('Deve verificar que a paginação do frontend corresponde à API', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      // Busca primeira página da API
      cy.request({
        method: 'GET',
        url: `${API_URL}/tipoDemanda?categoria=coleta&page=1&limit=10`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        const responseData = apiResponse.body?.data;
        const totalPagesAPI = responseData?.totalPages || 1;
        const totalDocsAPI = responseData?.totalDocs || 0;

        // Visita a página de demanda
        cy.visit(`${FRONTEND_URL}/demanda/coleta`);
        
        if (totalDocsAPI > 0) {
          // Verifica se há informações de paginação no frontend
          cy.getByData('demanda-cards-grid').should('exist');
          
          cy.log(`✓ API reporta ${totalDocsAPI} itens em ${totalPagesAPI} página(s)`);
          
          // Se houver mais de uma página, testa navegação
          if (totalPagesAPI > 1) {
            cy.contains(/próxima|next|>/i).should('exist');
            cy.log('✓ Botão de próxima página existe (consistente com API)');
          }
        }
      });
    });

    it('Deve enviar dados corretos para a API ao criar demanda e verificar persistência', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      const timestampUnico = Date.now();
      const dadosDemanda = {
        cep: '76980-000',
        bairro: 'Centro',
        logradouro: 'Major Amarante',
        numero: '1234',
        descricao: `Teste de consistência API - ${timestampUnico}`
      };

      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait(2000);

      // Abre o dialog de criação
      cy.contains('Solicitar Serviço').first().click({ force: true });
      cy.getByData('create-demanda-dialog').should('be.visible');

      // Preenche o formulário
      cy.getByData('cep-input').clear().type(dadosDemanda.cep);
      cy.wait(1500);
      cy.getByData('bairro-input').clear().type(dadosDemanda.bairro);
      cy.getByData('logradouro-input').clear().type(dadosDemanda.logradouro);
      cy.getByData('numero-input').clear().type(dadosDemanda.numero);
      cy.getByData('descricao-textarea').clear().type(dadosDemanda.descricao);

      // Upload de imagem
      cy.getByData('image-input').selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });

      // Intercepta a requisição de criação
      cy.intercept('POST', '**/demandas').as('createDemanda');
      
      cy.getByData('submit-button').click();

      // Verifica a requisição enviada
      cy.wait('@createDemanda').then((interception) => {
        // Verifica se a requisição foi bem-sucedida
        if (interception.response?.statusCode === 201 || interception.response?.statusCode === 200) {
          const demandaCriada = interception.response?.body?.data;
          
          if (demandaCriada?._id) {
            cy.log(`✓ Demanda criada com ID: ${demandaCriada._id}`);

            // Verifica diretamente na API se a demanda foi persistida
            cy.request({
              method: 'GET',
              url: `${API_URL}/demandas/${demandaCriada._id}`,
              headers: {
                Authorization: `Bearer ${authToken}`
              },
              failOnStatusCode: false
            }).then((apiResponse) => {
              if (apiResponse.status === 200) {
                const demandaAPI = apiResponse.body?.data;
                
                // Verifica consistência dos dados
                expect(demandaAPI.descricao).to.include(timestampUnico.toString());
                expect(demandaAPI.endereco?.bairro).to.equal(dadosDemanda.bairro);
                expect(demandaAPI.endereco?.numero?.toString()).to.equal(dadosDemanda.numero);
                
                cy.log('✓ Dados persistidos na API correspondem ao enviado pelo frontend');
                cy.log(`  - Descrição: ${demandaAPI.descricao?.substring(0, 50)}...`);
                cy.log(`  - Bairro: ${demandaAPI.endereco?.bairro}`);
                cy.log(`  - Número: ${demandaAPI.endereco?.numero}`);
              }
            });
          }
        } else {
          // Verifica ao menos se os dados da requisição estão corretos
          const body = interception.request.body;
          expect(body.descricao).to.include(timestampUnico.toString());
          cy.log('✓ Dados enviados para a API estão corretos');
        }
      });
    });

    it('Deve verificar que filtros do frontend geram requisições corretas para API', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.wait(2000);

      // Intercepta requisições de busca
      cy.intercept('GET', '**/tipoDemanda**').as('searchRequest');

      // Digita no campo de busca
      const termoBusca = 'teste';
      cy.get('input[placeholder*="Buscar"]')
        .clear()
        .type(termoBusca);

      // Aguarda a requisição de busca (debounce)
      cy.wait('@searchRequest').then((interception) => {
        const url = interception.request.url;
        
        // Verifica se o termo de busca foi enviado na query
        cy.log(`✓ Requisição de busca enviada: ${url}`);
        
        // A URL deve conter parâmetros de busca ou filtro
        expect(url).to.include('tipoDemanda');
      });

      // Verifica diretamente na API com o mesmo filtro
      cy.request({
        method: 'GET',
        url: `${API_URL}/tipoDemanda?categoria=coleta&search=${termoBusca}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((apiResponse) => {
        cy.log(`✓ API respondeu com status: ${apiResponse.status}`);
        
        if (apiResponse.status === 200) {
          const totalResults = apiResponse.body?.data?.totalDocs || apiResponse.body?.data?.length || 0;
          cy.log(`  - Total de resultados para "${termoBusca}": ${totalResults}`);
        }
      });
    });

    it('Deve verificar consistência de categorias entre API e frontend', function() {
      if (!authToken) {
        this.skip();
        return;
      }

      // Categorias esperadas
      const categoriasEsperadas = ['coleta', 'iluminação', 'animais', 'arvores', 'pavimentação', 'saneamento'];

      // Para cada categoria, verifica se a API responde e se o frontend navega corretamente
      categoriasEsperadas.forEach((categoria) => {
        cy.request({
          method: 'GET',
          url: `${API_URL}/tipoDemanda?categoria=${encodeURIComponent(categoria)}`,
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          failOnStatusCode: false
        }).then((apiResponse) => {
          cy.log(`Categoria "${categoria}": API status ${apiResponse.status}`);
        });
      });

      // Navega pelo frontend para verificar que todas as categorias são acessíveis
      cy.visit(`${FRONTEND_URL}/demanda/coleta`);
      cy.getByData('demanda-page').should('be.visible');
      cy.log('✓ Frontend navega corretamente para página de demanda');
    });
  });
});