# Suite de Teste - Gerenciamento de Tipos de Demanda
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

Módulo para gerenciar os tipos de serviços públicos disponíveis (coleta, iluminação, animais, árvores, pavimentação, saneamento). Permite CRUD completo com validações de título (mín. 3 caracteres), tipo obrigatório e descrição (mín. 10 caracteres). Inclui busca por título e filtro por tipo de categoria.

## 2 - Arquitetura

Next.js 15 + React 19 com React Query. Formulários validados com React Hook Form + Zod. Modais para operações CRUD.

## 3 - Requisitos

| Funcional | Não Funcional |
|-----------|---------------|
| RF001 – Listar tipos de demanda | NF001 – Tempo resposta < 3s |
| RF002 – Buscar por título | NF002 – Layout responsivo |
| RF003 – Filtrar por tipo (categoria) | NF003 – Validações client/server |
| RF004 – Adicionar tipo | NF004 – Toast notifications |
| RF005 – Editar tipo | |
| RF006 – Excluir tipo | |
| RF007 – Validar título (mín. 3 chars) | |
| RF008 – Validar descrição (mín. 10 chars) | |

## 4 - Casos de Teste

#### CRUD Completo

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem | ● Tabela com Título, Descrição, Tipo | ● Tabela visível <br>● Dados carregados | ● Listagem funcional |
| Busca por título | ● Busca em tempo real | ● Filtro aplicado <br>● Debounce | ● Busca funcional |
| Filtro por tipo | ● Filtrar por categoria (Coleta, Iluminação, etc.) | ● Dropdown funcional <br>● Lista filtrada | ● Filtro funcional |
| Adicionar | ● Modal com Título* (mín. 3), Tipo*, Descrição* (mín. 10) <br>● Criar e atualizar lista | ● Modal abre <br>● Validações <br>● POST /tipoDemanda <br>● Toast sucesso | ● Criação funcional |
| Editar | ● Modal com dados pré-preenchidos <br>● Atualizar tipo | ● Dados corretos <br>● PATCH /tipoDemanda/:id <br>● Toast sucesso | ● Edição funcional |
| Excluir | ● Modal confirmação <br>● Excluir e atualizar lista | ● Modal abre <br>● DELETE /tipoDemanda/:id <br>● Toast sucesso | ● Exclusão funcional |

#### Validações

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Título obrigatório | ● Mínimo 3 caracteres | ● Mensagem erro | ● Validação funcional |
| Tipo obrigatório | ● Seleção obrigatória | ● Mensagem erro | ● Validação funcional |
| Descrição obrigatória | ● Mínimo 10 caracteres | ● Mensagem erro | ● Validação funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● CRUD não funciona <br>● Listagem não carrega |
| Grave | ● Validações falham <br>● Dados não persistem |
| Moderada | ● Filtros não funcionam <br>● Toast não exibido |
| Pequena | ● Formatação <br>● Mensagens inconsistentes |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso.
