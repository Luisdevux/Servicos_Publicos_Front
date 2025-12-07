# Documentação de Testes - Vilhena+Pública

**Projeto Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

**Versão:** 3.0
**Última atualização:** 7 de dezembro de 2025


## Histórico das alterações

| Data | Versão | Descrição | Autor(a) |
|------|--------|-----------|----------|
| 04/12/2025 | 1.0 | Primeira versão do Plano de Testes do Vilhena+Pública | Equipe de QA |
| 04/12/2025 | 1.1 | Atualização após correções de testes e bug de descarte de alterações | Equipe de QA |
| 06/12/2025 | 2.0 | Reestruturação completa: adição de módulos Admin, Autenticação e fluxos completos | Equipe de QA |
| 06/12/2025 | 2.1 | Adição de módulos Operador, Secretaria e Componentes Globais (100% cobertura) | Equipe de QA |
| 06/12/2025 | 2.2 | Simplificação da seção 4.2.2 - Foco em Casos Essenciais com Prioridades | Equipe de QA |
| 07/12/2025 | 3.0 | Reestruturação da Documentação: Separadas Suítes de Testes em Diretórios Seguindo Padrão da Estrutura dos Testes, Adicionado README para Melhor Localização e Melhorado Plano de Testes Geral. | Equipe de QA |

---

## Sobre esta Documentação

Esta documentação contém as **Suites de Teste** organizadas por módulo funcional do sistema Vilhena+Pública. Cada suite descreve detalhadamente os casos de teste, arquitetura, requisitos, estratégias de validação e critérios de aceite para funcionalidades já implementadas com testes E2E automatizados usando Cypress.

A documentação foi estruturada seguindo o modelo padrão de suites de teste, com informações completas sobre:

- **Introdução:** Contexto e objetivo da funcionalidade
- **Arquitetura:** Stack tecnológico e fluxo de dados
- **Requisitos:** Funcionais e não funcionais
- **Estratégia de Teste:** Escopo, ferramentas e casos de teste detalhados
- **Classificação de Bugs:** Níveis de severidade
- **Definição de Pronto:** Critérios de aceite

---

## Estrutura da Documentação

```
documentacao/
├── planoTeste.md (arquivo original completo)
├── README.md (arquivo central para melhor compreensão)
└── suites/ (suites separadas)
    ├── auth/
    │   ├── login-municipe.md
    │   ├── login-funcionario.md
    │   └── cadastro.md
    ├── municipe/
    │   ├── pagina-inicial.md
    │   ├── demanda-tipo.md
    │   ├── create-demanda-dialog.md
    │   ├── meus-pedidos.md
    │   └── perfil.md
    ├── admin/
    │   ├── dashboard.md
    │   ├── secretarias.md
    │   ├── colaboradores.md
    │   ├── tipos-demanda.md
    │   └── demandas.md
    ├── operador/
    │   └── painel-operador.md
    └── secretaria/
        └── painel-secretaria.md
```

---

## Índice de Suítes de Teste

### 🔐 Módulo de Autenticação (No-Auth)

1. **[Login de Munícipe](suites/auth/login-municipe.md)**
   - Autenticação de cidadãos
   - Validações de campos
   - Redirecionamento pós-login

2. **[Login de Funcionário](suites/auth/login-funcionario.md)**
   - Autenticação de colaboradores (Admin, Operador, Secretário)
   - Redirecionamento baseado em nível de acesso
   - Controle de rotas

3. **[Cadastro de Munícipe](suites/auth/cadastro.md)**
   - Criação de nova conta
   - Validações (CPF, e-mail único, CEP Vilhena, senha)
   - Envio de e-mail de verificação

---

### 👤 Módulo Munícipe

4. **[Página Inicial](suites/municipe/pagina-inicial.md)**
   - Landing page principal
   - Exibição de serviços disponíveis
   - Navegação baseada em autenticação

5. **[Página de Demanda por Tipo](suites/municipe/demanda-tipo.md)**
   - Listagem de demandas por categoria
   - Busca e filtros
   - Paginação de resultados

6. **[Modal de Criação de Demanda](suites/municipe/create-demanda-dialog.md)**
   - Criação de novas demandas
   - Validações rigorosas (CEP Vilhena, descrição mínima)
   - Upload obrigatório de imagem com preview
   - Autopreenchimento de endereço via CEP

7. **[Meus Pedidos](suites/municipe/meus-pedidos.md)**
   - Listagem de demandas do munícipe
   - Filtros por status
   - Visualização de detalhes

8. **[Perfil do Munícipe](suites/municipe/perfil.md)**
   - Visualização e edição de dados pessoais
   - Upload de foto de perfil
   - Validações de campos editáveis

---

### 👨‍💼 Módulo Administração

9. **[Dashboard Admin](suites/admin/dashboard.md)**
   - Métricas consolidadas
   - Mapa interativo de demandas por bairro
   - Gráficos analíticos

10. **[Gerenciamento de Secretarias](suites/admin/secretarias.md)**
    - CRUD completo de secretarias
    - Busca e paginação
    - Validações de campos

11. **[Gerenciamento de Colaboradores](suites/admin/colaboradores.md)**
    - CRUD de funcionários
    - Filtros por nível de acesso e status
    - Proteção do admin principal
    - Validações rigorosas (CPF, e-mail, CEP)

12. **[Gerenciamento de Tipos de Demanda](suites/admin/tipos-demanda.md)**
    - CRUD de tipos de serviço
    - Busca por título
    - Filtro por categoria

13. **[Gerenciamento de Demandas](suites/admin/demandas.md)**
    - Visualização de todas as demandas do sistema
    - Filtros múltiplos
    - Paginação local
    - Exclusão de demandas

---

### 🔧 Módulo Operador

14. **[Painel do Operador](suites/operador/painel-operador.md)**
    - Demandas atribuídas ao operador
    - Devolução de demandas para secretaria
    - Resolução com upload de imagens
    - Filtros e abas por status

---

### 🏢 Módulo Secretaria

15. **[Painel da Secretaria](suites/secretaria/painel-secretaria.md)**
    - Demandas das secretarias do usuário
    - Atribuição a operadores
    - Rejeição de demandas
    - Visualização de resoluções
    - 4 abas de status

---

## Ambientes de Teste

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| **QA** | `https://servicospublicos-qa.app.fslab.dev` | `https://servicospublicos-api-qa.app.fslab.dev` |
| **Staging** | `https://servicospublicos.app.fslab.dev` | `https://servicospublicos-api.app.fslab.dev` |
| **Local** | `http://localhost:3000` | `http://localhost:5010` |

---

## Ferramentas de Teste

| Ferramenta | Versão | Uso |
|------------|--------|-----|
| **Cypress** | 15.7.0 | Testes E2E automatizados |
| **Jest** | - | Testes unitários e integração (API) |
| **Postman/Swagger** | - | Testes manuais de API |
| **Chrome DevTools** | - | Depuração e análise |

---

## Executar Testes

### Todos os testes E2E
```bash
npx cypress run
```

### Por módulo
```bash
# Autenticação
npx cypress run --spec "cypress/e2e/auth/**"

# Munícipe
npx cypress run --spec "cypress/e2e/municipe/**"

# Admin
npx cypress run --spec "cypress/e2e/admin/**"

# Operador
npx cypress run --spec "cypress/e2e/operador/**"

# Secretaria
npx cypress run --spec "cypress/e2e/secretaria/**"
```

### Teste específico
```bash
npx cypress run --spec "cypress/e2e/auth/login-municipe.cy.ts"
```

### Modo interativo
```bash
npx cypress open
```

---

## Credenciais de Teste

| Tipo | E-mail | Senha |
|------|--------|-------|
| Munícipe | municipe@exemplo.com | Senha@123 |
| Admin | admin@exemplo.com | Senha@123 |
| Operador | operador@exemplo.com | Senha@123 |
| Secretário | secretario@exemplo.com | Senha@123 |

---

## Classificação de Severidade de Bugs

| Nível | Descrição |
|-------|-----------|
| **Blocker** | Bug que bloqueia funcionalidade crítica, causa crash ou impede entrega |
| **Grave** | Funcionalidade não opera como esperado, mas há workaround |
| **Moderada** | Funcionalidade parcialmente afetada, experiência comprometida |
| **Pequena** | Impacto mínimo, problemas estéticos ou textuais |

---

## Definição de Pronto

Uma funcionalidade é considerada **pronta** quando:

1. ✅ Passa em todos os casos de teste aplicáveis
2. ✅ Não apresenta bugs **Blocker** ou **Grave**
3. ✅ UI revisada em pt-BR com acessibilidade mínima
4. ✅ Documentação atualizada
5. ✅ Testes E2E implementados e passando
6. ✅ Code review aprovado
7. ✅ Deploy em staging validado
8. ✅ Validação de negócio aprovada

---

## Observações Importantes

1. **Credenciais:** Configure variáveis de ambiente `CYPRESS_MUNICIPE_EMAIL`, `CYPRESS_MUNICIPE_SENHA`, etc., ou atualize nos arquivos de teste
2. **Rate Limiting:** A API possui limite de requisições. Aguarde alguns minutos se necessário
3. **Fixtures:** Alguns testes requerem arquivos em `cypress/fixtures/`
4. **Dependências:** Testes autenticados dependem de login bem-sucedido
5. **Proteção Admin:** Usuário admin principal não pode ser editado/excluído
6. **Sessão Expirada:** Tokens JWT expiram após tempo configurado

---

## Contato e Suporte

Para dúvidas ou sugestões sobre os testes, entre em contato com a **Equipe de QA**.

**Documento elaborado em:** 4 de dezembro de 2025  
**Última atualização:** 7 de dezembro de 2025 - versão 3.0
