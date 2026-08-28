# Como iniciar o projeto no VS Code

## 1. Pré-requisitos

Instale e confirme:

```powershell
node --version
npm --version
java -version
git --version
```

Versões recomendadas:

- Node.js 22 ou superior;
- npm 10 ou superior;
- Java JDK 21;
- MySQL local para executar o backend;
- VS Code com as extensões Java, ESLint e Tailwind CSS.

## 2. Abrir a pasta correta

No VS Code, escolha **File → Open Folder** e abra:

```text
C:\Users\cntta\OneDrive\Desktop\Aleatorios Documento\projeto-saude-feminina
```

Não abra apenas `frontend` ou apenas `backend`, porque as tarefas e configurações do workspace ficam na raiz.

## 3. Caminho rápido — somente a entrega do calendário

Abra o terminal integrado com `Ctrl + '` e execute:

```powershell
cd frontend
.\INICIAR_DEMO.bat
```

Depois abra:

```text
http://127.0.0.1:4173
```

Esse modo usa as dependências já instaladas e não precisa de backend nem MySQL.

Se for a primeira execução:

```powershell
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`.

## 4. Configurar o backend

Copie o exemplo de configuração:

```powershell
cd backend\cuidado-feminino-api
Copy-Item src\main\resources\application-local.properties.example src\main\resources\application-local.properties
```

Abra `src/main/resources/application-local.properties` e substitua:

```properties
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

O arquivo local fica ignorado pelo Git. Não envie credenciais ao repositório.

Com o MySQL iniciado, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

Confirme o backend:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

## 5. Iniciar o frontend integrado

Abra um segundo terminal do VS Code:

```powershell
cd frontend
npm ci
npm run dev
```

Acesse `http://localhost:5173`.

O calendário continuará usando armazenamento local. Conteúdos e queixas podem consumir o backend em `http://localhost:8080`.

Para demonstrar a Entrega 1, abra diretamente:

```text
http://localhost:5173/gestao/artigos
```

## 6. Usar as tarefas do VS Code

Pressione `Ctrl + Shift + P`, procure **Tasks: Run Task** e escolha:

- `Frontend: instalar dependências`;
- `Frontend: iniciar`;
- `Frontend: testar`;
- `Frontend: build`;
- `Backend: testar`;
- `Backend: iniciar`.

Para depurar o Java, abra **Run and Debug** e escolha **Backend Spring Boot**.

## 7. Testar antes de apresentar

```powershell
cd frontend
npm run lint
npm test
npm run build

cd ..\backend\cuidado-feminino-api
.\mvnw.cmd test
```

Os testes do backend usam H2 em memória e não dependem do MySQL. O MySQL é necessário para iniciar a aplicação e demonstrar a gestão de artigos com persistência real.

## 8. Android — opcional, não usar como plano principal amanhã

Pré-requisitos adicionais:

- Android Studio;
- Android SDK Platform 36;
- Android Build Tools compatíveis;
- `ANDROID_SDK_ROOT` configurado.

Depois:

```powershell
cd frontend
npm run build
npx cap sync android
npx cap open android
```

Para gerar um APK de debug:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Saída esperada:

```text
frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

## 9. Solução de problemas

### `npm-cli.js` não encontrado ou acesso negado

Feche o VS Code, abra-o normalmente e teste `npm --version`. Se o problema persistir, repare/reinstale o Node.js LTS. Como contingência nesta máquina:

```powershell
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

O arquivo `INICIAR_DEMO.bat` também inicia o Vite sem passar pelo npm.

### Maven não inicia

Confirme que `java -version` mostra Java 21. O wrapper do repositório já contém a correção para diretórios `.m2` normais no PowerShell.

Se uma dependência falhar com `PKIX path validation failed`, a rede/antivírus está interceptando HTTPS. Use uma rede confiável ou configure o certificado corporativo no Java; não desative a validação TLS.

### Porta ocupada

```powershell
Get-NetTCPConnection -LocalPort 5173,8080 -ErrorAction SilentlyContinue
```

Encerre o processo que estiver usando a porta ou altere temporariamente a porta do Vite.

### Banco indisponível

Confirme que o serviço MySQL está ativo e que usuário/senha em `application-local.properties` estão corretos. A demonstração do calendário não depende do banco.
