# Suite de Teste - Modal de Criação de Demanda
**Vilhena+Pública - Sistema de Gestão de Serviços Públicos Municipais**

## 1 - Introdução

O "Modal de Criação de Demanda" (CreateDemandaDialog) é um componente crítico que permite aos munícipes criarem novas solicitações de serviços públicos. Acessado através do botão "Criar demanda" nas páginas de demanda por tipo, este modal implementa validações rigorosas de endereço (apenas Vilhena), descrição mínima, e exige upload obrigatório de imagem como evidência. É responsável por garantir que apenas demandas válidas e bem documentadas sejam registradas no sistema.

## 2 - Arquitetura

O modal utiliza React 19 com React Hook Form + Zod para validações em tempo real. O componente é renderizado como um Dialog (modal) da biblioteca Shadcn/UI. A busca de endereço via CEP utiliza ViaCEP, e o upload de imagem é feito diretamente para MinIO através da API. As validações client-side previnem submissões inválidas antes de atingir o servidor.

**Fluxo de Dados:**

1. Usuário clica em "Criar demanda" em uma página de tipo de demanda
2. Modal abre com formulário vazio
3. Usuário preenche CEP válido de Vilhena (76980-XXX a 76999-XXX)
4. Sistema busca endereço automaticamente via ViaCEP
5. Campos Bairro e Logradouro preenchidos automaticamente
6. Usuário preenche Número (obrigatório)
7. Usuário preenche Descrição (mínimo 10 caracteres)
8. Usuário faz upload de imagem (obrigatório)
9. Preview da imagem exibido
10. Ao submeter, validações client-side verificam todos os campos
11. Requisição POST enviada para `/demandas` com dados + imagem
12. API valida e cria demanda
13. Toast de sucesso exibido
14. Modal fecha automaticamente
15. Lista de demandas atualizada

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|------------------------|
| RF001 – O modal deve abrir ao clicar em "Criar demanda" | NF001 – Validações em tempo real (client-side) |
| RF002 – O modal deve exibir todos os campos obrigatórios | NF002 – Layout responsivo do modal |
| RF003 – O sistema deve validar CEP de Vilhena (76980-XXX a 76999-XXX) | NF003 – Feedback visual claro de erros |
| RF004 – O sistema deve preencher endereço automaticamente via CEP válido | NF004 – Upload de imagem otimizado |
| RF005 – O sistema deve validar descrição mínima (10 caracteres) | NF005 – Toast notifications |
| RF006 – O sistema deve exigir upload de imagem obrigatória | NF006 – Prevenção de múltiplas submissões |
| RF007 – O sistema deve exibir preview da imagem após upload | NF007 – Tratamento de erros da API |
| RF008 – O sistema deve validar todos os campos antes de submeter | NF008 – Acessibilidade (labels, ARIA) |
| RF009 – O sistema deve criar demanda com sucesso (POST /demandas) | |
| RF010 – O sistema deve exibir toast de sucesso após criação | |
| RF011 – O modal deve fechar após sucesso | |
| RF012 – O sistema deve permitir cancelar e fechar modal | |
| RF013 – O sistema deve rejeitar CEP fora de Vilhena | |
| RF014 – O sistema deve rejeitar CEP incompleto | |
| RF015 – O sistema deve exibir erros para campos obrigatórios vazios | |

## 4 - Estratégia de Teste

### Escopo de Testes
O escopo abrange validações críticas do modal de criação de demanda, incluindo cenários positivos (criação bem-sucedida) e negativos (validações de CEP, campos obrigatórios, descrição curta, imagem ausente).

### 4.1 Ambiente e Ferramentas

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados com upload real de arquivo |

### 4.2 Casos de Teste

#### Cenários Positivos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Abertura do modal | ● Ao clicar em "Criar demanda", modal deve abrir. | ● Modal visível <br>● Título presente | ● Modal abre corretamente |
| Exibição de campos | ● Deve exibir: CEP, Bairro, Logradouro, Número, Descrição, Upload de Imagem. <br>● Botões: Submeter e Cancelar. | ● Todos os campos visíveis <br>● Botões presentes | ● Formulário completo |
| Autopreenchimento via CEP | ● Ao digitar CEP válido de Vilhena (ex: 76982-306), endereço deve ser preenchido. <br>● Bairro e Logradouro preenchidos automaticamente. | ● Requisição para ViaCEP <br>● Campos preenchidos <br>● Dados corretos | ● Autopreenchimento funcional |
| Upload de imagem | ● Deve permitir upload de imagem (PNG, JPG). <br>● Exibir preview após upload. | ● Upload bem-sucedido <br>● Preview visível <br>● Imagem carregada | ● Upload funcional |
| Fechamento ao cancelar | ● Ao clicar em "Cancelar", modal deve fechar. <br>● Dados não salvos. | ● Modal fecha <br>● Formulário limpo | ● Cancelamento funcional |
| Criação com sucesso | ● Fluxo completo: <br>  - Preencher CEP válido <br>  - Aguardar autopreenchimento <br>  - Preencher Logradouro, Número, Descrição (≥10 chars) <br>  - Fazer upload de imagem <br>  - Submeter <br>● Demanda criada com sucesso. | ● Requisição POST para /demandas <br>● Status 201 Created <br>● Toast de sucesso <br>● Modal fecha <br>● Lista atualizada | ● Demanda criada com sucesso |

#### Cenários Negativos - Validações de CEP

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| CEP fora de Vilhena | ● CEP de outra região (ex: 01310-100) deve ser rejeitado. <br>● Mensagem de erro exibida. | ● Mensagem "CEP deve estar entre 76980-000 e 76999-999" ou similar <br>● Formulário não submetido | ● Validação de região funcional |
| CEP incompleto | ● CEP com menos de 8 dígitos deve ser rejeitado. | ● Mensagem de erro "8 dígitos obrigatórios" ou similar <br>● Formulário não submetido | ● Validação de formato funcional |

#### Cenários Negativos - Validações de Campos Obrigatórios

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Submeter sem preencher campos | ● Ao submeter formulário vazio, deve exibir erros. <br>● Mensagens específicas por campo. | ● Mensagens "obrigatório/obrigatória" visíveis <br>● Formulário não submetido | ● Validações de campos obrigatórios |
| Descrição muito curta | ● Descrição com menos de 10 caracteres deve ser rejeitada. | ● Mensagem "Mínimo 10 caracteres" ou similar <br>● Formulário não submetido | ● Validação de tamanho funcional |
| Submeter sem imagem | ● Ao submeter sem fazer upload de imagem, deve exibir erro. <br>● Mensagem "Imagem obrigatória". | ● Mensagem de erro visível <br>● Formulário não submetido | ● Validação de imagem obrigatória |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Modal não abre. <br>● Criação de demanda não funciona. <br>● Upload de imagem falha completamente. <br>● CEP fora de Vilhena é aceito. |
| 2 | Grave | ● Autopreenchimento de endereço não funciona. <br>● Validações não funcionam. <br>● Demanda criada sem imagem. <br>● Descrição curta aceita. <br>● Toast não exibido. |
| 3 | Moderada | ● Preview de imagem não exibido. <br>● Modal não fecha após sucesso. <br>● Cancelar não limpa formulário. <br>● Mensagens de erro genéricas. |
| 4 | Pequena | ● Erros de formatação. <br>● Labels desalinhadas. <br>● Placeholders incorretos. <br>● Mensagens inconsistentes. |

## 6 - Definição de Pronto

A funcionalidade "Modal de Criação de Demanda" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.

---

## Observações Técnicas

### Validações Implementadas
- **CEP:** Regex de range 76980-000 a 76999-999
- **Descrição:** Mínimo 10 caracteres
- **Imagem:** Formatos aceitos: PNG, JPG, JPEG
- **Todos os campos:** Obrigatórios exceto Complemento

### Dependências Externas
- **ViaCEP API:** Para busca de endereço (pode falhar se API estiver fora)
- **MinIO:** Para armazenamento de imagens
- **Fixture:** `cypress/fixtures/test-image.png` necessária para testes

### CEPs de Teste
| CEP | Localização | Uso |
|-----|-------------|-----|
| 76982-306 | Vilhena/RO | CEP válido para testes positivos |
| 01310-100 | São Paulo/SP | CEP inválido para testes negativos |
