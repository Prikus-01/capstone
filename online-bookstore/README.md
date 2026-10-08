# BookWorm — Online Bookstore

A full-stack online bookstore built for the IBM AI Specialist Capstone project.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + TanStack Query
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL 15+
- Docker (optional, for quick DB setup)

### Start PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env   # edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:3000

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/login` | Login |
| `/register` | Register |
| `/catalogue` | Catalogue |
| `/categories/:slug` | Category |
| `/brands/:slug` | Brand |
| `/products/:id` | Product Details |
| `/cart` | Cart |
| `/checkout/address` | Checkout — Address |
| `/checkout/payment` | Checkout — Payment |
| `/payment/result` | Payment Result |
| `/orders/:id/confirmation` | Order Confirmation |
| `/orders` | Order History |
| `/profile` | Profile |
