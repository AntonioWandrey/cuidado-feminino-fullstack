# Frontend — Minha Saúde Feminina

Cliente React/Vite do projeto Cuidado Feminino, preparado para navegador e Android com Capacitor.

## Executar

```powershell
npm ci
npm run dev
```

Abra `http://localhost:5173`.

Com o backend em execução, a gestão de artigos fica em:

```text
http://localhost:5173/gestao/artigos
```

Ela oferece criação, edição, publicação/despublicação, exclusão lógica, editor Tiptap e prévia segura. O aplicativo refaz as consultas públicas periodicamente durante a demonstração.

Para a demonstração do calendário sem backend:

```powershell
.\INICIAR_DEMO.bat
```

Abra `http://127.0.0.1:4173`.

## Scripts

```powershell
npm run lint
npm test
npm run build
npm run preview
```

## Persistência do calendário

O calendário é local-first. Os períodos são salvos no `localStorage` sob a chave:

```text
cuidado-feminino:ciclos:v1
```

Para limpar somente os ciclos de demonstração:

```js
localStorage.removeItem("cuidado-feminino:ciclos:v1");
location.reload();
```

## Backend

Por padrão, serviços remotos usam `http://localhost:8080`. Para outro endereço:

```powershell
$env:VITE_API_URL = "http://10.0.2.2:8080"
npm run build
```

O calendário da Entrega 2 não usa a API.

## Android

```powershell
npm run build
npx cap sync android
npx cap open android
```

O projeto nativo fica em `frontend/android`. Arquivos de build, `local.properties` e assets copiados são ignorados pelo Git.
