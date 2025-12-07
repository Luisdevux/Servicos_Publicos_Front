/// <reference types="cypress"/>

/**
 * Testes E2E - Dashboard Admin
 * 
 * Cobertura:
 * - Renderização da página
 * - Cards de métricas (Demandas, Colaboradores ativos, Operadores ativos, Secretarias)
 * - Títulos e valores numéricos dos cards
 * - Categorias de demandas e quantidades
 * - Mapa Leaflet interativo
 * - Gráfico de barras "Os 5 Bairros com Maior Quantidade de Demandas Solicitadas"
 * - Gráfico de pizza "Demandas Por Categoria"
 * - Interação com o mapa (seleção de bairro e atualização do card de informações)
 */

describe('Dashboard Admin', () => {
    
    beforeEach(() => {
      cy.login('admin@exemplo.com', 'Senha@123', 'funcionario');
      cy.wait(2000);
      cy.url().should('include', '/admin/dashboard');
      cy.wait(1000);
  
      cy.contains('Carregando métricas...').should('not.exist', { timeout: 30000 });
    });

    describe('Renderização e elementos visuais', () => {
      it('Deve exibir todos os cards de métricas', () => {
          cy.get('[data-test="metric-card"]').should('have.length', 4).each(($card) => {
              cy.wrap($card).should('be.visible')
          })
      })

      it('Deve exibir os títulos corretos dos cards', () => {
          const titulos = [
            'Demandas',
            'Colaboradores ativos',
            'Operadores ativos',
            'Secretarias'
          ]
      
          cy.get('[data-test="metric-card"] p.text-sm')
            .each(($el, index) => {
              expect($el.text().trim()).to.eq(titulos[index])
            })
      })

      it('Deve exibir valores numéricos nos cards', () => {
          cy.get('[data-test="metric-card"] p.text-2xl')
            .each(($el) => {
              const valor = Number($el.text().trim())
              expect(valor).to.be.a('number')
              expect(valor).to.be.gte(0)
            })
      })

      it('Deve exibir as categorias e quantidades corretamente', () => {
          const categorias = [
            'Coleta',
            'Iluminação',
            'Saneamento',
            'Árvores',
            'Animais',
            'Pavimentação'
          ]
      
          categorias.forEach((categoria) => {
            cy.contains('span', categoria).should('be.visible')
            cy.contains('span', 'Demandas').should('exist')
          })
      })
    });

    describe('Mapa interativo', () => {
      it('Deve exibir o mapa Leaflet', () => {
          cy.get('.leaflet-container').should('exist').and('be.visible')
      })

      it('Deve atualizar o card de demandas ao clicar em um bairro no mapa', () => {

          // Garantir que o mapa foi carregado
          cy.get('.leaflet-container').should('be.visible')
      
          // Clicar no primeiro bairro do mapa (SVG path clicável)
          cy.get('path.leaflet-interactive')
            .first()
            .click({ force: true })
      
          // Validar que o nome do bairro apareceu no card da esquerda
          // Pegando o título do card da esquerda (h3)
          cy.get('div.w-full.h-full.bg-gray-50')
            .find('h3')
            .should('be.visible')
            .invoke('text')
            .then((texto) => {
              expect(texto.trim()).to.not.eq('')
            })
      })
    });

    describe('Gráficos', () => {
      it('Deve exibir o gráfico de barras "Bairros com Mais Demandas"', () => {
          cy.contains('h3', 'Os 5 Bairros com Maior Quantidade de Demandas Solicitadas')
            .should('be.visible')
      
          cy.get('.recharts-bar-rectangle').should('exist')
      })
      
      it('Deve exibir o gráfico de categorias (Pizza)', () => {
          cy.contains('h3', 'Demandas Por Categoria').should('be.visible')
          cy.get('.recharts-pie').should('exist')
      })
    });
});
