# Repository operating rules

These rules apply to the whole repository. The owner is non-technical: explain plans, results, risks, and next actions in plain English, and define unavoidable technical terms.

## Before coding

State the following before making changes:

- requested outcome and acceptance criteria;
- risk level: **LOW**, **MEDIUM**, or **HIGH**;
- database impact; and
- authentication/security impact.

Treat authentication, permissions, database schema changes, destructive operations, payments, secrets, and other security-sensitive changes as **HIGH** risk. Explain the safeguards and obtain owner approval before proceeding with high-risk or materially expanded work.

## Branches, reviews, and environments

- Never work directly on `main`. Every change must use its own branch and a Pull Request targeting `main`; never merge on the owner's behalf unless explicitly asked.
- `main` represents **Production**. Cloudflare pull-request previews and all development or test activity may use only **DEV** Supabase resources.
- Never give development tools, local environments, CI checks, or preview deployments Production credentials.
- Treat all frontend code and every `VITE_` value as public. Never place secrets or Supabase service-role credentials in frontend code, commits, logs, or Pull Requests.

## Engineering and data safety

- Keep the solution small, accessible, and understandable. Use React, TypeScript, Vite, npm, Supabase, Cloudflare Pages, and GitHub Actions.
- Avoid unnecessary infrastructure and paid services. Do not introduce Docker, Kubernetes, Terraform, microservices, or another platform without a clear requirement and owner approval.
- Keep TypeScript strict, avoid `any`, put application code in `src/`, keep tests near the code they cover, and record durable decisions in `docs/`.
- Access Supabase through `src/lib/supabase.ts`. Database changes must be version-controlled migrations, tested against DEV before Production.
- Never automatically perform destructive Production database changes. Present the impact, backup/rollback plan, and required human-controlled Production step.
- Add or update tests and documentation when behavior, setup, product scope, or architecture changes. Never disable, bypass, or weaken checks merely to get a green result.

## Definition of done

A task is complete only when:

- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass;
- relevant user flows are verified (or a plain-English limitation is reported);
- the final diff is reviewed for unrelated changes; and
- the Pull Request summary explains the result, risks, verification, and any owner next actions in plain English.
