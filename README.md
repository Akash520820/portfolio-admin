# Portfolio Admin (content management)

Login-gated dashboard for editing portfolio content. Only accounts with
`role: admin` on the backend get past login. Talks to the shared backend API.

## Local dev
    npm install
    cp .env.example .env     # set VITE_API_URL / VITE_PUBLIC_SITE_URL
    npm run dev

## Deploy (GitHub Pages)
1. Rename repo to `mern-portfolio-admin` (or update `VITE_BASE_PATH` in `.github/workflows/deploy.yml`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions:
   - Secret `VITE_API_URL` = your Render backend URL ending in `/api`
   - Variable `VITE_PUBLIC_SITE_URL` = `https://<username>.github.io/mern-portfolio/`
4. Push to `main`.
