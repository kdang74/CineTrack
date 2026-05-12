[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/N0Az2RiV)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23894019)
# Final Project

---

## The Brief

You have been hired as a full-stack engineer at a small startup called **CommunityOS**. The company is building a data-driven community platform that lets signed-in users discover, track, and collaborate around real-world data — books, art, places, weather, music, or another domain of your choosing. You are responsible for delivering a working version 1.0: publicly hosted, production-quality, secure, and data-rich enough to feel like a real product with an active user base.

This is not a toy project. You will design an architecture, build a full-stack system, connect real third-party APIs, seed a database that simulates thousands of users and hundreds of thousands of interactions, add real-time collaboration features, write a meaningful test suite, configure a CI/CD pipeline, and deploy to a public URL. GitHub Copilot will be your pair programmer throughout. You own the code, the design decisions, and the outcome.

You choose your domain. The quality of the product — its coherence, security, architecture, and user experience — is what will be evaluated.

---

## Learning Outcomes

By completing this project, you will be able to:

1. **Design and architect** a multi-layered production web application, including identifying the right boundaries between frontend, backend, database, external services, and real-time channels.
2. **Build a React frontend** with multiple routes, reusable components, a polished UI, loading/error/empty states, accessible markup, and a responsive layout.
3. **Build a .NET 10 ASP.NET Core backend** with RESTful endpoints, validation, centralized error handling, authentication middleware, authorization checks, and CORS configuration.
4. **Persist relational data** using Entity Framework Core, including migrations, related entities, meaningful constraints, and durable user-owned records.
5. **Implement OAuth 2.0 / OpenID Connect** end-to-end: login, logout, callback handling, secure backend token validation, and no committed secrets.
6. **Enforce authorization and user isolation** so that one user cannot read, modify, or delete another user's private data, verified both through the UI and directly against the API.
7. **Integrate a third-party API** in a way that meaningfully shapes the user experience — not just decorating a footer.
8. **Seed or import data at realistic scale**: thousands of domain records, hundreds of simulated user profiles, and hundreds of thousands of interaction records, with a documented reset process.
9. **Add a real-time or AI-assisted production feature** using SignalR/WebSockets, a custom MCP server, or another approved advanced integration.
10. **Test your application** with a layered suite: frontend unit/component tests, backend unit/API tests, integration tests, and at least one end-to-end test exercising a critical signed-in flow.
11. **Configure and run a CI/CD pipeline** that builds, tests, and deploys your application from GitHub Actions.
12. **Use GitHub Copilot as a force multiplier** while remaining the engineer responsible for correctness, security, and design — and documenting your AI-assisted workflow.
13. **Explain your system** under questioning: architecture, security choices, data model, deployment, testing strategy, and tradeoffs.

---

## Required Technology Stack

| Layer | Required technology | Notes |
|---|---|---|
| Frontend | React (Vite or Create React App) | Client-side routing with React Router or equivalent |
| Backend | ASP.NET Core on **.NET 10** | Minimal APIs |
| ORM | Entity Framework Core | Migrations required |
| Database | PostgreSQL (production) + SQLite (local dev) | Or another instructor-approved relational database |
| Authentication | **OAuth 2.0 / OpenID Connect** | GitHub, Google, Microsoft, Auth0, Azure AD B2C, or equivalent |
| Real-time | **SignalR** (recommended) or WebSockets | OR a custom MCP server integration (see Advanced Integration) |
| Hosting | Any public-access provider | Azure, Render, Fly.io, Railway, Vercel + hosted backend, etc. |
| CI/CD | **GitHub Actions** | Build, test, and at least one deployment job |
| AI workflow | GitHub Copilot | Prompt log required |

No alternative to .NET 10 for the backend. No alternative to React for the frontend.

---

## Project Domain — Your Choice

Choose one of the following domains as your app's primary subject area. Your application will feel more like a real product if you commit to a specific domain and design around it.

| Domain | Suggested third-party API | Example product direction |
|---|---|---|
| **Books & Reading** | Open Library (`openlibrary.org/developers/api`) | Collaborative reading platform: reading lists, book clubs, progress tracking, live activity feed |
| **Art & Culture** | Met Museum of Art API (`metmuseum.github.io`) | Curation platform: public exhibits, private collections, peer comments, trending works |
| **City & Civic Data** | Chicago Data Portal / Socrata (`data.cityofchicago.org`) | Neighborhood intelligence: places, inspections, community notes, live neighborhood alerts |
| **Weather & Outdoors** | Open-Meteo (`open-meteo.com`) | Activity planner: saved locations, shared plans, weather-safe recommendations, live conditions |
| **Travel & Geography** | REST Countries + your choice of a second API | Travel planning: shared itineraries, saved comparisons, community country notes |
| **Music & Events** | Last.fm or MusicBrainz | Music community: discovery lists, shared playlists, listening activity feed |
| **Astronomy & Space** | NASA APIs (`api.nasa.gov`) | Space exploration tracker: APOD journals, mission watchlists, community discussion |
| **Your own idea** | Any instructor-approved API | Must be approved at Milestone 0 |

You are encouraged to combine two APIs when doing so serves a compelling product purpose. If you use an API that requires a key, document setup without committing the key.

---

## Scenario Example (Illustrative — Not Required)

> *UrbanPulse* is a Chicago civic platform. Signed-out visitors can explore the public feed of neighborhood reports and city data. Signed-in residents save their neighborhoods, post community notes on food inspections, city permits, and 311 reports, and subscribe to live alerts for their saved areas. The home feed updates in real-time as other users post notes. Administrators can moderate flagged content. The seeded database includes 5,000 Chicago dataset records, 500 simulated community members, and 50,000 user interactions. A custom MCP server lets a Copilot-powered admin assistant query flagged content by neighborhood and date.

This is one possible direction. Build your own.

---

## Required Application Outcomes

Your application must demonstrate each of the following outcomes. You choose the implementation details, component names, route paths, entity names, and visual design.

### 1. Public experience

Signed-out visitors can:

- View a polished landing page that explains what the product is for.
- Browse or search real domain data without signing in.
- See aggregate metrics, trending records, or community highlights — content that makes the platform feel active and populated.
- Navigate without broken links or console errors.

The public experience must not expose private user data.

### 2. OAuth / OpenID Connect authentication

Your application must use a real OAuth 2.0 / OIDC provider.

Required:

- Sign in via the OAuth provider's flow.
- Logout that clears the session server-side and client-side.
- OIDC callback handled by the backend.
- Secure server-side token validation before any protected resource is served.
- User identity stored in your database on first login (linked to the OAuth subject identifier).
- No committed secrets. All credentials via environment variables.
- Documented setup process for configuring the OAuth client locally and in production.

### 3. Multiple users and user isolation

Your application supports multiple real users simultaneously.

It must demonstrate:

- Two or more distinct OAuth accounts can sign in and out.
- Each user has their own private data.
- Signed-in users can create, read, update, and delete their own records.
- A user cannot view, edit, or delete another user's private data.
- The backend enforces this rule regardless of what the React frontend does — direct API calls with another user's token must be rejected.

### 4. Protected routes and protected endpoints

Required minimums:

- **At least five protected React routes** that redirect unauthenticated visitors to the sign-in flow.
- **At least six protected ASP.NET Core API endpoints** that return `401 Unauthorized` when unauthenticated.
- **At least one endpoint that returns `403 Forbidden`** when a signed-in user attempts to access another user's resource.
- **At least two public endpoints** returning data accessible without authentication.

Example protected routes: `/dashboard`, `/profile`, `/my-collection`, `/my-collection/:id`, `/activity-feed`.

Example protected endpoints: `GET /api/me`, `GET /api/me/items`, `POST /api/collections`, `PUT /api/collections/{id}`, `DELETE /api/collections/{id}`, `POST /api/comments`.

### 5. Durable data persistence

Your EF Core model must include:

- A `User` (or equivalent) entity linked to the OAuth subject identifier.
- **At least four domain entities** beyond the authentication profile.
- **At least three meaningful relationships** (one-to-many, many-to-many, or self-referential).
- **At least one many-to-many relationship** (e.g., users ↔ collections, items ↔ tags).
- At least one status, category, rating, progress, tag, timestamp, or flag field on a domain entity.
- EF Core migrations — no `EnsureCreated()` in production.
- Documented migration and reset commands.

Your database must represent a real product domain, not just a user table and one record type.

### 6. Third-party API integration

Your application must integrate at least one third-party API in a way that meaningfully shapes the user experience.

Acceptable integration approaches:

- Fetch from the external API when a user searches or views a detail page.
- Import a curated subset of the external dataset into your database as seeded reference data.
- Store external record identifiers in your database and enrich with live API calls.
- Cache API results in your database and refresh on a schedule or on demand.

Your UI must clearly show:

- Which data came from the external source.
- Which data belongs to the signed-in user.
- Where images come from (API-provided, public domain, or your own assets).

If the integration requires an API key, document it and do not commit it.

### 7. Data at scale — simulated community

Your deployed application must feel populated and alive.

Your seed or import process must produce at minimum:

- **5,000 domain records** (books, artworks, places, tracks, etc.) — imported from the chosen public dataset, AI-generated and reviewed, or a combination.
- **500 simulated user profiles** with realistic names, join dates, preferences, and metadata.
- **10,000 user-owned interaction records** distributed across the simulated users: saves, ratings, comments, notes, follows, likes, activity events, or comparable records appropriate to your domain.

These simulated users do not need real OAuth accounts. They exist to give the application a credible sense of scale. Real authenticated users must still work alongside them.

Your README must explain:

- How seed data is produced.
- What is real external data vs. simulated.
- How to reseed or reset the database.
- Approximately how long the full seed takes.

### 8. Real-time or advanced integration

Your application must include at least one production-grade feature beyond standard CRUD.

**Option A — SignalR / WebSockets (recommended for most projects)**

Implement live updates for at least one meaningful feature:

- Live activity feed showing recent user actions across the platform.
- Real-time notifications when a followed user adds a record, comments, or takes an action.
- Collaborative dashboard that shows live aggregate metrics without page refresh.
- Live chat, annotation, or commenting on a shared resource.

The live behavior must work across two open browser sessions simultaneously. The deployed application must demonstrate this.

**Option B — MCP (Model Context Protocol) integration**

Expose a documented MCP server that gives an AI assistant controlled, read-only access to part of your application's data.

Requirements:

- At least two MCP tools (e.g., `search_records`, `get_user_activity_summary`, `list_flagged_content`).
- At least one MCP resource (e.g., the database schema, a public data summary).
- Documentation describing: what context the MCP server exposes, what actions it allows, and what safety boundaries prevent unauthorized or destructive access.
- A demonstration workflow showing an AI assistant (Copilot, Claude, etc.) using the MCP server to answer a question or perform an administrative task.

**Option C — Instructor-approved alternative**

Must be approved in writing. Strong alternatives include: background job queue processing, full-text search with ranking (e.g., pg_vector or Elasticsearch), recommendation engine, role-based admin workflow with audit log, or geographic visualization with map integration.

### 9. React frontend quality

Your React application must include:

- At least **eight meaningful, distinct routes** (not counting 404 or redirects).
- At least **twelve reusable components** with clear, single-responsibility designs.
- At least **one reusable form component** used in more than one place.
- At least **one data-rich view**: a dashboard, table with sorting/filtering, chart, calendar, map, or comparable visualization with real data.
- Correct **loading states** while async data is in flight.
- Correct **empty states** with helpful messaging, not blank screens.
- Correct **error states** that surface a meaningful message without leaking stack traces.
- **Client-side form validation** with inline field-level error messages before submission.
- **Accessible markup**: semantic HTML, ARIA labels where needed, keyboard navigation, meaningful alt text on all images.
- **Responsive layout**: usable on both mobile viewports and desktop screens.
- A visual design that looks like a finished product. Consistent color palette, typography, and spacing. You may use a component library (Tailwind, Material UI, shadcn/ui, Chakra, etc.) or write your own styles. Unstyled default HTML will receive partial credit.

### 10. ASP.NET Core backend quality

Your .NET 10 backend must include:

- Clear project structure with logical separation of concerns (separate route, service/repository layer, data models, DTOs, or your documented equivalent).
- RESTful endpoint naming with appropriate HTTP verbs and meaningful route paths.
- **Request validation** using data annotations, FluentValidation, or equivalent — not manual if-checks.
- **Consistent error responses** — a unified error response shape, not random exception messages.
- **Centralized error handling** middleware or exception filter.
- EF Core `DbContext` and migrations.
- Authentication middleware (`AddAuthentication`, `UseAuthentication`, `UseAuthorization`).
- **Authorization attributes or policy checks** on every protected endpoint.
- CORS policy that allows your React origin in both development and production.
- **Configuration through environment variables and `appsettings.json`**, no committed secrets.
- Swagger / OpenAPI documentation generated automatically.

### 11. Testing

Your project must include a meaningful test suite.

**Frontend tests (using Jest + React Testing Library or Vitest + Testing Library):**

- At least **10 component/unit tests** that test behavior, not implementation details.
- At least **2 tests** for a protected route or auth guard.
- At least **2 tests** for a form component with validation.

**Backend tests (using xUnit or NUnit):**

- At least **10 unit or API integration tests**.
- At least **3 tests** that verify correct `401` or `403` behavior on protected endpoints.
- At least **2 tests** that verify user isolation (one user's data is not accessible to another).

**End-to-end tests (using Playwright):**

- At least **3 E2E scenarios** covering a critical signed-in user workflow (login → create data → verify persistence → logout).

**AI-generated test review:**

- Ask GitHub Copilot to generate tests for at least one part of your project.
- Review at least **5 generated tests**.
- For each, classify: *useful as-is*, *useful with edits*, *brittle*, *tautological*, or *missing coverage*.
- Improve at least **2 AI-generated tests** and document what you changed and why.

### 12. CI/CD and public deployment

Your application must be publicly accessible.

**CI/CD requirements (GitHub Actions):**

- Frontend job: install, lint (if configured), test, build.
- Backend job: restore, build, test.
- At least one deployment job or documented deployment gate triggered on push to `main`.
- No secrets in workflow files — use GitHub Actions secrets.

**Deployment requirements:**

- Public frontend URL (HTTPS).
- Public backend URL or unified deployment behind a CDN/reverse proxy.
- Production database with durable persistence.
- Production OAuth redirect URI correctly configured.
- Environment variables and secrets managed outside the repository.
- HTTPS everywhere.

Acceptable hosting: Azure App Service, Azure Static Web Apps + Azure Container Apps, Render, Railway, Fly.io, Vercel + hosted backend, Netlify + hosted backend, or instructor-approved equivalent.

---

## Milestones and Deliverables

Your project is due at the final class session. Five interim milestones give you checkpoints and ensure the most critical components are in place before the end of the course.  **due dates are guidelines**

### Milestone 0 — Product Brief *(due start of Week 8)*

**Deliverable: A one-page `PRODUCT_BRIEF.md` in your repository.**

Answer:

- What is the name and core purpose of your app?
- Who is it for? What problem does it solve?
- Which domain did you choose?
- Which third-party API will you use? Which advanced integration (A, B, or C)?
- Sketch the main entities and their relationships (written or diagram).
- List your five most important user stories (format: *As a [role], I want to [action] so that [value]*).
- Which OAuth provider will you use?
- Where do you plan to host the frontend and backend?

**Graded:** Pass/Fail. Required to proceed.

---

### Milestone 1 — Authenticated Backend Skeleton *(due start of Week 8)*

**Deliverable: Working backend committed to your repository.**

Must demonstrate when run locally:

- .NET 10 ASP.NET Core project compiles and runs.
- EF Core `DbContext` with at least two entities and the initial migration applied.
- OAuth/OIDC login endpoint and callback working with your chosen provider.
- At least one protected endpoint returning `401` for unauthenticated requests.
- At least one public endpoint returning data.
- Swagger available at `/swagger`.

**Points:** 10

---

### Milestone 2 — Connected Frontend *(due start of Week 9)*

**Deliverable: React frontend committed and connected to the backend.**

Must demonstrate when run locally:

- React app runs and communicates with the backend over HTTP.
- Sign-in flow works end-to-end: click login → OAuth redirect → callback → signed-in state in React.
- At least three protected React routes that redirect unauthenticated users.
- At least one protected backend endpoint called from React with the authenticated user's token.
- At least one piece of user-owned data created from the React UI and persisted in the database.
- Data survives a browser refresh and a backend restart.

**Points:** 15

---

### Milestone 3 — Core Product Flows *(due end of Week 9)*

**Deliverable: Core signed-in user workflows complete and committed.**

Must demonstrate when run locally:

- At least four protected React routes.
- At least five protected backend endpoints.
- Full create/read/update/delete flow for at least one domain entity through the React UI.
- Third-party API data visible in the product experience.
- User isolation demonstrated: two different accounts' private data is separate.
- Seeding script producing at minimum 500 domain records, 50 user profiles, and 1,000 interaction records.
- README updated with local setup instructions.

**Points:** 20

---

### Milestone 4 — Advanced Integration and Scale *(due one week before final class)*

**Deliverable: Advanced feature and full-scale seed committed and deployed.**

Must demonstrate:

- Advanced integration (SignalR, MCP, or approved alternative) working.
- Seed producing the full required scale (5,000 domain records, 500 user profiles, 10,000 interactions).
- Deployed public URL accessible.
- CI/CD pipeline running on push with build and test jobs passing.
- At least 15 passing tests (combined frontend + backend).
- Accessibility audit run with initial findings documented.

**Points:** 20

---

### Milestone 5 — Final Submission *(due before final class)*

**Deliverable: Complete project available on the main branch of your GitHub repository with a deployed URL.**

Repository must contain everything in the Submission Requirements section below. All rubric criteria must be demonstrable through the deployed URL or in the recorded demo.

**Points:** 35 (evaluated against the full rubric)

---

## Grading Rubric

### Rubric (100 points)

Your final project is graded on a 100-point scale. Milestones are required checkpoints; see the deduction table below for late-milestone penalties.

| Criteria | Points | What distinguishes a top score |
|---|---:|---|
| **Product concept, user-centered design, and design note** | 8 | Clear audience, coherent domain, polished product brief, intuitive UX, well-written design note |
| **React frontend: routing, components, UI, accessibility, responsiveness** | 12 | 8+ routes, 12+ components, accessible markup, responsive layout, polished visual design |
| **ASP.NET Core backend: structure, REST quality, validation, error handling** | 10 | Clean project structure, consistent error shape, validation on all inputs, Swagger documented |
| **OAuth/OIDC: login, logout, callback, token validation, no secrets** | 12 | Full OIDC flow, server-side token validation, correct logout, documented provider setup |
| **Authorization and user isolation across multiple users** | 12 | 403 returned when crossing user boundaries, direct API tests confirm isolation |
| **EF Core persistence: schema, relationships, migrations, durable records** | 10 | 4+ entities, 3+ relationships, EF migrations, no EnsureCreated in production |
| **Third-party API integration** | 8 | API data meaningfully shapes the product, clearly distinguished from user data |
| **Data at scale: seed/import process** | 6 | 5,000+ domain records, 500+ profiles, 10,000+ interactions, documented reset process |
| **Advanced integration: SignalR/MCP/approved alternative** | 8 | Works in deployed app, demonstrated live across two sessions (SignalR) or documented workflow (MCP) |
| **Testing quality and AI-generated test review** | 6 | 10+ frontend, 10+ backend, 3+ E2E, review of 5+ AI tests with documented improvements |
| **CI/CD and public deployment** | 4 | Pipeline passes on main, deployed public HTTPS URL, no secrets in repo |
| **Documentation package** | 4 | README, architecture docs, prompt log, AI reflection, security review, accessibility report complete |
| **Total** | **100** | |

### Milestone Checkpoint Penalties

Milestones are required checkpoints. Missing or late submissions incur a deduction from your final score. Deductions are cumulative, up to a maximum of −20 points.

| Milestone | Deadline | Late penalty |
|---|---|---|
| M0 — Product Brief | Start of Week 8 | Required to proceed; not submitting blocks further milestone review |
| M1 — Authenticated Backend | Start of Week 8 | −5 points if late or not demonstrable |
| M2 — Connected Frontend | Start of Week 9 | −5 points if late or not demonstrable |
| M3 — Core Product Flows | End of Week 9 | −5 points if late or not demonstrable |
| M4 — Advanced Integration & Scale | One week before final class | −5 points if late or not demonstrable |
| **Maximum milestone deduction** | | **−20 points** |

---

## AI-Assisted Development Expectations

GitHub Copilot is a required tool in this course. You are expected to use it throughout this project. Your grade reflects how well you used AI as a development accelerator while remaining the engineer responsible for the result.

### What good AI-assisted workflow looks like

- **Write your intent first**, then ask Copilot to implement it. Compare what it produces against what you intended.
- **Ask for alternatives.** Before accepting an architecture, ask Copilot to explain two other approaches and evaluate them yourself.
- **Generate small pieces.** Don't ask Copilot to build the whole project in one prompt. Generate a code, review it, adjust it, test it, then move on.
- **Write tests for AI-generated code.** If Copilot writes a function, you write the test. If the test fails, you understand why.
- **Review every auth-related suggestion.** OAuth callback code, JWT validation, CORS policies, and authorization checks require your careful review. Do not accept generated auth code without reading and understanding it.
- **Iterate on prompts.** Your first prompt will rarely produce the best output. Refine it. Document the iteration in your prompt log.
- **Keep your prompt log while you work**, not afterward. Reconstructed logs are obvious and don't capture the interesting moments.

### What poor AI-assisted workflow looks like

- Asking Copilot to build the entire project in one prompt.
- Submitting code you cannot explain in a live conversation.
- Treating "the AI said it was secure" as a security review.
- Accepting OAuth or EF Core code without understanding the flow.
- Copying another student's prompt log or reflection.

### Prompt log format

Maintain a `docs/PROMPT_LOG.md` file. For each significant AI-assisted session, record:

| Field | Description |
|---|---|
| Tool | GitHub Copilot, Claude, ChatGPT, etc. |
| Goal | What you were trying to accomplish |
| Prompt | The prompt or instructions you provided |
| Result | What the AI produced |
| Accepted | What you kept without changes |
| Changed | What you modified and why |
| Rejected | What you discarded and why |
| Tested | How you verified the result |

You do not need an entry for autocompleted boilerplate. Log sessions where you made a deliberate design or implementation decision with AI assistance.

---

## Documentation Requirements

Your repository must include the following documentation files.

### README.md

- Project name and one-sentence description.
- Deployed application URL.
- Demo account instructions (how to log in for evaluation if using a gated OAuth provider).
- Local setup instructions: prerequisites, environment variable setup, backend run command, frontend run command, migration/seed commands.
- Required environment variables with descriptions (not values).
- CI status badge.
- Known limitations or incomplete features.

### docs/DESIGN_NOTE.md

Answer in 400–600 words:

- Who is this app for? What problem does it solve?
- Which domain and third-party API did you choose, and why?
- What user-owned data does your app store?
- What are your main entities and their relationships?
- Which routes and endpoints are protected, and how?
- How does your backend prevent cross-user data access?
- Which advanced integration did you implement and why?

### docs/ARCHITECTURE.md

Include:

- Architecture diagram (Mermaid, draw.io, Excalidraw, or similar) showing frontend, backend, database, OAuth provider, third-party API, real-time layer, and deployment.
- Frontend route map (path → component → protected or public).
- Backend endpoint table (method + path → protected or public → description).
- Data model diagram or entity summary with relationships.
- Deployment architecture (how the frontend and backend are hosted and connected).
- Key technology choices and rationale 

### docs/PROMPT_LOG.md

Maintain throughout development (see format above). Minimum 15 meaningful entries.

### docs/AI_REFLECTION.md

Address all of the following:

- Three ways Copilot accelerated or improved your work.
- Two places where AI output was wrong, insecure, incomplete, or misleading — and how you caught and fixed it.
- One architectural decision you made yourself rather than delegating to AI, and why.
- One debugging session where you had to understand the code rather than just re-prompting.
- How your prompting strategy evolved across the project. What did you learn to do differently?

### docs/SECURITY_REVIEW.md

Complete a structured review covering:

- OAuth/OIDC flow: is the callback handled securely? Is the state parameter validated?
- Token/session storage: where are tokens stored in the browser, and what are the tradeoffs?
- Protected routes: are frontend guards sufficient alone, or does the backend enforce independently?
- Authorization: how is user isolation enforced? What would happen if a user replaced an ID in a URL?
- Input validation: what inputs are validated, and at which layer?
- Error handling: do error messages expose implementation details?
- CORS: what origins are allowed, and why?
- HTTPS: is it enforced in production?
- Secrets management: where are secrets stored, and how are they injected?
- Dependency vulnerabilities: have you run `npm audit` and `dotnet list package --vulnerable`?
- Known limitations: what security properties does your app NOT provide?

Do not claim your app is secure because it uses OAuth. Explain how your app protects data *after* the user authenticates.

### docs/ACCESSIBILITY_REPORT.md

- Run an audit using Lighthouse, axe DevTools, or another tool.
- Document initial findings with severity.
- Implement at least **five accessibility fixes**.
- Document each fix: what you changed, why it matters, and how you verified it.
- Final audit score or final findings.

---

## Demo Expectations

Your final presentation is a recorded demo of your deployed application. Prepare a clear video walkthrough that demonstrates all of the following in sequence:

1. Open the public landing page without being signed in. Walk through the public experience.
2. Show aggregate or community data that demonstrates the app feels populated.
3. Trigger the OAuth login flow. Complete it. Show the signed-in state.
4. Navigate to at least two protected React routes.
5. Attempt to access a protected backend endpoint without authentication (e.g., via `curl` or browser dev tools). Show the `401`.
6. Show third-party API data in the product experience. Explain which data is external vs. user-owned.
7. Create or update user-owned data through the React UI.
8. Refresh the browser. Show the data persists.
9. Restart (or redeploy) the backend. Show the data still persists.
10. Sign out. Show that protected pages redirect and the API returns `401`.
11. Sign in with a second account. Show that the second user's private data is isolated from the first user's.
12. Demonstrate the advanced integration: live real-time update across two browser sessions (SignalR), or a documented AI assistant interaction via MCP.

**Presentation length:** approximately 5 minutes per student.

---

## Submission Requirements

Before the final class session, your complete project must reside on the `main` branch of your GitHub repository.

- GitHub repository URL (public or accessible to the instructor).
- Deployed application URL.
- OAuth provider name and third-party API name.
- Advanced integration choice (A, B, or C).
- Demo account login instructions for an account with admin permissions if your OAuth provider requires approval.

Your repository must include:

- React frontend source code.
- .NET 10 ASP.NET Core backend source code.
- EF Core model, `DbContext`, and migrations.
- Seed/import scripts and documented process.
- Test files (frontend, backend, E2E).
- GitHub Actions workflow file(s).
- `README.md`, `PRODUCT_BRIEF.md`.
- `docs/DESIGN_NOTE.md`, `docs/ARCHITECTURE.md`, `docs/PROMPT_LOG.md`, `docs/AI_REFLECTION.md`, `docs/SECURITY_REVIEW.md`, `docs/ACCESSIBILITY_REPORT.md`.

**Do not commit:** secrets, API keys, OAuth client secrets, passwords, production configuration files with private values, local SQLite files (`.db`), build output folders (`/bin`, `/obj`, `/dist`, `/build`, `node_modules`), or any file containing credentials of any kind.

---

## Frequently Asked Questions

**Can I use a component library?**
Yes. Tailwind CSS, Material UI, shadcn/ui, Chakra UI, and similar libraries are all fine. Document your choice.

**Can I use SQLite for production?**
SQLite is fine for local development. For the deployed/hosted application, you must use a durable production database (PostgreSQL, SQL Server, or an equivalent). SQLite loses data on many hosting platforms and is not appropriate for demonstrating realistic multi-user behavior at scale.

**How do I handle OAuth credentials in CI/CD?**
Use GitHub Actions secrets. Do not hardcode values. Document the required environment variables in your README.

**What if my chosen API has rate limits?**
Implement caching (in-memory, Redis, or database-backed) and import the most critical records as seed data. Your app must remain functional under normal demo conditions without hitting rate limits.

**Can I use a different real-time technology instead of SignalR?**
Raw WebSockets or Server-Sent Events are acceptable alternatives to SignalR. They require more setup but are architecturally equivalent. Get instructor confirmation before proceeding.

**Can two students share a domain idea?**
Each student must build their own implementation. Shared ideas are fine; shared code is not. Your implementation, data model, component structure, and design decisions must be your own.

**What counts as "simulated users"?**
Seeded database rows representing user profiles — names, join dates, preferences, activity records — linked to interaction data. They do not need real OAuth accounts. Simulated users demonstrate that your data model and authorization logic work at realistic scale.

---

## Course Topics Represented

This project integrates every major topic from CSC 436:

| Week | Topics |
|---|---|
| Week 1 | AI-assisted workflow, prompt engineering, MCP concepts, HTML/CSS/JS foundations, accessibility basics |
| Week 2 | React component architecture, React Router, state management, data visualization, SPA patterns |
| Week 3 | REST API design, ASP.NET Core, middleware pipeline, CORS, Swagger/OpenAPI, React-to-API integration |
| Week 4–5 | EF Core, related data, EF migrations, authenticated full-stack app design |
| Week 5–6 | OAuth 2.0, OpenID Connect, JWT, XSS, CSRF, SQL injection, authorization, OWASP Top 10 |
| Week 7 | CI/CD, GitHub Actions, Azure deployment, IaC, environment management |
| Week 8 | Unit testing, component testing (Jest/Vitest + RTL), API testing (xUnit), E2E (Playwright), TDD, AI-generated test critique |
| Week 9 | SignalR/WebSockets, MCP, SLMs vs. LLMs, accessibility auditing, AI ethics, production architecture |
| Week 10 | Final presentations, peer evaluation, production readiness review |

---

## A Final Word

Your goal is not to build the biggest codebase in the class. Your goal is to ship a coherent, secure, data-rich, publicly deployed product that you understand completely and can explain with confidence.

The developers who stand out are not the ones who generated the most code with AI — they're the ones who made thoughtful decisions, caught the places where AI went wrong, wrote tests that caught bugs before users did, and deployed something they're proud of.

That's what this project is for. Build something real.

---

