# Suite de Teste - Cadastro de Munícipe
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

A tela de "Cadastro de Munícipe" permite que novos cidadãos de Vilhena/RO criem suas contas na plataforma de serviços públicos. O cadastro inclui validação rigorosa de dados pessoais (CPF, e-mail único, CEP de Vilhena), senhas seguras e envio de e-mail de verificação. Esta funcionalidade é essencial para garantir que apenas moradores de Vilhena acessem os serviços municipais.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. A validação de formulários utiliza React Hook Form + Zod com validações customizadas para CPF, CEP e senha. O endereço é preenchido automaticamente via API de CEP (ViaCEP). Após cadastro bem-sucedido, o sistema envia e-mail de verificação e redireciona para página de aguardo.

**Fluxo de Dados:**

1. Usuário acessa `/cadastro`
2. Preenche formulário completo com dados pessoais e endereço
3. Sistema valida CPF (formato e dígitos verificadores)
4. Sistema valida e-mail (formato e unicidade)
5. Sistema valida senha (complexidade mínima)
6. Sistema valida CEP de Vilhena (76980-XXX) e busca endereço automaticamente
7. Ao submeter, envia requisição POST para `/usuarios`
8. API cria usuário e envia e-mail de verificação
9. Redirecionamento para `/aguardando-verificacao`

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O sistema deve permitir cadastro de novos munícipes | NF001 – O sistema deve ter tempo de resposta < 3s |
| RF002 – O sistema deve validar CPF (formato e dígitos verificadores) | NF002 – O sistema deve ser compatível com navegadores modernos |
| RF003 – O sistema deve aplicar máscara automática no CPF | NF003 – O sistema deve ter layout responsivo |
| RF004 – O sistema deve validar e-mail único no sistema | NF004 – O sistema deve implementar validações client-side e server-side |
| RF005 – O sistema deve validar senha com complexidade mínima | NF005 – O sistema deve exibir mensagens em pt-BR consistentes |
| RF006 – O sistema deve validar confirmação de senha | NF006 – O sistema deve ter tratamento de erros amigáveis |
| RF007 – O sistema deve aceitar apenas CEPs de Vilhena (76980-XXX) | NF007 – O sistema deve ter código modular e testável |
| RF008 – O sistema deve preencher endereço automaticamente via CEP | NF008 – O sistema deve exibir feedback (toast notifications) |
| RF009 – O sistema deve validar todos os campos obrigatórios | NF009 – O sistema deve ter validações em tempo real |
| RF010 – O sistema deve enviar e-mail de verificação após cadastro | NF010 – O sistema deve ter formulários acessíveis |
| RF011 – O sistema deve redirecionar para página de aguardo | |
| RF012 – O sistema deve permitir navegação para login | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange a validação funcional do cadastro de munícipes, incluindo renderização do formulário, validações de CPF, e-mail, senha e CEP, autopreenchimento de endereço, criação de usuário e envio de e-mail de verificação.

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface |

### 4.2 Casos de Teste

#### Renderização do Formulário

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da página | ● Ao acessar /cadastro, o formulário deve carregar com todos os campos. | ● Formulário visível <br>● Todos os campos presentes | ● Formulário completo |
| Exibição de campos | ● Campos: Nome, CPF, E-mail, Senha, Confirmar Senha, Data de Nascimento, CEP, Número, Complemento. | ● Labels corretos <br>● Placeholders informativos <br>● Campos habilitados | ● Campos exibidos corretamente |
| Exibição de botões | ● Botão "Cadastrar". <br>● Link "Já possui cadastro?". | ● Botão submit visível <br>● Link para login visível | ● Elementos de ação presentes |

#### Validação de CPF

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Máscara de CPF | ● CPF deve ter máscara aplicada automaticamente (XXX.XXX.XXX-XX). | ● Máscara aplicada durante digitação <br>● Formato correto | ● Máscara funcional |
| Validação de CPF obrigatório | ● Ao tentar submeter sem CPF, deve exibir mensagem de erro. | ● Mensagem "CPF é obrigatório" | ● Validação funcional |
| Validação de CPF inválido | ● Ao informar CPF com dígitos verificadores incorretos, deve exibir mensagem de erro. | ● Mensagem de CPF inválido <br>● Formulário não submetido | ● Validação de dígitos verificadores |
| CPF válido aceito | ● CPF válido deve ser aceito sem erros. | ● Sem mensagens de erro <br>● Formulário pode ser submetido | ● CPF válido aceito |

#### Validação de E-mail

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de e-mail obrigatório | ● Ao tentar submeter sem e-mail, deve exibir mensagem de erro. | ● Mensagem "E-mail é obrigatório" | ● Validação funcional |
| Validação de formato de e-mail | ● E-mail deve ter formato válido. | ● Mensagem de formato inválido <br>● Validação de @ e domínio | ● Validação de formato |
| Validação de e-mail único | ● E-mail duplicado deve exibir mensagem de erro. | ● Verificação de unicidade <br>● Mensagem clara | ● E-mail único |

#### Validação de Senha

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de senha obrigatória | ● Ao tentar submeter sem senha, deve exibir mensagem de erro. | ● Mensagem "Senha é obrigatória" | ● Validação funcional |
| Validação de complexidade | ● Senha deve ter mínimo 8 caracteres. <br>● Deve conter letra maiúscula, minúscula, número e caractere especial. | ● Mensagens específicas de regras <br>● Validação de complexidade | ● Senha segura |
| Validação de confirmação | ● Confirmação deve coincidir com senha. | ● Mensagem "Senhas não coincidem" <br>● Validação de igualdade | ● Confirmação válida |

#### Validação de CEP e Autopreenchimento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de CEP obrigatório | ● Ao tentar submeter sem CEP, deve exibir mensagem de erro. | ● Mensagem "CEP é obrigatório" | ● Validação funcional |
| Validação de CEP de Vilhena | ● Apenas CEPs do município de Vilhena (76980-XXX) devem ser aceitos. | ● Validação de prefixo 76980 <br>● Mensagem de erro para CEP fora de Vilhena | ● CEP válido de Vilhena |
| Autopreenchimento de endereço | ● Ao digitar CEP válido, endereço deve ser preenchido automaticamente. <br>● Campos: Logradouro, Bairro. | ● Requisição para API de CEP <br>● Campos preenchidos automaticamente <br>● Dados corretos | ● Autopreenchimento funcional |
| CEP inválido | ● CEP fora de Vilhena (ex: 01310-100) deve exibir erro. | ● Mensagem de erro específica <br>● Formulário não submetido | ● Rejeição de CEP inválido |

#### Validação de Campos Obrigatórios

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Nome obrigatório | ● Ao tentar submeter sem nome, deve exibir mensagem de erro. | ● Mensagem "Nome é obrigatório" | ● Validação funcional |
| Data de nascimento obrigatória | ● Ao tentar submeter sem data, deve exibir mensagem de erro. | ● Mensagem de erro | ● Validação funcional |
| Número obrigatório | ● Ao tentar submeter sem número, deve exibir mensagem de erro. | ● Mensagem "Número é obrigatório" | ● Validação funcional |

#### Cadastro com Sucesso

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Cadastro completo | ● Ao submeter dados válidos, deve criar o usuário. <br>● Deve exibir toast de sucesso. <br>● Deve redirecionar para /aguardando-verificacao. | ● Requisição POST para /usuarios <br>● Status 201 Created <br>● Toast exibido <br>● Redirecionamento correto | ● Usuário cadastrado com sucesso |
| E-mail de verificação enviado | ● Sistema deve enviar e-mail de verificação após cadastro. | ● E-mail enviado <br>● Mensagem informativa | ● E-mail enviado |

#### Navegação

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Link para login | ● Ao clicar em "Já possui cadastro?", deve redirecionar para /login/municipe. | ● Redirecionamento correto <br>● URL atualizada | ● Navegação funcional |

#### Responsividade

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout responsivo | ● Deve exibir corretamente em diferentes viewports (mobile, tablet, desktop). | ● Layout adaptado <br>● Elementos legíveis <br>● Formulário usável | ● Design responsivo |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Cadastro não funciona. <br>● Usuário não criado. <br>● E-mail de verificação não enviado. |
| 2 | Grave | ● Validações não funcionam. <br>● CPF ou e-mail duplicado aceito. <br>● CEP fora de Vilhena aceito. <br>● Autopreenchimento de endereço falha. |
| 3 | Moderada | ● Máscaras não aplicadas. <br>● Mensagens de erro inconsistentes. <br>● Layout quebrado em algum viewport. |
| 4 | Pequena | ● Erros de formatação de texto. <br>● Labels desalinhadas. <br>● Placeholders incorretos. |

## 6 - Definição de Pronto

A funcionalidade "Cadastro de Munícipe" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
