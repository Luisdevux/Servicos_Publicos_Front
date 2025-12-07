# Suite de Teste - Página de Demanda por Tipo e Criação de Demanda
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A "Página de Demanda por Tipo" permite aos munícipes visualizarem e criarem demandas de serviços públicos organizadas por categoria (coleta de lixo, iluminação pública, manejo de animais, podas de árvores, pavimentação e saneamento). A página inclui funcionalidades de busca, filtros, paginação e um modal para criação de novas demandas com validação rigorosa de endereço (apenas Vilhena) e upload obrigatório de imagens.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. Os dados são carregados via React Query (TanStack Query v5) com paginação server-side. O formulário de criação utiliza React Hook Form + Zod com validações customizadas. Upload de imagens é feito para MinIO via API. A busca de endereço via CEP utiliza ViaCEP.

**Fluxo de Dados:**

1. Usuário acessa `/demanda/[tipo]` (ex: `/demanda/coleta`)
2. Sistema busca demandas do tipo via API GET `/tipoDemanda/:tipo`
3. Dados exibidos em cards paginados
4. Ao clicar em "Criar demanda", abre modal
5. Usuário preenche formulário (CEP, endereço, descrição, imagem)
6. Sistema valida CEP de Vilhena (76980-XXX)
7. Sistema busca endereço automaticamente via ViaCEP
8. Usuário faz upload de imagem obrigatória
9. Ao submeter, envia POST para `/demandas` com imagem
10. API cria demanda e retorna confirmação
11. Toast de sucesso exibido
12. Modal fecha e lista atualiza

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve exibir demandas organizadas por tipo | NF001 – O sistema deve carregar em menos de 3 segundos |
| RF002 – O sistema deve exibir banner com título do tipo de demanda | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve carregar corretamente cada tipo de demanda | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve permitir busca e filtro de serviços | NF004 – O sistema deve ter código modular e testável |
| RF005 – O sistema deve exibir controles de paginação | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve abrir modal de criação ao clicar em "Criar demanda" | NF006 – O sistema deve ter tratamento de erros amigáveis |
| RF007 – O sistema deve validar todos os campos obrigatórios do formulário | NF007 – O sistema deve exibir feedback (toast notifications) |
| RF008 – O sistema deve preencher endereço automaticamente via CEP | NF008 – O sistema deve implementar validações client-side e server-side |
| RF009 – O sistema deve aceitar apenas CEPs de Vilhena (76980-000 a 76999-999) | NF009 – O sistema deve ter validações em tempo real |
| RF010 – O sistema deve exigir upload de imagem obrigatória | NF010 – O sistema deve ter formulários acessíveis |
| RF011 – O sistema deve exibir preview da imagem após upload | |
| RF012 – O sistema deve validar descrição mínima (10 caracteres) | |
| RF013 – O sistema deve criar demanda com sucesso (fluxo completo) | |
| RF014 – O sistema deve exibir toast de sucesso após criação | |
| RF015 – O sistema deve fechar modal ao cancelar | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional da página de demandas por tipo e criação de demandas, incluindo renderização, filtros, paginação, validações de formulário, upload de imagens e integração com API.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização da Página

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /demanda/[tipo], a página deve carregar corretamente. | ● Página visível <br>● Elementos carregados | ● Página renderizada |
| Exibição de banner | ● Deve exibir banner com título do tipo de demanda. | ● Banner visível <br>● Título correto | ● Banner exibido |
| Carregamento por tipo | ● Deve carregar corretamente cada tipo: coleta, iluminação, animais, árvores, pavimentação, saneamento. | ● Dados corretos por tipo <br>● URLs corretas | ● Tipos carregados |

#### Funcionalidades de Listagem

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Campo de busca | ● Deve exibir campo de busca. <br>● Deve permitir filtrar serviços. | ● Campo visível <br>● Filtro funcional | ● Busca funcional |
| Controles de paginação | ● Deve exibir controles quando há mais itens. <br>● Botões anterior/próximo funcionais. | ● Paginação visível <br>● Navegação funcional | ● Paginação funcional |

#### Modal de Criação de Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Abertura do modal | ● Ao clicar em "Criar demanda", deve abrir modal. | ● Modal visível <br>● Formulário presente | ● Modal abre |
| Exibição de campos | ● Deve exibir todos os campos obrigatórios: CEP, Bairro, Logradouro, Número, Descrição, Imagem. | ● Todos os campos visíveis <br>● Labels corretos | ● Campos exibidos |
| Fechamento ao cancelar | ● Ao clicar em cancelar, deve fechar modal. | ● Modal fecha <br>● Dados não salvos | ● Cancelamento funcional |

#### Validação de CEP e Autopreenchimento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Autopreenchimento via CEP | ● Ao digitar CEP válido de Vilhena, endereço deve ser preenchido automaticamente. | ● Requisição para ViaCEP <br>● Campos preenchidos <br>● Dados corretos | ● Autopreenchimento funcional |
| Validação de CEP de Vilhena | ● Deve aceitar apenas CEPs 76980-000 a 76999-999. | ● Validação de prefixo <br>● Mensagem de erro para CEP inválido | ● CEP válido de Vilhena |
| Rejeição de CEP fora de Vilhena | ● CEP fora da região (ex: 01310-100) deve exibir erro. | ● Mensagem de erro <br>● Formulário não submetido | ● Rejeição funcional |

#### Validação de Campos Obrigatórios

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Erro sem imagem | ● Ao submeter sem imagem, deve exibir erro. | ● Mensagem "Imagem é obrigatória" <br>● Formulário não submetido | ● Validação funcional |
| Erro sem campos obrigatórios | ● Ao submeter sem preencher campos, deve exibir erros. | ● Mensagens de erro específicas <br>● Formulário não submetido | ● Validações funcionais |
| Erro descrição curta | ● Descrição deve ter mínimo 10 caracteres. | ● Mensagem de erro <br>● Validação de tamanho | ● Validação funcional |

#### Upload de Imagem

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Upload de imagem | ● Deve permitir upload de imagem real. <br>● Deve exibir preview após upload. | ● Upload funcional <br>● Preview visível <br>● Arquivo carregado | ● Upload funcional |
| Preview de imagem | ● Preview deve exibir imagem carregada corretamente. | ● Imagem visível <br>● Preview correto | ● Preview funcional |

#### Criação de Demanda

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Criação com sucesso | ● Ao submeter dados válidos com imagem, deve criar demanda. <br>● Deve exibir toast de sucesso. <br>● Deve fechar modal. <br>● Deve atualizar lista. | ● Requisição POST para /demandas <br>● Status 201 Created <br>● Toast exibido <br>● Modal fecha <br>● Lista atualizada | ● Demanda criada com sucesso |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Criação de demanda não funciona. <br>● Upload de imagem falha. <br>● Modal não abre. |
| 2 | Grave | ● Validações não funcionam. <br>● CEP fora de Vilhena aceito. <br>● Autopreenchimento de endereço falha. <br>● Demanda criada sem imagem. |
| 3 | Moderada | ● Busca não funciona. <br>● Paginação não funciona. <br>● Preview de imagem não exibido. <br>● Toast não exibido. |
| 4 | Pequena | ● Erros de formatação. <br>● Mensagens inconsistentes. <br>● Alinhamentos incorretos. |

## 6 - Definição de Pronto

A funcionalidade "Página de Demanda por Tipo e Criação de Demanda" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
