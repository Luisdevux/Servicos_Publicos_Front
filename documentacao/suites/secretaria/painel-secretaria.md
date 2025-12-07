# Suite de Teste - Painel da Secretaria
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O "Painel da Secretaria" permite que secretários gerenciem demandas vinculadas às suas secretarias. Funcionalidades incluem visualização em 4 abas (Em Aberto, Em Andamento, Concluídas, Recusadas), filtros por tipo e secretaria, atribuição de demandas a operadores da mesma secretaria, rejeição de demandas com motivo, e visualização de detalhes completos incluindo resolução de operadores.

## 2 - Arquitetura

Next.js 15 + React 19 com React Query. Demandas filtradas pelas secretarias vinculadas ao usuário via API. Modais para detalhes, atribuição e rejeição. Carrossel de imagens. Paginação de 6 cards por página.

**Fluxo de Dados:**

1. Secretário acessa `/secretaria`
2. Sistema busca demandas das secretarias do usuário via API
3. Exibição em 4 abas: Em Aberto, Em Andamento, Concluídas, Recusadas
4. Filtros por tipo e secretaria aplicados
5. Ao clicar em "Analisar":
   - **Em Aberto:** Modal com botões "Atribuir a Operador" e "Rejeitar"
   - **Em Andamento:** Modal com operador atribuído, motivo devolução (se houver), opção reatribuir
   - **Concluída:** Modal com resolução e imagens do operador (somente leitura)
   - **Recusada:** Modal com motivo rejeição (somente leitura)

## 3 - Categorização dos Requisitos

| Requisito Funcional | Não Funcional |
|---------------------|---------------|
| RF001 – Listar demandas das secretarias do usuário | NF001 – Tempo resposta < 3s |
| RF002 – Exibir 4 abas (Em Aberto, Em Andamento, Concluídas, Recusadas) | NF002 – Layout responsivo |
| RF003 – Filtrar por tipo de demanda | NF003 – Toast notifications |
| RF004 – Filtrar por secretaria | NF004 – Tratamento sessão expirada |
| RF005 – Exibir cards informativos | NF005 – Skeleton loading |
| RF006 – Carrossel de imagens | |
| RF007 – Atribuir demanda a operador (somente mesma secretaria) | |
| RF008 – Rejeitar demanda com motivo obrigatório | |
| RF009 – Visualizar operador atribuído (Em Andamento) | |
| RF010 – Visualizar motivo devolução (se devolvida) | |
| RF011 – Reatribuir demanda devolvida | |
| RF012 – Visualizar resolução completa (Concluída) | |
| RF013 – Visualizar motivo rejeição (Recusada) | |
| RF014 – Paginação 6 cards/página | |

## 4 - Estratégia de Teste

### 4.1 Ambiente e Ferramentas
Cypress para testes E2E automatizados.

### 4.2 Casos de Teste

#### Renderização e Navegação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização | ● Carregar /secretaria <br>● Banner visível <br>● Demandas das secretarias | ● Página visível <br>● Filtro por secretarias aplicado | ● Página renderizada |
| Abas de status | ● 4 abas: Em Aberto, Em Andamento, Concluídas, Recusadas <br>● Contadores corretos <br>● Troca atualiza lista | ● Abas funcionais <br>● Contadores corretos | ● Navegação por abas |

#### Filtros

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Filtro por tipo | ● Dropdown com tipos <br>● Opção "Todos" | ● Filtro aplicado <br>● Lista atualizada | ● Filtro funcional |
| Filtro por secretaria | ● Dropdown com secretarias do usuário | ● Filtro aplicado <br>● Lista atualizada | ● Filtro funcional |

#### Cards de Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Informações | ● Título, descrição, tipo, status, endereço, imagens | ● Dados corretos | ● Cards informativos |
| Carrossel | ● Navegação entre imagens | ● Carrossel funcional | ● Múltiplas imagens |
| Botão analisar | ● Em cada card | ● Botão visível | ● Ação disponível |

#### Modal - Demanda Em Aberto

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Detalhes | ● Modal com informações completas | ● Modal abre <br>● Dados completos | ● Modal funcional |
| Botões ação | ● "Atribuir a Operador" e "Rejeitar" | ● Botões visíveis | ● Ações disponíveis |

#### Atribuir Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Modal atribuição | ● Dropdown com operadores da mesma secretaria | ● Modal abre <br>● Lista operadores | ● Modal funcional |
| Atribuição | ● Demanda passa para "Em Andamento" <br>● Operador vinculado | ● PATCH /demandas/:id <br>● Status atualizado <br>● Toast sucesso | ● Atribuição funcional |

#### Rejeitar Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Modal rejeição | ● Campo motivo obrigatório | ● Modal abre <br>● Campo presente | ● Modal funcional |
| Validação | ● Motivo obrigatório | ● Mensagem erro | ● Validação funcional |
| Rejeição | ● Demanda passa para "Recusada" <br>● Motivo salvo | ● PATCH /demandas/:id <br>● Status atualizado <br>● Toast sucesso | ● Rejeição funcional |

#### Modal - Demanda Em Andamento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Operador atribuído | ● Exibir nome do operador | ● Nome visível | ● Informação presente |
| Motivo devolução | ● Se devolvida, exibir motivo | ● Motivo visível (se houver) | ● Informação presente |
| Reatribuição | ● Se devolvida, botões reatribuir/rejeitar | ● Botões visíveis | ● Ações disponíveis |

#### Modal - Demanda Concluída

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Resolução | ● Exibir descrição da resolução | ● Resolução visível | ● Informação completa |
| Imagens resolução | ● Exibir imagens de resolução | ● Imagens visíveis | ● Evidências presentes |
| Operador | ● Exibir nome do operador que resolveu | ● Nome visível | ● Responsável identificado |
| Sem ações | ● Sem botões de ação | ● Somente leitura | ● Finalizada |

#### Modal - Demanda Recusada

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Motivo rejeição | ● Exibir motivo | ● Motivo visível | ● Informação presente |
| Sem ações | ● Sem botões de ação | ● Somente leitura | ● Finalizada |

#### Paginação e Loading

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Paginação | ● 6 cards/página <br>● Controles navegação | ● Paginação funcional | ● Navegação funcional |
| Skeleton | ● Durante carregamento | ● Skeleton visível | ● Feedback visual |

#### Sessão Expirada

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Erro 498 | ● Redirecionar para login | ● Redirecionamento | ● Tratamento funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● Painel não carrega <br>● Atribuição/Rejeição não funcionam |
| Grave | ● Validações falham <br>● Operador errado listado <br>● Status não atualiza |
| Moderada | ● Filtros não funcionam <br>● Resolução não exibida <br>● Toast não exibido |
| Pequena | ● Formatação <br>● Alinhamentos |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso no ambiente de homologação.
