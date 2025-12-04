# Plano de Teste

**Projeto Vilhena+Pública (Next.js + API Express)**

**versão 1.0**

---

## Histórico das alterações

| Data | Versão | Descrição | Autor(a) |
|------|--------|-----------|----------|
| 04/12/2025 | 1.0 | Primeira versão do Plano de Testes do Vilhena+Pública | Equipe de QA |
| 04/12/2025 | 1.1 | Atualização após correções de testes e bug de descarte de alterações | Equipe de QA |

---

## 1 - Introdução

O **Vilhena+Pública** é uma plataforma de serviços públicos municipais que permite aos cidadãos (munícipes) de Vilhena/RO solicitar serviços como coleta de lixo, iluminação pública, manejo de animais, podas de árvores, pavimentação e saneamento. A aplicação consiste em um front-end desenvolvido em **Next.js** que consome uma API **Express.js** conectada a um banco de dados **MongoDB**.

Este plano descreve cenários e critérios de aceitação para garantir o correto funcionamento das regras de negócio, a integridade das interações com a API e a experiência do usuário do módulo **Munícipe**.

> **Observação:** Os testes E2E utilizam as URLs de produção/staging:
> - **Frontend:** `https://servicospublicos.app.fslab.dev`
> - **Backend:** `https://servicospublicos-api.app.fslab.dev`

---

## 2 - Arquitetura

### Front-end
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Gerenciamento de Estado:** React Hooks + Context API

### Camadas/Organização:
| Diretório | Descrição |
|-----------|-----------|
| `src/app/` | Rotas e páginas (App Router) |
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

### Testes já presentes
- **E2E:** Cypress 15.7.0
- **Cobertura:** Jest (API)

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Autenticação de usuário |
| POST | `/usuarios` | Cadastro de novo usuário |
| GET | `/usuarios/:id` | Busca dados do usuário |
| PATCH | `/usuarios/:id` | Atualiza dados do usuário |
| GET | `/tipoDemanda` | Lista tipos de demanda |
| GET | `/tipoDemanda/:tipo` | Busca demandas por tipo |
| POST | `/demandas` | Cria nova demanda |
| GET | `/demandas/:id` | Busca demanda específica |

---

## 3 - Requisitos

### Requisitos Funcionais

| Código | Requisito Funcional | Regra de Negócio Associada |
|--------|---------------------|----------------------------|
| RF001 | Exibir página inicial com serviços disponíveis | Apresentar os 6 tipos de serviços: coleta, iluminação, animais, árvores, pavimentação, saneamento |
| RF002 | Redirecionar para login ao acessar serviço sem autenticação | Usuários não autenticados devem ser direcionados à tela de login |
| RF003 | Permitir cadastro de novo munícipe | Campos obrigatórios: nome, CPF, email, senha, data de nascimento, endereço em Vilhena |
| RF004 | Realizar login de munícipe | Validar credenciais e gerar token JWT |
| RF005 | Exibir lista de serviços por tipo de demanda | Apresentar cards com informações dos serviços disponíveis |
| RF006 | Permitir busca e filtros de serviços | Busca por texto com debounce e filtros por categoria |
| RF007 | Permitir paginação de serviços | Navegação entre páginas de resultados |
| RF008 | Criar nova demanda/solicitação | Campos obrigatórios: CEP (Vilhena), bairro, logradouro, número, descrição, imagem |
| RF009 | Validar CEP de Vilhena | Aceitar apenas CEPs do município de Vilhena (76980-XXX) |
| RF010 | Preencher endereço automaticamente via CEP | Buscar dados de endereço ao digitar CEP válido |
| RF011 | Permitir upload de até 3 imagens por demanda | Aceitar apenas arquivos de imagem (jpg, png, etc.) |
| RF012 | Exibir perfil do usuário autenticado | Mostrar dados pessoais, contato e endereço |
| RF013 | Permitir edição de dados do perfil | Campos editáveis: nome, celular, endereço. CPF, email e data de nascimento não editáveis |
| RF014 | Validar dados do formulário de perfil | Exibir mensagens de erro específicas por campo |
| RF015 | Permitir upload/alteração de foto de perfil | Aceitar imagens para foto do usuário |
| RF016 | Realizar logout | Limpar sessão e redirecionar para login |
| RF017 | Persistir dados após edição | Dados salvos devem ser mantidos após recarregar a página |
| RF018 | Exibir feedback de operações | Toasts de sucesso/erro em operações |
| RF019 | Descartar alterações não salvas | Ao cancelar edição, restaurar valores originais do formulário |

### Requisitos Não Funcionais

| Código | Requisito Não Funcional |
|--------|------------------------|
| RNF001 | Compatível com navegadores modernos (Chrome, Firefox, Edge, Safari) |
| RNF002 | Tempo de resposta percebido < 3s nas operações comuns |
| RNF003 | Layout responsivo (mobile, tablet, desktop) |
| RNF004 | Front desacoplado da API; uso de Axios centralizado em services |
| RNF005 | Boas práticas de segurança (tokens JWT, HTTPS, validação de entrada) |
| RNF006 | Interface acessível com atributos alt em imagens |
| RNF007 | Código modular e testável com TypeScript |
| RNF008 | Padronização de estilo (ESLint, Prettier) |
| RNF009 | Mensagens em pt-BR consistentes |
| RNF010 | Tratamento de erros de API com mensagens amigáveis |

---

## 4 - Casos de Teste

### 4.1 Página Inicial

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT001 | Deve renderizar a página inicial corretamente | RF001 |
| CT002 | Deve exibir o título principal "Vilhena+Pública" | RF001 |
| CT003 | Deve exibir a descrição principal da plataforma | RF001 |
| CT004 | Deve exibir os botões "Comece Agora" e "Já tenho conta" para usuários não autenticados | RF002 |
| CT005 | Deve exibir a seção de serviços disponíveis | RF001 |
| CT006 | Deve exibir todos os 6 cards de serviços | RF001 |
| CT007 | Deve exibir a seção "Como Funciona" com os 3 passos | RF001 |
| CT008 | Deve exibir a seção "Por que utilizar" | RF001 |
| CT009 | Deve redirecionar para cadastro ao clicar em "Comece Agora" | RF003 |
| CT010 | Deve redirecionar para login ao clicar em "Já tenho conta" | RF004 |
| CT011 | Deve redirecionar para login ao clicar em card de serviço sem autenticação | RF002 |
| CT012 | Deve navegar para a seção de serviços ao scrollar | RF001 |
| CT013 | Deve exibir corretamente em viewport mobile | RNF003 |
| CT014 | Deve exibir corretamente em viewport tablet | RNF003 |
| CT015 | Deve exibir corretamente em viewport desktop | RNF003 |
| CT016 | Deve exibir mensagem de boas-vindas e botão "Ver Serviços Disponíveis" (autenticado) | RF001 |
| CT017 | Não deve exibir botões "Comece Agora" e "Já tenho conta" quando autenticado | RF001 |
| CT018 | Deve navegar para a página de demanda ao clicar em um serviço (autenticado) | RF005 |
| CT019 | Deve navegar para diferentes tipos de demanda ao clicar nos cards | RF005 |
| CT020 | Deve exibir header com opções de navegação logada | RF001 |
| CT021 | Deve fazer logout ao clicar no botão de sair | RF016 |
| CT022 | Deve verificar que os tipos de serviços correspondem aos esperados | RF001 |
| CT023 | Deve carregar a página dentro de um tempo aceitável | RNF002 |
| CT024 | Deve ter elementos com atributos de acessibilidade adequados | RNF006 |
| CT025 | Deve exibir imagens com atributos alt adequados | RNF006 |

### 4.2 Página de Demanda por Tipo

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT030 | Deve renderizar a página de demanda corretamente | RF005 |
| CT031 | Deve exibir o banner com título do tipo de demanda | RF005 |
| CT032 | Deve exibir o botão de voltar | RF005 |
| CT033 | Deve exibir o campo de busca | RF006 |
| CT034 | Deve exibir o botão de filtros | RF006 |
| CT035 | Deve exibir o grid de cards de demanda quando há dados | RF005 |
| CT036 | Deve carregar corretamente cada tipo de demanda (coleta, iluminação, animais, árvores, pavimentação, saneamento) | RF005 |
| CT037 | Deve navegar de volta ao clicar em "Voltar" | RF005 |
| CT038 | Deve permitir digitar no campo de busca | RF006 |
| CT039 | Deve realizar busca com debounce ao digitar | RF006 |
| CT040 | Deve limpar a busca ao clicar no botão de limpar | RF006 |
| CT041 | Deve exibir/ocultar filtros ao clicar no botão | RF006 |
| CT042 | Deve trocar de tipo ao clicar em um chip de filtro | RF006 |
| CT043 | Deve exibir informações de paginação | RF007 |
| CT044 | Deve navegar para a próxima página quando disponível | RF007 |
| CT045 | Deve verificar existência de controles de paginação na primeira página | RF007 |
| CT046 | Deve abrir o dialog de criação ao clicar em "Solicitar Serviço" | RF008 |
| CT047 | Deve exibir todos os campos obrigatórios no formulário | RF008 |
| CT048 | Deve preencher automaticamente endereço ao digitar CEP válido | RF010 |
| CT049 | Deve verificar existência do campo de upload de imagem | RF011 |
| CT050 | Deve verificar que botão de remover imagem existe quando há preview | RF011 |
| CT051 | Deve fechar o dialog ao clicar em cancelar | RF008 |
| CT052 | Deve criar demanda com sucesso preenchendo campos obrigatórios (validação de formulário) | RF008 |
| CT053 | Deve verificar que campos obrigatórios têm validação | RF014 |
| CT054 | Deve manter campos com valores válidos após validação falhar | RF014 |
| CT055 | Deve exibir informação sobre imagem obrigatória no formulário | RF011, RF014 |
| CT056 | Deve verificar CEP fora de Vilhena não autocompleta | RF009 |
| CT057 | Deve exibir skeleton durante carregamento | RNF002 |
| CT058 | Deve exibir mensagem quando não há serviços encontrados | RF005 |
| CT059 | Deve exibir botão de tentar novamente em caso de erro | RNF010 |
| CT060 | Deve exibir dados da API corretamente nos cards | RF005 |
| CT061 | Deve enviar dados corretos para a API ao criar demanda | RF008 |

### 4.3 Página de Perfil

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT070 | Deve renderizar a página de perfil corretamente | RF012 |
| CT071 | Deve exibir o nome do usuário no título | RF012 |
| CT072 | Deve exibir a seção de informações pessoais | RF012 |
| CT073 | Deve exibir a seção de informações de contato | RF012 |
| CT074 | Deve exibir a seção de endereço | RF012 |
| CT075 | Deve exibir os botões de ação (Editar Perfil e Sair) | RF012, RF016 |
| CT076 | Deve exibir o campo de nome completo | RF012 |
| CT077 | Deve exibir o campo de CPF (não editável) | RF012, RF013 |
| CT078 | Deve exibir o campo de data de nascimento (não editável) | RF012, RF013 |
| CT079 | Deve exibir o campo de e-mail (não editável) | RF012, RF013 |
| CT080 | Deve exibir o campo de celular | RF012 |
| CT081 | Deve exibir os campos de endereço | RF012 |
| CT082 | Deve entrar no modo de edição ao clicar em "Editar Perfil" | RF013 |
| CT083 | Deve sair do modo de edição ao clicar em "Cancelar" | RF013 |
| CT084 | Deve habilitar campos editáveis no modo de edição | RF013 |
| CT085 | Deve manter campos não editáveis desabilitados | RF013 |
| CT086 | Deve descartar alterações ao cancelar edição | RF013, RF019 |
| CT087 | Deve permitir editar o nome | RF013 |
| CT088 | Deve permitir editar o celular com máscara | RF013 |
| CT089 | Deve permitir editar o CEP com busca automática | RF010, RF013 |
| CT090 | Deve salvar alterações com sucesso | RF013, RF017 |
| CT091 | Deve exibir erro ao tentar salvar com nome vazio | RF014 |
| CT092 | Deve exibir erro ao tentar salvar com nome muito curto | RF014 |
| CT093 | Deve exibir erro ao tentar salvar com celular inválido | RF014 |
| CT094 | Deve exibir erro ao tentar salvar com CEP fora de Vilhena | RF009, RF014 |
| CT095 | Deve exibir erro ao tentar salvar com CEP em formato inválido | RF014 |
| CT096 | Deve exibir área de upload de foto | RF015 |
| CT097 | Deve permitir upload de nova foto | RF015 |
| CT098 | Deve exibir preview da foto após upload | RF015 |
| CT099 | Deve fazer logout ao clicar no botão "Sair" | RF016 |
| CT100 | Deve limpar dados de sessão após logout | RF016 |
| CT101 | Deve manter dados salvos após recarregar a página | RF017 |
| CT102 | Deve carregar dados do usuário da API ao entrar na página | RF012 |
| CT103 | Deve exibir dados corretos vindos da API | RF012 |
| CT104 | Deve enviar dados corretos para API ao atualizar perfil | RF013 |
| CT105 | Deve exibir loading enquanto carrega dados do perfil | RNF002 |
| CT106 | Deve exibir loading ao salvar alterações | RNF002 |
| CT107 | Deve exibir corretamente em viewport mobile | RNF003 |
| CT108 | Deve exibir corretamente em viewport tablet | RNF003 |
| CT109 | Deve exibir corretamente em viewport desktop | RNF003 |

### 4.4 Testes de Consistência API ↔ Frontend

Estes testes fazem **requisições diretas à API** (`cy.request()`) e **comparam os dados retornados com o que é exibido no frontend**, garantindo consistência real entre as camadas.

#### Página Inicial - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT110 | Deve verificar que os tipos de demanda da API correspondem aos exibidos no frontend | RF001, RNF004 |
| CT111 | Deve verificar que a API de login responde corretamente | RF004 |
| CT112 | Deve verificar consistência entre navegação do frontend e rotas da API | RF002, RNF004 |
| CT113 | Deve verificar que a API está acessível e respondendo | RNF004 |

#### Página de Demanda - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT120 | Deve exibir dados da API corretamente nos cards - comparação direta | RF005, RNF004 |
| CT121 | Deve verificar estrutura de resposta da API de tipos de demanda | RF005, RNF004 |
| CT122 | Deve verificar que a paginação do frontend corresponde à API | RF007, RNF004 |
| CT123 | Deve enviar dados corretos para a API ao criar demanda e verificar persistência | RF008, RF017 |
| CT124 | Deve verificar que filtros do frontend geram requisições corretas para API | RF006, RNF004 |
| CT125 | Deve verificar consistência de categorias entre API e frontend | RF005, RNF004 |

#### Página de Perfil - Consistência

| ID | Caso de Teste | Requisitos |
|----|---------------|------------|
| CT130 | Deve exibir dados corretos vindos da API - comparação direta | RF012, RNF004 |
| CT131 | Deve enviar dados corretos para API ao atualizar perfil e verificar persistência | RF013, RF017 |
| CT132 | Deve verificar que dados do frontend refletem a API após reload | RF012, RF017 |
| CT133 | Deve verificar estrutura de resposta da API de usuários | RF012, RNF004 |

---

## 5 - Estratégia de Teste

### 5.1 Testes E2E (Cypress)
- **Cobertura:** Fluxos completos do módulo Munícipe
- **Escopo:** Página inicial, demanda por tipo, perfil
- **Execução:** Automatizada via CLI ou modo interativo

### 5.2 Testes de Consistência API ↔ Frontend (Cypress)
- **Cobertura:** Validação real entre dados da API e exibição no frontend
- **Técnica:** Uso de `cy.request()` para requisições diretas à API
- **Escopo:** Comparação de dados, verificação de persistência, estrutura de respostas

### 5.3 Testes Unitários (Jest - API)
- **Cobertura mínima:** 70%
- **Escopo:** Controllers, Services, Utils

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
| Staging | `https://servicospublicos.app.fslab.dev` | `https://servicospublicos-api.app.fslab.dev` |
| Local | `http://localhost:3000` | `http://localhost:5010` |

---

## 7 - Classificação de Bugs

| ID | Severidade | Descrição |
|----|------------|-----------|
| 1 | **Blocker** | Impede uso da funcionalidade principal, crash, botão essencial inoperante, perda de dados |
| 2 | **Grave** | Erros lógicos sérios (demanda não criada, login não funciona, dados perdidos) |
| 3 | **Moderada** | Critério não atendido mas há workaround (ex.: mensagem ausente, validação incompleta) |
| 4 | **Pequena** | Impacto mínimo na experiência (UI, textos, espaçamentos, alinhamentos) |

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

---

## 9 - Execução dos Testes

### Executar todos os testes E2E do módulo Munícipe

```bash
npx cypress run --spec "cypress/e2e/municipe/**"
```

### Executar teste específico

```bash
# Página Inicial
npx cypress run --spec "cypress/e2e/municipe/pagina-inicial.cy.ts"

# Demanda por Tipo
npx cypress run --spec "cypress/e2e/municipe/demanda-tipo.cy.ts"

# Perfil
npx cypress run --spec "cypress/e2e/municipe/perfil.cy.ts"
```

### Executar em modo interativo

```bash
npx cypress open
```

---

## 10 - Observações

1. **Credenciais de Teste:** Os testes autenticados requerem credenciais válidas de munícipe. Configure as variáveis de ambiente `CYPRESS_MUNICIPE_EMAIL` e `CYPRESS_MUNICIPE_SENHA` ou atualize as credenciais nos arquivos de teste.

2. **Rate Limiting:** A API possui rate limiting configurado. Em caso de muitas execuções seguidas, aguarde alguns minutos ou ajuste o rate limit no backend.

3. **Fixtures:** Alguns testes podem requerer fixtures específicas (ex.: imagens para upload). Certifique-se de que os arquivos necessários existam em `cypress/fixtures/`.

4. **Dependências:** Os testes de usuário autenticado dependem de login bem-sucedido. Se o login falhar, os testes são automaticamente pulados para evitar falsos negativos.

---

**Documento elaborado em:** 04 de dezembro de 2025

**Última atualização:** versão 1.1
