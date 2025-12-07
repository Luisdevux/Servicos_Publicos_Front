# Suite de Teste - Gerenciamento de Secretarias
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O módulo de "Gerenciamento de Secretarias" permite administradores realizarem operações CRUD (Create, Read, Update, Delete) completas sobre as secretarias municipais. Funcionalidades incluem listagem com busca e paginação, adição de novas secretarias, edição de dados existentes e exclusão com confirmação. Validações garantem integridade dos dados (nome, sigla, e-mail, telefone e tipo obrigatórios).

## 2 - Arquitetura

Next.js 15 + React 19 com React Query para gerenciamento de estado e cache. Formulários com React Hook Form + Zod. Modais para criação/edição/exclusão. Tabela responsiva com busca em tempo real (debounce) e paginação server-side.

## 3 - Requisitos

| Funcional | Não Funcional |
|-----------|---------------|
| RF001 – Listar secretarias em tabela paginada | NF001 – Tempo de resposta < 3s |
| RF002 – Buscar por nome com debounce | NF002 – Layout responsivo |
| RF003 – Adicionar nova secretaria | NF003 – Validações client e server-side |
| RF004 – Editar secretaria existente | NF004 – Toast notifications |
| RF005 – Excluir secretaria com confirmação | NF005 – Tratamento de erros |
| RF006 – Validar campos obrigatórios | |

## 4 - Casos de Teste

#### CRUD Completo

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem | ● Exibir tabela com colunas: Nome, Sigla, Email, Telefone, Tipo <br>● Paginação funcional | ● Tabela visível <br>● Dados carregados | ● Listagem funcional |
| Busca | ● Buscar por nome em tempo real | ● Filtro aplicado <br>● Debounce funcional | ● Busca funcional |
| Adicionar | ● Abrir modal ao clicar "Adicionar" <br>● Validar campos (Nome*, Sigla*, Email*, Telefone*, Tipo*) <br>● Criar secretaria | ● Modal abre <br>● Validações funcionam <br>● POST para /secretaria <br>● Toast sucesso | ● Criação funcional |
| Editar | ● Abrir modal com dados pré-preenchidos <br>● Atualizar dados | ● Dados pré-preenchidos <br>● PATCH para /secretaria/:id <br>● Toast sucesso | ● Edição funcional |
| Excluir | ● Abrir modal de confirmação <br>● Exibir nome da secretaria <br>● Excluir após confirmação | ● Modal confirmação <br>● DELETE para /secretaria/:id <br>● Toast sucesso | ● Exclusão funcional |

#### Validações

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Nome obrigatório | ● Mínimo 3 caracteres | ● Mensagem erro | ● Validação funcional |
| Sigla obrigatória | ● Mínimo 2 caracteres | ● Mensagem erro | ● Validação funcional |
| Email válido | ● Formato correto | ● Mensagem erro | ● Validação funcional |
| Telefone válido | ● Formato correto | ● Mensagem erro | ● Validação funcional |
| Tipo obrigatório | ● Seleção obrigatória | ● Mensagem erro | ● Validação funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● CRUD não funciona <br>● Listagem não carrega |
| Grave | ● Validações falham <br>● Dados não persistem |
| Moderada | ● Busca não funciona <br>● Toast não exibido |
| Pequena | ● Formatação <br>● Alinhamentos |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso.
