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
          cy.get('.leaflet-container').should('be.visible')
      
          cy.get('path.leaflet-interactive').first().click({ force: true })
      
          cy.get('div.w-full.h-full.bg-gray-50').find('h3').should('be.visible').invoke('text').then((texto) => {
              expect(texto.trim()).to.not.eq('')
            })
      })
    });

    describe('Gráficos', () => {
        it.skip('Deve exibir o gráfico de barras com os 5 bairros com mais demandas', () => {
            cy.contains('h3','Os 5 Bairros com Maior Quantidade de Demandas Solicitadas').should('be.visible')
        
            cy.get('svg').should('exist')
        
            cy.get('.recharts-bar-rectangle').should('have.length.at.least', 5)
        })

        it.skip('Cada barra deve ter uma cor diferente', () => {
            const cores = [];
        
            cy.get('.recharts-bar-rectangle path').each(($el) => {
              const fill = $el.attr('fill');
              expect(fill).to.exist;
              cores.push(fill);
            }).then(() => {
              const coresUnicas = [...new Set(cores)];
              expect(coresUnicas.length).to.eq(5);
            });
          });

        it.skip('Deve exibir tooltip ao passar o mouse na barra', () => {
            cy.get('.recharts-bar-rectangle').first().trigger('mouseover', { force: true });
        
            cy.get('.recharts-tooltip-wrapper').should('be.visible').invoke('text').then((texto) => {
                expect(texto).to.not.be.empty;
              });
          });

          it.skip('Tooltip deve mostrar nome do bairro e quantidade', () => {
            cy.get('.recharts-bar-rectangle').eq(0).trigger('mouseover', { force: true });
        
            cy.get('.recharts-tooltip-wrapper').should('be.visible').then(($tooltip) => {
                const texto = $tooltip.text();
        
                expect(texto).to.match(/[A-Za-z]/);
                expect(texto).to.match(/\d+/);
              });
            });
      
        it.skip('Deve exibir o gráfico de rosca', () => {
            cy.contains('h3', 'Demandas Por Categoria').should('be.visible');
            
            cy.get('.recharts-pie') .should('exist').and('be.visible');
            
            cy.get('.recharts-pie-sector').should('have.length.at.least', 1);
        });
        
        it.skip('Deve exibir a legenda', () => {
            cy.contains('div.text-sm.font-medium.text-gray-700', 'Árvores').should('be.visible');
            cy.contains('div.text-sm.font-medium.text-gray-700', 'Iluminação').should('be.visible');
            cy.contains('div.text-sm.font-medium.text-gray-700', 'Coleta').should('be.visible');
            cy.contains('div.text-sm.font-medium.text-gray-700', 'Pavimentação').should('be.visible');
        });

        it('As cores do gráfico devem corresponder às cores da legenda', () => {

            const hexParaRgb = (hex) => {
              const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return resultado 
                ? `rgb(${parseInt(resultado[1], 16)}, ${parseInt(resultado[2], 16)}, ${parseInt(resultado[3], 16)})`
                : hex;
            };
          
            const coresDoGrafico = [];
            const coresDaLegenda = [];
          
            // Captura as cores do gráfico (fill em HEX)
            cy.get('.recharts-pie-sector path').each(($el) => {
              const fill = $el.attr('fill');
              expect(fill).to.exist;
              coresDoGrafico.push(hexParaRgb(fill));
            }).then(() => {
          
              // Captura as cores da legenda (background-color em RGB)
              cy.get('.w-4.h-4.rounded-full').each(($el) => {
                const cor = $el.css('background-color');
                expect(cor).to.exist;
                coresDaLegenda.push(cor.trim());
              }).then(() => {
          
                expect(coresDoGrafico).to.deep.equal(coresDaLegenda);
              });
          
            });
          
        });   
        
        it('Deve exibir nome da categoria e porcentagem no tooltip ao passar o mouse', () => {
            cy.get('.recharts-pie-sector path').first().trigger('mouseover', { force: true });
          
            cy.get('.recharts-tooltip-wrapper').should('be.visible').invoke('text').then((texto) => {
                const textoLimpo = texto.trim();
          
                expect(textoLimpo).to.match(/[A-Za-zÀ-ÿ]/);
                expect(textoLimpo).to.match(/\d+%/);      
            });
          
        });
          
    });
});
