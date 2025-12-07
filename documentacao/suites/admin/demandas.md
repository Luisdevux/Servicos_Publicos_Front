# Suite de Teste - Gerenciamento de Demandas (Admin)
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

Painel administrativo para visualização e gestão de TODAS as demandas do sistema. Permite busca por tipo/bairro/secretaria, filtros por tipo e status, visualização de detalhes completos em modal e exclusão de demandas. Diferencia-se dos painéis de operador/secretaria por exibir demandas de todos os usuários e secretarias. Paginação local (carrega todos os dados e pagina no client).

## 2 - Arquitetura

Next.js 15 + React 19 com React Query. Carrega todas as páginas de dados da API e implementa paginação local (10 itens/página). Filtros e busca aplicados localmente. Modais para visualização de detalhes e confirmação de exclusão.

## 3 - Requisitos

| Funcional | Não Funcional |
|-----------|---------------|
| RF001 – Listar TODAS as demandas do sistema | NF001 – Carregar todas páginas eficientemente |
| RF002 – Buscar por tipo/bairro/secretaria | NF002 – Paginação local performática |
| RF003 – Filtrar por tipo de demanda | NF003 – Layout responsivo |
| RF004 – Filtrar por status | NF004 – Toast notifications |
| RF005 – Visualizar detalhes completos | |
| RF006 – Excluir demanda | |
| RF007 – Paginação local (10 itens/página) | |

## 4 - Casos de Teste

#### Listagem e Paginação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem completa | ● Carregar todas as demandas do sistema <br>● Paginação local | ● Todas páginas carregadas <br>● 10 itens por página | ● Listagem completa |
| Busca | ● Buscar por tipo, bairro ou secretaria <br>● Debounce aplicado | ● Filtro funcional <br>● Resultados corretos | ● Busca funcional |
| Filtro por tipo | ● Filtrar por tipo de demanda | ● Dropdown funcional <br>● Lista filtrada | ● Filtro funcional |
| Filtro por status | ● Filtrar por: Em aberto, Em andamento, Concluída, Recusada | ● Dropdown funcional <br>● Lista filtrada | ● Filtro funcional |
| Paginação local | ● Paginar localmente 10 itens/página <br>● Controles navegação <br>● Reset ao filtrar | ● Paginação correta <br>● Navegação funcional | ● Paginação funcional |

#### Detalhes e Exclusão

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Visualizar detalhes | ● Abrir modal com detalhes completos <br>● Endereço, descrição, imagens, status, usuário, secretaria | ● Modal abre <br>● Dados completos | ● Detalhes visíveis |
| Excluir demanda | ● Modal confirmação <br>● Excluir após confirmação | ● Modal abre <br>● DELETE /demandas/:id <br>● Toast sucesso | ● Exclusão funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● Listagem não carrega <br>● Exclusão não funciona |
| Grave | ● Paginação falha <br>● Filtros não funcionam <br>● Detalhes incompletos |
| Moderada | ● Busca não funciona <br>● Layout quebrado |
| Pequena | ● Formatação <br>● Alinhamentos |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso.
