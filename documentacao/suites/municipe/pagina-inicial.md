# Suite de Teste - Página Inicial (Munícipe)
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A "Página Inicial" é a landing page principal da plataforma Vilhena+Pública, servindo como ponto de entrada tanto para usuários não autenticados quanto para munícipes logados. A página apresenta os serviços disponíveis (coleta de lixo, iluminação pública, manejo de animais, podas de árvores, pavimentação e saneamento), informações sobre como funciona a plataforma e opções de navegação adaptadas conforme o estado de autenticação do usuário.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. A renderização é híbrida (server-side e client-side) com componentes dinâmicos baseados no estado de autenticação via NextAuth.js. A interface adapta-se conforme o usuário está ou não logado, exibindo diferentes CTAs (Call-to-Actions) e comportamentos de navegação.

**Fluxo de Dados:**

**Usuário Não Autenticado:**
1. Acessa `/` (página inicial)
2. Visualiza título, descrição e CTAs "Comece Agora" e "Já tenho conta"
3. Visualiza 6 cards de serviços
4. Ao clicar em serviço, é redirecionado para login
5. Ao clicar em "Comece Agora", vai para `/cadastro`
6. Ao clicar em "Já tenho conta", vai para `/login/municipe`

**Usuário Autenticado:**
1. Acessa `/` (página inicial)
2. Visualiza mensagem de boas-vindas e botão "Ver Serviços Disponíveis"
3. Visualiza 6 cards de serviços
4. Ao clicar em serviço, é redirecionado para página de demanda correspondente
5. Header exibe opções de navegação logada (Início, Meus Pedidos, Perfil, Sair)

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve exibir página inicial com título e descrição | NF001 – O sistema deve carregar em menos de 3 segundos |
| RF002 – O sistema deve exibir 6 cards de serviços disponíveis | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve exibir CTAs para usuários não autenticados | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve exibir mensagem de boas-vindas para usuários logados | NF004 – O sistema deve ter código modular e testável |
| RF005 – O sistema deve redirecionar para login ao clicar em serviço (não autenticado) | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve navegar para demanda ao clicar em serviço (autenticado) | NF006 – O sistema deve ter elementos com atributos de acessibilidade |
| RF007 – O sistema deve exibir seção "Como Funciona" com 3 passos | NF007 – O sistema deve ter tratamento de erros amigáveis |
| RF008 – O sistema deve exibir seção "Por que utilizar" | NF008 – O sistema deve implementar proteção de rotas |
| RF009 – O sistema deve permitir navegação para cadastro e login | |
| RF010 – O sistema deve exibir header com opções de navegação (autenticado) | |
| RF011 – O sistema deve permitir logout | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional da página inicial, incluindo renderização de elementos, navegação conforme estado de autenticação, exibição de serviços, seções informativas e responsividade.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização - Usuário Não Autenticado

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /, a página deve carregar corretamente. | ● Página visível <br>● Elementos carregados | ● Página renderizada |
| Exibição de título e descrição | ● Deve exibir título "Vilhena+Pública". <br>● Deve exibir descrição da plataforma. | ● Título visível <br>● Descrição visível | ● Informações exibidas |
| Exibição de CTAs | ● Deve exibir botões "Comece Agora" e "Já tenho conta". | ● Botão "Comece Agora" visível <br>● Botão "Já tenho conta" visível | ● CTAs presentes |
| Exibição de serviços | ● Deve exibir 6 cards de serviços: coleta de lixo, iluminação pública, manejo de animais, podas de árvores, pavimentação e saneamento. | ● 6 cards visíveis <br>● Títulos corretos <br>● Ícones/imagens presentes | ● Serviços exibidos |
| Seção "Como Funciona" | ● Deve exibir seção com os 3 passos do processo. | ● Seção visível <br>● 3 passos exibidos | ● Informações presentes |
| Seção "Por que utilizar" | ● Deve exibir seção com benefícios. | ● Seção visível <br>● Benefícios listados | ● Informações presentes |

#### Navegação - Usuário Não Autenticado

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Navegação para cadastro | ● Ao clicar em "Comece Agora", deve redirecionar para /cadastro. | ● Redirecionamento correto <br>● URL atualizada | ● Navegação funcional |
| Navegação para login | ● Ao clicar em "Já tenho conta", deve redirecionar para /login/municipe. | ● Redirecionamento correto <br>● URL atualizada | ● Navegação funcional |
| Redirecionamento ao clicar em serviço | ● Ao clicar em card de serviço, deve redirecionar para /login/municipe. | ● Redirecionamento correto <br>● Proteção de rota | ● Redirecionamento funcional |

#### Renderização - Usuário Autenticado

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Mensagem de boas-vindas | ● Deve exibir mensagem de boas-vindas personalizada. <br>● Deve exibir botão "Ver Serviços Disponíveis". | ● Mensagem visível <br>● Botão visível | ● Boas-vindas exibidas |
| CTAs não exibidos | ● Não deve exibir botões "Comece Agora" e "Já tenho conta". | ● Botões ausentes | ● Interface adaptada |
| Header com navegação | ● Deve exibir header com opções: Início, Meus Pedidos, Perfil, Sair. | ● Menu de navegação visível <br>● Opções corretas | ● Header autenticado |
| Exibição de serviços | ● Deve exibir 6 cards de serviços. | ● 6 cards visíveis | ● Serviços exibidos |

#### Navegação - Usuário Autenticado

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Navegação para demanda | ● Ao clicar em card de serviço, deve navegar para página de demanda do tipo correspondente. | ● Redirecionamento correto <br>● URL com tipo de demanda | ● Navegação funcional |
| Navegação por tipo de serviço | ● Cada card deve navegar para o tipo correto (coleta, iluminação, animais, árvores, pavimentação, saneamento). | ● URLs corretas <br>● Tipos correspondentes | ● Tipos corretos |
| Logout | ● Ao clicar em "Sair", deve fazer logout. <br>● Deve limpar sessão. <br>● Deve redirecionar para página inicial não autenticada. | ● Sessão limpa <br>● Redirecionamento correto <br>● CTAs exibidos novamente | ● Logout funcional |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout mobile | ● Deve exibir corretamente em viewport mobile (375x667). | ● Layout adaptado <br>● Cards empilhados <br>● Elementos legíveis | ● Design responsivo |
| Layout tablet | ● Deve exibir corretamente em viewport tablet (768x1024). | ● Layout adaptado <br>● Grid de cards apropriado <br>● Elementos legíveis | ● Design responsivo |
| Layout desktop | ● Deve exibir corretamente em viewport desktop (1920x1080). | ● Layout adaptado <br>● Grid de cards apropriado <br>● Elementos legíveis | ● Design responsivo |

#### Acessibilidade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Atributos alt em imagens | ● Todas as imagens devem ter atributos alt descritivos. | ● Atributos alt presentes <br>● Descrições adequadas | ● Acessibilidade funcional |
| Elementos com atributos adequados | ● Botões e links devem ter labels claros. | ● Labels presentes <br>● Textos descritivos | ● Acessibilidade funcional |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Página não carrega. <br>● Serviços não exibidos. <br>● Navegação não funciona. |
| 2 | Grave | ● CTAs não funcionam. <br>● Redirecionamento incorreto. <br>● Logout não funciona. <br>● Header não exibido para usuário logado. |
| 3 | Moderada | ● Seções informativas não exibidas. <br>● Layout quebrado em algum viewport. <br>● Cards de serviços com informações incompletas. |
| 4 | Pequena | ● Erros de formatação de texto. <br>● Imagens sem alt. <br>● Alinhamentos incorretos. |

## 6 - Definição de Pronto

A funcionalidade "Página Inicial (Munícipe)" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
