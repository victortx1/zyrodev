# SECURITY_FIX_REPORT — ZyroDev

> Observação: o `SECURITY_AUDIT.md` não estava no zip enviado. A auditoria foi refeita diretamente no código.

## Problemas corrigidos
**Críticos / altos**
1. E-mails e dados privados públicos: `usuarios` agora só é lido pelo dono/admin. Dados públicos (sem e-mail) ficam em `perfisPublicos` (somente leitura, lista limitada a 100).
2. Escalonamento de privilégios: nenhuma escrita em `usuarios` pelo navegador (cargos, admin, badges, VIP, pontos, likes, moedas, itens). Tudo passa por `/api/conta/*` e `/api/admin/*` (Admin SDK, lista de campos permitidos, validação de posse e catálogo).
3. Pontos/aulas validados no servidor (curso/aula válidos, idempotente, intervalo mínimo).
4. Curtidas 1/dia por perfil contabilizadas no servidor.
5. Painel admin: ações validadas no servidor (token + `admin === true` + auditoria em `auditoriaAdmin`); admin não altera o próprio cargo/ban.
6. Mercado Pago: webhook falha fechado sem `MERCADOPAGO_WEBHOOK_SECRET`; assinatura em tempo constante; só `payment`; confere valor, moeda, referência e provedor contra o catálogo do servidor; liberação em transação idempotente; reconciliação segura em `status.js`; erros do provedor não vazam ao cliente; rate limit; contas banidas bloqueadas.
7. Webhook Asaas (quebrado/inseguro) corrigido: token em tempo constante, idempotência atômica, só pedidos `asaas`.
8. Chave ImgBB hardcoded removida do `podepa.js`; upload migrado para Firebase Storage (regras já existentes). Chave Pix pessoal removida de `LEIA-ME-VIP.txt`.
9. XSS/injeção: foto sem escape no admin; `onclick` inline removidos (admin/ranking); `sanitizeMediaUrl` recusa SVG embutido, aspas, parênteses, `\`, `//`, `..`; `cssUrl()` contra injeção de CSS (perfil público, chat); formulário de config do site escapado; perfil público não deriva `@handle` do e-mail.
10. Chat: regras validam identidade (`nome` real, `foto` vazia), castigo no servidor, URL de imagem só do Firebase Storage, campos permitidos, reações só em `reacoes`. Amizades: nomes reais, id determinístico, update restrito a `lastMessage/updatedAt`.
11. Hospedagem: CSP/HSTS/XFO etc. em `vercel.json`, `firebase.json`, `_headers` (CSP sem `http:` em imagens, `object-src 'none'`, `apis.google.com` para login Google); `api/`, `.bak`, `.md`, `.txt`, rules fora do deploy do Firebase Hosting; `.vercelignore`/`.gitignore` atualizados.
12. Storage rules: nega SVG, usuários banidos e caminhos fora do chat.

## Arquivos modificados
Novos: `api-client.js`, `api/conta/[acao].js`, `api/admin/[acao].js`, `api/_lib/{http,guard,publico,catalogo,cursos,pagamentos}.js`, `testes/seguranca.test.js`, `.vercelignore`.
Alterados: `firestore.rules`, `storage.rules`, `firebase.json`, `vercel.json`, `_headers`, `.gitignore`, `.env.example`, `package.json`, `PAGAMENTO-README.md`, `LEIA-ME-VIP.txt`, `security-utils.js`, `login.js`, `editar-perfil.js`, `temporada-service.js`, `zyro-id.js`, `admin.js`, `podepa.js`, `ranking.html`, `perfil-publico.html`, `amizades.html`, `configuracoes.html`, `loja.html`, `loja-vip.html`, `javascript/java/python/php/csharp/cursohtmlecss/logica-programacao.html`, `api/_lib/{firebaseAdmin,mercadopago}.js`, `api/pagamento/{criar,status}.js`, `api/webhook-{mercadopago,asaas}.js`.
Backup original: `backup_original.zip`.

## Depende de configuração externa (OBRIGATÓRIO antes de usar)
1. Vercel env: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, **`MERCADOPAGO_WEBHOOK_SECRET`**, `PUBLIC_SITE_URL` (https). Asaas (se usar): `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`.
2. **Revogar/rotacionar a chave ImgBB** `bbaa7aa3…` (esteve pública) e, se a chave Pix foi exposta, considerar trocá-la.
3. Publicar `firestore.rules` e `storage.rules` **junto** com o deploy da API (as páginas antigas deixam de gravar direto).
4. Após o deploy, entrar uma vez como admin: o painel reconstrói `perfisPublicos` das contas existentes automaticamente (ranking/perfis aparecem depois disso).
5. Firebase Console → restringir a API key web por domínio (referrer) e manter o App Check/Authorized domains; confirmar Firebase Storage ativo.
6. Verificar `functions.runtime` do `vercel.json` (`nodejs20.x` não é formato padrão da Vercel; não alterado por não ter sido possível validar sem deploy).
7. Cadastrar o webhook do Mercado Pago (`/api/webhook-mercadopago`) com o secret acima.

## Testes executados (`npm test` → `node testes/seguranca.test.js`): 34 ok, 0 falhas
- Sintaxe de todos os JS da API, módulos do front e scripts inline dos HTML.
- Varredura de segredos; ausência de escrita do navegador em `usuarios`; ausência de leitura pública de `usuarios`; sanitização de URLs/CSS; regras (Firestore/Storage/headers) por inspeção.
- Servidor com Firestore simulado: webhook (sem assinatura, assinatura falsa, sem secret, tipo errado, id inválido) e liberação de pagamento (valor divergente, pedido adulterado, status, provedor, idempotência VIP, moldura).
- Login/cadastro, painel admin, ranking, chat e permissões: validados por revisão de código e testes estáticos/unitários; **não foi possível executar contra Firebase real nem o Emulator** (sem rede/credenciais). Recomenda-se um teste manual de fumaça após o deploy.

## Vulnerabilidades não resolvidas / riscos residuais
- CSP mantém `'unsafe-inline'` (há muitos scripts/handlers inline; removê-lo exige refatoração ampla).
- Servidor não consegue provar que o aluno assistiu ao vídeo (pontos podem ser obtidos concluindo aulas sem assistir; limitado a intervalo mínimo e total finito).
- Filtro de palavrões do chat é do lado do cliente (castigo contornável).
- Adicionar amigo continua sem aceite do outro usuário (design original).
- Reembolso/chargeback marca o pedido, mas não revoga benefícios já liberados (comportamento original).
- Rate limit em memória é por instância serverless (dissuasão); garantias reais estão nas transações.
- Firestore Rules não foram testadas no Emulator.
