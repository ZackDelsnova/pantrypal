# SPEC_00_OVERVIEW.md — PantryPal Master Context

> **TOOL:** Read-only context. Feed to all tools (Deepseekv4.1-flash + Claude).  
> **PURPOSE:** Single source of truth. Every other spec file references this.

---

## 1. Project Summary

- **Name:** PantryPal — Intelligent Recipe Finder
- **Type:** Full-stack MERN web application
- **Purpose:** Users enter ingredients they have at home. The app finds recipes they can cook, ranked by ingredient match percentage. Includes a shopping list generator for missing items.
- **Course:** Web Technology (CSE23CT202) — 1-credit lab project
- **Scope:** Local-only demo. No cloud deployment. Not production-grade.

## 2. Tech Stack (Exact Versions)

| Layer      | Technology              | Version | Notes                                            |
| ---------- | ----------------------- | ------- | ------------------------------------------------ |
| Runtime    | Node.js                 | ≥ 20.x  | Check with `node -v`                             |
| Backend    | Express.js              | ^4.19.x | **Not v5** — stick to 4.x for stability          |
| Database   | MongoDB                 | ≥ 7.0   | Local, port 27017                                |
| ODM        | Mongoose                | ^8.x    |                                                  |
| Auth       | jsonwebtoken + bcryptjs | latest  | JWT in localStorage                              |
| Frontend   | React                   | ^18.3.x | **Not React 19** — Vite + React 18 for stability |
| Bundler    | Vite                    | ^5.x    |                                                  |
| Routing    | react-router-dom        | ^6.x    |                                                  |
| HTTP       | axios                   | ^1.x    |                                                  |
| UI         | Bootstrap               | ^5.3.x  | + custom CSS for glassmorphism                   |
| Icons      | react-icons             | ^5.x    |                                                  |
| Toasts     | react-toastify          | ^10.x   |                                                  |
| Recipe API | TheMealDB               | v1      | Free test key = `1`                              |

**Do not deviate from these versions.** Any newer major versions have breaking changes that will waste time.

## 3. Folder Structure (Exact)

```text
pantrypal/
├── .gitignore
├── README.md
├── specs/                          # These spec files
│   ├── SPEC_00_OVERVIEW.md
│   ├── SPEC_01_BACKEND.md
│   ├── SPEC_02_SMART_MATCH.md
│   ├── SPEC_03_FRONTEND_CORE.md
│   ├── SPEC_04_FRONTEND_PAGES.md
│   ├── SPEC_05_DESIGN.md
│   ├── SPEC_06_SEED_SCRIPT.md
│   └── SPEC_07_README.md
├── server/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   ├── config/db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── PantryItem.js
│   │   ├── Recipe.js
│   │   └── Favorite.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pantryController.js
│   │   ├── recipeController.js
│   │   ├── favoriteController.js
│   │   └── shoppingController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── pantryRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── favoriteRoutes.js
│   │   └── shoppingRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   └── seed/
│       └── seedRunner.js
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/axios.js
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   └── PantryContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── AdminRoute.jsx
        │   ├── RecipeCard.jsx
        │   ├── MatchScoreBadge.jsx
        │   ├── IngredientTag.jsx
        │   ├── LoadingSpinner.jsx
        │   └── ConfirmModal.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Pantry.jsx
            ├── Discover.jsx
            ├── SmartMatch.jsx
            ├── RecipeDetail.jsx
            ├── Favorites.jsx
            ├── ShoppingList.jsx
            ├── AdminPanel.jsx
            ├── Profile.jsx
            └── NotFound.jsx
```

## 4. Data Flow

```text
User Browser (React)
    │
    │ HTTP (axios) → http://localhost:5000/api/*
    ▼
Express Server (Node)
    │
    │ Mongoose
    ▼
Local MongoDB (port 27017)
    │
    └── Collections: users, pantryitems, recipes, favorites

TheMealDB API
    │
    │ Fetched ONCE on server start (if DB empty)
    ▼
Seed Script → transforms data → inserts 100 recipes into MongoDB
```

After seeding, the app **never** calls TheMealDB again. All queries hit local MongoDB.

## 5. Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pantrypal
JWT_SECRET=pantrypal_super_secret_key_change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### `client/.env` (Optional — defaults work)

```env
VITE_API_URL=http://localhost:5000/api
```

## 6. API Endpoints (High Level)

| Method | Endpoint                 | Auth | Admin | Purpose                            |
| ------ | ------------------------ | ---: | ----: | ---------------------------------- |
| POST   | `/api/auth/register`     |   No |    No | Register user                      |
| POST   | `/api/auth/login`        |   No |    No | Login, return JWT                  |
| GET    | `/api/auth/profile`      |  Yes |    No | Get current user                   |
| PUT    | `/api/auth/profile`      |  Yes |    No | Update profile                     |
| GET    | `/api/pantry`            |  Yes |    No | List pantry items                  |
| POST   | `/api/pantry`            |  Yes |    No | Add pantry item                    |
| PUT    | `/api/pantry/:id`        |  Yes |    No | Update item                        |
| DELETE | `/api/pantry/:id`        |  Yes |    No | Delete item                        |
| DELETE | `/api/pantry/clear`      |  Yes |    No | Clear all                          |
| GET    | `/api/recipes`           |   No |    No | List recipes (filterable)          |
| GET    | `/api/recipes/:id`       |   No |    No | Single recipe                      |
| POST   | `/api/recipes/match`     |  Yes |    No | **Smart Match** (pantry → recipes) |
| POST   | `/api/recipes`           |  Yes |   Yes | Create recipe                      |
| PUT    | `/api/recipes/:id`       |  Yes |   Yes | Update recipe                      |
| DELETE | `/api/recipes/:id`       |  Yes |   Yes | Delete recipe                      |
| POST   | `/api/favorites`         |  Yes |    No | Save recipe                        |
| GET    | `/api/favorites`         |  Yes |    No | List favorites                     |
| DELETE | `/api/favorites/:id`     |  Yes |    No | Remove favorite                    |
| POST   | `/api/shopping/generate` |  Yes |    No | Generate shopping list             |

## 7. MongoDB Collections (High Level)

### `users`

- `name`, `email`, `password` (hashed), `dietaryPreference`, `allergies[]`, `role`, `createdAt`

### `pantryitems`

- `userId` (ref), `name`, `quantity`, `category`, `expiryDate`, `addedAt`

### `recipes`

- `title`, `description`, `imageUrl`, `cuisine`, `category`, `instructions[]`, `ingredients[]`, `youtubeUrl`, `createdBy`, `createdAt`
- **Unique index** on `title` (prevents duplicate seed)

### `favorites`

- `userId` (ref), `recipeId` (ref), `savedAt`
- **Compound unique index** on `(userId, recipeId)`

## 8. Design System

### Theme: Glassmorphism + Fresh Green + Dark Mode Default

**Color palette (CSS variables):**

```css
:root[data-theme="dark"] {
  --bg-primary: #0f1720;
  --bg-secondary: #1a2430;
  --bg-glass: rgba(255, 255, 255, 0.06);
  --bg-glass-hover: rgba(255, 255, 255, 0.1);
  --border-glass: rgba(255, 255, 255, 0.12);
  --text-primary: #e8f0e8;
  --text-secondary: #9ca89c;
  --accent: #2ecc71;
  --accent-hover: #27ae60;
  --accent-glow: rgba(46, 204, 113, 0.35);
  --danger: #e74c3c;
  --warning: #f39c12;
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:root[data-theme="light"] {
  --bg-primary: #f0f7f2;
  --bg-secondary: #e0ebe3;
  --bg-glass: rgba(255, 255, 255, 0.55);
  --bg-glass-hover: rgba(255, 255, 255, 0.75);
  --border-glass: rgba(46, 204, 113, 0.25);
  --text-primary: #1a2a1a;
  --text-secondary: #4a5a4a;
  --accent: #27ae60;
  --accent-hover: #229954;
  --accent-glow: rgba(46, 204, 113, 0.25);
  --danger: #c0392b;
  --warning: #d68910;
  --shadow: 0 8px 32px rgba(46, 204, 113, 0.15);
}
```

**Glassmorphism recipe** (apply to cards, navbar, modals):

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: var(--bg-glass-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--accent-glow);
}
```

**Critical:** `<body>` must have `background-color: var(--bg-primary)` set in raw CSS **before React loads**. This prevents the white flash. Put this in `index.html` inline:

```html
<style>
  html,
  body {
    background: #0f1720;
    margin: 0;
    color: #e8f0e8;
  }
</style>
```

Dark mode is the default. The theme toggle in `Navbar` switches the `data-theme` attribute on the `<html>` element. The preference is saved to localStorage as `pantrypal-theme`.

**No white flashbang rule:** Even in light mode, the initial paint uses a dark background. React hydrates and switches to light within 100 ms if the user prefers light.

## 9. Tool Assignment Table

| Spec File | Tool         | Why                         |
| --------- | ------------ | --------------------------- |
| `SPEC_00` | Reference    | Everyone reads              |
| `SPEC_01` | Qwen (Aider) | Standard boilerplate        |
| `SPEC_02` | Claude Free  | Complex aggregation logic   |
| `SPEC_03` | Qwen (Aider) | Standard React patterns     |
| `SPEC_04` | Qwen (Aider) | Standard React pages        |
| `SPEC_05` | Claude Free  | Design taste required       |
| `SPEC_06` | Claude Free  | API quirks + transformation |
| `SPEC_07` | Claude Free  | Writing quality             |

## 10. Development Workflow

1. Write all 8 spec files into `pantrypal/specs/`.
2. Initialize `server/` and `client/` with `package.json` and dependencies.
3. Run Aider inside `pantrypal/` with `qwen2.5-coder:14b-32k`.
4. Feed `SPEC_01` to Aider to generate the backend.
5. Manually copy `SPEC_02`, paste it into Claude, and save the output files.
6. Feed `SPEC_03` + `SPEC_04` to Aider to generate the frontend.
7. Manually copy `SPEC_05`, paste it into Claude, and save the CSS/context files.
8. Manually copy `SPEC_06`, paste it into Claude, and save the seed script.
9. Manually copy `SPEC_07`, paste it into Claude, and save the README.
10. Test locally, fix issues, commit, and push to GitHub.
11. Clone on Windows, run `npm install`, and launch the demo.

## 11. Non-Goals (Do Not Build)

- ❌ Meal planner / calendar
- ❌ Recipe ratings or comments
- ❌ Profile picture upload
- ❌ Password reset via email
- ❌ Social sharing
- ❌ Real payment integration
- ❌ Cloud deployment
- ❌ TypeScript (plain JS only)
- ❌ Redux (Context API only)
- ❌ Tailwind (Bootstrap only)
- ❌ React 19 (use React 18)
- ❌ Express 5 (use Express 4)

## 12. Demo Credentials (Seeded)

| Role      | Email                 | Password   | Notes             |
| --------- | --------------------- | ---------- | ----------------- |
| Admin     | `admin@pantrypal.com` | `admin123` | Can CRUD recipes  |
| Demo User | `demo@pantrypal.com`  | `demo123`  | Pre-filled pantry |

The demo user pantry is pre-seeded with:

- chicken
- rice
- onion
- garlic
- egg
- soy sauce
- tomato
- pasta
- cheese
- butter

## 13. Ports

| Service         |  Port | URL                         |
| --------------- | ----: | --------------------------- |
| Express backend |  5000 | `http://localhost:5000`     |
| Vite frontend   |  5173 | `http://localhost:5173`     |
| MongoDB         | 27017 | `mongodb://127.0.0.1:27017` |

**CORS:** The backend allows origin `http://localhost:5173` only.

## 14. Success Criteria

The project is done when:

- [ ] User can register, log in, and log out.
- [ ] User can add, edit, and delete pantry items.
- [ ] Smart Match page returns recipes ranked by match percentage.
- [ ] User can view recipe details.
- [ ] User can favorite and unfavorite recipes.
- [ ] Shopping list generates from selected recipes minus pantry items.
- [ ] Admin can CRUD recipes.
- [ ] Dark/light toggle works, with no white flash.
- [ ] README works on both Linux and Windows.
- [ ] `git clone` + `npm install` + `npm run dev` works on a fresh machine.

---

**End of `SPEC_00`.**

```*

```
