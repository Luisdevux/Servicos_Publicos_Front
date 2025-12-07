# Suite de Teste - Dashboard Admin
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O "Dashboard Admin" é o painel principal de controle para administradores do sistema Vilhena+Pública. Oferece visão consolidada de métricas (demandas, colaboradores, operadores, secretarias), mapa interativo de demandas por bairro com cores baseadas em densidade, e gráficos analíticos (top 5 bairros com mais demandas e distribuição por categoria). Esta funcionalidade é crítica para tomada de decisões e gestão estratégica dos serviços públicos.

## 2 - Arquitetura

Utiliza Next.js 15 com App Router e React 19. Os dados são carregados via React Query da API endpoint `/dashboard/metricas`. O mapa interativo utiliza KML de bairros de Vilhena com polígonos clicáveis. Gráficos implementados com bibliotecas de chart (Recharts). A interface atualiza em tempo real conforme dados da API.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – Exibir 4 cards de métricas (Demandas, Colaboradores, Operadores, Secretarias) | NF001 – Carregar em menos de 3 segundos |
| RF002 – Carregar métricas da API em tempo real | NF002 – Compatível com navegadores modernos |
| RF003 – Exibir mapa interativo de Vilhena com bairros | NF003 – Layout responsivo |
| RF004 – Colorir bairros conforme quantidade de demandas | NF004 – Código modular e testável |
| RF005 – Exibir detalhes ao clicar em bairro | NF005 – Performance otimizada para gráficos |
| RF006 – Exibir gráfico de barras (Top 5 bairros) | NF006 – Tratamento de erros amigáveis |
| RF007 – Exibir gráfico de rosca (Demandas por categoria) | NF007 – Feedback visual durante loading |

## 4 - Estratégia de Teste

### 4.1 Ambiente e Ferramentas
Cypress para testes E2E automatizados.

### 4.2 Casos de Teste

#### Métricas e Cards

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do dashboard | ● Ao acessar /admin/dashboard, deve carregar a página com 4 cards de métricas | ● Página visível <br>● 4 cards presentes | ● Dashboard renderizado |
| Valores das métricas | ● Cards devem exibir valores numéricos carregados da API | ● Requisição GET /dashboard/metricas <br>● Valores corretos | ● Métricas atualizadas |
| Loading de métricas | ● Deve exibir loading durante carregamento | ● Indicador de loading | ● Feedback visual |

#### Mapa Interativo

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do mapa | ● Deve exibir mapa de Vilhena com bairros | ● Mapa carregado <br>● Polígonos visíveis | ● Mapa funcional |
| Cores por densidade | ● Bairros devem ter cores conforme quantidade de demandas | ● Cores aplicadas <br>● Escala de cores | ● Visualização clara |
| Interatividade | ● Ao clicar em bairro, deve exibir card com detalhes | ● Card de informações visível <br>● Dados do bairro corretos | ● Interação funcional |
| Detalhes do bairro | ● Card deve listar demandas do bairro | ● Lista de demandas <br>● Navegação pelas demandas | ● Informações completas |

#### Gráficos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Gráfico de barras (Top 5) | ● Deve exibir gráfico com 5 bairros com mais demandas <br>● Barras com cores distintas <br>● Valores exibidos | ● Gráfico renderizado <br>● Dados corretos <br>● Cores aplicadas | ● Gráfico funcional |
| Gráfico de rosca | ● Deve exibir distribuição por categoria <br>● Legenda visível <br>● Cores por categoria | ● Gráfico renderizado <br>● Legenda presente <br>● Proporções corretas | ● Gráfico funcional |

## 5 - Classificação de Bugs

| ID | Severidade | Descrição |
|----|------------|-----------|
| 1 | Blocker | ● Dashboard não carrega <br>● Métricas não exibidas <br>● Mapa não renderiza |
| 2 | Grave | ● Valores incorretos <br>● Gráficos não funcionam <br>● Interação do mapa falha |
| 3 | Moderada | ● Cores não aplicadas <br>● Loading não exibido <br>● Layout quebrado |
| 4 | Pequena | ● Formatação de números <br>● Alinhamentos <br>● Labels inconsistentes |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso no ambiente de homologação.
