# Plano de Teste

**Projeto Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

**versão 2.2**

---

## Histórico das alterações

| Data | Versão | Descrição | Autor(a) |
|------|--------|-----------|----------|
| 04/12/2025 | 1.0 | Primeira versão do Plano de Testes do Vilhena+Pública | Equipe de QA |
| 04/12/2025 | 1.1 | Atualização após correções de testes e bug de descarte de alterações | Equipe de QA |
| 06/12/2025 | 2.0 | Reestruturação completa: adição de módulos Admin, Autenticação e fluxos completos | Equipe de QA |
| 06/12/2025 | 2.1 | Adição de módulos Operador, Secretaria e Componentes Globais (100% cobertura) | Equipe de QA |
| 06/12/2025 | 2.2 | Simplificação da seção 4.2.2 - foco em casos essenciais com prioridades | Equipe de QA |

---

## 1 - Introdução

O **Vilhena+Pública** é uma plataforma de serviços públicos municipais desenvolvida para atender cidadãos (munícipes) de Vilhena/RO. O sistema permite solicitar serviços como coleta de lixo, iluminação pública, manejo de animais, podas de árvores, pavimentação e saneamento, além de contar com um painel administrativo completo para gestão de demandas, colaboradores, secretarias e tipos de demanda.

A aplicação consiste em um front-end desenvolvido em **Next.js 15** que consome uma API **Express.js** conectada a um banco de dados **MongoDB**, com armazenamento de imagens via **MinIO** e autenticação via **JWT**.

Este plano de testes abrange todos os módulos do sistema: **Autenticação (No-Auth)**, **Munícipe**, **Administração**, **Operador** e **Secretaria**, além de componentes globais, descrevendo cenários, critérios de aceitação e verificações para garantir o correto funcionamento das regras de negócio, a integridade das interações com a API e a experiência do usuário.

> **Observação:** Os testes E2E utilizam as URLs de QA:
> - **Frontend:** `https://servicospublicos-qa.app.fslab.dev`
> - **Backend:** `https://servicospublicos-api-qa.app.fslab.dev`

---

## 2 - Arquitetura

### Front-end
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Gerenciamento de Estado:** React Query (TanStack Query v5) + Context API
- **Validação de Formulários:** React Hook Form + Zod
- **Autenticação:** NextAuth.js v4
- **Notificações:** Sonner (Toast)

**Camadas/Organização:**

| Diretório | Descrição |
|-----------|-----------|
| `src/app/(auth)/` | Rotas autenticadas (admin, munícipe, operador, secretaria) |
| `src/app/(no-auth)/` | Rotas públicas (login, cadastro, recuperação de senha) |
| `src/components/` | Componentes reutilizáveis da UI |
| `src/services/` | Acesso HTTP via Axios |
| `src/hooks/` | Custom hooks (useAuth, etc.) |
| `src/providers/` | Context Providers |
| `src/types/` | Tipagens TypeScript |

### Back-end (API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Banco de Dados:** MongoDB (Mongoose)
- **Armazenamento:** MinIO (imagens)
- **Autenticação:** JWT

### Testes Implementados
- **E2E:** Cypress 15.7.0
- **Unitários:** Jest (API)

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Autenticação de usuário |
| POST | `/usuarios` | Cadastro de novo usuário |
| GET | `/usuarios/:id` | Busca dados do usuário |
| PATCH | `/usuarios/:id` | Atualiza dados do usuário |
| POST | `/recuperar-senha` | Solicita recuperação de senha |
| POST | `/nova-senha` | Define nova senha |
| GET | `/verificar-email/:token` | Verifica e-mail do usuário |
| GET | `/tipoDemanda` | Lista tipos de demanda |
| GET | `/tipoDemanda/:tipo` | Busca demandas por tipo |
| POST | `/demandas` | Cria nova demanda |
| GET | `/demandas/:id` | Busca demanda específica |
| DELETE | `/demandas/:id` | Exclui demanda |
| GET | `/secretaria` | Lista secretarias |
| POST | `/secretaria` | Cria nova secretaria |
| PATCH | `/secretaria/:id` | Atualiza secretaria |
| DELETE | `/secretaria/:id` | Exclui secretaria |
| GET | `/dashboard/metricas` | Busca métricas do dashboard |

---

## 3 - Requisitos

### 3.1 Requisitos Funcionais

| Código | Requisito Funcional | Módulo |
|--------|---------------------|--------|
| RF001 | O sistema deve permitir o login de munícipes com e-mail e senha | Autenticação |
| RF002 | O sistema deve permitir o login de funcionários (admin, operador, secretário) com e-mail e senha | Autenticação |
| RF003 | O sistema deve permitir o cadastro de novos munícipes com validação de CPF, e-mail único e CEP de Vilhena | Autenticação |
| RF004 | O sistema deve enviar e-mail de verificação após cadastro | Autenticação |
| RF005 | O sistema deve permitir recuperação de senha via e-mail | Autenticação |
| RF006 | O sistema deve permitir definição de nova senha com token válido | Autenticação |
| RF007 | O sistema deve exibir página inicial com serviços disponíveis para munícipes | Munícipe |
| RF008 | O sistema deve redirecionar para login ao acessar serviço sem autenticação | Munícipe |
| RF009 | O sistema deve permitir criar novas demandas com endereço válido de Vilhena e imagem obrigatória | Munícipe |
| RF010 | O sistema deve permitir busca e filtro de serviços por tipo | Munícipe |
| RF011 | O sistema deve exibir os pedidos do munícipe com filtros por status | Munícipe |
| RF012 | O sistema deve exibir e permitir edição do perfil do munícipe | Munícipe |
| RF013 | O sistema deve permitir upload de foto de perfil | Munícipe |
| RF014 | O sistema deve realizar logout limpando a sessão | Autenticação |
| RF015 | O sistema deve exibir dashboard com métricas e gráficos para admin | Admin |
| RF016 | O sistema deve permitir CRUD completo de secretarias | Admin |
| RF017 | O sistema deve permitir CRUD completo de colaboradores | Admin |
| RF018 | O sistema deve permitir CRUD completo de tipos de demanda | Admin |
| RF019 | O sistema deve permitir visualização e gestão de todas as demandas | Admin |
| RF020 | O sistema deve exibir mapa interativo de demandas por bairro | Admin |
| RF021 | O sistema deve preencher endereço automaticamente via CEP | Geral |
| RF022 | O sistema deve validar CEP de Vilhena (76980-XXX) | Geral |
| RF023 | O sistema deve permitir ao operador visualizar demandas atribuídas a ele | Operador |
| RF024 | O sistema deve permitir ao operador devolver demanda para secretaria com motivo | Operador |
| RF025 | O sistema deve permitir ao operador resolver demanda com descrição e imagens | Operador |
| RF026 | O sistema deve permitir à secretaria visualizar demandas de suas secretarias | Secretaria |
| RF027 | O sistema deve permitir à secretaria atribuir demanda a operador | Secretaria |
| RF028 | O sistema deve permitir à secretaria rejeitar demanda com motivo | Secretaria |
| RF029 | O sistema deve exibir modal de sessão expirada com opção de re-login | Geral |

### 3.2 Requisitos Não Funcionais

| Código | Requisito Não Funcional |
|--------|------------------------|
| RNF001 | O sistema deve ser compatível com navegadores modernos (Chrome, Firefox, Edge, Safari) |
| RNF002 | O sistema deve ter tempo de resposta percebido < 3s nas operações comuns |
| RNF003 | O sistema deve ter layout responsivo (mobile, tablet, desktop) |
| RNF004 | O sistema deve ter front desacoplado da API; uso de Axios centralizado em services |
| RNF005 | O sistema deve implementar boas práticas de segurança (tokens JWT, HTTPS, validação de entrada) |
| RNF006 | O sistema deve ser acessível com atributos alt em imagens |
| RNF007 | O sistema deve ter código modular e testável com TypeScript |
| RNF008 | O sistema deve seguir padronização de estilo (ESLint, Prettier) |
| RNF009 | O sistema deve exibir mensagens em pt-BR consistentes |
| RNF010 | O sistema deve ter tratamento de erros de API com mensagens amigáveis |
| RNF011 | O sistema deve exibir mensagens de feedback (toast notifications) |
| RNF012 | O sistema deve implementar proteção de rotas autenticadas |

---

## 4 - Casos de Teste

### 4.1 Módulo de Autenticação (No-Auth)

#### 4.1.1 Login Munícipe

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /login/municipe, a página deve carregar corretamente. <br>● Deve exibir campos de e-mail e senha. <br>● Deve exibir botão de entrar. <br>● Deve exibir links para cadastro e recuperação de senha. | ● Campos de input visíveis e habilitados <br>● Botão de submit visível <br>● Links de navegação funcionais | ● Página renderizada corretamente |
| Login com credenciais válidas | ● Ao informar e-mail e senha válidos, o sistema deve autenticar o usuário. <br>● Deve redirecionar para a página inicial logada. <br>● Deve armazenar token JWT na sessão. | ● Requisição POST para /login <br>● Redirecionamento correto <br>● Token armazenado | ● Usuário autenticado com sucesso |
| Login com credenciais inválidas | ● Ao informar e-mail ou senha inválidos, deve exibir mensagem de erro. <br>● Não deve redirecionar. <br>● Campos devem manter os valores digitados. | ● Mensagem de erro exibida <br>● Permanece na página de login <br>● Valores preservados | ● Feedback claro de erro |
| Validação de campos obrigatórios | ● Ao tentar submeter sem preencher campos, deve exibir mensagens de validação. <br>● E-mail deve ter formato válido. <br>● Senha deve ter mínimo de caracteres. | ● Mensagem "E-mail é obrigatório" <br>● Mensagem "Senha é obrigatória" <br>● Validação de formato de e-mail | ● Validações claras e específicas |
| Link para cadastro | ● Ao clicar em "Criar conta", deve redirecionar para /cadastro. | ● Redirecionamento correto | ● Navegação funcional |
| Link para recuperar senha | ● Ao clicar em "Esqueci minha senha", deve redirecionar para /esqueci-senha. | ● Redirecionamento correto | ● Navegação funcional |
| Responsividade | ● A página deve exibir corretamente em mobile, tablet e desktop. | ● Layout adaptado para cada viewport | ● Design responsivo |

#### 4.1.2 Login Funcionário

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /login/funcionario, a página deve carregar corretamente. <br>● Deve exibir campos de e-mail e senha. <br>● Deve diferenciar visualmente do login de munícipe. | ● Campos de input visíveis <br>● Identificação visual de área administrativa | ● Página renderizada corretamente |
| Login de Administrador | ● Admin autenticado deve ser redirecionado para /admin/dashboard. | ● Redirecionamento para dashboard admin | ● Acesso correto ao painel admin |
| Login de Operador | ● Operador autenticado deve ser redirecionado para /operador. | ● Redirecionamento para área do operador | ● Acesso correto ao painel operador |
| Login de Secretário | ● Secretário autenticado deve ser redirecionado para /secretaria. | ● Redirecionamento para área da secretaria | ● Acesso correto ao painel secretaria |
| Proteção de rotas | ● Usuário não autorizado não deve acessar rotas de outros níveis. | ● Redirecionamento para área correta | ● Controle de acesso funcional |

#### 4.1.3 Cadastro de Munícipe

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do formulário | ● Ao acessar /cadastro, o formulário deve carregar com todos os campos. <br>● Campos: Nome, CPF, E-mail, Senha, Confirmar Senha, Data de Nascimento, CEP, Número, Complemento. | ● Todos os campos visíveis <br>● Labels corretos <br>● Placeholders informativos | ● Formulário completo |
| Validação de CPF | ● CPF deve ser validado quanto ao formato (XXX.XXX.XXX-XX). <br>● Deve aplicar máscara automática. <br>● Deve verificar se CPF é válido. | ● Máscara aplicada <br>● Validação de dígitos verificadores <br>● Mensagem de erro clara | ● CPF válido aceito |
| Validação de E-mail único | ● E-mail duplicado deve exibir mensagem de erro. <br>● Formato de e-mail deve ser validado. | ● Verificação de unicidade <br>● Formato válido | ● E-mail único e válido |
| Validação de Senha | ● Senha deve ter mínimo de 8 caracteres. <br>● Deve conter letra maiúscula, minúscula, número e caractere especial. <br>● Confirmação deve coincidir com senha. | ● Regras de complexidade <br>● Mensagens específicas <br>● Confirmação igual | ● Senha segura |
| Validação de CEP de Vilhena | ● Apenas CEPs do município de Vilhena (76980-XXX) devem ser aceitos. <br>● Endereço deve ser preenchido automaticamente. | ● Validação de prefixo 76980 <br>● Autopreenchimento funcional | ● CEP válido de Vilhena |
| Cadastro com sucesso | ● Ao submeter dados válidos, deve criar o usuário. <br>● Deve redirecionar para página de aguardando verificação. <br>● Deve exibir toast de sucesso. | ● Requisição POST para /usuarios <br>● Redirecionamento correto <br>● Toast exibido | ● Usuário cadastrado |
| Validação de campos obrigatórios | ● Todos os campos obrigatórios devem ser validados. <br>● Mensagens de erro específicas por campo. | ● Validações em tempo real <br>● Mensagens claras | ● Feedback apropriado |
| Link para login | ● Ao clicar em "Já possui cadastro?", deve redirecionar para /login/municipe. | ● Redirecionamento correto | ● Navegação funcional |

#### 4.1.4 Verificação de E-mail

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Verificação com token válido | ● Ao acessar /verificar-email?token=XXX com token válido, deve confirmar o e-mail. <br>● Deve exibir mensagem de sucesso com ícone verde. <br>● Deve redirecionar para login após 3 segundos. | ● Requisição GET com token <br>● Mensagem de sucesso <br>● Redirecionamento automático | ● E-mail verificado |
| Token inválido ou expirado | ● Com token inválido, deve exibir mensagem de erro com ícone vermelho. <br>● Deve oferecer botões para login ou novo cadastro. | ● Mensagem de erro clara <br>● Opções de navegação | ● Tratamento de erro |
| Token ausente | ● Sem token na URL, deve exibir mensagem de token não encontrado. | ● Validação de parâmetro <br>● Mensagem informativa | ● Feedback apropriado |
| Loading durante verificação | ● Deve exibir spinner enquanto processa a verificação. | ● Indicador de loading | ● Feedback visual |

#### 4.1.5 Aguardando Verificação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Após cadastro, deve exibir mensagem informando que e-mail foi enviado. <br>● Deve instruir o usuário a verificar a caixa de entrada. | ● Mensagem informativa <br>● Instruções claras | ● Orientação ao usuário |
| Link para reenviar e-mail | ● Deve permitir reenvio do e-mail de verificação. | ● Botão de reenvio <br>● Feedback de envio | ● Opção de reenvio |

#### 4.1.6 Recuperação de Senha (Esqueci Senha)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do formulário | ● Ao acessar /esqueci-senha, deve exibir campo de e-mail. <br>● Deve exibir botão de enviar. | ● Campo de e-mail visível <br>● Botão de submit | ● Formulário correto |
| Envio com e-mail válido | ● Ao informar e-mail cadastrado, deve enviar link de recuperação. <br>● Deve exibir mensagem de confirmação. | ● Requisição POST para /recuperar-senha <br>● Mensagem de sucesso | ● E-mail enviado |
| E-mail não cadastrado | ● Ao informar e-mail não cadastrado, deve exibir mensagem apropriada. | ● Tratamento de erro <br>● Mensagem informativa | ● Feedback claro |
| Validação de formato | ● E-mail deve ter formato válido. | ● Validação de formato | ● Formato correto |
| Link para voltar ao login | ● Deve ter link para retornar à página de login. | ● Link funcional | ● Navegação |

#### 4.1.7 Nova Senha (Redefinição)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização com token válido | ● Ao acessar /nova-senha?token=XXX com token válido, deve exibir formulário. <br>● Campos: Nova Senha, Confirmar Senha. | ● Formulário visível <br>● Campos corretos | ● Página renderizada |
| Token ausente ou inválido | ● Sem token ou token inválido, deve exibir alerta de link inválido. <br>● Deve oferecer link para solicitar novo. | ● Alerta exibido <br>● Link para recuperação | ● Tratamento de erro |
| Validação de nova senha | ● Nova senha deve seguir regras de complexidade. <br>● Confirmação deve coincidir. | ● Validações aplicadas <br>● Mensagens específicas | ● Senha válida |
| Redefinição com sucesso | ● Ao submeter senha válida, deve atualizar a senha. <br>● Deve exibir mensagem de sucesso. <br>● Deve redirecionar para login. | ● Requisição POST <br>● Toast de sucesso <br>● Redirecionamento | ● Senha redefinida |

---

### 4.2 Módulo Munícipe

#### 4.2.1 Página Inicial

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT001 | Deve renderizar a página inicial corretamente | RF007 |
| CT002 | Deve exibir o título principal "Vilhena+Pública" | RF007 |
| CT003 | Deve exibir a descrição principal da plataforma | RF007 |
| CT004 | Deve exibir os botões "Comece Agora" e "Já tenho conta" para usuários não autenticados | RF008 |
| CT005 | Deve exibir a seção de serviços disponíveis | RF007 |
| CT006 | Deve exibir todos os 6 cards de serviços (coleta, iluminação, animais, árvores, pavimentação, saneamento) | RF007 |
| CT007 | Deve exibir a seção "Como Funciona" com os 3 passos | RF007 |
| CT008 | Deve exibir a seção "Por que utilizar" | RF007 |
| CT009 | Deve redirecionar para cadastro ao clicar em "Comece Agora" | RF003 |
| CT010 | Deve redirecionar para login ao clicar em "Já tenho conta" | RF001 |
| CT011 | Deve redirecionar para login ao clicar em card de serviço sem autenticação | RF008 |
| CT012 | Deve navegar para a seção de serviços ao scrollar | RF007 |
| CT013 | Deve exibir corretamente em viewport mobile | RNF003 |
| CT014 | Deve exibir corretamente em viewport tablet | RNF003 |
| CT015 | Deve exibir corretamente em viewport desktop | RNF003 |
| CT016 | Deve exibir mensagem de boas-vindas e botão "Ver Serviços Disponíveis" (autenticado) | RF007 |
| CT017 | Não deve exibir botões "Comece Agora" e "Já tenho conta" quando autenticado | RF007 |
| CT018 | Deve navegar para a página de demanda ao clicar em um serviço (autenticado) | RF009 |
| CT019 | Deve navegar para diferentes tipos de demanda ao clicar nos cards | RF010 |
| CT020 | Deve exibir header com opções de navegação logada | RF007 |
| CT021 | Deve fazer logout ao clicar no botão de sair | RF014 |
| CT022 | Deve verificar que os tipos de serviços correspondem aos esperados | RF007 |
| CT023 | Deve carregar a página dentro de um tempo aceitável | RNF002 |
| CT024 | Deve ter elementos com atributos de acessibilidade adequados | RNF006 |
| CT025 | Deve exibir imagens com atributos alt adequados | RNF006 |

#### 4.2.2 Página de Demanda por Tipo e Criação de Demanda

| ID | Caso de Teste | Requisitos | Prioridade |
|----|---------------|------------|------------|
| CT030 | Deve renderizar a página de demanda corretamente | RF009 | Alta |
| CT031 | Deve exibir o banner com título do tipo de demanda | RF009 | Média |
| CT032 | Deve carregar corretamente cada tipo de demanda (coleta, iluminação, animais, árvores, pavimentação, saneamento) | RF009 | Alta |
| CT033 | Deve exibir campo de busca e permitir filtrar serviços | RF010 | Média |
| CT034 | Deve exibir controles de paginação quando há mais itens | RF010 | Média |
| CT035 | Deve abrir o modal de criação ao clicar em "Criar demanda" | RF009 | Alta |
| CT036 | Deve exibir todos os campos obrigatórios no formulário (CEP, bairro, logradouro, número, descrição, imagem) | RF009 | Alta |
| CT037 | Deve preencher endereço automaticamente ao digitar CEP válido de Vilhena | RF021, RF022 | Alta |
| CT038 | Deve rejeitar CEP fora da região de Vilhena (76980-000 a 76999-999) | RF022 | Alta |
| CT039 | Deve fazer upload de imagem real e exibir preview | RF009 | Alta |
| CT040 | Deve exibir erro ao submeter sem imagem obrigatória | RF009 | Alta |
| CT041 | Deve exibir erros ao submeter formulário sem campos obrigatórios | RF009 | Alta |
| CT042 | Deve exibir erro para descrição muito curta (mín. 10 caracteres) | RF009 | Média |
| CT043 | Deve fechar o modal ao clicar em cancelar | RF009 | Média |
| CT044 | Deve criar demanda com sucesso (fluxo completo com upload real) | RF009 | Alta |
| CT045 | Deve exibir toast de sucesso após criação | RNF011 | Alta |

#### 4.2.3 Meus Pedidos (Pedidos do Munícipe)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem de Pedidos | ● Ao entrar na página, deve listar todos os pedidos do munícipe logado. <br>● Cada card deve exibir: tipo de demanda, descrição, status e data. <br>● Deve carregar dados paginados. | ● Cards com informações corretas <br>● Paginação funcional <br>● Loading durante carregamento | ● Pedidos listados corretamente |
| Filtros por Status | ● Deve exibir tabs/botões de filtro: Todos, Em Aberto, Em Andamento, Concluídas, Recusadas. <br>● Cada filtro deve exibir contador. <br>● Ao selecionar filtro, lista deve atualizar. | ● Filtros funcionais <br>● Contadores corretos <br>● Lista atualizada | ● Filtros precisos |
| Visualizar Detalhes | ● Ao clicar em "Ver mais", deve abrir modal com detalhes completos. <br>● Modal deve exibir: endereço completo, descrição, imagens, status, datas, observações. | ● Modal abre corretamente <br>● Dados completos exibidos <br>● Imagens carregadas | ● Detalhes visíveis |
| Paginação | ● Deve exibir controles de paginação quando há mais pedidos. <br>● Botões anterior/próximo funcionais. <br>● Indicador de página atual. | ● Navegação funcional <br>● Limites respeitados | ● Paginação correta |
| Estado Vazio | ● Quando não há pedidos, deve exibir mensagem apropriada. <br>● Deve sugerir criar nova demanda. | ● Mensagem informativa <br>● CTA para criar demanda | ● Feedback adequado |
| Responsividade | ● Cards devem adaptar para diferentes viewports. <br>● Modal deve ser responsivo. | ● Layout adaptado | ● Design responsivo |

#### 4.2.4 Página de Perfil

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT070 | Deve renderizar a página de perfil corretamente | RF012 |
| CT071 | Deve exibir o nome do usuário no título | RF012 |
| CT072 | Deve exibir a seção de informações pessoais | RF012 |
| CT073 | Deve exibir a seção de informações de contato | RF012 |
| CT074 | Deve exibir a seção de endereço | RF012 |
| CT075 | Deve exibir os botões de ação (Editar Perfil e Sair) | RF012, RF014 |
| CT076 | Deve exibir o campo de nome completo | RF012 |
| CT077 | Deve exibir o campo de CPF (não editável) | RF012 |
| CT078 | Deve exibir o campo de data de nascimento (não editável) | RF012 |
| CT079 | Deve exibir o campo de e-mail (não editável) | RF012 |
| CT080 | Deve exibir o campo de celular | RF012 |
| CT081 | Deve exibir os campos de endereço | RF012 |
| CT082 | Deve entrar no modo de edição ao clicar em "Editar Perfil" | RF012 |
| CT083 | Deve sair do modo de edição ao clicar em "Cancelar" | RF012 |
| CT084 | Deve habilitar campos editáveis no modo de edição | RF012 |
| CT085 | Deve manter campos não editáveis desabilitados | RF012 |
| CT086 | Deve descartar alterações ao cancelar edição | RF012 |
| CT087 | Deve permitir editar o nome | RF012 |
| CT088 | Deve permitir editar o celular com máscara | RF012 |
| CT089 | Deve permitir editar o CEP com busca automática | RF012, RF021 |
| CT090 | Deve salvar alterações com sucesso | RF012 |
| CT091 | Deve exibir erro ao tentar salvar com nome vazio | RF012 |
| CT092 | Deve exibir erro ao tentar salvar com nome muito curto | RF012 |
| CT093 | Deve exibir erro ao tentar salvar com celular inválido | RF012 |
| CT094 | Deve exibir erro ao tentar salvar com CEP fora de Vilhena | RF012, RF022 |
| CT095 | Deve exibir erro ao tentar salvar com CEP em formato inválido | RF012 |
| CT096 | Deve exibir área de upload de foto | RF013 |
| CT097 | Deve permitir upload de nova foto | RF013 |
| CT098 | Deve exibir preview da foto após upload | RF013 |
| CT099 | Deve fazer logout ao clicar no botão "Sair" | RF014 |
| CT100 | Deve limpar dados de sessão após logout | RF014 |
| CT101 | Deve manter dados salvos após recarregar a página | RF012 |
| CT102 | Deve carregar dados do usuário da API ao entrar na página | RF012 |
| CT103 | Deve exibir dados corretos vindos da API | RF012 |
| CT104 | Deve enviar dados corretos para API ao atualizar perfil | RF012 |
| CT105 | Deve exibir loading enquanto carrega dados do perfil | RNF002 |
| CT106 | Deve exibir loading ao salvar alterações | RNF002 |
| CT107 | Deve exibir corretamente em viewport mobile | RNF003 |
| CT108 | Deve exibir corretamente em viewport tablet | RNF003 |
| CT109 | Deve exibir corretamente em viewport desktop | RNF003 |

---

### 4.3 Módulo Administração

#### 4.3.1 Dashboard Admin

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do Dashboard | ● Ao acessar /admin/dashboard, deve carregar a página. <br>● Deve exibir 4 cards de métricas: Demandas, Colaboradores ativos, Operadores ativos, Secretarias. <br>● Cada card deve ter ícone e valor. | ● Cards visíveis <br>● Valores numéricos <br>● Ícones corretos | ● Dashboard renderizado |
| Métricas em Tempo Real | ● Os valores devem ser carregados da API. <br>● Deve exibir loading durante carregamento. <br>● Valores devem refletir dados reais. | ● Requisição para /dashboard/metricas <br>● Dados corretos | ● Métricas atualizadas |
| Mapa de Demandas por Bairro | ● Deve exibir mapa interativo de Vilhena. <br>● Bairros devem ser coloridos conforme quantidade de demandas. <br>● Ao clicar em bairro, deve exibir detalhes. | ● Mapa carregado <br>● Cores aplicadas <br>● Interatividade funcional | ● Mapa interativo |
| Card de Informações do Bairro | ● Ao selecionar bairro no mapa, deve exibir card com detalhes. <br>● Deve listar demandas do bairro. <br>● Deve permitir navegação pelas demandas. | ● Card atualizado <br>● Demandas listadas | ● Informações por bairro |
| Gráfico de Barras (Top 5 Bairros) | ● Deve exibir gráfico com os 5 bairros com mais demandas. <br>● Barras devem ter cores distintas. <br>● Deve exibir valores. | ● Gráfico renderizado <br>● Dados corretos <br>● Cores aplicadas | ● Gráfico funcional |
| Gráfico de Rosca (Demandas por Categoria) | ● Deve exibir gráfico de rosca com distribuição por categoria. <br>● Deve exibir legenda. <br>● Cores devem corresponder às categorias. | ● Gráfico renderizado <br>● Legenda visível <br>● Proporções corretas | ● Gráfico funcional |
| Sessão Expirada | ● Ao receber erro 498 ou "expirado", deve exibir toast e redirecionar para login. | ● Toast exibido <br>● Redirecionamento | ● Tratamento de sessão |
| Responsividade | ● Dashboard deve adaptar para diferentes viewports. <br>● Gráficos devem redimensionar. | ● Layout adaptado | ● Design responsivo |

#### 4.3.2 Gerenciamento de Secretarias

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem de Secretarias | ● Ao acessar /admin/secretaria, deve exibir tabela com secretarias. <br>● Colunas: Nome, Sigla, Email, Telefone, Tipo. <br>● Deve carregar dados paginados. | ● Tabela visível <br>● Colunas corretas <br>● Dados carregados | ● Listagem funcional |
| Campo de Busca | ● Deve permitir pesquisar por nome da secretaria. <br>● Busca em tempo real com debounce. | ● Campo de busca <br>● Filtro aplicado | ● Busca funcional |
| Adicionar Secretaria | ● Ao clicar em "Adicionar", deve abrir modal de criação. <br>● Campos: Nome*, Sigla*, Email*, Telefone*, Tipo*. <br>● Ao salvar, deve criar secretaria e atualizar lista. | ● Modal abre <br>● Campos corretos <br>● Toast de sucesso | ● Secretaria criada |
| Editar Secretaria | ● Ao clicar em editar, deve abrir modal com dados preenchidos. <br>● Ao salvar, deve atualizar secretaria. <br>● Toast de confirmação. | ● Dados pré-preenchidos <br>● Atualização funcional | ● Secretaria editada |
| Excluir Secretaria | ● Ao clicar em excluir, deve abrir modal de confirmação. <br>● Modal deve exibir nome da secretaria. <br>● Ao confirmar, deve excluir e atualizar lista. | ● Modal de confirmação <br>● Exclusão funcional <br>● Toast de sucesso | ● Secretaria excluída |
| Validação de Campos Obrigatórios | ● Nome obrigatório (mín. 3 caracteres). <br>● Sigla obrigatória (mín. 2 caracteres). <br>● Email obrigatório e válido. <br>● Telefone obrigatório e válido. <br>● Tipo obrigatório. | ● Mensagens de erro específicas | ● Validações funcionais |
| Tratamento de Erros | ● Erro ao criar/editar/excluir deve exibir toast de erro. <br>● Mensagem deve ser clara. | ● Toast de erro <br>● Mensagem descritiva | ● Erros tratados |

#### 4.3.3 Gerenciamento de Colaboradores

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem de Colaboradores | ● Ao acessar /admin/colaborador, deve exibir tabela com colaboradores. <br>● Colunas: Nome, Email, CPF, Telefone, Portaria, Cargo, Status. <br>● Deve carregar dados paginados. | ● Tabela visível <br>● Colunas corretas <br>● Dados carregados | ● Listagem funcional |
| Pesquisa | ● Deve permitir pesquisar por nome, CPF ou portaria. <br>● Busca em tempo real com debounce. | ● Campo de busca <br>● Filtro aplicado | ● Busca funcional |
| Filtro por Nível de Acesso | ● Deve permitir filtrar por: Operador, Secretário, Administrador. <br>● Filtro deve atualizar lista. | ● Dropdown de filtro <br>● Lista filtrada | ● Filtro funcional |
| Filtro por Status | ● Deve permitir filtrar por: Ativo, Inativo. <br>● Filtro deve atualizar lista. | ● Dropdown de filtro <br>● Lista filtrada | ● Filtro funcional |
| Adicionar Colaborador | ● Ao clicar em "Adicionar colaborador", deve abrir modal. <br>● Campos: Nome*, Email*, CPF*, Celular*, Data de Nascimento*, Cargo*, Portaria*, Nível de Acesso*, CEP*, Número*. <br>● Ao salvar, deve criar colaborador. | ● Modal abre <br>● Campos corretos <br>● Toast de sucesso | ● Colaborador criado |
| Editar Colaborador | ● Ao clicar em editar, deve abrir modal com dados preenchidos. <br>● Não deve permitir editar admin principal. <br>● Ao salvar, deve atualizar colaborador. | ● Dados pré-preenchidos <br>● Proteção do admin <br>● Toast de sucesso | ● Colaborador editado |
| Excluir/Inativar Colaborador | ● Ao clicar em excluir, deve abrir modal de confirmação. <br>● Não deve permitir excluir admin principal. <br>● Ao confirmar, deve inativar colaborador. | ● Modal de confirmação <br>● Proteção do admin <br>● Toast de sucesso | ● Colaborador inativado |
| Ativar Colaborador | ● Deve permitir reativar colaborador inativo. | ● Botão de ativar <br>● Status atualizado | ● Reativação funcional |
| Validações | ● CPF único e válido. <br>● Email único e válido. <br>● Celular no formato correto. <br>● CEP de Vilhena. | ● Mensagens de erro específicas | ● Validações funcionais |

#### 4.3.4 Gerenciamento de Tipos de Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem de Tipos | ● Ao acessar /admin/tipoDemanda, deve exibir tabela com tipos de demanda. <br>● Colunas: Título, Descrição, Tipo. <br>● Deve carregar dados. | ● Tabela visível <br>● Colunas corretas <br>● Dados carregados | ● Listagem funcional |
| Pesquisa por Título | ● Deve permitir pesquisar por título. <br>● Busca em tempo real. | ● Campo de busca <br>● Filtro aplicado | ● Busca funcional |
| Filtro por Tipo | ● Deve permitir filtrar por categoria (Coleta, Iluminação, etc.). <br>● Filtro deve atualizar lista. | ● Dropdown de filtro <br>● Lista filtrada | ● Filtro funcional |
| Adicionar Tipo de Demanda | ● Ao clicar em "Adicionar tipo", deve abrir modal. <br>● Campos: Título* (mín. 3 caracteres), Tipo*, Descrição* (mín. 10 caracteres). <br>● Ao salvar, deve criar e atualizar lista. | ● Modal abre <br>● Campos corretos <br>● Toast de sucesso | ● Tipo criado |
| Editar Tipo de Demanda | ● Ao clicar em editar, deve abrir modal com dados preenchidos. <br>● Ao salvar, deve atualizar tipo. | ● Dados pré-preenchidos <br>● Toast de sucesso | ● Tipo editado |
| Excluir Tipo de Demanda | ● Ao clicar em excluir, deve abrir modal de confirmação. <br>● Ao confirmar, deve excluir e atualizar lista. | ● Modal de confirmação <br>● Toast de sucesso | ● Tipo excluído |
| Validações | ● Título obrigatório (mín. 3 caracteres). <br>● Tipo obrigatório. <br>● Descrição obrigatória (mín. 10 caracteres). | ● Mensagens de erro específicas | ● Validações funcionais |

#### 4.3.5 Gerenciamento de Demandas (Admin)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Listagem de Todas as Demandas | ● Ao acessar /admin/demanda, deve exibir tabela com todas as demandas do sistema. <br>● Deve carregar todas as páginas de dados. <br>● Paginação local. | ● Tabela visível <br>● Dados carregados <br>● Paginação funcional | ● Listagem completa |
| Pesquisa | ● Deve permitir pesquisar por tipo, bairro ou secretaria. <br>● Busca com debounce. | ● Campo de busca <br>● Filtro aplicado | ● Busca funcional |
| Filtro por Tipo | ● Deve permitir filtrar por tipo de demanda. | ● Dropdown de filtro <br>● Lista filtrada | ● Filtro funcional |
| Filtro por Status | ● Deve permitir filtrar por: Em aberto, Em andamento, Concluída, Recusada. | ● Dropdown de filtro <br>● Lista filtrada | ● Filtro funcional |
| Visualizar Detalhes | ● Ao clicar no ícone de visualizar, deve abrir modal com detalhes completos. <br>● Deve exibir: endereço, descrição, imagens, status, usuário, secretaria. | ● Modal abre <br>● Dados completos | ● Detalhes visíveis |
| Excluir Demanda | ● Ao clicar em excluir, deve abrir modal de confirmação. <br>● Ao confirmar, deve excluir demanda. | ● Modal de confirmação <br>● Toast de sucesso | ● Demanda excluída |
| Paginação Local | ● Deve paginar localmente com 10 itens por página. <br>● Controles de navegação funcionais. <br>● Reset de página ao filtrar. | ● Paginação correta <br>● Navegação funcional | ● Paginação funcional |

#### 4.3.6 Painel do Operador

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Página | ● Ao acessar /operador, deve carregar a página do operador. <br>● Deve exibir banner identificando área do operador. <br>● Deve listar apenas demandas atribuídas ao operador logado. | ● Página carregada <br>● Banner visível <br>● Demandas filtradas por operador | ● Página renderizada |
| Abas de Status | ● Deve exibir abas: "Aguardando Resolução" e "Concluídas". <br>● Ao trocar de aba, lista deve atualizar. <br>● Contador em cada aba. | ● Abas funcionais <br>● Contadores corretos <br>● Lista atualizada | ● Navegação por abas |
| Filtro por Tipo | ● Deve permitir filtrar por tipo de demanda (coleta, iluminação, etc.). <br>● Dropdown com opção "Todos". | ● Dropdown funcional <br>● Filtro aplicado | ● Filtro funcional |
| Filtro por Secretaria | ● Deve permitir filtrar por secretaria vinculada ao operador. <br>● Exibir apenas secretarias do operador. | ● Dropdown com secretarias <br>● Filtro aplicado | ● Filtro funcional |
| Cards de Demanda | ● Cada card deve exibir: título, descrição, tipo, status, endereço, imagens. <br>● Carrossel de imagens quando houver múltiplas. <br>● Botão "Analisar" para abrir detalhes. | ● Cards com informações <br>● Carrossel funcional <br>● Botão analisar | ● Cards informativos |
| Modal de Detalhes da Demanda | ● Ao clicar em "Analisar", deve abrir modal com detalhes completos. <br>● Deve exibir: título, descrição, endereço completo, imagens, status atual. <br>● Botões de ação conforme status. | ● Modal abre <br>● Dados completos <br>● Ações visíveis | ● Modal funcional |
| Devolver Demanda | ● Ao clicar em "Devolver", deve abrir modal de devolução. <br>● Campo de motivo obrigatório. <br>● Ao confirmar, demanda volta para secretaria. <br>● Toast de sucesso. | ● Modal de devolução <br>● Campo de motivo <br>● Status atualizado <br>● Toast exibido | ● Devolução funcional |
| Resolver Demanda | ● Ao clicar em "Resolver", deve abrir modal de resolução. <br>● Campo de descrição da resolução obrigatório. <br>● Upload de imagens de resolução obrigatório (mín. 1). <br>● Ao confirmar, demanda marcada como concluída. | ● Modal de resolução <br>● Campo descrição <br>● Upload de imagens <br>● Toast de sucesso | ● Resolução funcional |
| Validação de Imagens na Resolução | ● Deve aceitar apenas formatos de imagem válidos (JPG, PNG, etc.). <br>● Deve exibir preview das imagens. <br>● Botão X para remover imagem. <br>● Máximo de imagens respeitado. | ● Validação de formato <br>● Preview funcional <br>● Remoção funcional | ● Upload validado |
| Visualizar Demanda Concluída | ● Na aba "Concluídas", ao clicar em demanda, deve exibir detalhes. <br>● Deve mostrar resolução e imagens de resolução. <br>● Sem botões de ação (já finalizada). | ● Detalhes visíveis <br>● Resolução exibida <br>● Imagens de resolução | ● Visualização correta |
| Paginação | ● Deve paginar cards com 6 itens por página. <br>● Controles anterior/próximo. <br>● Indicador de página atual. | ● Paginação funcional <br>● Navegação correta | ● Paginação funcional |
| Skeleton Loading | ● Durante carregamento, deve exibir skeleton nos cards. | ● Skeleton visível | ● Feedback visual |
| Sessão Expirada | ● Ao receber erro 498, deve redirecionar para login com parâmetro expired. | ● Redirecionamento <br>● Parâmetro na URL | ● Tratamento de sessão |

#### 4.3.7 Painel da Secretaria

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Página | ● Ao acessar /secretaria, deve carregar a página da secretaria. <br>● Deve exibir banner identificando área da secretaria. <br>● Deve listar demandas vinculadas às secretarias do usuário. | ● Página carregada <br>● Banner visível <br>● Demandas filtradas | ● Página renderizada |
| Abas de Status | ● Deve exibir abas: "Em Aberto", "Em Andamento", "Concluídas", "Recusadas". <br>● Ao trocar de aba, lista deve atualizar. <br>● Contador em cada aba. | ● Abas funcionais <br>● Contadores corretos <br>● Lista atualizada | ● Navegação por abas |
| Filtro por Tipo | ● Deve permitir filtrar por tipo de demanda. <br>● Dropdown com opção "Todos". | ● Dropdown funcional <br>● Filtro aplicado | ● Filtro funcional |
| Filtro por Secretaria | ● Deve permitir filtrar por secretaria do usuário. <br>● Exibir apenas secretarias vinculadas. | ● Dropdown com secretarias <br>● Filtro aplicado | ● Filtro funcional |
| Cards de Demanda | ● Cada card deve exibir: título, descrição, tipo, status, endereço, imagens. <br>● Carrossel de imagens quando houver múltiplas. <br>● Botão "Analisar" para abrir detalhes. | ● Cards com informações <br>● Carrossel funcional <br>● Botão analisar | ● Cards informativos |
| Modal de Detalhes (Em Aberto) | ● Ao clicar em demanda "Em Aberto", deve abrir modal. <br>● Deve exibir detalhes completos da demanda. <br>● Botões: "Atribuir a Operador" e "Rejeitar". | ● Modal abre <br>● Botões de ação visíveis | ● Modal funcional |
| Atribuir Demanda a Operador | ● Ao clicar em "Atribuir", deve abrir modal de atribuição. <br>● Dropdown com lista de operadores da mesma secretaria. <br>● Ao confirmar, demanda passa para "Em Andamento". <br>● Toast de sucesso. | ● Modal de atribuição <br>● Lista de operadores <br>● Status atualizado <br>● Toast exibido | ● Atribuição funcional |
| Rejeitar Demanda | ● Ao clicar em "Rejeitar", deve abrir modal de rejeição. <br>● Campo de motivo obrigatório. <br>● Ao confirmar, demanda passa para "Recusada". <br>● Toast de sucesso. | ● Modal de rejeição <br>● Campo de motivo <br>● Status atualizado <br>● Toast exibido | ● Rejeição funcional |
| Modal de Detalhes (Em Andamento) | ● Deve exibir nome do operador atribuído. <br>● Deve exibir motivo de devolução se foi devolvida. <br>● Botões para reatribuir ou rejeitar se devolvida. | ● Operador exibido <br>● Motivo devolução (se houver) <br>● Ações disponíveis | ● Detalhes completos |
| Modal de Detalhes (Concluída) | ● Deve exibir resolução do operador. <br>● Deve exibir imagens de resolução. <br>● Deve exibir nome do operador que resolveu. <br>● Sem botões de ação. | ● Resolução visível <br>● Imagens de resolução <br>● Operador identificado | ● Visualização correta |
| Modal de Detalhes (Recusada) | ● Deve exibir motivo da rejeição. <br>● Sem botões de ação. | ● Motivo visível | ● Visualização correta |
| Paginação | ● Deve paginar cards com 6 itens por página. <br>● Controles anterior/próximo. <br>● Indicador de página atual. | ● Paginação funcional <br>● Navegação correta | ● Paginação funcional |
| Sessão Expirada | ● Ao receber erro 498, deve redirecionar para login. | ● Redirecionamento | ● Tratamento de sessão |

#### 4.3.8 Modais e Componentes Globais

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Modal de Sessão Expirada | ● Quando sessão expira, deve exibir modal informativo. <br>● Deve ter ícone de alerta (laranja). <br>● Mensagem explicativa sobre expiração. <br>● Botão "Fazer Login" para redirecionar. <br>● Aviso sobre dados não salvos. | ● Modal exibido <br>● Mensagem clara <br>● Botão funcional <br>● Redirecionamento | ● Modal informativo |
| Modal de Detalhes do Colaborador | ● Ao clicar em visualizar colaborador, deve abrir modal. <br>● Deve exibir: Nome, Email, CPF, Celular, Cargo, Portaria. <br>● Deve exibir secretarias vinculadas. <br>● Deve exibir nível de acesso. <br>● Header estilizado com padrão visual. | ● Modal abre <br>● Dados completos <br>● Secretarias listadas <br>● Nível de acesso | ● Detalhes visíveis |
| Modal de Confirmação de Exclusão | ● Ao clicar em excluir qualquer item, deve exibir modal de confirmação. <br>● Deve exibir nome/título do item. <br>● Botões: "Cancelar" (secundário) e "Excluir" (vermelho). <br>● Ao cancelar, fecha modal sem ação. <br>● Ao confirmar, executa exclusão. | ● Modal exibido <br>● Nome do item <br>● Botões corretos <br>● Ações funcionais | ● Confirmação obrigatória |
| Header Autenticado | ● Deve exibir logo/nome do sistema. <br>● Deve exibir nome do usuário logado. <br>● Menu de navegação conforme nível de acesso. <br>● Botão de logout visível. | ● Logo visível <br>● Nome do usuário <br>● Menu correto <br>● Logout funcional | ● Header informativo |
| Footer | ● Deve exibir informações do sistema. <br>● Deve estar presente em todas as páginas. | ● Footer visível <br>● Informações corretas | ● Footer presente |
| Toast Notifications | ● Toasts de sucesso devem ter cor verde. <br>● Toasts de erro devem ter cor vermelha. <br>● Devem auto-fechar após alguns segundos. <br>● Devem ter botão X para fechar manualmente. | ● Cores corretas <br>● Auto-fechamento <br>● Fechamento manual | ● Feedback visual |
| Carrossel de Imagens | ● Quando há múltiplas imagens, deve exibir carrossel. <br>● Botões anterior/próximo funcionais. <br>● Indicadores de posição (dots). <br>● Imagens carregam corretamente. | ● Navegação funcional <br>● Indicadores visíveis <br>● Imagens carregadas | ● Carrossel funcional |
| Skeleton Loading | ● Durante carregamento de dados, deve exibir skeletons. <br>● Skeletons devem ter animação de pulse. <br>● Devem corresponder ao layout dos cards/itens. | ● Skeletons visíveis <br>● Animação correta <br>● Layout correspondente | ● Feedback de loading |

---

### 4.4 Testes de Consistência API ↔ Frontend

Estes testes fazem **requisições diretas à API** (`cy.request()`) e **comparam os dados retornados com o que é exibido no frontend**, garantindo consistência real entre as camadas.

#### 4.4.1 Página Inicial - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT110 | Deve verificar que os tipos de demanda da API correspondem aos exibidos no frontend | RF007, RNF004 |
| CT111 | Deve verificar que a API de login responde corretamente | RF001 |
| CT112 | Deve verificar consistência entre navegação do frontend e rotas da API | RF008, RNF004 |
| CT113 | Deve verificar que a API está acessível e respondendo | RNF004 |

#### 4.4.2 Página de Demanda - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT120 | Deve exibir dados da API corretamente nos cards - comparação direta | RF009, RNF004 |
| CT121 | Deve verificar estrutura de resposta da API de tipos de demanda | RF009, RNF004 |
| CT122 | Deve verificar que a paginação do frontend corresponde à API | RF010, RNF004 |
| CT123 | Deve enviar dados corretos para a API ao criar demanda e verificar persistência | RF009 |
| CT124 | Deve verificar que filtros do frontend geram requisições corretas para API | RF010, RNF004 |
| CT125 | Deve verificar consistência de categorias entre API e frontend | RF009, RNF004 |

#### 4.4.3 Página de Perfil - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT130 | Deve exibir dados corretos vindos da API - comparação direta | RF012, RNF004 |
| CT131 | Deve enviar dados corretos para API ao atualizar perfil e verificar persistência | RF012 |
| CT132 | Deve verificar que dados do frontend refletem a API após reload | RF012 |
| CT133 | Deve verificar estrutura de resposta da API de usuários | RF012, RNF004 |

#### 4.4.4 Admin - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT140 | Deve verificar que métricas do dashboard correspondem aos dados reais | RF015, RNF004 |
| CT141 | Deve verificar que CRUD de secretarias persiste corretamente na API | RF016, RNF004 |
| CT142 | Deve verificar que CRUD de colaboradores persiste corretamente na API | RF017, RNF004 |
| CT143 | Deve verificar que CRUD de tipos de demanda persiste corretamente na API | RF018, RNF004 |

---

## 5 - Estratégia de Teste

### 5.1 Escopo de Testes

O plano de testes abrange todas as funcionalidades descritas nas tabelas acima, incluindo:

- **Módulo de Autenticação:** Login (munícipe e funcionário), cadastro, verificação de e-mail, recuperação de senha
- **Módulo Munícipe:** Página inicial, demandas por tipo, meus pedidos, perfil
- **Módulo Administração:** Dashboard, secretarias, colaboradores, tipos de demanda, demandas
- **Módulo Operador:** Listagem de demandas atribuídas, devolução, resolução com imagens
- **Módulo Secretaria:** Listagem de demandas, atribuição a operadores, rejeição
- **Componentes Globais:** Modais, toasts, carrossel de imagens, skeletons, header, footer

Serão executados testes em todos os níveis conforme a descrição abaixo:

**Testes Unitários:** O código terá uma cobertura mínima de 70% de testes unitários na API, que são de responsabilidade dos desenvolvedores.

**Testes de Integração:** Serão executados testes de integração em todos os endpoints, e esses testes serão de responsabilidade do time de qualidade.

**Testes Automatizados E2E:** Serão realizados testes end-to-end com Cypress cobrindo os fluxos principais:
- Login e logout (munícipe e funcionário)
- Cadastro e verificação de e-mail
- Criação e visualização de demandas
- Edição de perfil
- CRUD de secretarias, colaboradores e tipos de demanda
- Dashboard e métricas

**Testes Manuais:** Todas as funcionalidades serão testadas manualmente pelo time de qualidade seguindo a documentação de Cenários de Teste e deste TestPlan.

**Versão Beta:** Será lançada uma versão beta para 20 usuários pré-cadastrados antes do release.

### 5.2 Testes E2E (Cypress)
- **Cobertura:** Fluxos completos de todos os módulos
- **Escopo:** Autenticação, Munícipe, Admin
- **Execução:** Automatizada via CLI ou modo interativo

### 5.3 Testes de Consistência API ↔ Frontend (Cypress)
- **Cobertura:** Validação real entre dados da API e exibição no frontend
- **Técnica:** Uso de `cy.request()` para requisições diretas à API
- **Escopo:** Comparação de dados, verificação de persistência, estrutura de respostas

### 5.4 Testes de Integração
- **Escopo:** Validar interação frontend ↔ API
- **Mocks:** Intercept de requisições via Cypress

### 5.5 Testes Manuais
- **Escopo:** Testes exploratórios
- **Ferramentas:** Postman, Insomnia, DevTools

---

## 6 - Ambiente e Ferramentas

| Ferramenta | Fase | Descrição |
|------------|------|-----------|
| Cypress 15.7.0 | E2E | Testes de ponta a ponta automatizados |
| Jest | API | Testes unitários e de integração do backend |
| Postman/Insomnia | Manual | Testes de endpoints da API |
| Chrome DevTools | Debug | Depuração e análise de performance |
| ESLint/Prettier | Dev/CI | Padronização e lint de código |
| GitHub Actions | CI | Integração contínua |

### Ambientes de Teste

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| QA | `https://servicospublicos-qa.app.fslab.dev` | `https://servicospublicos-api-qa.app.fslab.dev` |
| Staging | `https://servicospublicos.app.fslab.dev` | `https://servicospublicos-api.app.fslab.dev` |
| Local | `http://localhost:3000` | `http://localhost:5010` |

---

## 7 - Classificação de Bugs

Os Bugs serão classificados com as seguintes severidades:

| ID | Severidade | Descrição |
|----|------------|-----------|
| 1 | **Blocker** | ● Bug que bloqueia o teste de uma função ou feature, causa crash na aplicação. <br>● Botão não funciona impedindo o uso completo da funcionalidade. <br>● Perda de dados. <br>● Bloqueia a entrega. |
| 2 | **Grave** | ● Funcionalidade não funciona como o esperado. <br>● Input incomum causa efeitos irreversíveis. <br>● Login não funciona, demanda não é criada, dados perdidos. |
| 3 | **Moderada** | ● Funcionalidade não atinge certos critérios de aceitação, mas sua funcionalidade em geral não é afetada. <br>● Mensagem de erro ou sucesso não é exibida. <br>● Validação incompleta. <br>● Há workaround disponível. |
| 4 | **Pequena** | ● Quase nenhum impacto na funcionalidade porém atrapalha a experiência. <br>● Erro ortográfico. <br>● Pequenos erros de UI (espaçamentos, alinhamentos). <br>● Textos inconsistentes. |

---

## 8 - Definição de Pronto

Será considerada pronta a funcionalidade que:

1. ✅ Passar em todos os casos de teste aplicáveis
2. ✅ Não apresentar bugs **Blocker** ou **Grave**
3. ✅ UI revisada em pt-BR e acessibilidade mínima verificada
4. ✅ Documentação atualizada (se aplicável)
5. ✅ Testes E2E implementados e passando
6. ✅ Code review aprovado pela equipe técnica
7. ✅ Deploy em ambiente de staging validado
8. ✅ Validação de negócio aprovada pelo time de produto

---

## 9 - Execução dos Testes

### Executar todos os testes E2E

```bash
npx cypress run
```

### Executar testes por módulo

```bash
# Módulo Munícipe
npx cypress run --spec "cypress/e2e/municipe/**"

# Módulo Admin
npx cypress run --spec "cypress/e2e/admin/**"

# Módulo Operador
npx cypress run --spec "cypress/e2e/operador/**"

# Módulo Secretaria
npx cypress run --spec "cypress/e2e/secretaria/**"
```

### Executar teste específico

```bash
# Página Inicial
npx cypress run --spec "cypress/e2e/municipe/pagina-inicial.cy.ts"

# Demanda por Tipo
npx cypress run --spec "cypress/e2e/municipe/demanda-tipo.cy.ts"

# Perfil
npx cypress run --spec "cypress/e2e/municipe/perfil.cy.ts"

# Secretarias
npx cypress run --spec "cypress/e2e/admin/secretaria.cy.js"

# Colaboradores
npx cypress run --spec "cypress/e2e/admin/colaborador.cy.js"

# Tipos de Demanda
npx cypress run --spec "cypress/e2e/admin/tipoDemanda.cy.js"

# Painel do Operador
npx cypress run --spec "cypress/e2e/operador/painel-operador.cy.ts"

# Painel da Secretaria
npx cypress run --spec "cypress/e2e/secretaria/painel-secretaria.cy.ts"
```

### Executar em modo interativo

```bash
npx cypress open
```

---

## 10 - Massa de Dados de Teste

### Credenciais de Teste

| Tipo | E-mail | Senha | Observação |
|------|--------|-------|------------|
| Munícipe | municipe@exemplo.com | Senha@123 | Usuário munícipe padrão |
| Admin | admin@exemplo.com | Senha@123 | Administrador do sistema |
| Operador | operador@exemplo.com | Senha@123 | Operador de demandas |
| Secretário | secretario@exemplo.com | Senha@123 | Secretário de pasta |

### CEPs de Teste

| CEP | Cidade | Uso |
|-----|--------|-----|
| 76980-000 | Vilhena | CEP válido de Vilhena |
| 76980-632 | Vilhena | CEP válido com logradouro |
| 01310-100 | São Paulo | CEP inválido (fora de Vilhena) |

---

## 11 - Observações

1. **Credenciais de Teste:** Os testes autenticados requerem credenciais válidas. Configure as variáveis de ambiente `CYPRESS_MUNICIPE_EMAIL`, `CYPRESS_MUNICIPE_SENHA`, `CYPRESS_ADMIN_EMAIL`, `CYPRESS_ADMIN_SENHA` ou atualize as credenciais nos arquivos de teste.

2. **Rate Limiting:** A API possui rate limiting configurado. Em caso de muitas execuções seguidas, aguarde alguns minutos ou ajuste o rate limit no backend.

3. **Fixtures:** Alguns testes podem requerer fixtures específicas (ex.: imagens para upload). Certifique-se de que os arquivos necessários existam em `cypress/fixtures/`.

4. **Dependências:** Os testes de usuário autenticado dependem de login bem-sucedido. Se o login falhar, os testes são automaticamente pulados para evitar falsos negativos.

5. **Proteção de Admin:** O usuário administrador principal (admin@exemplo.com) não pode ser editado ou excluído pelos testes para manter a integridade do sistema.

6. **Sessão Expirada:** Tokens JWT expiram após o tempo configurado. Testes longos podem falhar por sessão expirada.

---

**Documento elaborado em:** 04 de dezembro de 2025

**Última atualização:** 06 de dezembro de 2025 - versão 2.2
