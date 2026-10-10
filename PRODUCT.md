# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Node.js + Express for the server; static HTML/CSS/JS for the front-end; Supabase for categories, nominees, votes, rankings, and public settings; deployed via Render and run locally with `npm start`.

## Users

- Primary users: visitors attending the ESS-UCAC Academic Awards gala and members of the ESS-UCAC community voting in one of the event categories.
- Secondary users: organizers and the bureau of the Amicale ESS-UCAC, who validate mobile-money references and confirm votes before counts are considered final.
- Situation: a public, time-boxed voting campaign during the 2025-2026 academic awards edition.

## Product Purpose

This product lets people browse the award categories, discover nominees, cast a vote for a candidate using a mobile-money reference, and view the ranking of valid votes. The experience is designed for a short-lived live event rather than a perpetual SaaS product.

## Positioning

The product occupies a narrow, high-clarity role: a one-event awards voting site that keeps the public vote flow simple while making payment verification and validation explicit and manual. It is not an e-commerce product, a social platform, or a generalized admin system.

## Operating Context

- The event date is 10 July 2026, and the public interface presents the gala under the title “ESS-UCAC Academic Awards — Édition 2025-2026”.
- The site exposes 7 categories and a public ranking page.
- The vote amount is 100 FCFA and the user selects Orange Money or MTN MoMo before submitting a transaction reference.
- The backend records votes with a status of `en_attente` and requires manual confirmation in Supabase before ranking counts are considered valid.
- The public UI includes a home page, category pages, ranking page, sponsor strip, and a vote modal workflow.

## Capabilities and Constraints

- Users can view the list of categories on the home page and open a category page for nominees.
- Users can select a nominee, choose the mobile-money operator, enter a phone number, and submit a transaction reference.
- Votes are stored through `/api/votes` and only become valid after the bureau confirms the payment in the database.
- Public settings such as mobile-money numbers and the vote closing time are loaded from Supabase via `/api/settings`.
- Category and nominee data are loaded from Supabase and the app handles empty state messaging when a category has no valid nominees yet.
- There is no user account system, no authentication flow, and no automatic payment gateway integration in the current codebase.
- The front-end is static and server-rendered via Express, with the data layer kept outside the browser.

## Brand Commitments

- Product name and entity: ESS-UCAC Academic Awards.
- Visual identity in the current UI is dark navy + deep gold academic gala styling, with sponsor and institutional branding visible in the header and footer.
- Institutional assets referenced by the app include UCAC ESS and the Bureau de l’Amicale, plus sponsor logos for Carimo, Apple Store 237, Boissons du Cameroun, and Les Délices de Marie Jo.
- The design language is event-driven and ceremonial rather than product-agnostic or enterprise-neutral.

## Evidence on Hand

- Project brief and setup instructions: [README.md](README.md)
- Entry server: [server.js](server.js)
- API routes and persistence logic: [routes/api.js](routes/api.js)
- Front-end logic for category browsing, nominee voting, and rankings: [public/js/app.js](public/js/app.js)
- Home page structure and event presentation: [public/index.html](public/index.html)
- Visual system and color language: [public/css/style.css](public/css/style.css)
- Runtime and package metadata: [package.json](package.json)

## Product Principles

1. Keep the voting flow short, clear, and understandable for event attendees.
2. Separate the public voting experience from the internal validation process.
3. Respect the operational constraints of mobile-money confirmation and real-world event logistics.
4. Favor a simple, deployable web experience over complex product architecture.
5. Preserve the ceremonial and institutional tone of the academic awards event.

## Accessibility & Inclusion

The current project does not yet document a formal accessibility policy beyond the need for a public-facing, event-ready web flow. No advanced accessibility requirements are specified in the repo, so the product record intentionally reflects the current state rather than inventing future obligations.
