describe('Fluxo de testes da pagina de operador', () => {
  
  beforeEach(() => {
    cy.login('operadorfixo@exemplo.com', 'Senha@123', 'funcionario');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Deve fazer login com sucesso e carregar as demandas cadastradas na secretaria do usuario (por status em andamento e concluida)', () => {
    // Verificar elementos da página
    cy.getByData('indicador-secretarias-container').should('be.visible');
    cy.getByData('abas-status').should('be.visible');
    
    // Verificar abas de status
    cy.getByData('aba-aguardando-resolucao').should('be.visible');
    cy.getByData('aba-concluidas').should('be.visible');
    
    // Verificar se há demandas ou mensagem de vazio
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').should('be.visible');
        cy.getByData('botao-analisar-demanda').should('be.visible');
      } else {
        cy.contains('Nenhum pedido encontrado').should('be.visible');
      }
    });
  });

  it('Deve visualizar completamente a demanda selecionada', () => {
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('botao-analisar-demanda').first().should('be.visible').click();
        cy.wait(500);
        
        // Verificar modal de detalhes
        cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
        
        // Verificar botões de ação
        cy.getByData('botao-resolver-demanda').should('be.visible');
        cy.getByData('botao-devolver-demanda').should('be.visible');
        
        // Fechar modal
        cy.get('body').type('{esc}');
        cy.wait(300);
        cy.getByData('modal-detalhes-demanda-operador').should('not.exist');
      }
    });
  });

  it('Deve resolver uma demanda', () => {
    // Criar uma demanda para resolver
    cy.logout();
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.getByData('card-servico-coleta').click();
    cy.wait(10000);
    cy.getByData('card-demanda-botao-criar').first().click();
    cy.getByData('cep-input').type('76980008');
    cy.getByData('numero-input').type('371');
    cy.getByData('descricao-textarea').type('Demanda para teste de resolução pelo operador');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.wait(1000);
    cy.getByData('submit-button').click();
    cy.contains('Demanda criada com sucesso', { timeout: 15000 }).should('be.visible');
    cy.wait(2000);
    cy.logout();

    // Atribuir ao operador como secretário
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);
    cy.getByData('aba-em-aberto').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().click();
    cy.getByData('botao-analisar-demanda').first().click();
    cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
    cy.getByData('botao-confirmar-demanda').click();
    cy.getByData('modal-atribuir-operador').should('be.visible');
    cy.wait(500);
    cy.get('button[role="combobox"]').click();
    cy.get('div[role="option"]').contains('Operador Fixo').click();
    cy.getByData('botao-confirmar-atribuicao').click();
    cy.contains('Demanda atribuída com sucesso').should('be.visible');
    cy.wait(2000);
    cy.logout();

    // Resolver como operador
    cy.login('operadorfixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().click();
    cy.getByData('botao-analisar-demanda').first().click();
    cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
    cy.getByData('botao-resolver-demanda').click();
    
    // Preencher modal de resolução
    cy.getByData('modal-resolver-demanda').should('be.visible');
    cy.getByData('textarea-descricao-resolucao').type('Demanda resolvida com sucesso. Problema corrigido.');
    cy.getByData('input-upload-imagens-resolucao').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.wait(1000);
    cy.getByData('botao-confirmar-resolucao').should('not.be.disabled').click();
    cy.contains('Demanda resolvida com sucesso', { timeout: 15000 }).should('be.visible');
  });

  it('Deve devolver uma demanda para a secretaria', () => {
    // Criar e atribuir demanda
    cy.logout();
    cy.login('municipe@exemplo.com', 'Senha@123', 'municipe');
    cy.getByData('card-servico-coleta').click();
    cy.wait(10000);
    cy.getByData('card-demanda-botao-criar').first().click();
    cy.getByData('cep-input').type('76980008');
    cy.getByData('numero-input').type('371');
    cy.getByData('descricao-textarea').type('Demanda para teste de devolução');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.wait(1000);
    cy.getByData('submit-button').click();
    cy.contains('Demanda criada com sucesso', { timeout: 15000 }).should('be.visible');
    cy.wait(2000);
    cy.logout();

    // Atribuir ao operador
    cy.login('secretariofixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);
    cy.getByData('aba-em-aberto').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().click();
    cy.getByData('botao-analisar-demanda').first().click();
    cy.getByData('modal-detalhes-demanda-secretaria').should('be.visible');
    cy.getByData('botao-confirmar-demanda').click();
    cy.getByData('modal-atribuir-operador').should('be.visible');
    cy.wait(500);
    cy.get('button[role="combobox"]').click();
    cy.get('div[role="option"]').contains('Operador Fixo').click();
    cy.getByData('botao-confirmar-atribuicao').click();
    cy.contains('Demanda atribuída com sucesso').should('be.visible');
    cy.wait(2000);
    cy.logout();

    // Devolver como operador
    cy.login('operadorfixo@exemplo.com', 'Senha@123', 'funcionario');
    cy.wait(1000);
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    cy.getByData('card-demanda').first().click();
    cy.getByData('botao-analisar-demanda').first().click();
    cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
    cy.getByData('botao-devolver-demanda').click();
    
    // Preencher modal de devolução
    cy.getByData('modal-devolver-demanda').should('be.visible');
    cy.getByData('textarea-motivo-devolucao').type('Não tenho equipamento adequado para resolver este problema.');
    cy.getByData('botao-confirmar-devolucao').should('not.be.disabled').click();
    cy.contains('Demanda devolvida', { timeout: 15000 }).should('be.visible');
  });

  it('Deve alternar entre abas de status corretamente', () => {
    const abas = [
      { dataTest: 'aba-aguardando-resolucao', nome: 'Aguardando Resolução' },
      { dataTest: 'aba-concluidas', nome: 'Concluídas' }
    ];

    abas.forEach(aba => {
      cy.getByData(aba.dataTest).should('be.visible').click();
      cy.wait(500);
      
      // Verificar se a aba está ativa visualmente
      cy.getByData(aba.dataTest).should('have.class', 'border-[#337695]');
    });
  });

  it('Deve filtrar demandas por tipo corretamente', () => {
    cy.getByData('filtro-container').should('be.visible');
    
    // Testar filtro "Todos os tipos"
    cy.get('button[role="combobox"]').click();
    cy.get('div[role="option"]').contains('Todos os tipos').click();
    cy.wait(500);
    
    // Testar filtro "Coleta"
    cy.get('button[role="combobox"]').click();
    cy.get('div[role="option"]').contains('Coleta').click();
    cy.wait(500);
    
    // Verificar se apenas demandas de coleta aparecem (se houver demandas)
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').each(($card) => {
          cy.wrap($card).should('contain', 'Coleta');
        });
      }
    });
  });

  it('Deve exibir imagens da demanda no modal', () => {
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').first().click();
        cy.getByData('botao-analisar-demanda').first().click();
        cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
        
        // Verificar se a imagem está presente
        cy.get('img[alt*="Imagem da demanda"]').should('exist');
        
        cy.get('body').type('{esc}');
        cy.wait(300);
      }
    });
  });
});

describe('Fluxo de testes da pagina de operador - casos de erro', () => {
  
  beforeEach(() => {
    cy.login('operadorfixo@exemplo.com', 'Senha@123', 'funcionario');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Deve impedir a resolução de uma demanda sem a descrição da resolução', () => {
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').first().click();
        cy.getByData('botao-analisar-demanda').first().click();
        cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
        cy.getByData('botao-resolver-demanda').click();
        
        cy.getByData('modal-resolver-demanda').should('be.visible');
        
        // Tentar confirmar sem descrição
        cy.getByData('botao-confirmar-resolucao').should('be.disabled');
        
        // Adicionar apenas imagem
        cy.getByData('input-upload-imagens-resolucao').selectFile('cypress/fixtures/test-image.png', { force: true });
        cy.wait(1000);
        
        // Botão ainda deve estar desabilitado
        cy.getByData('botao-confirmar-resolucao').should('be.disabled');
        
        // Cancelar
        cy.getByData('botao-cancelar-resolucao').click();
        cy.getByData('modal-resolver-demanda').should('not.exist');
        cy.get('body').type('{esc}');
        cy.wait(300);
      }
    });
  });

  it('Deve impedir a resolução de uma demanda sem a imagem da resolução', () => {
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').first().click();
        cy.getByData('botao-analisar-demanda').first().click();
        cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
        cy.getByData('botao-resolver-demanda').click();
        
        cy.getByData('modal-resolver-demanda').should('be.visible');
        
        // Adicionar apenas descrição
        cy.getByData('textarea-descricao-resolucao').type('Descrição da resolução sem imagem');
        
        // Botão deve estar desabilitado sem imagem
        cy.getByData('botao-confirmar-resolucao').should('be.disabled');
        
        // Cancelar
        cy.getByData('botao-cancelar-resolucao').click();
        cy.getByData('modal-resolver-demanda').should('not.exist');
        cy.get('body').type('{esc}');
        cy.wait(300);
      }
    });
  });

  it('Deve impedir a devolução de uma demanda para a secretaria sem informar o motivo', () => {
    cy.getByData('aba-aguardando-resolucao').click();
    cy.wait(500);
    
    cy.get('body').then($body => {
      if ($body.find('[data-test="card-demanda"]').length > 0) {
        cy.getByData('card-demanda').first().click();
        cy.getByData('botao-analisar-demanda').first().click();
        cy.getByData('modal-detalhes-demanda-operador').should('be.visible');
        cy.getByData('botao-devolver-demanda').click();
        
        cy.getByData('modal-devolver-demanda').should('be.visible');
        
        // Botão deve estar desabilitado sem motivo
        cy.getByData('botao-confirmar-devolucao').should('be.disabled');
        
        // Cancelar
        cy.getByData('botao-cancelar-devolucao').click();
        cy.getByData('modal-devolver-demanda').should('not.exist');
        cy.get('body').type('{esc}');
        cy.wait(300);
      }
    });
  });
});

