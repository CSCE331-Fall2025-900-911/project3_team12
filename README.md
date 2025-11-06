# Kiosk App — quick deployment notes

This repository is a Vite + React kiosk frontend. Below are quick instructions to run and deploy the app (suitable for Vercel).

Quick dev

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

Build

```bash
npm run build
```

Deploy to Vercel (minimal)

1. Connect this Git repository to Vercel (Vercel app -> New Project -> Import Git Repository).
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. (Optional) If using client-side routing, Vercel will automatically handle routes; otherwise add redirects as needed.

Notes

- I pinned several dependencies and added a `tsconfig.json` to improve reproducible builds and TypeScript support.
- Consider adding CI (GitHub Actions) to run `npm ci` and `npm run build` on pull requests.
Run `npm i` to install the dependencies.
Run `npm run dev` to start the development server.
  