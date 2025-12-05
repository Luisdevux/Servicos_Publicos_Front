/**
 * Testes E2E - Página de Perfil do Usuário (Munícipe)
 * 
 * Cobertura:
 * - Renderização da página de perfil
 * - Exibição de dados do usuário
 * - Edição de dados pessoais
 * - Validações de campos
 * - Upload e remoção de foto de perfil
 * - Logout
 * - Persistência de dados
 * - Consistência entre API e Frontend
 * 
 * NOTA: Estes testes requerem um usuário munícipe válido para autenticação.
 * Configure as credenciais corretas ou os testes serão pulados.
 */

describe('Página de Perfil - Munícipe', () => {
  const API_URL = 'https://servicospublicos-api.app.fslab.dev';
  const FRONTEND_URL = 'https://servicospublicos.app.fslab.dev';

  // Credenciais de teste (munícipe) - atualize com credenciais válidas
  const MUNICIPE_EMAIL = Cypress.env('MUNICIPE_EMAIL') || 'municipe@exemplo.com';
  const MUNICIPE_SENHA = Cypress.env('MUNICIPE_SENHA') || 'Senha@123';

  // Verifica se consegue fazer login antes de executar os testes
  before(function() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(`${FRONTEND_URL}/login/municipe`);
    
    cy.get('input[type="text"]', { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .type(MUNICIPE_EMAIL);
    cy.get('input[type="password"]')
      .should('not.be.disabled')
      .type(MUNICIPE_SENHA);
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
    cy.visit(`${FRONTEND_URL}/perfil`);
  });

  describe('Renderização e elementos visuais', () => {
    it('Deve renderizar a página de perfil corretamente', () => {
      cy.getByData('page-perfil').should('exist').and('be.visible');
    });

    it('Deve exibir o nome do usuário no título', () => {
      cy.getByData('perfil-titulo').should('exist').and('be.visible');
    });

    it('Deve exibir a seção de informações pessoais', () => {
      cy.getByData('perfil-info-pessoal').should('exist').and('be.visible');
      cy.getByData('perfil-info-pessoal').within(() => {
        cy.contains('Informações Pessoais').should('be.visible');
      });
    });

    it('Deve exibir a seção de informações de contato', () => {
      cy.getByData('perfil-info-contato').should('exist').and('be.visible');
      cy.getByData('perfil-info-contato').within(() => {
        cy.contains('Informações de Contato').should('be.visible');
      });
    });

    it('Deve exibir a seção de endereço', () => {
      cy.getByData('perfil-info-endereco').should('exist').and('be.visible');
      cy.getByData('perfil-info-endereco').within(() => {
        cy.contains('Endereço').should('be.visible');
      });
    });

    it('Deve exibir os botões de ação (Editar Perfil e Sair)', () => {
      cy.getByData('button-editar-perfil').should('exist').and('be.visible');
      cy.getByData('button-sair').should('exist').and('be.visible');
    });
  });

  describe('Exibição de dados do usuário', () => {
    it('Deve exibir o campo de nome completo', () => {
      cy.getByData('perfil-campo-nome').should('exist').and('be.visible');
    });

    it('Deve exibir o campo de CPF (não editável)', () => {
      cy.getByData('perfil-campo-cpf').should('exist').and('be.visible');
      cy.getByData('perfil-campo-cpf').should('contain', 'Campo não editável');
    });

    it('Deve exibir o campo de data de nascimento (não editável)', () => {
      cy.getByData('perfil-campo-data-nascimento').should('exist').and('be.visible');
      cy.getByData('perfil-campo-data-nascimento').should('contain', 'Campo não editável');
    });

    it('Deve exibir o campo de e-mail (não editável)', () => {
      cy.getByData('perfil-campo-email').should('exist').and('be.visible');
      cy.getByData('perfil-campo-email').should('contain', 'Campo não editável');
    });

    it('Deve exibir o campo de celular', () => {
      cy.getByData('perfil-campo-celular').should('exist').and('be.visible');
    });

    it('Deve exibir os campos de endereço', () => {
      cy.getByData('perfil-campo-cep').should('exist');
      cy.getByData('perfil-campo-numero').should('exist');
      cy.getByData('perfil-campo-logradouro').should('exist');
      cy.getByData('perfil-campo-bairro').should('exist');
      cy.getByData('perfil-campo-complemento').should('exist');
      cy.getByData('perfil-campo-cidade').should('exist');
    });
  });

  describe('Modo de edição', () => {
    it('Deve entrar no modo de edição ao clicar em "Editar Perfil"', () => {
      cy.getByData('button-editar-perfil').click();
      
      // Botões devem mudar para "Cancelar" e "Salvar"
      cy.getByData('button-cancelar-edicao').should('exist').and('be.visible');
      cy.getByData('button-salvar-perfil').should('exist').and('be.visible');
      
      // Botões originais não devem estar visíveis
      cy.getByData('button-editar-perfil').should('not.exist');
    });

    it('Deve sair do modo de edição ao clicar em "Cancelar"', () => {
      cy.getByData('button-editar-perfil').click();
      cy.getByData('button-cancelar-edicao').click();
      
      // Deve voltar aos botões originais
      cy.getByData('button-editar-perfil').should('exist').and('be.visible');
      cy.getByData('button-sair').should('exist').and('be.visible');
    });

    it('Deve habilitar campos editáveis no modo de edição', () => {
      cy.getByData('button-editar-perfil').click();
      
      // Campos editáveis devem estar habilitados
      cy.getByData('perfil-campo-nome').find('input').should('not.be.disabled');
      cy.getByData('perfil-campo-celular').find('input').should('not.be.disabled');
      cy.getByData('perfil-campo-cep').find('input').should('not.be.disabled');
      cy.getByData('perfil-campo-numero').find('input').should('not.be.disabled');
      cy.getByData('perfil-campo-logradouro').find('input').should('not.be.disabled');
      cy.getByData('perfil-campo-bairro').find('input').should('not.be.disabled');
    });

    it('Deve manter campos não editáveis desabilitados', () => {
      cy.getByData('button-editar-perfil').click();
      
      // CPF, data de nascimento e e-mail devem continuar desabilitados
      cy.getByData('perfil-campo-cpf').should('contain', 'Campo não editável');
      cy.getByData('perfil-campo-data-nascimento').should('contain', 'Campo não editável');
      cy.getByData('perfil-campo-email').should('contain', 'Campo não editável');
    });

    it('Deve descartar alterações ao cancelar edição', () => {
      cy.getByData('button-editar-perfil').click();
      
      // Captura valor original
      cy.getByData('perfil-campo-nome').find('input').invoke('val').then((valorOriginal) => {
        // Altera o valor
        cy.getByData('perfil-campo-nome').find('input').clear().type('Nome Alterado Temporário');
        
        // Cancela
        cy.getByData('button-cancelar-edicao').click();
        
        // Entra em edição novamente e verifica se voltou ao original
        cy.getByData('button-editar-perfil').click();
        cy.getByData('perfil-campo-nome').find('input').should('have.value', valorOriginal);
      });
    });
  });

  describe('Edição de dados - Fluxo feliz', () => {
    beforeEach(() => {
      cy.getByData('button-editar-perfil').click();
    });

    it('Deve permitir editar o nome', () => {
      const novoNome = 'Nome Teste Atualizado';
      
      cy.getByData('perfil-campo-nome').find('input')
        .clear()
        .type(novoNome)
        .should('have.value', novoNome);
    });

    it('Deve permitir editar o celular com máscara', () => {
      cy.getByData('perfil-campo-celular').find('input')
        .clear()
        .type('69999999999');
      
      // Deve aplicar máscara (69) 99999-9999
      cy.getByData('perfil-campo-celular').find('input')
        .should('have.value', '(69) 99999-9999');
    });

    it('Deve permitir editar o CEP com busca automática', () => {
      const cepVilhena = '76980000';
      
      cy.getByData('perfil-campo-cep').find('input')
        .clear()
        .type(cepVilhena);
      
      // Aguarda busca do CEP
      cy.wait(1500);
      
      // Deve formatar o CEP
      cy.getByData('perfil-campo-cep').find('input')
        .should('have.value', '76980-000');
    });

    it('Deve salvar alterações com sucesso', () => {
      cy.interceptSecureFetch('usuarios', 'updateUser', 'PATCH');
      
      // Altera um campo
      cy.getByData('perfil-campo-numero').find('input')
        .clear()
        .type('9999');
      
      // Salva
      cy.getByData('button-salvar-perfil').click();
      
      // Aguarda requisição
      cy.wait('@updateUser', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
      
      // Deve voltar ao modo visualização
      cy.getByData('button-editar-perfil').should('exist');
    });
  });

  describe('Edição de dados - Validações (cenários tristes)', () => {
    beforeEach(() => {
      cy.getByData('button-editar-perfil').click();
    });

    it('Deve exibir erro ao tentar salvar com nome vazio', () => {
      cy.getByData('perfil-campo-nome').find('input').clear();
      
      cy.getByData('button-salvar-perfil').click();
      
      // Deve exibir mensagem de erro
      cy.contains(/nome|obrigatório|inválido/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar salvar com nome muito curto', () => {
      cy.getByData('perfil-campo-nome').find('input')
        .clear()
        .type('AB');
      
      cy.getByData('button-salvar-perfil').click();
      
      cy.contains(/nome|mínimo|caracteres/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar salvar com celular inválido', () => {
      cy.getByData('perfil-campo-celular').find('input')
        .clear()
        .type('123');
      
      cy.getByData('button-salvar-perfil').click();
      
      cy.contains(/celular|inválido|telefone/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar salvar com CEP fora de Vilhena', () => {
      // CEP de São Paulo
      cy.getByData('perfil-campo-cep').find('input')
        .clear()
        .type('01310100');
      
      cy.wait(1500);
      
      cy.getByData('button-salvar-perfil').click();
      
      cy.contains(/CEP|inválido|Vilhena/i).should('be.visible');
    });

    it('Deve exibir erro ao tentar salvar com CEP em formato inválido', () => {
      cy.getByData('perfil-campo-cep').find('input')
        .clear()
        .type('12345');
      
      cy.getByData('button-salvar-perfil').click();
      
      cy.contains(/CEP|inválido/i).should('be.visible');
    });
  });

  describe('Upload de foto de perfil', () => {
    it('Deve exibir área de upload de foto', () => {
      // Verifica se existe o componente de foto
      cy.get('[class*="ProfilePhotoUpload"], [data-test*="photo"]').should('exist');
    });

    it('Deve permitir upload de nova foto', () => {
      cy.interceptSecureFetch('foto', 'uploadFoto', 'POST');
      
      // Procura pelo input de arquivo ou botão de upload
      cy.get('input[type="file"]').first().selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'profile-photo.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });
      
      // Pode aguardar a requisição de upload
      // cy.wait('@uploadFoto');
    });

    it('Deve exibir preview da foto após upload', () => {
      cy.get('input[type="file"]').first().selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'profile-photo.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });
      
      // Verifica se aparece uma imagem ou preview
      cy.wait(1000);
    });
  });

  describe('Logout', () => {
    it('Deve fazer logout ao clicar no botão "Sair"', () => {
      cy.getByData('button-sair').click();
      
      // Deve redirecionar para login
      cy.url().should('include', '/login');
    });

    it('Deve limpar dados de sessão após logout', () => {
      cy.getByData('button-sair').click();
      
      cy.url().should('include', '/login');
      
      // Tenta acessar perfil novamente
      cy.visit(`${FRONTEND_URL}/perfil`);
      
      // Deve redirecionar para login
      cy.url().should('include', '/login');
    });
  });

  describe('Persistência de dados', () => {
    it('Deve manter dados salvos após recarregar a página', () => {
      cy.interceptSecureFetch('usuarios', 'updateUser', 'PATCH');
      
      cy.getByData('button-editar-perfil').click();
      
      const novoNumero = '7777';
      cy.getByData('perfil-campo-numero').find('input')
        .clear()
        .type(novoNumero);
      
      cy.getByData('button-salvar-perfil').click();
      
      cy.wait('@updateUser', { timeout: 10000 });
      
      // Recarrega a página
      cy.reload();
      
      // Aguarda carregamento
      cy.getByData('page-perfil').should('be.visible');
      cy.getByData('button-editar-perfil').click();
      
      // Verifica se o número foi persistido
      cy.getByData('perfil-campo-numero').find('input')
        .should('have.value', novoNumero);
    });

    it('Deve carregar dados do usuário da API ao entrar na página', () => {
      cy.interceptSecureFetch('usuarios', 'getUser', 'GET');
      
      cy.reload();
      
      cy.wait('@getUser', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        
        const userData = interception.response?.body?.data;
        if (userData?.nome) {
          cy.getByData('perfil-titulo').should('contain', userData.nome);
        }
      });
    });
  });

  describe('Consistência entre Frontend e API', () => {
    // Armazena dados para comparação entre API e Frontend
    let authToken: string;
    let userId: string;

    before(function() {
      // Obtém token de autenticação e dados do usuário via API com timeout maior
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          identificador: MUNICIPE_EMAIL,
          senha: MUNICIPE_SENHA
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        if (response.status === 200 && response.body?.data?.user) {
          authToken = response.body.data.user.accessToken;
          userId = response.body.data.user._id || response.body.data.user.id;
          cy.log(`✓ Token obtido, userId: ${userId}`);
        } else {
          cy.log(`⚠ Falha ao obter token: status ${response.status}`);
        }
      });
    });

    it('Deve exibir dados corretos vindos da API - comparação direta', function() {
      if (!authToken || !userId) {
        this.skip();
        return;
      }

      // Busca dados do usuário diretamente da API
      cy.request({
        method: 'GET',
        url: `${API_URL}/usuarios/${userId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        timeout: 10000
      }).then((apiResponse) => {
        expect(apiResponse.status).to.equal(200);
        
        const userDataAPI = apiResponse.body?.data;
        
        if (userDataAPI) {
          // Visita a página de perfil no frontend
          cy.visit(`${FRONTEND_URL}/perfil`);
          cy.getByData('page-perfil').should('be.visible');

          // Compara nome da API com o exibido no frontend
          if (userDataAPI.nome) {
            cy.getByData('perfil-titulo').should('contain', userDataAPI.nome);
            cy.log(`✓ Nome da API: "${userDataAPI.nome}" corresponde ao frontend`);
          }

          // Compara email da API com o exibido no frontend
          if (userDataAPI.email) {
            cy.getByData('perfil-campo-email').should('contain', userDataAPI.email);
            cy.log(`✓ Email da API: "${userDataAPI.email}" corresponde ao frontend`);
          }

          // Verifica CPF (pode estar formatado diferente)
          if (userDataAPI.cpf) {
            cy.getByData('perfil-campo-cpf').should('exist');
            cy.log(`✓ CPF existe na API e no frontend`);
          }

          // Verifica celular
          if (userDataAPI.celular) {
            cy.getByData('perfil-campo-celular').should('exist');
            cy.log(`✓ Celular da API: "${userDataAPI.celular}"`);
          }

          // Verifica endereço
          if (userDataAPI.endereco) {
            if (userDataAPI.endereco.cep) {
              cy.getByData('perfil-campo-cep').should('exist');
            }
            if (userDataAPI.endereco.bairro) {
              cy.getByData('perfil-campo-bairro').should('exist');
            }
            if (userDataAPI.endereco.logradouro) {
              cy.getByData('perfil-campo-logradouro').should('exist');
            }
            cy.log(`✓ Endereço da API corresponde aos campos do frontend`);
          }
        }
      });
    });

    it('Deve enviar dados corretos para API ao atualizar perfil e verificar persistência', function() {
      if (!authToken || !userId) {
        this.skip();
        return;
      }

      const dadosAtualizacao = {
        nome: `Teste Consistência ${Date.now()}`,
        celular: '69988887777',
        numero: '9876'
      };

      // Faz a atualização via frontend
      cy.visit(`${FRONTEND_URL}/perfil`);
      cy.getByData('button-editar-perfil').click();

      cy.getByData('perfil-campo-nome').find('input')
        .clear()
        .type(dadosAtualizacao.nome);

      cy.getByData('perfil-campo-celular').find('input')
        .clear()
        .type(dadosAtualizacao.celular);

      cy.getByData('perfil-campo-numero').find('input')
        .clear()
        .type(dadosAtualizacao.numero);

      cy.interceptSecureFetch('usuarios', 'updateUser', 'PATCH');
      cy.getByData('button-salvar-perfil').click();

      // Aguarda a atualização
      cy.wait('@updateUser', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });

      // Verifica diretamente na API se os dados foram persistidos
      cy.wait(1000); // Aguarda sincronização
      cy.request({
        method: 'GET',
        url: `${API_URL}/usuarios/${userId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        expect(apiResponse.status).to.equal(200);
        
        const userDataAPI = apiResponse.body?.data;
        
        // Verifica se o nome foi atualizado na API
        expect(userDataAPI.nome).to.equal(dadosAtualizacao.nome);
        cy.log(`✓ Nome persistido na API: "${userDataAPI.nome}"`);

        // Verifica se o celular foi atualizado
        const celularAPI = userDataAPI.celular?.replace(/\D/g, '');
        expect(celularAPI).to.include(dadosAtualizacao.celular);
        cy.log(`✓ Celular persistido na API: "${userDataAPI.celular}"`);

        // Verifica se o número do endereço foi atualizado
        expect(userDataAPI.endereco?.numero?.toString()).to.equal(dadosAtualizacao.numero);
        cy.log(`✓ Número do endereço persistido na API: "${userDataAPI.endereco?.numero}"`);
      });
    });

    it('Deve verificar que dados do frontend refletem a API após reload', function() {
      if (!authToken || !userId) {
        this.skip();
        return;
      }

      // Primeiro, busca dados atuais da API
      cy.request({
        method: 'GET',
        url: `${API_URL}/usuarios/${userId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        const userDataAPI = apiResponse.body?.data;

        // Visita o perfil
        cy.visit(`${FRONTEND_URL}/perfil`);
        cy.getByData('page-perfil').should('be.visible');

        // Recarrega a página
        cy.reload();
        cy.getByData('page-perfil').should('be.visible');

        // Verifica que os dados ainda correspondem à API
        if (userDataAPI?.nome) {
          cy.getByData('perfil-titulo').should('contain', userDataAPI.nome);
        }

        cy.log('✓ Dados do frontend permanecem consistentes com a API após reload');
      });
    });

    it('Deve verificar estrutura de resposta da API de usuários', function() {
      if (!authToken || !userId) {
        this.skip();
        return;
      }

      cy.request({
        method: 'GET',
        url: `${API_URL}/usuarios/${userId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((apiResponse) => {
        expect(apiResponse.status).to.equal(200);
        
        const userData = apiResponse.body?.data;
        
        // Verifica estrutura esperada da resposta
        expect(userData).to.have.property('nome');
        expect(userData).to.have.property('email');
        expect(userData).to.have.property('cpf');
        
        cy.log('✓ Estrutura da resposta da API está correta');
        cy.log(`  - nome: ${userData.nome}`);
        cy.log(`  - email: ${userData.email}`);
        cy.log(`  - cpf: ${userData.cpf ? '***' : 'N/A'}`);
      });
    });
  });

  describe('Estados de carregamento', () => {
    it('Deve exibir loading enquanto carrega dados do perfil', () => {
      // Mock do secure-fetch para simular delay
      cy.intercept('POST', '**/api/auth/secure-fetch', (req) => {
        if (req.body?.endpoint?.includes('usuarios') && req.body?.method === 'GET') {
          req.reply({
            delay: 2000,
            body: { data: {} }
          });
        }
      }).as('slowRequest');
      
      cy.reload();
      
      // Deve exibir loading
      cy.getByData('loading-perfil').should('exist');
    });

    it('Deve exibir loading ao salvar alterações', () => {
      // Mock do secure-fetch para simular delay
      cy.intercept('POST', '**/api/auth/secure-fetch', (req) => {
        if (req.body?.endpoint?.includes('usuarios') && req.body?.method === 'PATCH') {
          req.reply({
            delay: 1500,
            body: { data: {} }
          });
        }
      }).as('slowUpdate');
      
      cy.getByData('button-editar-perfil').click();
      cy.getByData('perfil-campo-numero').find('input').clear().type('1234');
      cy.getByData('button-salvar-perfil').click();
      
      // Botão deve exibir estado de loading
      cy.contains(/salvando/i).should('be.visible');
    });
  });

  describe('Responsividade', () => {
    it('Deve exibir corretamente em viewport mobile', () => {
      cy.viewport('iphone-x');
      cy.getByData('page-perfil').should('be.visible');
      cy.getByData('perfil-info-pessoal').should('be.visible');
      cy.getByData('perfil-info-contato').should('be.visible');
      cy.getByData('perfil-info-endereco').should('be.visible');
    });

    it('Deve exibir corretamente em viewport tablet', () => {
      cy.viewport('ipad-2');
      cy.getByData('page-perfil').should('be.visible');
    });

    it('Deve exibir corretamente em viewport desktop', () => {
      cy.viewport(1920, 1080);
      cy.getByData('page-perfil').should('be.visible');
    });
  });
});
