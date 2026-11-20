# ZyroDev — Mercado Pago + PIX/Checkout automático

Fluxo do projeto:

**usuário logado → cria pedido → Checkout Mercado Pago → webhook → Firebase → benefício liberado**

## Arquivos do backend

- `api/pagamento/criar.js` — valida o usuário e cria uma preferência no Mercado Pago.
- `api/pagamento/status.js` — consulta o pedido do usuário.
- `api/webhook-mercadopago.js` — recebe as notificações do Mercado Pago e confirma o pagamento pela API.
- `api/_lib/firebaseAdmin.js` — acesso seguro ao Firestore pelo backend.
- `api/_lib/mercadopago.js` — chamadas para a API do Mercado Pago.
- `api/_lib/products.js` — catálogo e preços no servidor.

## Variáveis da Vercel

Configure estas Environment Variables:

```text
MERCADOPAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN
PUBLIC_SITE_URL=https://SEU-DOMINIO.vercel.app

FIREBASE_PROJECT_ID=zyrodev-58fed
FIREBASE_CLIENT_EMAIL=SEU_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nSUA_CHAVE\\n-----END PRIVATE KEY-----\\n"
```

Opcionalmente, para validar a assinatura do webhook:

```text
MERCADOPAGO_WEBHOOK_SECRET=SEU_SECRET_SIGNATURE
```

## Onde pegar o Access Token

No painel de desenvolvedores do Mercado Pago, use o **Access Token de teste** para o primeiro teste. Nunca coloque esse token em HTML, JavaScript do navegador ou GitHub.

## Webhook

Cadastre no Mercado Pago a URL:

```text
https://SEU-DOMINIO.vercel.app/api/webhook-mercadopago
```

Ative notificações de **pagamentos**.

O backend não confia apenas no navegador. Quando chega a notificação, ele consulta o pagamento diretamente na API do Mercado Pago e somente libera o benefício quando o status é `approved`.

## Firebase

O backend grava os pedidos em:

```text
pedidos/{orderId}
```

Quando o pagamento é aprovado, atualiza:

```text
usuarios/{uid}
```

### VIP Nova Era

- `vipAtivo: true`
- `vipTipo: "nova_era"`
- badge `vip`
- badge `vip_nova_era`
- `nomeGlowAtivo: true`
- `decoracaoAtiva: true`
- `perfilCor: "#ff6a00"` se ainda não existir
- +500 likes uma única vez
- libera `moldura_nova_era`

### Molduras

Cada compra adiciona o ID correspondente em `moldurasDesbloqueadas`.

## Importante

A página de retorno não libera nada sozinha. Ela apenas consulta o pedido. A liberação financeira acontece no webhook depois da confirmação do Mercado Pago.

## Deploy

1. Instale as dependências com `npm install`.
2. Configure as Environment Variables na Vercel.
3. Faça o deploy.
4. Cadastre o webhook do Mercado Pago usando o domínio publicado.
5. Faça um teste usando as credenciais de teste do Mercado Pago.

Não publique `.env`, Access Token ou a chave privada do Firebase.
