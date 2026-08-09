# Repository instructions

These instructions apply to the whole repository.

## Working with the owner

- The application owner is non-technical. Explain plans, decisions, results, risks, and next actions in plain English.
- Before coding, state the requested outcome, acceptance criteria, risk level (`LOW`, `MEDIUM`, or `HIGH`), database impact, and authentication/security impact.
- Treat authentication, permissions, database schema changes, destructive operations, payments, secrets, and other security-sensitive changes as `HIGH` risk.

## Branches and environments

- Never work directly on `main`. Every change must use its own branch and GitHub Pull Request.
- `main` represents Production. Do not merge into it without review and passing automated checks.
- Preview and development environments may use DEV resources only. Never give development tooling Production credentials.
- Keep Supabase DEV and PROD separate. Never expose or commit secrets or service-role credentials in frontend code.
- Treat every `VITE_` variable as public browser data. Add new variables to `.env.example` with placeholder values.

## Product and architecture

- Keep the application accessible, straightforward, and operable by a non-developer.
- Prefer the smallest maintainable solution and avoid unnecessary infrastructure or paid services.
- Use React, TypeScript, Vite, npm, Supabase, Cloudflare Pages, and GitHub Actions.
- Do not introduce Docker, Kubernetes, Terraform, microservices, additional databases, additional cloud platforms, or paid services without a clear requirement and explicit owner approval.

## Engineering and data safety

- Keep TypeScript strict and avoid `any`. Put application code in `src/`, tests beside the code they cover, and durable decisions in `docs/`.
- Access Supabase through `src/lib/supabase.ts`; never expose or commit secret or service-role credentials.
- Make database changes with version-controlled migrations and test them in DEV before Production.
- Never perform destructive Production database changes automatically.
- Add or update tests when behavior changes. Never disable, skip, remove, or weaken checks merely to obtain a passing result.
- Update `README.md`, `docs/PRODUCT.md`, or `docs/ARCHITECTURE.md` when setup, product behavior, or architectural decisions change.

## Definition of done

A task is complete only when:

- Type checking, lint, tests, and the production build pass.
- Relevant user flows are verified.
- The final diff is checked for unrelated changes.

Before presenting changes, run and report:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
