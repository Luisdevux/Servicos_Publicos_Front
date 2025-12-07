# Suite de Teste - Perfil do Munícipe
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A página de "Perfil do Munícipe" permite aos usuários visualizarem e editarem suas informações pessoais, de contato e endereço. A funcionalidade inclui validação de dados, upload de foto de perfil, busca automática de endereço via CEP e proteção de dados sensíveis (CPF, e-mail e data de nascimento não podem ser editados). Esta é uma funcionalidade crítica para manutenção de dados atualizados dos cidadãos.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. Os dados do usuário são carregados via React Query e atualizados via API PATCH. O formulário utiliza React Hook Form + Zod com validações customizadas. Há dois modos: visualização e edição, com alternância controlada por estado local.

**Fluxo de Dados:**

1. Usuário acessa `/perfil` (autenticado)
2. Sistema busca dados do usuário via API GET `/usuarios/:id`
3. Dados exibidos em modo visualização (campos não editáveis desabilitados)
4. Ao clicar em "Editar Perfil", entra em modo edição
5. Campos editáveis são habilitados (nome, celular, CEP, número, complemento)
6. Usuário pode fazer alterações
7. Ao clicar em "Salvar", envia PATCH para `/usuarios/:id`
8. API atualiza dados e retorna confirmação
9. Toast de sucesso exibido
10. Modo edição desativado, dados atualizados exibidos
11. Ao clicar em "Cancelar", descarta alterações e volta ao modo visualização

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve exibir dados do usuário logado | NF001 – O sistema deve carregar dados em menos de 3 segundos |
| RF002 – O sistema deve permitir edição do perfil | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve proteger campos não editáveis (CPF, e-mail, data de nascimento) | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve permitir editar nome, celular e endereço | NF004 – O sistema deve ter código modular e testável |
| RF005 – O sistema deve validar nome (mínimo 3 caracteres) | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve validar celular (formato válido) | NF006 – O sistema deve ter tratamento de erros amigáveis |
| RF007 – O sistema deve validar CEP de Vilhena (76980-XXX) | NF007 – O sistema deve exibir feedback (toast notifications) |
| RF008 – O sistema deve buscar endereço automaticamente via CEP | NF008 – O sistema deve ter validações em tempo real |
| RF009 – O sistema deve permitir upload de foto de perfil | NF009 – O sistema deve persistir dados após reload |
| RF010 – O sistema deve exibir preview da foto após upload | NF010 – O sistema deve ter formulários acessíveis |
| RF011 – O sistema deve permitir cancelar edição descartando alterações | |
| RF012 – O sistema deve salvar alterações com sucesso | |
| RF013 – O sistema deve exibir loading durante operações | |
| RF014 – O sistema deve permitir logout | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional do perfil do munícipe, incluindo exibição de dados, modo de edição, validações de campos, upload de foto, integração com API e persistência de dados.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização e Exibição de Dados

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /perfil, deve exibir dados do usuário. | ● Página visível <br>● Dados carregados | ● Perfil renderizado |
| Exibição do nome | ● Deve exibir nome do usuário no título. | ● Nome visível <br>● Título correto | ● Nome exibido |
| Seções de informações | ● Deve exibir seções: Informações Pessoais, Informações de Contato, Endereço. | ● 3 seções visíveis <br>● Títulos corretos | ● Seções organizadas |
| Campos exibidos | ● Deve exibir: Nome, CPF, Data de Nascimento, E-mail, Celular, CEP, Logradouro, Bairro, Número, Complemento. | ● Todos os campos visíveis <br>● Dados corretos | ● Dados completos |
| Botões de ação | ● Deve exibir botões "Editar Perfil" e "Sair". | ● Botões visíveis <br>● Habilitados | ● Ações disponíveis |

#### Modo de Edição

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Entrar em modo edição | ● Ao clicar em "Editar Perfil", deve habilitar edição. | ● Campos editáveis habilitados <br>● Botões "Salvar" e "Cancelar" visíveis | ● Modo edição ativado |
| Campos editáveis habilitados | ● Campos editáveis: Nome, Celular, CEP, Logradouro, Bairro, Número, Complemento. | ● Campos habilitados <br>● Inputs editáveis | ● Campos corretos habilitados |
| Campos não editáveis desabilitados | ● Campos não editáveis: CPF, E-mail, Data de Nascimento. | ● Campos desabilitados <br>● Visualmente diferenciados | ● Proteção de dados |
| Cancelar edição | ● Ao clicar em "Cancelar", deve sair do modo edição. <br>● Deve descartar alterações. | ● Modo visualização restaurado <br>● Dados originais mantidos | ● Cancelamento funcional |

#### Validações de Campos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de nome vazio | ● Ao tentar salvar com nome vazio, deve exibir erro. | ● Mensagem "Nome é obrigatório" <br>● Formulário não submetido | ● Validação funcional |
| Validação de nome curto | ● Nome deve ter mínimo 3 caracteres. | ● Mensagem de erro <br>● Validação de tamanho | ● Validação funcional |
| Validação de celular | ● Celular deve ter formato válido (máscara aplicada). | ● Mensagem de erro para formato inválido <br>● Máscara funcional | ● Validação funcional |
| Validação de CEP | ● CEP deve ser de Vilhena (76980-XXX). <br>● Formato válido. | ● Mensagem de erro para CEP fora de Vilhena <br>● Mensagem para formato inválido | ● Validação funcional |

#### Busca de Endereço via CEP

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Autopreenchimento via CEP | ● Ao digitar CEP válido de Vilhena, deve preencher endereço. | ● Requisição para ViaCEP <br>● Campos preenchidos <br>● Dados corretos | ● Autopreenchimento funcional |
| Rejeição de CEP inválido | ● CEP fora de Vilhena deve exibir erro. | ● Mensagem de erro <br>● Campos não preenchidos | ● Validação funcional |

#### Upload de Foto de Perfil

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Área de upload | ● Deve exibir área de upload de foto. | ● Área visível <br>● Botão de upload | ● Upload disponível |
| Upload de foto | ● Deve permitir upload de nova foto. | ● Upload funcional <br>● Arquivo enviado | ● Upload funcional |
| Preview de foto | ● Deve exibir preview da foto após upload. | ● Preview visível <br>● Imagem correta | ● Preview funcional |

#### Salvamento de Dados

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Editar nome | ● Deve permitir editar nome e salvar. | ● Nome atualizado <br>● Toast de sucesso | ● Edição funcional |
| Editar celular | ● Deve permitir editar celular com máscara e salvar. | ● Celular atualizado <br>● Máscara aplicada | ● Edição funcional |
| Editar endereço | ● Deve permitir editar CEP e campos de endereço e salvar. | ● Endereço atualizado <br>● Toast de sucesso | ● Edição funcional |
| Salvamento com sucesso | ● Ao salvar com dados válidos, deve atualizar perfil. <br>● Deve exibir toast de sucesso. <br>● Deve sair do modo edição. | ● Requisição PATCH para /usuarios/:id <br>● Status 200 OK <br>● Toast exibido <br>● Modo visualização restaurado | ● Perfil atualizado |

#### Persistência e Carregamento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Carregamento da API | ● Ao entrar na página, deve carregar dados do usuário da API. | ● Requisição GET para /usuarios/:id <br>● Dados corretos exibidos | ● Dados da API |
| Persistência após reload | ● Dados salvos devem persistir após recarregar página. | ● Dados atualizados exibidos <br>● Persistência confirmada | ● Dados persistentes |
| Loading ao carregar | ● Deve exibir indicador de loading enquanto busca dados. | ● Spinner ou skeleton visível | ● Feedback visual |
| Loading ao salvar | ● Deve exibir indicador de loading ao salvar alterações. | ● Botão de salvar com loading <br>● Feedback visual | ● Feedback visual |

#### Logout

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Fazer logout | ● Ao clicar em "Sair", deve fazer logout. <br>● Deve limpar sessão. <br>● Deve redirecionar para login. | ● Sessão limpa <br>● Cookies removidos <br>● Redirecionamento correto | ● Logout funcional |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout mobile | ● Deve exibir corretamente em viewport mobile (375x667). | ● Layout adaptado <br>● Formulário usável | ● Design responsivo |
| Layout tablet | ● Deve exibir corretamente em viewport tablet (768x1024). | ● Layout adaptado <br>● Formulário usável | ● Design responsivo |
| Layout desktop | ● Deve exibir corretamente em viewport desktop (1920x1080). | ● Layout adaptado <br>● Formulário usável | ● Design responsivo |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Perfil não carrega. <br>● Salvamento não funciona. <br>● Dados não persistem. |
| 2 | Grave | ● Validações não funcionam. <br>● Campos protegidos podem ser editados. <br>● CEP fora de Vilhena aceito. <br>● Upload de foto falha. <br>● Autopreenchimento de endereço não funciona. |
| 3 | Moderada | ● Cancelamento não descarta alterações. <br>● Máscaras não aplicadas. <br>● Toast não exibido. <br>● Layout quebrado. |
| 4 | Pequena | ● Erros de formatação. <br>● Labels desalinhadas. <br>● Mensagens inconsistentes. |

## 6 - Definição de Pronto

A funcionalidade "Perfil do Munícipe" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
