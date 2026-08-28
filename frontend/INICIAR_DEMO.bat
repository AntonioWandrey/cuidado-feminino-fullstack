@echo off
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencias nao encontradas. Execute npm install nesta pasta antes da demonstracao.
  pause
  exit /b 1
)

echo.
echo Minha Saude Feminina - demonstracao local
echo Abra no navegador: http://127.0.0.1:4173
echo Para encerrar o servidor, pressione Ctrl+C.
echo.

node "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 4173
