@echo off
REM Script de setup inicial del proyecto (Windows)
REM Uso: setup.bat

cls
echo.
echo ===================================================
echo   SafeMoneyApp - Script de Setup Inicial (Windows)
echo ===================================================
echo.

REM 1. Instalar dependencias del backend
echo.
echo 1. Instalando dependencias del backend...
cd backend
if exist "vendor" (
    echo    [OK] vendor/ ya existe
) else (
    where composer >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        call composer install --optimize-autoloader
    ) else (
        echo    [WARN] Composer no encontrado. Asegúrate de subir la carpeta vendor/ manualmente.
    )
)
cd ..

REM 2. Instalar dependencias del frontend
echo.
echo 2. Instalando dependencias del frontend...
cd frontend
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call npm install
) else (
    echo    [ERROR] npm no encontrado. Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)
cd ..

REM 3. Compilar frontend
echo.
echo 3. Compilando frontend...
cd frontend
call npm run build
cd ..

REM 4. Crear estructura de carpetas
echo.
echo 4. Creando estructura de carpetas...
if not exist "backend\public\dist" mkdir backend\public\dist
if not exist "backend\public\logs" mkdir backend\public\logs
if not exist "docs\deployment" mkdir docs\deployment

REM 5. Verificación
echo.
echo ===================================================
echo   Verificacion de instalacion:
echo ===================================================
echo.

if exist "backend\vendor\autoload.php" (
    echo   [OK] Autoloader de Composer presente
) else (
    echo   [ERROR] Autoloader de Composer no encontrado
)

if exist "backend\public\dist\index.html" (
    echo   [OK] Frontend compilado en backend\public\dist\
) else (
    echo   [WARN] Frontend no compilado
)

if exist ".htaccess" (
    echo   [OK] Archivos .htaccess presentes
) else (
    echo   [WARN] Falta algún archivo .htaccess
)

echo.
echo ===================================================
echo   Setup completado
echo ===================================================
echo.
echo Proximos pasos:
echo   1. Abre: http://localhost/api/v1/health
echo   2. Abre: http://localhost/
echo   3. Lee: DEPLOY_HOSTINGER.md para desplegar en produccion
echo.

pause
