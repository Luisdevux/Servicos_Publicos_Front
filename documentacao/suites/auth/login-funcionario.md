# Suite de Teste - Login de Funcionário
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A tela de "Login de Funcionário" é o ponto de entrada para colaboradores da prefeitura (administradores, operadores e secretários) acessarem o sistema de gestão. Esta funcionalidade permite autenticação com e-mail e senha, validando credenciais e redirecionando para o painel adequado conforme o nível de acesso do usuário. O login utiliza autenticação JWT e distingue-se visualmente do login de munícipe.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. A autenticação é gerenciada via NextAuth.js v4 com tokens JWT. Após autenticação bem-sucedida, o sistema identifica o nível de acesso (admin, operador ou secretário) e redireciona para a rota correspondente.

**Fluxo de Dados:**

1. Usuário acessa `/login/funcionario`
2. Preenche e-mail e senha
3. Sistema valida campos localmente (React Hook Form + Zod)
4. Ao submeter, envia requisição POST para `/login`
5. API valida credenciais e retorna token JWT com dados do usuário
6. Sistema identifica nível de acesso do usuário
7. Redirecionamento conforme perfil:
   - **Admin** → `/admin/dashboard`
   - **Operador** → `/operador`
   - **Secretário** → `/secretaria`

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve permitir o login de funcionários com e-mail e senha | NF001 – O sistema deve ter tempo de resposta < 3s nas operações comuns |
| RF002 – O sistema deve validar campos obrigatórios | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve redirecionar admin para /admin/dashboard | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve redirecionar operador para /operador | NF004 – O sistema deve implementar proteção de rotas autenticadas |
| RF005 – O sistema deve redirecionar secretário para /secretaria | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve diferenciar visualmente do login de munícipe | NF006 – O sistema deve ter tratamento de erros com mensagens amigáveis |
| RF007 – O sistema deve armazenar token JWT na sessão | NF007 – O sistema deve ter código modular e testável |
| RF008 – O sistema deve exibir mensagem de erro para credenciais inválidas | NF008 – O sistema deve implementar controle de acesso por nível |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional do login de funcionários, incluindo renderização da página, autenticação de diferentes níveis de acesso (admin, operador, secretário), redirecionamento correto conforme perfil e proteção de rotas.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização e Elementos Visuais

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /login/funcionario, a página deve carregar corretamente. <br>● Deve exibir formulário de login. <br>● Deve ter identificação visual de área administrativa. | ● Formulário visível <br>● Elementos carregados <br>● Visual diferenciado | ● Página renderizada corretamente |
| Exibição de campos | ● Deve exibir campo de e-mail. <br>● Deve exibir campo de senha. <br>● Deve exibir botão de entrar. | ● Campo de e-mail visível <br>● Campo de senha visível <br>● Botão visível | ● Campos exibidos corretamente |

#### Autenticação e Redirecionamento por Nível de Acesso

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Login de Administrador | ● Ao informar credenciais de admin válidas, deve autenticar. <br>● Deve redirecionar para /admin/dashboard. | ● Requisição POST para /login <br>● Token armazenado <br>● Redirecionamento para /admin/dashboard | ● Admin autenticado e redirecionado |
| Login de Operador | ● Ao informar credenciais de operador válidas, deve autenticar. <br>● Deve redirecionar para /operador. | ● Requisição POST para /login <br>● Token armazenado <br>● Redirecionamento para /operador | ● Operador autenticado e redirecionado |
| Login de Secretário | ● Ao informar credenciais de secretário válidas, deve autenticar. <br>● Deve redirecionar para /secretaria. | ● Requisição POST para /login <br>● Token armazenado <br>● Redirecionamento para /secretaria | ● Secretário autenticado e redirecionado |
| Login com credenciais inválidas | ● Ao informar credenciais inválidas, deve exibir mensagem de erro. <br>● Não deve redirecionar. | ● Toast de erro exibido <br>● Permanece na página <br>● Mensagem clara | ● Feedback de erro correto |

#### Proteção de Rotas

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Proteção de rotas autenticadas | ● Usuário não autorizado não deve acessar rotas de outros níveis. <br>● Operador não deve acessar /admin. <br>● Secretário não deve acessar /operador. | ● Redirecionamento correto <br>● Acesso negado quando inadequado | ● Controle de acesso funcional |

#### Validação de Campos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de e-mail obrigatório | ● Ao tentar submeter sem e-mail, deve exibir mensagem "E-mail é obrigatório". | ● Mensagem de erro visível <br>● Formulário não submetido | ● Validação funcional |
| Validação de senha obrigatória | ● Ao tentar submeter sem senha, deve exibir mensagem "Senha é obrigatória". | ● Mensagem de erro visível <br>● Formulário não submetido | ● Validação funcional |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout responsivo | ● Deve exibir corretamente em diferentes viewports (mobile, tablet, desktop). | ● Layout adaptado <br>● Elementos legíveis | ● Design responsivo |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Login não funciona. <br>● Redirecionamento incorreto. <br>● Controle de acesso falha. |
| 2 | Grave | ● Validações não funcionam. <br>● Token JWT não armazenado. <br>● Usuário redirecionado para área incorreta. |
| 3 | Moderada | ● Layout quebrado. <br>● Mensagens de erro inconsistentes. |
| 4 | Pequena | ● Erros de formatação de texto. <br>● Ícones desalinhados. |

## 6 - Definição de Pronto

A funcionalidade "Login de Funcionário" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
