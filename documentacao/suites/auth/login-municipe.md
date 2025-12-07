# Suite de Teste - Login de Munícipe
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A tela de "Login de Munícipe" é o ponto de entrada para cidadãos de Vilhena/RO acessarem a plataforma de serviços públicos. Esta funcionalidade permite que usuários se autentiquem com e-mail e senha, acessem suas demandas, criem novos pedidos e gerenciem seu perfil. O login utiliza autenticação JWT e valida credenciais através da API do sistema.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. A autenticação é gerenciada via NextAuth.js v4, que armazena tokens JWT na sessão. A validação de formulários utiliza React Hook Form + Zod, e as notificações são exibidas via Sonner (Toast).

**Fluxo de Dados:**

1. Usuário acessa `/login/municipe`
2. Preenche e-mail e senha
3. Sistema valida campos localmente (React Hook Form + Zod)
4. Ao submeter, envia requisição POST para `/login`
5. API valida credenciais e retorna token JWT
6. Token armazenado na sessão (NextAuth)
7. Redirecionamento para página inicial autenticada

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve permitir o login de munícipes com e-mail e senha | NF001 – O sistema deve ter tempo de resposta < 3s nas operações comuns |
| RF002 – O sistema deve validar campos obrigatórios (e-mail e senha) | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve exibir mensagem de erro para credenciais inválidas | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve redirecionar para página inicial após login bem-sucedido | NF004 – O sistema deve implementar boas práticas de segurança (JWT, HTTPS) |
| RF005 – O sistema deve armazenar token JWT na sessão | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve permitir navegação para cadastro | NF006 – O sistema deve ter tratamento de erros com mensagens amigáveis |
| RF007 – O sistema deve permitir navegação para recuperação de senha | NF007 – O sistema deve ter código modular e testável |
| RF008 – O sistema deve permitir visualização da senha (toggle) | NF008 – O sistema deve exibir feedback (toast notifications) |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional do login de munícipes, incluindo renderização da página, validação de campos, autenticação com credenciais válidas e inválidas, navegação para outras páginas e responsividade.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização e Elementos Visuais

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /login/municipe, a página deve carregar corretamente. <br>● Deve exibir formulário de login. | ● Formulário visível <br>● Elementos carregados | ● Página renderizada corretamente |
| Exibição de campos | ● Deve exibir campo de e-mail. <br>● Deve exibir campo de senha. <br>● Deve exibir botão de entrar. | ● Campo de e-mail visível <br>● Campo de senha visível <br>● Botão visível | ● Campos exibidos corretamente |
| Exibição de links | ● Deve exibir link "Criar conta". <br>● Deve exibir link "Esqueci minha senha". | ● Link para cadastro visível <br>● Link para recuperação visível | ● Links de navegação presentes |

#### Validação de Campos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de e-mail obrigatório | ● Ao tentar submeter sem e-mail, deve exibir mensagem "E-mail é obrigatório". | ● Mensagem de erro visível <br>● Formulário não submetido | ● Validação funcional |
| Validação de e-mail inválido | ● Ao informar e-mail em formato inválido, deve exibir mensagem de erro. | ● Mensagem de erro específica <br>● Formulário não submetido | ● Validação de formato |
| Validação de senha obrigatória | ● Ao tentar submeter sem senha, deve exibir mensagem "Senha é obrigatória". | ● Mensagem de erro visível <br>● Formulário não submetido | ● Validação funcional |

#### Autenticação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Login com credenciais válidas | ● Ao informar e-mail e senha válidos, o sistema deve autenticar o usuário. <br>● Deve armazenar token JWT na sessão. <br>● Deve redirecionar para página inicial. | ● Requisição POST para /login <br>● Token armazenado <br>● Redirecionamento correto | ● Usuário autenticado com sucesso |
| Login com credenciais inválidas | ● Ao informar credenciais inválidas, deve exibir toast de erro. <br>● Não deve redirecionar. <br>● Deve manter usuário na página de login. | ● Toast de erro exibido <br>● Permanece na página <br>● Mensagem clara | ● Feedback de erro correto |

#### Navegação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Link para cadastro | ● Ao clicar em "Criar conta", deve redirecionar para /cadastro. | ● Redirecionamento correto <br>● URL atualizada | ● Navegação funcional |
| Link para recuperar senha | ● Ao clicar em "Esqueci minha senha", deve redirecionar para /esqueci-senha. | ● Redirecionamento correto <br>● URL atualizada | ● Navegação funcional |

#### Interatividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Toggle de visibilidade da senha | ● Deve exibir ícone para mostrar/ocultar senha. <br>● Ao clicar, senha deve alternar entre visível e oculta. | ● Ícone presente <br>● Alternância funcional <br>● Tipo do input alterna entre "password" e "text" | ● Toggle funcional |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout mobile | ● Deve exibir corretamente em viewport mobile (375x667). | ● Layout adaptado <br>● Elementos legíveis | ● Design responsivo |
| Layout tablet | ● Deve exibir corretamente em viewport tablet (768x1024). | ● Layout adaptado <br>● Elementos legíveis | ● Design responsivo |
| Layout desktop | ● Deve exibir corretamente em viewport desktop (1920x1080). | ● Layout adaptado <br>● Elementos legíveis | ● Design responsivo |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Login não funciona. <br>● Página não carrega. <br>● Redirecionamento após login falha. |
| 2 | Grave | ● Validações não funcionam. <br>● Toast de erro não exibido. <br>● Token JWT não armazenado. |
| 3 | Moderada | ● Links de navegação não funcionam. <br>● Toggle de senha não funciona. <br>● Layout quebrado em algum viewport. |
| 4 | Pequena | ● Erros de formatação de texto. <br>● Mensagens inconsistentes. <br>● Ícones desalinhados. |

## 6 - Definição de Pronto

A funcionalidade "Login de Munícipe" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
