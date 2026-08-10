# Product

## Purpose

MyApp is a deliberately small foundation from which a useful web product can be built safely. Its owner may not be a developer, so routine review and deployment should happen through visual previews and clear automated checks.

## Current behavior

The sole initial user-facing requirement is a page that displays:

> MyApp is running.

There are no accounts, data-entry flows, analytics, or background jobs in this first version.

## Intended users

- **Visitors** will eventually use the product through a browser.
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
