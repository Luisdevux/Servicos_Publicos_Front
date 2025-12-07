# Suite de Teste - Meus Pedidos (Munícipe)
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A página "Meus Pedidos" permite aos munícipes visualizarem todas as suas demandas criadas no sistema, com filtros por status (Todos, Em Aberto, Em Andamento, Concluídas, Recusadas) e opção de visualizar detalhes completos de cada demanda. A funcionalidade é essencial para acompanhamento do andamento das solicitações de serviços públicos.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. Os dados são carregados via React Query com filtros dinâmicos por status. A interface utiliza tabs para alternância entre status e modais para exibição de detalhes. Paginação é implementada client-side.

**Fluxo de Dados:**

1. Usuário acessa `/meus-pedidos` (autenticado)
2. Sistema busca demandas do munícipe via API GET `/demandas?usuario=:id`
3. Dados exibidos em cards paginados
4. Usuário pode filtrar por status via tabs
5. Ao clicar em "Ver mais", abre modal com detalhes completos
6. Modal exibe: endereço completo, descrição, imagens, status, datas, observações

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve listar todos os pedidos do munícipe logado | NF001 – O sistema deve carregar em menos de 3 segundos |
| RF002 – O sistema deve exibir cards com informações da demanda | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve permitir filtros por status | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve exibir contador em cada filtro | NF004 – O sistema deve ter código modular e testável |
| RF005 – O sistema deve permitir visualizar detalhes completos | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve exibir modal com detalhes ao clicar em "Ver mais" | NF006 – O sistema deve ter tratamento de erros amigáveis |
| RF007 – O sistema deve implementar paginação | NF007 – O sistema deve exibir feedback adequado |
| RF008 – O sistema deve exibir mensagem quando não há pedidos | NF008 – O sistema deve carregar imagens otimizadas |
| RF009 – O sistema deve sugerir criar nova demanda quando vazio | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional da listagem de pedidos do munícipe, incluindo filtros por status, paginação, exibição de detalhes e estados vazios.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Listagem de Pedidos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /meus-pedidos, deve listar pedidos do munícipe. | ● Página visível <br>● Cards exibidos | ● Pedidos listados |
| Informações nos cards | ● Cada card deve exibir: tipo de demanda, descrição, status, data. | ● Informações corretas <br>● Formatação adequada | ● Cards informativos |
| Paginação | ● Deve paginar dados quando há muitos pedidos. <br>● Controles anterior/próximo funcionais. | ● Paginação visível <br>● Navegação funcional <br>● Indicador de página | ● Paginação funcional |
| Loading durante carregamento | ● Deve exibir indicador de loading enquanto busca dados. | ● Spinner ou skeleton visível | ● Feedback visual |

#### Filtros por Status

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Exibição de tabs | ● Deve exibir tabs: Todos, Em Aberto, Em Andamento, Concluídas, Recusadas. | ● 5 tabs visíveis <br>● Labels corretos | ● Tabs exibidos |
| Contadores em tabs | ● Cada tab deve exibir contador de pedidos. | ● Contadores corretos <br>● Atualização dinâmica | ● Contadores funcionais |
| Filtro por status | ● Ao selecionar tab, lista deve atualizar conforme filtro. | ● Dados filtrados <br>● Lista atualizada | ● Filtros precisos |
| Tab ativo destacado | ● Tab selecionado deve ter destaque visual. | ● Estilo de ativo aplicado | ● Feedback visual |

#### Visualização de Detalhes

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Abertura de modal | ● Ao clicar em "Ver mais", deve abrir modal com detalhes. | ● Modal visível <br>● Dados carregados | ● Modal abre |
| Detalhes completos | ● Modal deve exibir: endereço completo, descrição, imagens, status, datas, observações. | ● Todas as informações presentes <br>● Dados corretos | ● Detalhes completos |
| Exibição de imagens | ● Imagens da demanda devem ser exibidas. <br>● Carrossel se houver múltiplas imagens. | ● Imagens carregadas <br>● Carrossel funcional (se aplicável) | ● Imagens visíveis |
| Fechamento de modal | ● Deve permitir fechar modal. | ● Modal fecha <br>● Retorna para lista | ● Fechamento funcional |

#### Estado Vazio

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Mensagem quando vazio | ● Quando não há pedidos, deve exibir mensagem apropriada. | ● Mensagem informativa visível | ● Feedback adequado |
| Sugestão de ação | ● Deve sugerir criar nova demanda. <br>● Link ou botão para criar demanda. | ● CTA visível <br>● Navegação funcional | ● CTA presente |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout responsivo | ● Cards devem adaptar para diferentes viewports. <br>● Modal deve ser responsivo. | ● Layout adaptado <br>● Elementos legíveis | ● Design responsivo |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Pedidos não carregam. <br>● Modal não abre. <br>● Página não renderiza. |
| 2 | Grave | ● Filtros não funcionam. <br>● Contadores incorretos. <br>● Detalhes incompletos no modal. <br>● Imagens não carregam. |
| 3 | Moderada | ● Paginação não funciona. <br>● Layout quebrado. <br>● Estado vazio sem mensagem. |
| 4 | Pequena | ● Erros de formatação. <br>● Datas mal formatadas. <br>● Alinhamentos incorretos. |

## 6 - Definição de Pronto

A funcionalidade "Meus Pedidos (Munícipe)" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
