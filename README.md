# StayBuddies frontend

Vue 3 application for student profiles, lifestyle matching, messaging, and
administration. Use Node.js 24.12 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://127.0.0.1:5173>. The backend runs on port 8080; see its README
for the disposable local preview or persistent PostgreSQL setup. OCR runs on
port 8000 and is called by the backend.

`VITE_API_BASE` is the backend origin, without `/api/v1`. During development,
Vite proxies `/api`, `/uploads`, `/files`, and `/ws`. Application routes such
as `/login` and `/register` remain Vue pages and support direct navigation.
For production, configure SPA history fallback and reverse-proxy WebSocket
upgrades on the web server. Vite preview is a local build check.

Never put secrets in `VITE_*` values: they are included in public browser code.
Optional push messaging uses the `VITE_FIREBASE_*` public project settings and
VAPID public key consumed by `src/push.ts`.

```sh
npm test
npm run build
npm audit
npm run preview
```

Session tests cover token normalization, student/admin separation, expired
sessions in both browser stores, incorrect login, late 401 responses, and safe
internal redirects. Login/public requests omit stale credentials. Admin account
creation requires an existing administrator and preserves their session.

The homepage includes retryable listing failures, accessible pagination,
reduced-motion support, and a controllable slideshow. Page routes load lazily.
Desktop and 375px mobile browser checks were performed with synthetic listings;
backend/cloud integration and broader accessibility review remain separate work.
