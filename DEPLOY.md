# Deploy Glee-go ID no EasyPanel

Stack: **Next.js 14 (frontend)** + **NestJS 10 (backend)** + **PostgreSQL 16** — tudo dockerizado.

## Estrutura

```
/frontend   # Next.js 14 App Router
/backend    # NestJS + Prisma
docker-compose.yml
.env.example
```

> ⚠️ Os arquivos em `src/`, `supabase/`, `vite.config.ts` na raiz são do preview Lovable e **não são usados** no deploy Docker. Pode ignorar ou apagar depois de exportar o repo.

## 1. Subir local (teste)

```bash
cp .env.example .env
# edite .env com senhas fortes
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend:  http://localhost:3000/api/health
- Postgres: localhost:5432

## 2. Deploy no EasyPanel

Crie **3 serviços** no mesmo projeto EasyPanel:

### Serviço 1 — Postgres
- Template: **Postgres** (oficial do EasyPanel)
- User: `gleego`  ·  Password: gere uma forte  ·  Database: `gleego_id`
- Anote o host interno (algo como `projeto_postgres`)

### Serviço 2 — Backend (App)
- Source: **GitHub** → seu repo, branch `main`
- **Build Path**: `/backend`
- **Dockerfile**: `Dockerfile` (já está em `/backend/Dockerfile`)
- **Porta**: `3000`
- **Domínio**: `api.seudominio.com`
- **Environment Variables**:
  ```
  DATABASE_URL=postgres://gleego:SENHA@projeto_postgres:5432/gleego_id
  JWT_SECRET=<string-aleatoria-64-chars>
  CORS_ORIGIN=https://app.seudominio.com
  PORT=3000
  NODE_ENV=production
  ```

### Serviço 3 — Frontend (App)
- Source: **GitHub** → mesmo repo
- **Build Path**: `/frontend`
- **Dockerfile**: `Dockerfile`
- **Porta**: `8080`
- **Domínio**: `app.seudominio.com`
- **Build Args**:
  ```
  NEXT_PUBLIC_API_URL=https://api.seudominio.com
  ```
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL=https://api.seudominio.com
  NODE_ENV=production
  PORT=8080
  ```

### Ordem do deploy
1. Postgres  →  aguarde "running"
2. Backend   →  ele roda `prisma migrate deploy` no start
3. Frontend  →  consome a API do backend

## 3. Endpoints do backend

- `POST /api/auth/register`  · cria empresa + admin
- `POST /api/auth/login`     · retorna `{ token, user }`
- `GET  /api/cards`          · lista cartões (JWT)
- `POST /api/cards`          · cria cartão (JWT)
- `PATCH /api/cards/:id`     · edita (JWT)
- `DELETE /api/cards/:id`    · deleta (JWT)
- `GET  /api/public/cards/:slug` · página pública
- `POST /api/leads/public`   · captura lead (público)
- `GET  /api/leads`          · lista leads (JWT)
- `GET  /api/health`         · health check

## 4. Migrações Prisma

Rodam automaticamente no start do container backend (`prisma migrate deploy`).
Para criar uma nova migration localmente:

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name nome_da_migration
```

## 5. SSL / HTTPS

No EasyPanel, em cada serviço App → **Domains** → adicione o domínio e marque **HTTPS** (Let's Encrypt automático).

## 6. Backup do banco

No serviço Postgres do EasyPanel → aba **Backups** → configure backup agendado para S3/Wasabi.

---

**Pronto.** Push pro GitHub, conecte os 3 serviços no EasyPanel e o sistema sobe.