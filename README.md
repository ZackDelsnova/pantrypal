# PantryPal — Intelligent Recipe Finder

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2020-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-%E2%89%A5%207.0-47A248?logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Cook with what you already have — match your pantry to recipes instantly.**

## Table of Contents

- [Short Description](#short-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Diagram](#architecture-diagram)
- [Folder Structure](#folder-structure)
- [How the Smart Match Works](#how-the-smart-match-works)
- [Prerequisites](#prerequisites)
- [Installation — Linux (Endeavour OS / Arch)](#installation--linux-endeavour-os--arch)
  - [Step 1: Install Node.js and Git](#step-1-install-nodejs-and-git)
  - [Step 2: Install MongoDB](#step-2-install-mongodb-via-aur-helper-yay)
  - [Step 3: Clone the repo](#step-3-clone-the-repo)
  - [Step 4: Setup backend](#step-4-setup-backend)
  - [Step 5: Setup frontend](#step-5-setup-frontend)
  - [Step 6: Run backend](#step-6-run-backend-terminal-1)
  - [Step 7: Run frontend](#step-7-run-frontend-terminal-2)
- [Installation — Windows 11](#installation--windows-11)
  - [Step 1: Install Node.js](#step-1-install-nodejs-1)
  - [Step 2: Install Git](#step-2-install-git-1)
  - [Step 3: Install MongoDB Community Server](#step-3-install-mongodb-community-server)
  - [Step 4: Clone the repo](#step-4-clone-the-repo)
  - [Step 5: Setup backend](#step-5-setup-backend-1)
  - [Step 6: Setup frontend](#step-6-setup-frontend-1)
  - [Step 7: Run backend](#step-7-run-backend-powershell-window-1)
  - [Step 8: Run frontend](#step-8-run-frontend-powershell-window-2)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)
- [Acknowledgements](#acknowledgements)

---

## Short Description

Every household has the same evening ritual: open the fridge, stare at a handful of ingredients, and have no idea what to cook. The result is either an unnecessary takeaway order or ingredients quietly expiring at the back of the shelf. Both contribute to food waste and wasted money.

**PantryPal** flips the usual recipe-search model. Instead of picking a recipe and hunting for ingredients, you tell the app what you already have. It ranks every recipe in its database by how much of it you can already make, and tells you exactly what is missing. Pick a few recipes and it produces a shopping list grouped by category, containing only what you still need to buy.

The highlight is the **Smart Match algorithm**: a single MongoDB aggregation pipeline that compares your pantry against every recipe's ingredient list using set operations (`$setIntersection` and `$setDifference`), computes a match percentage, and returns the results ranked, all in the database rather than in application code.

> **Note:** PantryPal is a local-only demo built as a student lab project. It is not production-hardened and has no cloud deployment.

---

## Features

| Core Features | Admin Features |
| ------------- | -------------- |
| JWT authentication (register / login / logout) | Admin-only recipe management panel |
| Pantry management (add / edit / delete / clear ingredients) | Create new recipes |
| **Smart Match**: recipes ranked by % of ingredients you already have | Edit existing recipes |
| Recipe discovery with search + cuisine + category filters | Delete recipes |
| Favorites system (save / remove recipes) | Role-protected routes (`AdminRoute` on the client, admin middleware on the server) |
| Shopping list generator: pick recipes, get missing ingredients grouped by category | Seeded admin account for instant access |
| Dark / Light theme toggle with glassmorphism design | |
| Toast notifications, form validation, protected routes | |

---

## Tech Stack

| Layer | Technology | Purpose |
| ----- | ---------- | ------- |
| Frontend | React 18 | Component-based UI |
| Frontend | Vite 5 | Dev server and bundler |
| Frontend | React Router 6 | Client-side routing and protected routes |
| Frontend | Bootstrap 5 | Responsive layout and base components |
| Frontend | react-icons | Icon set |
| Frontend | react-toastify | Toast notifications |
| Frontend | axios | HTTP client for the REST API |
| Backend | Node.js (>= 20) | JavaScript runtime |
| Backend | Express 4 | REST API framework |
| Backend | jsonwebtoken (JWT) | Stateless authentication |
| Backend | bcryptjs | Password hashing |
| Backend | node-fetch | One-time recipe fetch from TheMealDB during seeding |
| Database | MongoDB (>= 7.0) | Document store and aggregation engine |
| Database | Mongoose 8 | Schema modelling and queries |
| External API | TheMealDB | Free recipe data source (used once, at seed time) |

---

## Architecture Diagram

```text
┌──────────────────────────────┐
│           Browser            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  React SPA (Vite :5173)      │
│  Context API · React Router  │
└──────────────┬───────────────┘
               │  axios (HTTP / JSON + JWT)
               ▼
┌──────────────────────────────┐
│  Express API (:5000)         │
│  routes → middleware →       │
│  controllers                 │
└──────────────┬───────────────┘
               │  Mongoose
               ▼
┌──────────────────────────────┐
│  MongoDB (:27017)            │
│  users · pantryitems ·       │
│  recipes · favorites         │
└──────────────▲───────────────┘
               │  one-time seed
               │  (only if DB is empty)
┌──────────────┴───────────────┐
│  TheMealDB API               │
│  themealdb.com/api.php       │
└──────────────────────────────┘
```

> TheMealDB is called **once**, at server startup, and only if the database is empty. After seeding, every request is served from local MongoDB.

---

## Folder Structure

```text
pantrypal/
├── README.md
├── specs/                      # Development specification docs
│   └── SPEC_00 … SPEC_07       # Overview, backend, smart match, frontend, design, seed, README
├── server/                     # Express + MongoDB backend
│   ├── server.js               # Entry point
│   ├── .env.example            # Environment template
│   ├── config/                 # Database connection
│   ├── models/                 # User, PantryItem, Recipe, Favorite
│   ├── controllers/            # Auth, pantry, recipe, favorite, shopping logic
│   ├── routes/                 # Route definitions per resource
│   ├── middleware/             # Auth, admin, error handling
│   └── seed/                   # TheMealDB seeding + demo accounts
└── client/                     # React + Vite frontend
    ├── index.html              # Inline dark background (prevents white flash)
    ├── vite.config.js
    └── src/
        ├── api/                # Configured axios instance
        ├── context/            # Auth, Theme, Pantry providers
        ├── components/         # Navbar, RecipeCard, MatchScoreBadge, ...
        └── pages/              # Landing, Dashboard, Pantry, Discover, SmartMatch, ...
```

---

## How the Smart Match Works

1. The user's pantry ingredient names are **lowercased** so comparisons are case-insensitive.
2. A MongoDB aggregation pipeline runs against every recipe. For each recipe, `$setIntersection` finds the ingredients the user **has**, and `$setDifference` finds the ones they are **missing**.
3. The score is computed as:

```text
   matchScore = (matched / total) * 100     → rounded to 1 decimal place
```

4. Results are sorted by `matchScore` in **descending** order.
5. Each recipe receives a badge based on its score:

| Badge | Condition |
| ----- | --------- |
| **Can Cook Now** | 100% |
| **Almost There** | 70% – 99% |
| **Partial** | below 70% |

> Because the whole calculation happens inside MongoDB, the server returns ranked results plus the list of missing ingredients in a single query.

---

## Prerequisites

| Software | Linux Version | Windows Version |
| -------- | ------------- | --------------- |
| Node.js (>= 20) | `nvm` or `pacman` | Installer from [nodejs.org](https://nodejs.org/) |
| npm | Comes with Node.js | Comes with Node.js |
| Git | `sudo pacman -S git` | [git-scm.com/download/win](https://git-scm.com/download/win) |
| MongoDB (>= 7) | AUR: `mongodb-bin` | MongoDB Community Server MSI |

---

## Installation — Linux (Endeavour OS / Arch)

### Step 1: Install Node.js and Git

```bash
sudo pacman -S --needed nodejs npm git base-devel
```

### Step 2: Install MongoDB (via AUR helper `yay`)

If `yay` is not installed:

```bash
git clone https://aur.archlinux.org/yay.git
cd yay && makepkg -si
```

Then install and start MongoDB:

```bash
yay -S mongodb-bin
sudo systemctl enable --now mongod
systemctl status mongod
```

> The status output should say **active (running)**.

### Step 3: Clone the repo

```bash
git clone <YOUR_REPO_URL> pantrypal
cd pantrypal
```

### Step 4: Setup backend

```bash
cd server
npm install
cp .env.example .env
# .env defaults work out of the box for local MongoDB
cd ..
```

### Step 5: Setup frontend

```bash
cd client
npm install
cd ..
```

### Step 6: Run backend (Terminal 1)

```bash
cd server
npm run dev
# On first run, seeds 100 recipes from TheMealDB (~30s)
# Server: http://localhost:5000
# Health: http://localhost:5000/api/health
```

### Step 7: Run frontend (Terminal 2)

```bash
cd client
npm run dev
# Open http://localhost:5173
```

---

## Installation — Windows 11

### Step 1: Install Node.js

Download the **LTS** installer from [nodejs.org](https://nodejs.org/) and run it.

Verify in PowerShell:

```powershell
node -v    # should be >= 20
npm -v
```

### Step 2: Install Git

Download from [git-scm.com/download/win](https://git-scm.com/download/win) and install (default options are fine).

Verify:

```powershell
git --version
```

### Step 3: Install MongoDB Community Server

Download the MSI from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).

During installation:

- Choose the **Complete** setup type.
- Check **Install MongoDB as a Service** (runs on port 27017 automatically).
- Skip MongoDB Compass (optional GUI, not required).

Verify the service is running:

```powershell
Get-Service MongoDB
# Should say "Running". If not, start it:
Start-Service MongoDB
```

### Step 4: Clone the repo

```powershell
git clone <YOUR_REPO_URL> pantrypal
cd pantrypal
```

### Step 5: Setup backend

```powershell
cd server
npm install
copy .env.example .env
cd ..
```

### Step 6: Setup frontend

```powershell
cd client
npm install
cd ..
```

### Step 7: Run backend (PowerShell Window 1)

```powershell
cd server
npm run dev
```

> On first run the server seeds 100 recipes from TheMealDB (~30s). Wait for the `[SEED] Done` message before logging in.

### Step 8: Run frontend (PowerShell Window 2)

```powershell
cd client
npm run dev
# Open http://localhost:5173
```

---

## Environment Variables

Only `server/.env` is needed. The client works with its built-in defaults.

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/pantrypal` |
| `JWT_SECRET` | Secret used to sign JWTs | `pantrypal_super_secret_key_change_me` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `NODE_ENV` | Runtime environment | `development` |

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pantrypal
JWT_SECRET=pantrypal_super_secret_key_change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> Change `JWT_SECRET` if you ever expose this app beyond your own machine.

---

## Demo Credentials

| Role | Email | Password | Notes |
| ---- | ----- | -------- | ----- |
| Admin | `admin@pantrypal.com` | `admin123` | Can CRUD recipes |
| Demo | `demo@pantrypal.com` | `demo123` | Pre-filled pantry (10 items) |

> Accounts are created automatically on first server start.

The demo pantry contains: chicken, rice, onion, garlic, egg, soy sauce, tomato, pasta, cheese, butter.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Admin | Description |
| ------ | -------- | ---- | ----- | ----------- |
| POST | `/api/auth/register` | Public | — | Register a new user |
| POST | `/api/auth/login` | Public | — | Log in and receive a JWT |
| GET | `/api/auth/profile` | JWT required | — | Get the current user's profile |
| PUT | `/api/auth/profile` | JWT required | — | Update the current user's profile |
| GET | `/api/pantry` | JWT required | — | List pantry items |
| POST | `/api/pantry` | JWT required | — | Add a pantry item |
| PUT | `/api/pantry/:id` | JWT required | — | Update a pantry item |
| DELETE | `/api/pantry/:id` | JWT required | — | Delete a pantry item |
| DELETE | `/api/pantry/clear` | JWT required | — | Clear the entire pantry |
| GET | `/api/recipes` | Public | — | List recipes (search, cuisine, category filters) |
| GET | `/api/recipes/:id` | Public | — | Get a single recipe |
| POST | `/api/recipes/match` | JWT required | — | **Smart Match**: rank recipes against the user's pantry |
| POST | `/api/recipes` | JWT required | Yes | Create a recipe |
| PUT | `/api/recipes/:id` | JWT required | Yes | Update a recipe |
| DELETE | `/api/recipes/:id` | JWT required | Yes | Delete a recipe |
| GET | `/api/favorites` | JWT required | — | List the user's favorites |
| POST | `/api/favorites` | JWT required | — | Save a recipe to favorites |
| DELETE | `/api/favorites/:id` | JWT required | — | Remove a favorite |
| POST | `/api/shopping/generate` | JWT required | — | Generate a shopping list from selected recipes |

> Protected requests send the token as `Authorization: Bearer <token>`.

---

## Database Schema

Four collections, modelled with Mongoose.

### `users`

```javascript
{
  name: String,
  email: String,               // unique
  password: String,            // bcrypt hash
  dietaryPreference: String,
  allergies: [String],
  role: String,                // "user" | "admin"
  createdAt: Date
}
```

### `pantryitems`

```javascript
{
  userId: ObjectId,            // ref: User
  name: String,                // stored lowercase for matching
  quantity: String,
  category: String,
  expiryDate: Date,
  addedAt: Date
}
```

### `recipes`

```javascript
{
  title: String,               // unique index (prevents duplicate seeding)
  description: String,
  imageUrl: String,
  cuisine: String,
  category: String,
  instructions: [String],
  ingredients: [String],       // matched against the user's pantry
  youtubeUrl: String,
  createdBy: ObjectId,         // ref: User
  createdAt: Date
}
```

### `favorites`

```javascript
{
  userId: ObjectId,            // ref: User
  recipeId: ObjectId,          // ref: Recipe
  savedAt: Date
}
// compound unique index on (userId, recipeId)
```

---

## Available Scripts

| Location | Command | Description |
| -------- | ------- | ----------- |
| `server/` | `npm run dev` | Start the backend with auto-reload (development) |
| `server/` | `npm start` | Start the backend in standard mode |
| `server/` | `npm run seed` | Run the seed script manually (recipes + demo accounts) |
| `client/` | `npm run dev` | Start the Vite dev server on port 5173 |
| `client/` | `npm run build` | Create a production build in `client/dist` |
| `client/` | `npm run preview` | Preview the production build locally |

---

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Linux: `sudo systemctl start mongod`. Windows: `Start-Service MongoDB`. |
| Port 5000 already in use | Kill the process (Linux: `sudo lsof -i :5000`, Windows: `netstat -ano \| findstr :5000`) or change `PORT` in `server/.env`. |
| Port 5173 already in use | Vite will auto-pick the next available port — check the terminal output. |
| Seed script fails / no recipes in DB | Check your internet connection. Re-run: `mongosh pantrypal --eval "db.dropDatabase()"` then restart the server. |
| Aider error: `No module named 'audioop'` | Only affects the dev workflow, not this project. Skip if using the app normally. |
| Login fails with correct credentials | Ensure the server is running, seeding completed (check server logs for `[SEED] Done`), and MongoDB is accessible. |
| Dark mode flashes white on refresh | Confirm `index.html` has the inline `<style>` setting a dark background — do not remove it. |
| `Cannot find module 'node-fetch'` | You're likely on Node 18+ with ESM confusion. Ensure `server/package.json` uses CommonJS (no `"type": "module"`) and `node-fetch@2` is installed. |

> **Note:** If the frontend loads but API calls fail, check that the backend is running on port 5000. The backend only accepts CORS requests from `http://localhost:5173`.

---

## Development Workflow

This project was built with **spec-driven development**. Each part of the system is described in a dedicated specification file in the [`specs/`](./specs) folder, and each spec was handed to the AI tool best suited to it:

- **Deepseek** for standard boilerplate (backend scaffolding, React patterns, pages).
- **Claude** for the complex parts: the Smart Match aggregation, the design system, the seed script, and this README.

`SPEC_00_OVERVIEW.md` acts as the single source of truth that every other spec references.

---

## Acknowledgements

- [TheMealDB](https://www.themealdb.com/api.php) for the free recipe API.
- The [Bootstrap](https://getbootstrap.com/), [react-icons](https://react-icons.github.io/react-icons/) and [react-toastify](https://fkhadra.github.io/react-toastify/) open-source communities.

---
