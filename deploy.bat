@echo off
echo ===================================================
echo   LibraryHub - Deploy Script
echo ===================================================
echo.
echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Docker nao esta instalado ou nao esta no PATH.
    echo Por favor, instale o Docker Desktop antes de continuar.
    pause
    exit /b 1
)

echo [2/3] Iniciando build e execucao dos containers...
docker-compose down
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo [ERRO] Falha ao iniciar os containers do Docker.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   ✅ DEPLOY CONCLUIDO COM SUCESSO!
echo ===================================================
echo   A plataforma esta rodando em:
echo   - URL: http://localhost:3333
echo   - Porta: 3333
echo.
echo   Utilize os logins de teste fornecidos.
echo ===================================================
pause
