@echo off
setlocal

echo ============================================
echo GESTOK - PUBLICAR BACKEND DE PAGAMENTO
echo ============================================
echo.

echo 1. Fazendo login no Firebase...
firebase login
if errorlevel 1 goto erro

echo.
echo 2. Selecionando projeto gestok-3bce2...
firebase use gestok-3bce2
if errorlevel 1 goto erro

echo.
echo 3. Instalando dependencias das Functions...
cd functions
call npm install
if errorlevel 1 goto erro
cd ..

echo.
echo 4. Configurando Access Token do Mercado Pago.
echo NAO cole o token neste arquivo.
firebase functions:secrets:set MP_ACCESS_TOKEN --project gestok-3bce2
if errorlevel 1 goto erro

echo.
echo 5. Configurando Webhook Secret do Mercado Pago.
firebase functions:secrets:set MP_WEBHOOK_SECRET --project gestok-3bce2
if errorlevel 1 goto erro

echo.
echo 6. Publicando as Cloud Functions...
firebase deploy --only functions --project gestok-3bce2
if errorlevel 1 goto erro

echo.
echo ============================================
echo PUBLICACAO CONCLUIDA
echo ============================================
echo.
echo Teste no navegador:
echo https://southamerica-east1-gestok-3bce2.cloudfunctions.net/paymentHealth
echo.
pause
exit /b 0

:erro
echo.
echo ERRO durante a publicacao.
echo Confira a mensagem acima e tente novamente.
pause
exit /b 1
