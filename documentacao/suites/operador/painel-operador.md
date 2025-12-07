# Suite de Teste - Painel do Operador
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O "Painel do Operador" permite que operadores visualizem e gerenciem demandas atribuídas a eles pelas secretarias. Funcionalidades incluem visualização em abas (Aguardando Resolução / Concluídas), filtros por tipo e secretaria, análise de demandas com detalhes completos, devolução de demandas para secretaria com motivo, e resolução de demandas com descrição e upload obrigatório de imagens de resolução (mínimo 1 imagem).

## 2 - Arquitetura

Next.js 15 + React 19 com React Query. Demandas filtradas por operador logado via API. Carrossel de imagens quando múltiplas. Modais para análise, devolução e resolução. Upload de imagens de resolução para MinIO. Paginação de 6 cards por página.

**Fluxo de Dados:**

1. Operador acessa `/operador`
2. Sistema busca demandas atribuídas ao operador via API
3. Exibição em abas: "Aguardando Resolução" (status: Em Andamento) e "Concluídas"
4. Filtros por tipo e secretaria aplicados
5. Ao clicar em "Analisar", abre modal com detalhes
6. **Opções:**
   - **Devolver:** Modal com campo motivo → PATCH status para "Em Aberto" + motivo devolução
   - **Resolver:** Modal com descrição* + upload imagens* (mín. 1) → PATCH status para "Concluída" + dados resolução
7. Toast de confirmação
8. Lista atualizada

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – Listar demandas atribuídas ao operador | NF001 – Tempo resposta < 3s |
| RF002 – Exibir abas Aguardando/Concluídas | NF002 – Layout responsivo |
| RF003 – Filtrar por tipo de demanda | NF003 – Validações upload |
| RF004 – Filtrar por secretaria do operador | NF004 – Toast notifications |
| RF005 – Exibir cards com título, descrição, tipo, status, endereço, imagens | NF005 – Tratamento sessão expirada |
| RF006 – Carrossel de imagens | NF006 – Skeleton loading |
| RF007 – Modal de detalhes ao clicar "Analisar" | |
| RF008 – Devolver demanda com motivo obrigatório | |
| RF009 – Resolver demanda com descrição* + imagens* (mín. 1) | |
| RF010 – Validar formatos de imagem | |
| RF011 – Preview de imagens de resolução | |
| RF012 – Visualizar demanda concluída (somente leitura) | |
| RF013 – Paginação 6 cards/página | |
| RF014 – Tratamento erro 498 (sessão expirada) | |

## 4 - Estratégia de Teste

### 4.1 Ambiente e Ferramentas
Cypress para testes E2E automatizados.

### 4.2 Casos de Teste

#### Renderização e Navegação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização | ● Carregar página /operador <br>● Banner visível <br>● Demandas do operador | ● Página visível <br>● Filtro por operador aplicado | ● Página renderizada |
| Abas de status | ● Abas "Aguardando Resolução" e "Concluídas" <br>● Contadores corretos <br>● Troca de aba atualiza lista | ● Abas funcionais <br>● Contadores corretos | ● Navegação por abas |

#### Filtros

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Filtro por tipo | ● Dropdown com tipos <br>● Opção "Todos" | ● Filtro aplicado <br>● Lista atualizada | ● Filtro funcional |
| Filtro por secretaria | ● Dropdown com secretarias do operador | ● Filtro aplicado <br>● Lista atualizada | ● Filtro funcional |

#### Cards de Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Informações nos cards | ● Título, descrição, tipo, status, endereço, imagens | ● Dados corretos <br>● Layout adequado | ● Cards informativos |
| Carrossel de imagens | ● Navegação entre imagens <br>● Indicadores | ● Carrossel funcional | ● Múltiplas imagens |
| Botão analisar | ● Presente em cada card | ● Botão visível e funcional | ● Ação disponível |

#### Modal de Detalhes

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Abertura | ● Modal com detalhes completos | ● Modal visível <br>● Dados completos | ● Modal funcional |
| Botões de ação | ● "Devolver" e "Resolver" para aguardando <br>● Sem ações para concluídas | ● Botões corretos conforme status | ● Ações apropriadas |

#### Devolver Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Modal devolução | ● Campo motivo obrigatório | ● Modal abre <br>● Campo presente | ● Modal funcional |
| Validação motivo | ● Motivo obrigatório | ● Mensagem erro se vazio | ● Validação funcional |
| Devolução | ● Demanda volta para secretaria <br>● Status "Em Aberto" <br>● Motivo salvo | ● PATCH /demandas/:id <br>● Status atualizado <br>● Toast sucesso | ● Devolução funcional |

#### Resolver Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Modal resolução | ● Campo descrição* <br>● Upload imagens* (mín. 1) | ● Modal abre <br>● Campos presentes | ● Modal funcional |
| Validação descrição | ● Descrição obrigatória | ● Mensagem erro | ● Validação funcional |
| Validação imagens | ● Mínimo 1 imagem <br>● Formatos válidos (JPG, PNG) | ● Mensagem erro <br>● Validação formato | ● Validação funcional |
| Preview imagens | ● Exibir preview após upload <br>● Botão X para remover | ● Preview visível <br>● Remoção funcional | ● Preview funcional |
| Resolução | ● Demanda marcada "Concluída" <br>● Descrição e imagens salvos | ● PATCH /demandas/:id <br>● Status atualizado <br>● Toast sucesso | ● Resolução funcional |

#### Visualização Concluída

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Detalhes concluída | ● Exibir resolução e imagens <br>● Sem botões ação | ● Resolução visível <br>● Imagens resolução | ● Visualização correta |

#### Paginação e Loading

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Paginação | ● 6 cards/página <br>● Controles navegação | ● Paginação funcional | ● Navegação funcional |
| Skeleton loading | ● Skeleton durante carregamento | ● Skeleton visível <br>● Animação pulse | ● Feedback visual |

#### Sessão Expirada

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Erro 498 | ● Redirecionar para login com param expired | ● Redirecionamento <br>● Parâmetro URL | ● Tratamento funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● Painel não carrega <br>● Devolução/Resolução não funcionam |
| Grave | ● Validações falham <br>● Imagens não fazem upload <br>● Status não atualiza |
| Moderada | ● Filtros não funcionam <br>● Carrossel quebrado <br>● Toast não exibido |
| Pequena | ● Formatação <br>● Alinhamentos <br>● Skeleton |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso no ambiente de homologação.
