# TripFinder

A travel smart booking system web application built with Node.js, Express, React and PostgreSQL.

## Prerequisites

- Node.js v18+
- PostgreSQL (running locally)

## Setup and Run

**1. Database**

```bash
createdb tripfinder
psql tripfinder -f backend/schema.sql
psql tripfinder -f backend/seed.sql
```

**2. Backend** - API runs on http://localhost:3000

```bash
cd backend
cp .env.example .env
```

Then open `.env` and fill in your PostgreSQL password and a JWT secret of your choice.

```bash
npm install
npm start
```

**3. Frontend** - client runs on http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

**4. Tests**

```bash
cd backend
npm test
```

All 16 tests should pass (3 suites: auth, booking CRUD, polymorphism).

## Test Accounts

| Email | Role |
|---|---|
| akokiopeyemi@gmail.com | Admin |
| Register on the site | Member / Guest |

## Architecture

The backend follows a layered architecture:

```text
frontend/src/pages/      → View (React)
backend/src/controllers/ → Controller (thin, no business logic)
backend/src/services/    → Business / Service layer
backend/src/domain/      → Domain model (Customer, Member, Guest, Booking)
backend/src/repositories/→ Persistence layer (parameterised SQL)
```

**GRASP Polymorphism** — `Customer` is an abstract class. `Member` and `Guest` each override `earnPoints()` and `canUpgrade()` with their own rules. The service layer calls these methods without any `if/else` type checks; the subclass decides the behaviour.

**MVC** - Express controllers parse requests and delegate to services (no business logic in controllers). React pages act as views consuming a JSON API. Domain classes and repositories form the model.

**Beyond CRUD** - JWT authentication, role-based access control (customer / advisor / admin), Zod input validation, booking cutoff enforcement, loyalty points system, and a Jest + Supertest test suite with coverage.
