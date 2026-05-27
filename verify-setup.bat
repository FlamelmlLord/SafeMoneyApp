@echo off
REM Script de verificación de instalación

echo.
echo ===================================================
echo   SafeMoneyApp - Verificacion de Instalacion
echo ===================================================
echo.

REM Verificar PHP
echo Verificando PHP...
php -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    php -v | findstr /R "^PHP" >nul
    if %ERRORLEVEL% EQU 0 (
        echo   [OK] PHP instalado
        php -v | findstr /R "^PHP"
    )
) else (
    echo   [ERROR] PHP no encontrado
)

echo.

REM Verificar extensiones de PHP
echo Verificando extensiones de PHP...

php -m | find "json" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Extensión JSON presente
) else (
    echo   [WARN] Extensión JSON no encontrada
)

php -m | find "bcmath" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Extensión BCMath presente
) else (
    echo   [WARN] Extensión BCMath no encontrada (REQUERIDA)
)

echo.

REM Verificar Node.js
echo Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Node.js instalado
    node --version
) else (
    echo   [WARN] Node.js no encontrado (necesario para compilar frontend)
)

echo.

REM Verificar Composer
echo Verificando Composer...
composer --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Composer instalado
    composer --version
) else (
    echo   [WARN] Composer no encontrado (necesario para instalar dependencias)
)

echo.

REM Verificar archivos
echo Verificando archivos del proyecto...

if exist "backend\vendor\autoload.php" (
    echo   [OK] Autoloader de PHP presente
) else (
    echo   [ERROR] Autoloader de PHP no encontrado
)

if exist "backend\public\index.php" (
    echo   [OK] index.php del backend presente
) else (
    echo   [ERROR] index.php del backend no encontrado
)

if exist "frontend\src\main.tsx" (
    echo   [OK] Frontend presente
) else (
    echo   [ERROR] Frontend no encontrado
)

echo.
echo ===================================================
echo   Verificacion completada
echo ===================================================
echo.

pause
