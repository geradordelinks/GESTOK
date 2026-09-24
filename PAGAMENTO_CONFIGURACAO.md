# Gestok — configuração do pagamento

Este projeto separa o frontend (GitHub Pages) do backend (Firebase Cloud Functions).

## 1. Projeto Firebase

O projeto configurado é:

`gestok-3bce2`

Região das funções:

`southamerica-east1`

## 2. Instalar e publicar

Na pasta raiz do projeto:

```bash
firebase login
firebase use gestok-3bce2
cd functions
npm install
cd ..
firebase deploy --only functions --project gestok-3bce2
```

Durante o deploy, o Firebase poderá pedir o valor de `MP_PUBLIC_KEY`.
Use a **Public Key** da aplicação Mercado Pago.

## 3. Configurar credenciais privadas

Não coloque o Access Token no HTML ou JavaScript do site.

Configure no Firebase:

```bash
firebase functions:secrets:set MP_ACCESS_TOKEN --project gestok-3bce2
firebase functions:secrets:set MP_WEBHOOK_SECRET --project gestok-3bce2
```

Depois publique novamente:

```bash
firebase deploy --only functions --project gestok-3bce2
```

## 4. Testar se o backend está online

Depois do deploy, abra no navegador:

`https://southamerica-east1-gestok-3bce2.cloudfunctions.net/paymentHealth`

O retorno esperado é um JSON contendo:

```json
{
  "ok": true,
  "service": "Gestok Payments"
}
```

Também é possível testar:

`https://southamerica-east1-gestok-3bce2.cloudfunctions.net/paymentConfig`

O retorno esperado é:

```json
{
  "ok": true,
  "publicKey": "SUA_PUBLIC_KEY"
}
```

## 5. Webhook do Mercado Pago

Configure o webhook de pagamentos para:

`https://southamerica-east1-gestok-3bce2.cloudfunctions.net/mercadoPagoWebhook`

O backend valida a assinatura do webhook e consulta o pagamento diretamente na API do Mercado Pago antes de liberar a assinatura.

## 6. Fluxo

1. Usuário entra no Gestok.
2. Frontend obtém o token do Firebase Auth.
3. Frontend chama `createPayment`.
4. Backend valida o usuário e a loja.
5. Backend cria o pagamento no Mercado Pago.
6. Mercado Pago processa Pix/cartão.
7. Webhook ou consulta server-side confirma o status.
8. Somente `approved` libera/renova a assinatura.
9. O Firestore recebe `status: "ativa"` e `pagamento: "aprovado"`.
10. O frontend consulta `paymentStatus` e entra no sistema.

## 7. Segurança

Nunca publique estes valores no GitHub Pages:

- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`

A Public Key pode ser entregue ao frontend; o Access Token permanece nas Cloud Functions.
