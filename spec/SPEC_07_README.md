# SPEC_07_README.md - for Claude free tier

You are a senior technical writer producing a professional GitHub README for a student project. Output ONE complete markdown file. No text before or after the code block.

PROJECT: PantryPal — Intelligent Recipe Finder
STACK: MongoDB + Express + React + Node (MERN)
PURPOSE: Users add ingredients they have at home. App ranks recipes by ingredient match percentage and generates shopping lists for missing items.

===== FACTUAL DETAILS (do not invent, use exactly) =====

Repository name: pantrypal
Node.js version required: >= 20.x
MongoDB version required: >= 7.0 (local install)
Ports:

- Backend (Express): 5000
- Frontend (Vite): 5173
- MongoDB: 27017

Folder structure:
pantrypal/
client/ (React + Vite frontend)
server/ (Express + MongoDB backend)
specs/ (development specification docs)
README.md

Backend .env variables (in server/.env):
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pantrypal
JWT_SECRET=pantrypal_super_secret_key_change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development

Demo credentials (auto-seeded on first server start):
Admin — <admin@pantrypal.com> / admin123
Demo — <demo@pantrypal.com> / demo123

Recipe data source: TheMealDB public API (<https://www.themealdb.com/api.php>). 100 recipes fetched on first server startup and stored in local MongoDB.

Key features:

- JWT authentication (register / login / logout)
- Pantry management (add / edit / delete / clear ingredients)
- Smart Match algorithm (MongoDB aggregation ranking recipes by % of ingredients user already has)
- Recipe discovery with search + cuisine + category filters
- Favorites system
- Shopping list generator (pick recipes → get missing ingredients grouped by category)
- Admin panel (CRUD recipes)
- Dark/Light theme toggle with glassmorphism design
- Toast notifications, form validation, protected routes

Data flow:
React (5173) → axios → Express (5000) → Mongoose → MongoDB (27017)
TheMealDB API is called ONCE at server startup (if DB empty) and never again.

===== SECTIONS REQUIRED (in this exact order) =====

1. TITLE + BADGES + ONE-LINE DESCRIPTION
   Title: # PantryPal — Intelligent Recipe Finder
   Add shield-style badges (static, no external services needed — just text badges or markdown that renders):
   Node.js, Express, React, MongoDB, Bootstrap, License: MIT
   One-line: "Cook with what you already have — match your pantry to recipes instantly."

2. SHORT DESCRIPTION (2-3 paragraphs)
   Explain the problem (food waste, indecision), the solution (pantry-based matching), and the highlight feature (Smart Match algorithm using MongoDB aggregation).

3. FEATURES
   Two-column bullet list (use markdown table or two lists side by side):
   Core features / Admin features

4. TECH STACK
   Table with columns: Layer | Technology | Purpose
   Include: Frontend (React 18, Vite, React Router, Bootstrap 5, react-icons, react-toastify), Backend (Node, Express 4, JWT, bcryptjs, node-fetch), Database (MongoDB, Mongoose 8), External API (TheMealDB).

5. ARCHITECTURE DIAGRAM
   ASCII diagram showing:
   Browser → React SPA (Vite :5173)
   → axios → Express API (:5000)
   → Mongoose → MongoDB (:27017)
   TheMealDB API → one-time seed → MongoDB

6. FOLDER STRUCTURE
   Show the tree with a text code block. Only expand to 2-3 levels deep for readability.
   Include: client/, server/, specs/ with brief inline comments.

7. HOW THE SMART MATCH WORKS (short section)
   Explain in plain English:
   - User's pantry ingredients are lowercased
   - MongoDB aggregation uses $setIntersection and $setDifference against each recipe's ingredients array
   - matchScore = (matched / total) * 100, rounded to 1 decimal
   - Recipes sorted by matchScore desc
   - Badges: "Can Cook Now" (100%), "Almost There" (70-99%), "Partial" (< 70%)

8. PREREQUISITES
   Table: Software | Linux Version | Windows Version
   - Node.js (>= 20) — nvm or pacman — installer from nodejs.org
   - npm (comes with Node)
   - Git — sudo pacman -S git — git-scm.com/download/win
   - MongoDB (>= 7) — AUR: mongodb-bin — MongoDB Community Server MSI

9. INSTALLATION — LINUX (Endeavour OS / Arch)
   Step-by-step with code blocks. Use EXACT commands:

   ### Step 1: Install Node.js and Git

   sudo pacman -S --needed nodejs npm git base-devel

   ### Step 2: Install MongoDB (via AUR helper `yay`)

   If yay is not installed:
   git clone <https://aur.archlinux.org/yay.git>
   cd yay && makepkg -si
   Then:
   yay -S mongodb-bin
   sudo systemctl enable --now mongod
   systemctl status mongod (should say "active (running)")

   ### Step 3: Clone the repo

   git clone <YOUR_REPO_URL> pantrypal
   cd pantrypal

   ### Step 4: Setup backend

   cd server
   npm install
   cp .env.example .env

   # .env defaults work out of the box for local MongoDB

   cd ..

   ### Step 5: Setup frontend

   cd client
   npm install
   cd ..

   ### Step 6: Run backend (Terminal 1)

   cd server
   npm run dev

   # On first run, seeds 100 recipes from TheMealDB (~30s)

   # Server: <http://localhost:5000>

   # Health: <http://localhost:5000/api/health>

   ### Step 7: Run frontend (Terminal 2)

   cd client
   npm run dev

   # Open <http://localhost:5173>

10. INSTALLATION — WINDOWS 11
    Step-by-step with PowerShell commands. Use EXACT steps:

    ### Step 1: Install Node.js

    Download LTS installer from <https://nodejs.org/> and run it.
    Verify in PowerShell:
    node -v (should be >= 20)
    npm -v

    ### Step 2: Install Git

    Download from <https://git-scm.com/download/win> and install (default options fine).
    Verify:
    git --version

    ### Step 3: Install MongoDB Community Server

    Download MSI from <https://www.mongodb.com/try/download/community>
    During install:
    - Choose "Complete" setup
    - Check "Install MongoDB as a Service" (runs on port 27017 automatically)
    - Skip MongoDB Compass (optional GUI, not required)
      Verify service is running:
      Get-Service MongoDB

    # Should say "Running". If not, start it

    Start-Service MongoDB

    ### Step 4: Clone the repo

    git clone <YOUR_REPO_URL> pantrypal
    cd pantrypal

    ### Step 5: Setup backend

    cd server
    npm install
    copy .env.example .env
    cd ..

    ### Step 6: Setup frontend

    cd client
    npm install
    cd ..

    ### Step 7: Run backend (PowerShell Window 1)

    cd server
    npm run dev

    ### Step 8: Run frontend (PowerShell Window 2)

    cd client
    npm run dev

    # Open <http://localhost:5173>

11. ENVIRONMENT VARIABLES
    Table with variable name, description, default value.
    Only mention server/.env — client uses hardcoded defaults.

12. DEMO CREDENTIALS
    Table:
    Role | Email | Password | Notes
    Admin | <admin@pantrypal.com> | admin123 | Can CRUD recipes
    Demo | <demo@pantrypal.com> | demo123 | Pre-filled pantry (10 items)
    Note: Accounts are created automatically on first server start.

13. API ENDPOINTS
    Table with columns: Method | Endpoint | Auth | Admin | Description
    Include all endpoints from:
    /api/auth/register (POST), /api/auth/login (POST), /api/auth/profile (GET/PUT)
    /api/pantry (GET, POST), /api/pantry/:id (PUT, DELETE), /api/pantry/clear (DELETE)
    /api/recipes (GET, POST), /api/recipes/:id (GET, PUT, DELETE), /api/recipes/match (POST)
    /api/favorites (GET, POST), /api/favorites/:id (DELETE)
    /api/shopping/generate (POST)
    Auth column = "JWT required" or "Public". Admin = "Yes" or "—".

14. DATABASE SCHEMA
    Brief overview of 4 collections: users, pantryitems, recipes, favorites.
    Show each as a short code block with field names + types. Keep to ~6-8 fields per collection.

15. AVAILABLE SCRIPTS
    Table of npm scripts:
    server: npm run dev, npm start, npm run seed
    client: npm run dev, npm run build, npm run preview

16. TROUBLESHOOTING
    Common issues with solutions (use these):

    | Issue                                                    | Solution                                                                                                                                       |
    | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
    | "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017" | MongoDB isn't running. Linux: sudo systemctl start mongod. Windows: Start-Service MongoDB.                                                     |
    | Port 5000 already in use                                 | Kill the process (Linux: `sudo lsof -i :5000`, Windows: `netstat -ano \| findstr :5000`) or change PORT in server/.env                         |
    | Port 5173 already in use                                 | Vite will auto-pick next available port — check terminal output                                                                                |
    | Seed script fails / no recipes in DB                     | Check internet connection. Re-run: `mongosh pantrypal --eval "db.dropDatabase()"` then restart server                                          |
    | Aider error: "No module named 'audioop'"                 | Only affects dev workflow, not this project. Skip if using the app normally.                                                                   |
    | Login fails with correct credentials                     | Ensure server is running, seed completed (check server logs for `[SEED] Done`), and MongoDB is accessible                                      |
    | Dark mode flashes white on refresh                       | Confirm `index.html` has inline `<style>` setting dark background — do not remove it                                                           |
    | "Cannot find module 'node-fetch'"                        | You're likely on Node 18+ with ESM confusion. Ensure `server/package.json` uses CommonJS (no `"type": "module"`) and node-fetch@2 is installed |

17. DEVELOPMENT WORKFLOW
    Brief note that the project was developed using spec-driven development with aider + local Qwen2.5-Coder + Claude for complex parts. Reference the `specs/` folder.

18. LICENSE
    MIT License. Standard short text.

19. ACKNOWLEDGEMENTS
    - TheMealDB for the free recipe API
    - Bootstrap + react-icons + react-toastify open-source community
    - Course: Web Technology (CSE23CT202) — Lab Project

20. AUTHOR / TEAM
    Placeholder block:
    **[Your Name]** — [Roll Number]
    **[Team Member 2]** — [Roll Number]
    **[Team Member 3]** — [Roll Number]
    Note: This is a 3-member team project for a 1-credit lab course.

===== FORMATTING RULES =====

- Use GitHub-flavored markdown.
- Every code block must have a language tag (`bash`, `powershell`, `javascript`, `json`, `text`).
- Tables must have header separator rows.
- Headings: h1 for title only, h2 for sections, h3 for subsections.
- Use blockquotes (`>`) for important notes.
- Keep prose tight — no filler sentences.
- Total length: aim for 400-600 lines.
- No emojis in headings (only in feature bullets if genuinely useful).
- Use `<YOUR_REPO_URL>` as a literal placeholder for the git clone URL.
- Add a table of contents right after the badges section (nested markdown links).

===== OUTPUT FORMAT =====

Output EXACTLY one markdown code block labeled:

### FILE: README.md

```markdown
<complete file>
```

No text before or after. Just the labeled block.
