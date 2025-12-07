# Suite de Teste - Gerenciamento de Colaboradores
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O módulo permite administradores gerenciarem colaboradores (funcionários) com CRUD completo. Inclui filtros por nível de acesso e status, validações rigorosas (CPF único, e-mail único, CEP de Vilhena), proteção do admin principal (não pode ser editado/excluído) e funcionalidade de ativar/inativar colaboradores.

## 2 - Arquitetura

Next.js 15 + React 19 com React Query. Formulários com validações complexas (CPF, e-mail, CEP). Modais para criação/edição/detalhes/exclusão. Filtros múltiplos e busca combinada.

## 3 - Requisitos

| Funcional | Não Funcional |
|-----------|---------------|
| RF001 – Listar colaboradores paginados | NF001 – Tempo resposta < 3s |
| RF002 – Buscar por nome/CPF/portaria | NF002 – Layout responsivo |
| RF003 – Filtrar por nível de acesso | NF003 – Validações rigorosas |
| RF004 – Filtrar por status (Ativo/Inativo) | NF004 – Proteção admin principal |
| RF005 – Adicionar colaborador | NF005 – Toast notifications |
| RF006 – Editar colaborador (exceto admin) | |
| RF007 – Inativar colaborador (exceto admin) | |
| RF008 – Reativar colaborador | |
| RF009 – Validar CPF único e válido | |
| RF010 – Validar e-mail único | |
| RF011 – Validar CEP de Vilhena | |

## 4 - Casos de Teste

#### CRUD e Filtros

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem | ● Tabela com Nome, Email, CPF, Telefone, Portaria, Cargo, Status | ● Tabela visível <br>● Dados corretos | ● Listagem funcional |
| Busca | ● Buscar por nome, CPF ou portaria | ● Filtro aplicado <br>● Debounce | ● Busca funcional |
| Filtro nível acesso | ● Filtrar por Operador, Secretário, Administrador | ● Dropdown funcional <br>● Lista filtrada | ● Filtro funcional |
| Filtro status | ● Filtrar por Ativo/Inativo | ● Dropdown funcional <br>● Lista filtrada | ● Filtro funcional |
| Adicionar | ● Modal com campos: Nome*, Email*, CPF*, Celular*, Data Nascimento*, Cargo*, Portaria*, Nível*, CEP*, Número* <br>● Validações completas | ● Modal abre <br>● Validações funcionam <br>● POST /usuarios <br>● Toast sucesso | ● Criação funcional |
| Editar | ● Modal com dados pré-preenchidos <br>● Não permitir editar admin principal | ● Dados corretos <br>● Proteção admin <br>● PATCH /usuarios/:id | ● Edição funcional |
| Inativar | ● Modal confirmação <br>● Não permitir inativar admin principal <br>● Status atualizado | ● Proteção admin <br>● Status mudado <br>● Toast sucesso | ● Inativação funcional |
| Reativar | ● Permitir reativar inativo | ● Status mudado <br>● Toast sucesso | ● Reativação funcional |

#### Validações

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| CPF único e válido | ● Verificar dígitos <br>● Verificar duplicidade | ● Mensagens erro | ● Validação funcional |
| Email único e válido | ● Formato correto <br>● Verificar duplicidade | ● Mensagens erro | ● Validação funcional |
| CEP Vilhena | ● Apenas 76980-XXX | ● Mensagem erro | ● Validação funcional |
| Celular válido | ● Formato com máscara | ● Mensagem erro | ● Validação funcional |

#### Proteções

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Admin protegido | ● Não permitir editar/excluir admin principal | ● Botões desabilitados ou ocultos <br>● Mensagem informativa | ● Proteção funcional |

## 5 - Classificação de Bugs

| Severidade | Descrição |
|------------|-----------|
| Blocker | ● CRUD não funciona <br>● Admin pode ser excluído |
| Grave | ● Validações falham <br>● CPF/email duplicado aceito <br>● CEP fora Vilhena aceito |
| Moderada | ● Filtros não funcionam <br>● Reativação falha |
| Pequena | ● Máscaras <br>● Formatação |

## 6 - Definição de Pronto

Funcionalidade pronta quando todos os casos de teste forem executados com sucesso.
