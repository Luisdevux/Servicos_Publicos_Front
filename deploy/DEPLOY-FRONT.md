# Deploy - Frontend Serviços Públicos

## Build Produção

```bash
cd /home/yuri/Documentos/fabrica/servicos-publicos-front
docker build --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api.app.fslab.dev -t yurizetoles/servicos_publicos_front:latest .
docker push yurizetoles/servicos_publicos_front:latest
```

## Build QA

```bash
cd /home/yuri/Documentos/fabrica/servicos-publicos-front
docker build --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api-qa.app.fslab.dev -t yurizetoles/servicos_publicos_front:qa .
docker push yurizetoles/servicos_publicos_front:qa
```

## Deploy Produção

```bash
kubectl apply -f deploy/servicos-front-configmap.secret.yaml
kubectl apply -f deploy/servicos-front-publicos.yaml
```

## Atualizar Produção

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api.app.fslab.dev -t yurizetoles/servicos_publicos_front:latest .
docker push yurizetoles/servicos_publicos_front:latest
kubectl rollout restart deployment/servicos-front-publicos
```

## Deploy QA

```bash
kubectl apply -f deploy/servicos-front-qa-configmap.secret.yaml
kubectl apply -f deploy/servicos-front-publicos-qa.yaml
```

## Atualizar QA

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://servicospublicos-api-qa.app.fslab.dev -t yurizetoles/servicos_publicos_front:qa .
docker push yurizetoles/servicos_publicos_front:qa
kubectl rollout restart deployment/servicos-front-publicos-qa
```

## Deletar

```bash
kubectl delete -f deploy/servicos-front-publicos.yaml
kubectl delete -f deploy/servicos-front-configmap.secret.yaml
kubectl delete -f deploy/servicos-front-publicos-qa.yaml
kubectl delete -f deploy/servicos-front-qa-configmap.secret.yaml
```

## Verificar

```bash
kubectl get pods | grep front
kubectl logs -f deployment/servicos-front-publicos
kubectl logs -f deployment/servicos-front-publicos-qa
```

## Rodar Cypress

```bash
npx cypress open
npx cypress run
```

## URLs

- Produção: https://servicospublicos.app.fslab.dev
- QA: https://servicospublicos-qa.app.fslab.dev
