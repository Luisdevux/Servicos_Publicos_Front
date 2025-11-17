# 🏛️ Serviços Públicos - Frontend

Sistema web para gestão de demandas públicas municipais.

## 📋 Pré-requisitos

- Docker e Docker Compose
- Git

## 🚀 Instalação Rápida

### 1. Clone os repositórios (mesma pasta)

```bash
# Frontend
git clone ssh://git@gitlab.fslab.dev:4241/fabrica-de-software-iii-2025-2/servicos-publicos/servicos-publicos-front.git

# API
git clone ssh://git@gitlab.fslab.dev:4241/fabrica-de-software-iii-2025-2/servicos-publicos/servicos-publicos-api.git
```

**Estrutura final:**
```
fabrica/
├── servicos-publicos-front/
└── servicos-publicos-api/
```

### 2. Configure o email (obrigatório)

1. **Gere uma senha de aplicativo Gmail:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Crie senha para "Servicos Publicos"
   - Copie os 16 caracteres gerados

2. **Edite o `.env` da API:**
   ```bash
   cd servicos-publicos-api
   nano .env
   ```

3. **Preencha:**
   ```env
   SENDER_EMAIL="seu-email@gmail.com"
   SENDER_PASSWORD="abcdefghijklmnop"  # sem espaços
   MASTER_KEY="..."  # gere: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 3. Habilite emulação ARM64 (apenas primeira vez)

```bash
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```

> **Nota:** Necessário apenas em máquinas x86_64/amd64 para rodar o serviço de email.

### 4. Inicie todos os serviços

```bash
cd servicos-publicos-front
docker compose -f docker-compose-dev.yml up --build --force-recreate
```

Aguarde até ver:
```
✅ frontend-servicos     Up
✅ api-servicos          Up
✅ mailsender-servicos   Up (healthy)
✅ mongodb-servicos      Up (healthy)
```

### 5. Popule o banco de dados

```bash
docker compose -f docker-compose-dev.yml exec api npm run seed
```

## 🌐 Acessar

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API** | http://localhost:5011 | - |
| **API Docs** | http://localhost:5011/docs | - |
| **Login Admin** | `/login/funcionario` | admin@exemplo.com / Senha@123 |
| **Login Munícipe** | `/login/municipe` | municipe@exemplo.com / Senha@123 |

## 🧪 Testes

```bash
# Rodar todos os testes da API
docker compose -f docker-compose-dev.yml exec api npm test

# Testes com cobertura
docker compose -f docker-compose-dev.yml exec api npm run test:coverage
```

## 🛠️ Comandos Úteis

```bash
# Ver logs em tempo real
docker compose -f docker-compose-dev.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose-dev.yml logs -f frontend

# Parar todos os serviços
docker compose -f docker-compose-dev.yml down

# Parar e remover volumes (limpa banco de dados)
docker compose -f docker-compose-dev.yml down -v

# Reconstruir imagens
docker compose -f docker-compose-dev.yml up --build
```

## 📦 Serviços Docker

| Container | Descrição | Porta |
|-----------|-----------|-------|
| **mongodb-servicos** | Banco de dados MongoDB 8 | 27017 |
| **mailsender-servicos** | Serviço de envio de emails | 5016 |
| **api-servicos** | Backend Node.js/Express | 5011 |
| **frontend-servicos** | Frontend Next.js 14 | 3000 |

## ✨ Funcionalidades Principais

- 🔐 Autenticação com NextAuth.js e JWT
- 👥 Gestão de usuários (Munícipes, Operadores, Secretários, Admins)
- 📋 Sistema de demandas públicas
- 📧 Recuperação de senha via email
- 🖼️ Upload de imagens
- 📍 Integração com ViaCEP
- 🎨 Interface responsiva com Tailwind CSS
- ✅ Validação em tempo real
- 🔔 Notificações com Sonner Toast

## 🔒 Requisitos de Senha

- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número
- 1 caractere especial (@, $, !, %, *, ?, &)

## 🐛 Troubleshooting

### Email não enviado
- Verifique se `SENDER_EMAIL` e `SENDER_PASSWORD` estão corretos
- Confirme que usou senha de aplicativo, não senha normal
- Veja logs: `docker logs mailsender-servicos`

### Containers não iniciam
- Execute: `docker compose -f docker-compose-dev.yml down -v`
- Recrie: `docker compose -f docker-compose-dev.yml up --build`

### Erro de permissão
- Linux/Mac: `sudo chown -R $USER:$USER .`

## 📚 Stack Tecnológica

- **Frontend:** Next.js 14, TypeScript, TailwindCSS, Shadcn/UI
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** NextAuth.js, JWT, bcrypt
- **Validação:** Zod
- **Email:** Mailsender (custom service)
- **Container:** Docker, Docker Compose 