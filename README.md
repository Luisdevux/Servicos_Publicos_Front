# Serviços Públicos - Frontend

## Estrutura de Pastas

Clone os dois projetos **na mesma pasta**:

```
fabrica/
├── servicos-publicos-front/
└── servicos-publicos-api/
```

### Clone dos repositórios

**Frontend:**
```bash
git clone ssh://git@gitlab.fslab.dev:4241/fabrica-de-software-iii-2025-2/servicos-publicos/servicos-publicos-front.git
```

**API:**
```bash
git clone ssh://git@gitlab.fslab.dev:4241/fabrica-de-software-iii-2025-2/servicos-publicos/servicos-publicos-api.git
```

## Como Rodar

> **Nota:** Este é o `docker-compose-dev.yml` focado em **desenvolvimento** com **bind mounts**, permitindo hot reload e sincronização de código em tempo real.

### 1. Subir os containers
```bash
docker compose -f docker-compose-dev.yml up --build --force-recreate
```

### 2. Popular o banco (seeds)
```bash
docker compose -f docker-compose-dev.yml exec api npm run seed
```

### 3. Rodar testes da API
```bash
docker compose -f docker-compose-dev.yml exec api npm test
```

## Acessar

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5011
- **Login**: admin@exemplo.com || municipe@exemplo.com / Senha@123 