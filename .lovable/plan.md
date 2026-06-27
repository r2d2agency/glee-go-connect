## Objetivo

Transformar o Glee-go ID em duas camadas de produto:

- **Bio Link (grátis)** — qualquer pessoa cria, escolhe template e publica sua mini página de links (estilo Linktree) em segundos.
- **Cartão Digital NFC/vCard (upgrade pago)** — recursos atuais (vCard, QR, leads, pixel, analytics) ficam disponíveis para planos pagos.

Junto com isso, melhorar mensagens de login/erro e a responsividade mobile.

---

## 1. Cadastro com Wizard (frontend Next no /frontend)

Substituir o `/auth/register` atual por um fluxo de 4 passos em uma única página com indicador de progresso:

1. **Conta** — nome, email, senha, nome público (sugere slug automático a partir do nome).
2. **Template** — grid com 4 templates de bio (Minimal, Dark, Vibrant, Pro). Preview ao vivo de um lado, opções do outro (em mobile vira tabs).
3. **Bio** — foto (URL), título/cargo, bio curta (280 char), cor principal.
4. **Links** — adicionar até 5 botões (label + URL) e até 5 redes sociais. "Pular" disponível.

Ao concluir: cria conta + cria automaticamente o primeiro `Card` do tipo `BIO_LINK` já publicado, redireciona para `/dashboard` mostrando link público + QR.

---

## 2. Modelo de dados (backend Nest/Prisma)

No `schema.prisma`:

- Adicionar enum `CardType { BIO_LINK, DIGITAL_CARD }` e campo `type` no `Card` (default `BIO_LINK`).
- Adicionar enum `Plan { FREE, PRO, BUSINESS }` em `Company` (default `FREE`).
- Garantir que `Card` já tem: `avatarUrl`, `bio`, `primaryColor`, `template`, `socialLinks Json`, `customButtons Json`. Adicionar o que faltar.

Regras de negócio no `cards.service.ts`:

- FREE: máximo 1 card do tipo `BIO_LINK`, sem `DIGITAL_CARD`, sem leads, sem pixel.
- PRO/BUSINESS: múltiplos cards, qualquer tipo, leads + pixel + analytics liberados.
- Endpoint `POST /cards` recebe `type`; valida limite pelo plano e retorna erro amigável `403 PLAN_LIMIT`.

Seed: adicionar 4 templates fixos (Minimal, Dark, Vibrant, Pro) como referência (lista exportada do backend via `GET /templates`).

---

## 3. Página pública do Bio Link

Em `frontend/src/app/c/[slug]/page.tsx`, renderizar dois layouts conforme `card.type`:

- `BIO_LINK` — avatar centralizado, nome, bio, lista vertical de botões grandes, ícones de redes sociais no rodapé. Sem vCard/QR por padrão.
- `DIGITAL_CARD` — layout atual completo com botão "Salvar contato" (vCard) e bloco WhatsApp/telefone/email.

Aplicar `primaryColor` do card via CSS var inline. Mobile-first com `max-w-md mx-auto`.

---

## 4. UX de erros e mensagens (frontend)

- Criar helper `frontend/src/lib/errors.ts` que parseia a resposta do Nest (string, `{message}`, array de validação) e devolve string legível em PT-BR.
- Substituir `setError(err.message)` em login/register/dashboard por esse helper.
- Trocar banners vermelhos por toast (instalar `sonner` no /frontend) com variantes success/error.
- Mensagens específicas: "Email ou senha incorretos", "Este email já está em uso", "Slug já está em uso, tente outro", "Limite do plano grátis atingido — faça upgrade".

No backend `auth.service.ts` e `cards.service.ts`, padronizar exceptions com `{ code, message }` em português.

---

## 5. Responsividade

Auditar e ajustar (regras do `responsive-layout-patterns`):

- `dashboard/page.tsx` — header com grid `grid-cols-[minmax(0,1fr)_auto]` em mobile, botões empilham, formulário de criar card vira accordion/modal em telas < `md`.
- `admin/page.tsx` — tabelas viram cards empilhados em mobile.
- Wizard — passos em coluna única no mobile, 2 colunas (preview + form) em `md+`.
- Garantir `min-w-0` + `truncate` em todos os títulos com email/slug.

---

## 6. Detalhes técnicos

- Sem mudança de stack: continua Next 14 em `/frontend` + Nest em `/backend` + Postgres, tudo Docker/EasyPanel.
- Migrações: usar `prisma db push` como já está configurado no Dockerfile (o novo enum e campos sobem no próximo deploy).
- Instalar `sonner` e `react-hook-form` + `zod` no `/frontend` para o wizard.
- Não mexer no `src/` da Lovable (preview interno) — apenas em `/frontend` e `/backend`.

---

## Entregáveis

- `backend/prisma/schema.prisma` (enums + campos)
- `backend/src/cards/cards.service.ts` (regras de plano)
- `backend/src/templates/` novo módulo + `GET /templates`
- `frontend/src/app/auth/register/page.tsx` (wizard 4 passos)
- `frontend/src/app/dashboard/page.tsx` (responsividade + toasts)
- `frontend/src/app/c/[slug]/page.tsx` (dois layouts)
- `frontend/src/lib/errors.ts`, `frontend/src/components/wizard/*`, `frontend/src/components/bio-templates/*`
- Login/register usando toast + mensagens PT-BR

Quer que eu siga com tudo isso de uma vez, ou prefere fatiar (ex: começar pelo wizard + bio link e deixar plano/upgrade para depois)?