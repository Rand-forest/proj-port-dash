# Repository instructions

These instructions apply to the whole repository.

## Product and scope

- Keep the application understandable and operable by a non-developer.
- Prefer the smallest maintainable solution. Do not add services or infrastructure without a documented need.
- Use React, TypeScript, Vite, npm, Supabase, Cloudflare Pages, and GitHub Actions. Do not introduce Next.js or Docker.
- Avoid paid dependencies and services. Confirm a free option exists before proposing an external service.

## Engineering practices

- Keep TypeScript strict and avoid `any`.
- Put application code in `src/`, tests beside the code they cover, and durable decisions in `docs/`.
- Access Supabase through `src/lib/supabase.ts`; never expose or commit service-role keys.
- Treat every `VITE_` variable as public browser data. Add new variables to `.env.example` with placeholder values.
- Add or update tests when behavior changes. Do not weaken type, lint, or test checks to make CI pass.
- Keep the visible interface accessible and straightforward.

## Before presenting changes

Run and report:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Update `README.md`, `docs/PRODUCT.md`, or `docs/ARCHITECTURE.md` when setup, product behavior, or architectural decisions change.
