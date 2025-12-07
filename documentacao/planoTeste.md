# Plano de Teste

**Vilhena+Pública - Plataforma de Gestão de Serviços Públicos Municipais**

---

## 1 - Introdução

O **Vilhena+Pública** é um sistema web para gerenciamento de serviços públicos municipais de Vilhena/RO. A principal finalidade é permitir que cidadãos (munícipes) solicitem serviços públicos de forma digital, acompanhem o andamento de suas demandas, além de oferecer painéis administrativos completos para gestão de demandas, colaboradores, secretarias e tipos de serviços.

O sistema possui três níveis de acesso: **Munícipe** (cidadãos), **Funcionários** (Operadores e Secretários) e **Administradores**, cada um com funcionalidades específicas conforme seu perfil de atuação.

> **Documentação Detalhada:** As suites de teste individuais (15 suites com 389 casos de teste implementados) estão disponíveis em [`documentacao/suites/`](suites/) com índice completo em [`documentacao/README.md`](README.md)

---

## 2 - Arquitetura

O sistema utiliza **Next.js 15 com App Router** como framework principal para o frontend, que possui uma arquitetura orientada a componentes com **React 19**. A aplicação implementa Server-Side Rendering (SSR) e Client-Side Rendering (CSR) conforme necessário.

**Stack Tecnológica:**

- **Frontend:** Next.js 15, React 19, TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Gerenciamento de Estado:** React Query (TanStack Query v5) + Context API
- **Validação de Formulários:** React Hook Form + Zod
- **Autenticação:** NextAuth.js v4
- **UI Components:** Shadcn/UI (Radix UI)
- **Notificações:** Sonner (Toast Notifications)
- **Testes E2E:** Cypress 15.7.0
- **Containerização:** Docker

Para o armazenamento, consulta e alteração de dados da aplicação, o sistema consome uma **API REST (Node.js/Express)** que disponibiliza endpoints para demandas, usuários, secretarias, colaboradores e uploads. A comunicação é feita através de requisições HTTP com autenticação via **Bearer Token (JWT)**, retornando dados em formato JSON. O armazenamento de arquivos é feito via **MinIO** e o banco de dados é **MongoDB**.

**Fluxo de Arquitetura:**

1. **Cliente (Next.js App)** → Requisição HTTPS com Token JWT (Autenticado) ou Pública (Login/Cadastro)
2. **API REST** → Processa, valida requisição e gerencia arquivos no MinIO
3. **Retorna resposta JSON** com dados paginados
4. **Cliente atualiza estado e UI** usando React Query

---

## 3 - Categorização dos Requisitos em Funcionais x Não Funcionais

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve permitir o login de munícipes e funcionários via e-mail e senha. | NF001 – O sistema deve exibir mensagens de feedback (toast notifications) para ações de sucesso ou erro. |
| RF002 – O sistema deve permitir cadastrar demandas com tipo, descrição, endereço (CEP de Vilhena), imagem obrigatória. | NF002 – O sistema deve implementar proteção de rotas autenticadas (middleware). |
| RF003 – O sistema deve permitir o upload de imagens para as demandas. | NF003 – O sistema deve ser responsivo e otimizado para diferentes viewports (mobile, tablet, desktop). |
| RF004 – O sistema deve validar automaticamente o CEP de Vilhena (76980-XXX a 76999-XXX). | NF004 – O tempo de resposta da API para listagem de demandas deve ser baixo para não comprometer a experiência. |
| RF005 – O sistema deve listar demandas com filtros por status (Em Aberto, Em Andamento, Concluída, Recusada). | NF005 – O sistema deve ter código modular, testável e seguir boas práticas (TypeScript, ESLint). |
| RF006 – O sistema deve permitir editar perfil do munícipe (nome, celular, endereço). | NF006 – O sistema deve implementar validações client-side (Zod) e server-side. |
| RF007 – O sistema deve permitir visualizar dashboard com métricas e mapa de bairros (Admin). | NF007 – O sistema deve ter tratamento de erros de API com mensagens amigáveis. |
| RF008 – O sistema deve permitir CRUD de secretarias, colaboradores e tipos de demanda (Admin). | NF008 – O sistema deve ter atributos de acessibilidade (alt em imagens, labels em formulários). |
| RF009 – O sistema deve permitir cadastro de novos munícipes com validação de CPF, e-mail único e senha segura. | NF009 – O sistema deve exibir mensagens em pt-BR consistentes. |
| RF010 – O sistema deve permitir ao operador devolver ou resolver demandas com descrição e imagens. | NF010 – O sistema deve implementar paginação para listagens grandes. |
| RF011 – O sistema deve permitir à secretaria atribuir demandas a operadores ou rejeitá-las. | NF011 – O sistema deve ter proteção contra ações críticas (confirmação de exclusão). |
| RF012 – O sistema deve enviar e-mail de verificação após cadastro de munícipe. | NF012 – O sistema deve ter loading states e skeleton screens durante carregamento. |
| RF013 – O sistema deve permitir recuperação de senha via e-mail com token válido. | |
| RF014 – O sistema deve preencher endereço automaticamente ao digitar CEP válido. | |
| RF015 – O sistema deve exibir modal de sessão expirada com opção de re-login. | |

---

## 4 - Casos de Teste

> **Documentação Detalhada:** Para especificações completas de cada suite (15 suites com 389 casos de teste implementados), consulte [`documentacao/suites/`](suites/) com índice completo em [`documentacao/README.md`](README.md)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| **Login Administrativo e de Munícipe** | ● Ao digitar e-mail e senha corretos, o usuário deve acessar a área correspondente (Munícipe, Admin, Operador, Secretaria).<br>● Ao falhar, deve exibir mensagem de erro. | ● Login com credenciais válidas<br>● Login com senha incorreta<br>● Tentativa de acesso a rota protegida sem login | ● Redirecionamento correto conforme nível de acesso.<br>● Bloqueio de acesso sem token válido. |
| **Cadastro de Munícipe** | ● O usuário deve preencher o formulário completo com validações de CPF, e-mail único, CEP de Vilhena e senha segura.<br>● Deve enviar e-mail de verificação. | ● Preenchimento completo com sucesso<br>● Validação de campos obrigatórios (Zod)<br>● Validação de CPF e e-mail único<br>● Validação de CEP de Vilhena (76980-XXX) | ● Usuário criado e redirecionado para aguardar verificação.<br>● E-mail de verificação enviado. |
| **Criar Demanda** | ● O munícipe deve preencher formulário com CEP válido de Vilhena, tipo de serviço, descrição e upload de imagem obrigatória.<br>● Endereço deve ser preenchido automaticamente ao digitar CEP. | ● Validação de CEP de Vilhena (76980-XXX a 76999-XXX)<br>● Upload de imagem válido<br>● Validação de descrição mínima (10 caracteres)<br>● Seleção de tipo de demanda obrigatória | ● Demanda criada e listada em "Meus Pedidos".<br>● Toast de sucesso exibido. |
| **Editar Perfil** | ● O munícipe deve conseguir alterar dados editáveis (nome, celular, endereço).<br>● Campos protegidos (CPF, e-mail, data nascimento) não podem ser editados.<br>● O formulário deve vir preenchido com os dados atuais. | ● Carregamento dos dados corretos no formulário<br>● Edição de campos permitidos<br>● Proteção de campos sensíveis<br>● Validação de CEP na edição | ● Alterações salvas e persistidas.<br>● Toast de sucesso após salvar. |
| **Listagem de Demandas** | ● O sistema deve listar demandas com paginação e filtros por status.<br>● Cada perfil visualiza apenas suas demandas relevantes (Munícipe: próprias, Operador: atribuídas, Secretaria: da pasta, Admin: todas). | ● Carregamento da lista inicial<br>● Funcionamento da paginação<br>● Filtros por status funcionando (Em Aberto, Em Andamento, Concluída, Recusada) | ● Exibição correta dos cards de demanda.<br>● Navegação fluida entre páginas. |
| **Dashboard Admin** | ● Deve exibir métricas consolidadas (total de demandas, colaboradores, operadores, secretarias).<br>● Deve exibir mapa interativo de Vilhena colorido por quantidade de demandas por bairro.<br>● Deve exibir gráficos analíticos (Top 5 Bairros, Demandas por Categoria). | ● Métricas carregadas da API<br>● Mapa interativo funcional com clique em bairros<br>● Gráficos renderizados corretamente | ● Dados atualizados e precisos.<br>● Interface responsiva. |
| **Gerenciamento de Secretarias/Colaboradores/Tipos** | ● O admin deve conseguir realizar CRUD completo (Criar, Ler, Editar, Excluir).<br>● Validações específicas devem ser aplicadas (e-mail único, CPF válido, etc.).<br>● Exclusão deve exigir confirmação. | ● Cadastro com sucesso<br>● Edição com validações<br>● Exclusão com modal de confirmação<br>● Busca e filtros funcionando | ● Dados persistidos corretamente.<br>● Toasts de feedback.<br>● Listas atualizadas após operações. |
| **Painel do Operador** | ● O operador deve visualizar demandas atribuídas a ele.<br>● Deve poder devolver com motivo ou resolver com descrição e imagens de resolução (mínimo 1 imagem). | ● Listagem filtrada por operador logado<br>● Devolução com motivo obrigatório<br>● Resolução com descrição e imagens obrigatórias | ● Status atualizado corretamente após ação.<br>● Resolução salva com evidências visuais. |
| **Painel da Secretaria** | ● A secretaria deve visualizar demandas de suas pastas (secretarias vinculadas).<br>● Deve poder atribuir demanda a operador da mesma secretaria ou rejeitar com motivo. | ● Listagem filtrada por secretarias do usuário<br>● Atribuição a operador da mesma secretaria<br>● Rejeição com motivo obrigatório | ● Atribuição registrada e demanda passa para "Em Andamento".<br>● Status atualizado para "Recusada" com motivo salvo.<br>● Toasts de confirmação. |

---

## 5 - Estratégia de Teste

### Escopo de Testes

O plano de testes abrange as funcionalidades de gestão de demandas (CRUD), autenticação (munícipe e funcionários), gerenciamento administrativo (secretarias, colaboradores, tipos de demanda) e painéis operacionais (operador e secretaria).

Serão executados testes em todos os níveis conforme a descrição abaixo.

**Testes Unitários:** Focados nas regras de negócio do Backend (Services/Models) e validações do Frontend (Schemas Zod).

**Testes de Integração:** Testes dos endpoints da API (Controllers/Routes) garantindo a comunicação correta com o Banco de Dados e MinIO.

**Testes Automatizados (E2E):** Fluxos críticos no Frontend (Login → Criar Demanda → Visualizar em Meus Pedidos) usando Cypress.

**Testes Manuais:** Validação de UX/UI, responsividade e casos de borda não cobertos por automação.

### Ambiente e Ferramentas

Os testes serão executados nos seguintes ambientes:

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| **QA** | `https://servicospublicos-qa.app.fslab.dev` | `https://servicospublicos-api-qa.app.fslab.dev` |
| **Staging** | `https://servicospublicos.app.fslab.dev` | `https://servicospublicos-api.app.fslab.dev` |
| **Local** | `http://localhost:3000` | `http://localhost:5010` |

As seguintes ferramentas serão utilizadas no teste:

| Ferramenta | Versão | Uso |
|------------|--------|-----|
| **Cypress** | 15.7.0 | Testes E2E automatizados |
| **Jest** | - | Testes unitários e integração (API) |
| **Postman/Swagger** | - | Testes manuais de API |
| **Chrome DevTools** | - | Depuração e análise |

---

## 6 - Classificação de Bugs

Os Bugs serão classificados com as seguintes severidades:

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| **1** | **Blocker** | ● Bug que impede o Login ou criação de demandas.<br>● Crash da aplicação.<br>● Perda de dados. |
| **2** | **Grave** | ● Funcionalidade principal com erro (ex: não salva demanda, validação de CEP errada, e-mail de verificação não enviado). |
| **3** | **Moderada** | ● Falha em validações não críticas, filtros não funcionando perfeitamente, paginação com problemas. |
| **4** | **Pequena** | ● Erros ortográficos, alinhamento visual, melhorias de UX. |

---

## 7 - Definição de Pronto

Será considerada pronta as funcionalidades que passarem pelas verificações e testes descritas nestes planos de testes, não apresentarem bugs com a severidade acima de **Moderada**, e passarem por uma validação de negócio de responsabilidade do time de produto.