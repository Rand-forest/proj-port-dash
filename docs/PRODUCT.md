# Product

## Purpose

Pulse is a stakeholder-facing project dashboard mockup. It gives project sponsors and delivery teams a shared, easy-to-scan view of progress, delivery health, budget, milestones, updates, and risks.

## Current behavior

The overview presents realistic sample data for the fictional Nova Platform project. It includes:

- Top-level progress, budget, task, and health indicators.
- A six-month planned-versus-actual progress chart.
- Upcoming milestones and delivery dates.
- Recent team updates and reactions.
- Risks and blockers that need stakeholder attention.
- Responsive navigation for desktop and mobile layouts.

The dashboard is currently a visual mockup. Its data is local and read-only; there are no accounts, database writes, analytics, or background jobs.

## Intended users

- **Project stakeholders** use the overview to understand delivery status without needing access to delivery tools.
- **Project leads** use the page as a concise structure for communicating progress and concerns.
- **The owner** reviews pull-request previews and approves releases without needing a local development environment.
- Cloudflare Preview deployments display a small `DEVELOPMENT ENVIRONMENT` banner at the top of the page; Production does not display the banner.
- **Contributors** make focused changes through pull requests and keep documentation and tests current.

## Product principles

1. **Simple to operate:** prefer automatic checks and deployments over manual procedures.
2. **Safe by default:** do not commit secrets; apply Row Level Security before exposing Supabase tables.
3. **Accessible:** use semantic HTML and support keyboard and assistive-technology users.
4. **Small and economical:** use the existing stack and free service tiers; add dependencies only for a clear product need.
5. **Reviewable:** each production change should have passing CI and a Cloudflare preview before merge.

## Near-term decisions before adding features

For each proposed feature, document its user, problem, success measure, data retained, and deletion needs. Authentication and database tables should be added only when a concrete workflow requires them. Any personal data requires an explicit privacy and access-control review.

## Out of scope for the foundation

- A custom backend server
- Native mobile applications
- Paid monitoring or deployment services
- Complex state-management or design-system dependencies
