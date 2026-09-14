# Contributing to TravelEase

Thank you for your interest in contributing to **TravelEase**! We welcome code contributions, documentation improvements, bug reports, and feature proposals.

---

## Code of Conduct

Please treat all contributors with respect, empathy, and professionalism. We are committed to providing a welcoming, harassment-free environment for everyone.

---

## Development Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB**: v6.0+ (optional: in-memory / static fallback data active by default)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/travel-website.git
cd travel-website

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Setup
```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp server/.env.example server/.env
```

### 3. Run Locally
In terminal 1 (Frontend):
```bash
npm run dev
```

In terminal 2 (Backend):
```bash
cd server
npm run dev
```

---

## Pull Request Guidelines

1. **Branch Naming**:
   - Features: `feat/feature-name`
   - Bug fixes: `fix/bug-description`
   - Docs/Refactoring: `docs/doc-topic` or `refactor/scope`

2. **Pre-Flight Checks**:
   Before submitting your PR, ensure all local checks pass:
   ```bash
   npm run lint              # ESLint check must pass with 0 errors
   npm test                  # All 18 core security & flow tests must pass
   npm run build             # Production Vite build must succeed
   node -c server/src/index.js # Server syntax validation
   ```

3. **Commit Messages**:
   Follow conventional commit conventions:
   - `feat: add real-time tatkal countdown badge`
   - `fix: resolve leaflet tile z-index on mobile modal`
   - `docs: update IRCTC proxy setup in architecture doc`
