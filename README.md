#  Military Asset Management System

A full-stack military asset management assignment implementation using React + TypeScript + Tailwind CSS + shadcn-style UI, Express + TypeScript REST APIs, Prisma ORM, PostgreSQL, JWT authentication and RBAC.


## Roles

- **Admin** — all bases and all modules
- **Base Commander** — all operational modules for assigned base
- **Logistics Officer** — purchases and transfers only, scoped to assigned base

## Run

### Backend

```bash
cd backend
cp .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### .env file
```
DATABASE_URL="postgres://avnadmin:[password]@pg-25f2a1de-hariashish1-e64d.l.aivencloud.com:13745/defaultdb?sslmode=require"
JWT_SECRET="secret-long-secret"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

### Frontend

```bash
cd frontend
npm install
cp .env
npm run dev
```

### .env file
```
VITE_API_URL = http://localhost:5000/api
```

## Demo users

Seeded password for all demo accounts: `ChangeMe@123`

- admin@military.local — Admin
- commander@military.local — Base Commander
- logistics@military.local — Logistics Officer

Change these credentials before any real deployment.
