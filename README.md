# PortariaPro

Sistema interno de gestão para empresa de portaria virtual: clientes, propostas, contratos, equipamentos e financeiro.

## Tecnologias

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Prisma

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npx prisma db push
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
