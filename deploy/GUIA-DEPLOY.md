# 🚀 Deploy - Frontend Serviços Públicos

Guia simples e direto para deploy do frontend no cluster Kubernetes do IFRO.

---

## 📋 Pré-requisitos

- Cluster Kubernetes acessível
- `kubectl` configurado
- Docker e Docker Compose instalados
- **API já deployada** (`servicospublicos-api` rodando)

---

## 🔧 Passo 1: Preparar ConfigMap

```bash
# Copiar template
cp deploy/servicos-front-configmap.example.yaml \
   deploy/servicos-front-configmap.secret.yaml

# Editar secrets
nano deploy/servicos-front-configmap.secret.yaml
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 48
```

**Substituir no arquivo:**
```yaml
NEXTAUTH_SECRET: "COLE_O_SECRET_GERADO_AQUI"
```

**Verificar URLs:**
```yaml
API_URL_SERVER_SIDED: "http://servicospublicos-api:80"              # Interna
NEXT_PUBLIC_API_URL: "https://servicospublicos-api.app.fslab.dev"  # Pública
NEXTAUTH_URL: "https://servicospublicos.app.fslab.dev"              # Frontend
```

---

## 🐋 Passo 2: Build e Push da Imagem

```bash
# Build (com URL da API em build-time para NEXT_PUBLIC_API_URL)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api.app.fslab.dev \
  -t yurizetoles/servicos_publicos_front:latest .

# Push
docker push yurizetoles/servicos_publicos_front:latest

# Verificar
docker images | grep servicos_publicos_front
```

---

## 🚀 Passo 3: Deploy no Cluster

### 3.1 Aplicar ConfigMap
```bash
kubectl apply -f deploy/servicos-front-configmap.secret.yaml
```

### 3.2 Deploy Frontend
```bash
kubectl apply -f deploy/servicos-front-publicos.yaml
```

### 3.3 Verificar Status
```bash
kubectl get all | grep front-publicos
```

**Saída esperada:**
```
pod/servicos-front-publicos-xxx   1/1     Running
service/servicospublicos          ClusterIP
```

### 3.4 Aguardar Pod Pronto
```bash
kubectl wait --for=condition=ready pod -l io.kompose.service=servicos-front-publicos --timeout=120s
```

---

## ✅ Passo 4: Validar

### Testar HTTPS
```bash
curl -I https://servicospublicos.app.fslab.dev/
```

**Esperado:** `HTTP/1.1 200 OK`

### Acessar no navegador
```
https://servicospublicos.app.fslab.dev/
```

### Ver logs
```bash
kubectl logs -f deployment/servicos-front-publicos
```

**Logs esperados:**
```
▲ Next.js 15.x.x
- Local:   http://localhost:3000
✓ Ready in Xms
```

### Testar conectividade com API
```bash
kubectl exec -it deployment/servicos-front-publicos -- sh
wget -O- http://servicospublicos-api:80/
exit
```

**Esperado:** HTML redirecionando para `/docs`

---

## 🔄 Atualizar Deployment

### Atualizar imagem
```bash
# Rebuild do frontend (se mudou NEXT_PUBLIC_* deve rebuild)
cd /home/yuri/Documentos/fabrica/servicos-publicos-front
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api.app.fslab.dev \
  -t yurizetoles/servicos_publicos_front:latest .
docker push yurizetoles/servicos_publicos_front:latest
kubectl rollout restart deployment/servicos-front-publicos
kubectl rollout status deployment/servicos-front-publicos
```

### Atualizar ConfigMap
```bash
nano deploy/servicos-front-configmap.secret.yaml
kubectl apply -f deploy/servicos-front-configmap.secret.yaml
kubectl rollout restart deployment/servicos-front-publicos
```

### Rollback
```bash
kubectl rollout undo deployment/servicos-front-publicos
```

---

## 🗑️ Deletar Tudo

### Opção 1: Deletar um por um

```bash
# Frontend
kubectl delete deployment servicos-front-publicos
kubectl delete service servicospublicos
kubectl delete configmap servicos-front-env
```

### Opção 2: Deletar tudo via arquivos

```bash
kubectl delete -f deploy/servicos-front-configmap.secret.yaml \
               -f deploy/servicos-front-publicos.yaml
```

**Verificar limpeza:**
```bash
kubectl get all | grep publicos
```

---

## 🗑️ Reset Completo (API + Frontend + MongoDB)

```bash
# Frontend
kubectl delete deployment servicos-front-publicos
kubectl delete service servicospublicos
kubectl delete configmap servicos-front-env

# API
kubectl delete deployment servicos-api-publicos
kubectl delete service servicospublicos-api
kubectl delete configmap servicos-publicos-env

# MongoDB (⚠️ DELETA DADOS!)
kubectl delete deployment servicos-mongodb-publicos
kubectl delete service servicos-mongodb-publicos
kubectl delete pvc vol-servicos-mongodb-publicos
```

**Verificar limpeza:**
```bash
kubectl get all | grep -E "(servicospublicos|servicos-.*-publicos)"
```

---

## 🔍 Troubleshooting

### Pod não inicia
```bash
kubectl logs deployment/servicos-front-publicos --tail=50
kubectl describe pod <nome-do-pod>
```

**Causas comuns:**
- NEXTAUTH_SECRET não configurado
- API_URL_SERVER_SIDED incorreta
- API não está rodando

### Frontend não conecta na API
```bash
# Verificar API rodando
kubectl get pods | grep api-publicos

# Testar DNS
kubectl exec -it deployment/servicos-front-publicos -- sh
wget -O- http://servicospublicos-api:80/
exit
```

### Frontend não responde via HTTPS
```bash
# Verificar Service (nome DEVE ser servicospublicos)
kubectl get svc servicospublicos

# Testar internamente
kubectl run test-curl --image=curlimages/curl:latest --rm -it --restart=Never -- \
  curl -I http://servicospublicos:80/
```

---

## 📘 Informações

### Portas
- Frontend: 3000 (interna) → Service porta 80

### URLs
- **Frontend (interna):** http://servicospublicos:80
- **Frontend (produção):** https://servicospublicos.app.fslab.dev
- **API (interna - SSR):** http://servicospublicos-api:80
- **API (pública - navegador):** https://servicospublicos-api.app.fslab.dev

### Arquivos
```
deploy/
├── servicos-front-configmap.secret.yaml   # Produção (NÃO commitar!)
├── servicos-front-configmap.example.yaml  # Template
├── servicos-front-publicos.yaml           # Deployment + Service
└── GUIA-DEPLOY.md                         # Este guia
```

### Variáveis de Ambiente
- `API_URL_SERVER_SIDED`: URL interna da API (Next.js SSR)
- `NEXT_PUBLIC_API_URL`: URL pública da API (navegador)
- `NEXTAUTH_URL`: URL do frontend
- `NEXTAUTH_SECRET`: Secret do NextAuth (gerado)

---

**Última atualização:** 22/11/2025
