# SPEC_05_DESIGN.md - For Claude free tier

You are a senior UI/CSS engineer specializing in glassmorphism design and modern dark/light theming. Output ONE complete CSS file. No explanations, no commentary, no markdown outside the single code block.

PROJECT: PantryPal — a MERN recipe finder app. React 18 + Bootstrap 5.3 + Vite.

TASK: Write the complete `client/src/index.css` file. It must:

1. Define CSS variables for BOTH dark (default) and light themes via `:root[data-theme="dark"]` and `:root[data-theme="light"]` selectors (theme toggle is already implemented in ThemeContext.jsx and sets `data-theme` on `<html>`).
2. Override Bootstrap defaults where needed so Bootstrap components (forms, buttons, tables, modals, dropdowns, pagination, badges, alerts) look correct in BOTH themes.
3. Implement glassmorphism cards, navbar, modals, and dropdowns.
4. Add polished micro-animations (hover lifts, fade-ins, smooth transitions).
5. Ensure NO white flashbang — this is critical. The `html, body` background must always be dark until JS switches the theme attribute. Since `index.html` already sets `background-color: #0f1720` on html/body as a fallback, do not remove that.

===== COLOR PALETTE (use these exact values) =====

DARK THEME (`:root[data-theme="dark"]`):
--bg-primary: #0f1720
--bg-secondary: #1a2430
--bg-tertiary: #232f3d
--bg-glass: rgba(255, 255, 255, 0.06)
--bg-glass-hover: rgba(255, 255, 255, 0.10)
--bg-glass-strong: rgba(255, 255, 255, 0.14)
--border-glass: rgba(255, 255, 255, 0.12)
--border-glass-strong: rgba(255, 255, 255, 0.22)
--text-primary: #e8f0e8
--text-secondary: #9ca89c
--text-muted: #6b786b
--accent: #2ecc71
--accent-hover: #27ae60
--accent-glow: rgba(46, 204, 113, 0.35)
--accent-soft: rgba(46, 204, 113, 0.15)
--danger: #e74c3c
--danger-soft: rgba(231, 76, 60, 0.15)
--warning: #f39c12
--warning-soft: rgba(243, 156, 18, 0.15)
--info: #3498db
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25)
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.35)
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.45)
--shadow-accent: 0 8px 32px rgba(46, 204, 113, 0.25)

LIGHT THEME (`:root[data-theme="light"]`):
--bg-primary: #eef5f0
--bg-secondary: #e2ede6
--bg-tertiary: #d4e3d9
--bg-glass: rgba(255, 255, 255, 0.55)
--bg-glass-hover: rgba(255, 255, 255, 0.72)
--bg-glass-strong: rgba(255, 255, 255, 0.85)
--border-glass: rgba(46, 204, 113, 0.22)
--border-glass-strong: rgba(46, 204, 113, 0.4)
--text-primary: #14261a
--text-secondary: #4a5a4a
--text-muted: #7a8a7a
--accent: #1e9e55
--accent-hover: #188045
--accent-glow: rgba(30, 158, 85, 0.25)
--accent-soft: rgba(30, 158, 85, 0.12)
--danger: #c0392b
--danger-soft: rgba(192, 57, 43, 0.12)
--warning: #d68910
--warning-soft: rgba(214, 137, 16, 0.12)
--info: #2874a6
--shadow-sm: 0 2px 8px rgba(20, 38, 26, 0.08)
--shadow-md: 0 8px 24px rgba(20, 38, 26, 0.12)
--shadow-lg: 0 12px 40px rgba(20, 38, 26, 0.16)
--shadow-accent: 0 8px 32px rgba(30, 158, 85, 0.18)

===== REQUIRED SECTIONS (in this order) =====

1. GLOBAL RESET & BASE
   - Box-sizing, html/body min-height, font stack, antialiasing
   - body background + color using variables
   - Smooth transition on background-color and color (0.3s ease)
   - Custom scrollbar styling (WebKit + Firefox) using accent + glass vars

2. TYPOGRAPHY
   - h1-h6 default color = var(--text-primary)
   - Smooth font rendering
   - Links: no underline by default, hover color = var(--accent)

3. GLASSMORPHISM UTILITIES
   .glass-card — glass surface (blur 16px, saturate 180%, border, rounded 16px, shadow-md, padding via Bootstrap classes)
   .glass-card:hover — background lifts, translateY(-2px), shadow-accent glow
   .glass-navbar — glass surface but full-width sticky (blur 20px, top border-bottom only)
   .glass-modal — glass surface for modal content
   .glass-input — inputs with glass background

4. BUTTONS (override Bootstrap)
   .btn-accent — accent bg, dark text, hover lifts with glow
   .btn-outline-accent — transparent bg, accent border + text, hover fills
   .btn-outline-secondary — restyle to match glass theme in both modes
   .btn-secondary — restyle to glass look
   .theme-toggle-btn — circular 36x36, glass background, rotates icon on hover
   .btn-danger, .btn-outline-danger — restyle text/bg for both themes

5. FORMS (override Bootstrap)
   .form-control, .form-select, .form-check-input, .input-group-text
   - Background = var(--bg-glass)
   - Border = 1px solid var(--border-glass)
   - Color = var(--text-primary)
   - Focus: border-color = var(--accent), box-shadow = 0 0 0 0.2rem var(--accent-glow)
   - Placeholder color = var(--text-muted)
   - In BOTH themes

6. NAVBAR
   .glass-navbar — full styling
   .navbar-brand — accent color for icon, text-primary for name
   .navbar .nav-link — text-secondary, hover accent, active state with bottom underline in accent
   .navbar-toggler — transparent, no Bootstrap border
   .navbar-collapse on mobile — glass panel with backdrop blur

7. CARDS & CONTAINERS
   .glass-card (already covered) — ensure card images have proper border-radius at top
   Recipe cards: `.recipe-card-img` class for image styling (rounded top, aspect ratio, object-fit cover)

8. BADGES & TAGS
   .badge-accent — accent soft bg + accent text
   .badge-glass — glass bg + text-secondary
   .ingredient-tag — pill for ingredients (already inline-styled in component, but override to ensure consistency)

9. MODALS (override Bootstrap)
   - Modal content: glass background, border, rounded 16px
   - Modal backdrop: darker in dark mode, lighter blur in light mode
   - Modal header/footer: transparent, border-color = var(--border-glass)
   - Close button: adapts to theme

10. TABLES (override Bootstrap .table)
    - Remove default borders, use border-glass
    - Header text = text-secondary, uppercase, small
    - Row hover: bg = var(--bg-glass)
    - Text color = text-primary

11. ALERTS & TOASTS (react-toastify overrides)
    - .Toastify__toast — glass background, border, blurred
    - Success/danger/warning/info variants use matching soft bg + accent text
    - Progress bar in accent color

12. PAGINATION
    - page-link: glass background, text-primary, hover accent
    - active page: accent background, dark text

13. SCROLLBAR
    - Width 10px, track transparent, thumb = var(--border-glass-strong) with accent hover

14. ANIMATIONS
    @keyframes fadeInUp — 0% opacity 0 translateY(10px), 100% opacity 1 translateY(0)
    @keyframes fadeIn — simple opacity
    @keyframes pulseGlow — subtle glow pulse for "Can Cook Now" badge
    @keyframes shimmer — subtle loading shimmer for skeleton states
    Apply fadeInUp to .glass-card by default (0.4s ease, no delay)
    Add stagger helper classes: .fade-delay-1 (.05s), .fade-delay-2 (.1s), .fade-delay-3 (.15s)

15. SPINNER (override Bootstrap .spinner-border)
    - Border color uses var(--accent) for the animated part
    - Ensure visibility in both themes

16. UTILITY HELPERS
    .text-accent — color = var(--accent)
    .text-soft — color = var(--text-secondary)
    .bg-glass — background = var(--bg-glass)
    .border-glass — border = 1px solid var(--border-glass)
    .rounded-xl — 16px
    .rounded-2xl — 24px
    .shadow-accent — var(--shadow-accent)
    .hover-lift — translateY(-2px) on hover with 0.2s transition

17. RESPONSIVE TWEAKS
    - On screens < 992px, reduce backdrop-filter blur to 12px (perf)
    - On screens < 576px, reduce glass-card padding slightly

18. REDUCED MOTION
    @media (prefers-reduced-motion: reduce) — disable animations, transitions

19. ACCESSIBILITY
    - :focus-visible outlines in accent color
    - Ensure contrast ratio meets WCAG AA in both themes

===== RULES =====

- Every color MUST come from a CSS variable defined at the top.
- NO hardcoded hex values except inside the :root variable declarations.
- NO !important unless absolutely required to override Bootstrap (e.g., .table borders).
- Do NOT add Bootstrap import — it's already imported in main.jsx BEFORE this file.
- Do NOT remove the `html, body { background-color: #0f1720 }` line — that's the anti-flash fallback (it's in index.html, so you don't need to re-add it in CSS, but be aware of it).
- File must end with a final newline.
- Add section header comments (/_===== SECTION NAME =====_/) to make the file scannable.
- Aim for clean, production-quality CSS with no duplicated rules.
- Keep total under 900 lines.

===== OUTPUT FORMAT =====

Output EXACTLY one markdown code block:

### FILE: client/src/index.css

```css
<complete file>
```

No text before or after. Just the labeled block.
