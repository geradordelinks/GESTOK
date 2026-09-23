# Gestok — Pagamento real com Pix e cartão

A tela de pagamento foi preparada para usar **Mercado Pago + Firebase Cloud Functions + Firestore**.

O fluxo é:

1. Cliente cria a conta.
2. A conta fica com `aguardando_pagamento`.
3. O cliente abre o pagamento.
4. O Payment Brick oferece Pix e cartão.
5. O frontend envia apenas os dados necessários ao backend.
6. O backend cria o pagamento no Mercado Pago.
7. O Mercado Pago envia Webhook quando o pagamento muda de status.
8. O backend valida a assinatura do Webhook e consulta o pagamento no Mercado Pago.
9. Somente quando o status for `approved`, o backend grava `assinatura.status = ativa` e `pagamento = aprovado`.
10. O login libera o sistema somente com assinatura aprovada e dentro da validade.

## 1. Pré-requisitos

- Conta de vendedor no Mercado Pago.
- Aplicação criada em **Suas integrações** no Mercado Pago.
- Firebase CLI instalado e login feito.
- Projeto Firebase `gestok-3bce2` selecionado.
- Projeto Firebase no plano Blaze para Cloud Functions.

O Firebase exige Cloud Functions para colocar o Access Token fora do navegador; credenciais privadas devem ficar no Secret Manager. `functions.config()` não deve ser usado em uma implementação nova. Consulte a documentação oficial do Firebase sobre parâmetros e secrets.

## 2. Instalar dependências

No terminal, dentro da pasta `ESTOQUE`:

```bash
cd functions
npm install
cd ..
```

## 3. Configurar as credenciais

No terminal, dentro de `ESTOQUE`:

```bash
firebase functions:secrets:set MP_ACCESS_TOKEN
```

Cole o **Access Token de produção** do Mercado Pago quando o terminal pedir.

Depois:

```bash
firebase functions:secrets:set MP_WEBHOOK_SECRET
```

Cole a chave secreta gerada pelo Mercado Pago em **Webhooks > Configurar notificações**.

Para a Public Key:

```bash
firebase deploy --only functions:paymentConfig
```

Durante a configuração/deploy, informe a **Public Key** da aplicação do Mercado Pago quando o Firebase solicitar `MP_PUBLIC_KEY`.

> Nunca coloque Access Token ou Webhook Secret em HTML, JavaScript do navegador, Git ou `pagamento/config.js`.

## 4. Deploy das funções

```bash
firebase deploy --only functions
```

As funções usadas pelo Gestok são:

- `paymentConfig`
- `createPayment`
- `paymentStatus`
- `mercadoPagoWebhook`

A URL esperada para o webhook é:

```text
https://southamerica-east1-gestok-3bce2.cloudfunctions.net/mercadoPagoWebhook
```

## 5. Configurar Webhook no Mercado Pago

No painel da aplicação do Mercado Pago:

**Webhooks → Configurar notificações**

Cadastre a URL acima e habilite as notificações de pagamento.

A integração valida o `x-signature` antes de aceitar a notificação.

## 6. Publicar o site

O frontend usa:

```text
https://southamerica-east1-gestok-3bce2.cloudfunctions.net
```

em `pagamento/config.js`.

Se você mudar a região das Cloud Functions, altere essa URL.

## 7. Teste obrigatório antes de produção

Faça pelo menos estes testes:

- Cartão de teste aprovado.
- Cartão recusado.
- Pix criado e pago.
- Pix criado e não pago.
- Recarregar a página durante um Pix pendente.
- Tentar alterar `assinatura` pelo navegador.
- Tentar acessar o sistema antes da aprovação.
- Fazer login depois da aprovação.
- Esperar a assinatura vencer e verificar o bloqueio.

## Importante

O navegador **não aprova pagamentos**. A função antiga `aprovarPagamentoGestok()` foi neutralizada. A aprovação passa a depender do Mercado Pago e do backend.
