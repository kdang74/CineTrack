# AI_REFLECTION.md — CineTrack

## Overview

This document reflects on how I used AI assistance (Claude through Cursor IDE) while developing CineTrack for CSC 360. Most of the project was built through conversational prompting. I would explain what I wanted the application to do, describe the architecture or feature I was working on, and then review, test, and modify the code that the AI generated.

---

## 1. Three Ways AI Accelerated or Improved My Work

### Quickly Generating Project Structure

One of the biggest advantages of using AI was how quickly it generated the initial project structure. Instead of manually creating every EF Core model, DTO, service, API endpoint, React component, context provider, and test file, the AI was able to generate a working foundation across dozens of files in a short amount of time. This allowed me to spend more time understanding, testing, and improving the application instead of spending hours writing repetitive setup code.

### Keeping Different Parts of the Application Consistent

Another area where AI helped was maintaining consistency across the entire application. When I described entities such as User, Movie, WatchlistItem, Tag, and ActivityEvent, the AI updated those definitions across the backend and frontend. It generated matching EF Core models, API handlers, service classes, TypeScript interfaces, and React components. Doing this manually can easily lead to mismatches between layers, so having the AI keep everything synchronized saved a lot of time.

### Helping Solve Complex Framework Issues

The most useful technical assistance came when debugging issues involving xUnit, WebApplicationFactory, and cookie authentication. Protected endpoints were returning HTTP 302 redirects instead of the expected 401 responses, and the test client was automatically following those redirects.

The AI helped identify the problem and suggested a solution that involved multiple parts of the application. It:

1. Determined that automatic redirect behavior was hiding the real authentication error.
2. Added an `ApiAuthMiddleware` component that converted redirects on API routes into proper 401 or 403 responses.
3. Updated the test factory configuration to disable automatic redirects.
4. Removed unnecessary redirect handling code from `Program.cs`.

What impressed me most was that the solution required understanding how middleware, cookie authentication, HTTP clients, and xUnit testing infrastructure all interacted together.

---

## 2. Two Places Where AI Output Was Wrong, Insecure, or Incomplete

### Incorrect PowerShell Commands

One recurring issue was that the AI often generated bash-style command chains using `&&`, such as:

```bash
cd backend && dotnet run
```

These commands were not always compatible with my PowerShell environment. Several times I had to manually adjust commands before they would run correctly. This taught me that even when AI-generated code looks correct, it is important to verify environment-specific details rather than assuming they will work.

### Initial Database Seeder Design

The first version of the database seeder was technically functional but not practical. The AI created a solution that attempted to pull all 5,000 movie records from TMDB by iterating through hundreds of pages of API results.

While it would eventually work, it ignored real-world concerns such as API rate limits and execution time. After calculating the number of requests required, I realized it would take far too long and could easily fail in production.

I redesigned the approach by pulling data from several curated TMDB lists, running requests in parallel, removing duplicates, and generating additional records when necessary. This produced a much faster and more reliable seeding process.

---

## 3. One Architectural Decision I Made Myself Rather Than Delegating to AI

### Choosing Cookie-Based Authentication Instead of JWTs

One important design decision I made myself was using cookie-based authentication instead of JWT tokens stored in localStorage.

When authentication was first discussed, the AI suggested a JWT-based solution. After researching the tradeoffs, I decided cookies were a better fit for the project.

My reasoning was:

* JWTs stored in localStorage can be stolen through XSS attacks.
* HttpOnly cookies cannot be accessed through JavaScript.
* ASP.NET Core already provides strong support for cookie authentication.
* The additional configuration required for cookies, such as SameSite settings and CORS credentials, was manageable.

After making that decision, I directed the AI to implement Google OAuth using cookie-based sessions instead of JWTs.

---

## 4. One Debugging Session Where I Had to Understand the Code

### PostgreSQL DateTime Errors During Deployment

One of the biggest debugging challenges happened after deploying the application to Render.

The deployment logs showed the following error:

```text
Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone',
only UTC is supported.
```

The issue did not occur locally, so I had to investigate why it only appeared in production.

After tracing the problem, I discovered that:

1. TMDB returned release dates as strings.
2. `DateTime.TryParse()` created DateTime values with `Kind = Unspecified`.
3. SQLite accepted those values without complaint.
4. PostgreSQL required UTC timestamps and rejected the values.

This was an environment-specific bug that only appeared after deployment because development used SQLite while production used PostgreSQL.

Understanding the root cause helped me identify the correct fix. I updated the seeder to explicitly set the DateTime kind to UTC and added the appropriate PostgreSQL configuration in `Program.cs`. This experience showed me that AI can help with debugging, but I still need to understand what the code is doing in order to verify the solution.

---

## 5. How My Prompting Strategy Evolved

At the beginning of the project, my prompts were very broad. I would ask for things like:

> Build a watchlist app using React and .NET.

The AI usually generated something functional, but it often required significant revisions because the requirements were too general.

As the project progressed, I started writing more detailed prompts that described exactly what I wanted. For example:

> Add a SignalR hub that broadcasts a WatchlistActivityEvent whenever a watchlist item is created or updated. Update the endpoints to inject IHubContext and send the event after successful writes.

These prompts produced much more accurate results because the requirements were clear and specific.

Toward the end of the project, my prompts became more focused on debugging. Instead of immediately asking for a fix, I would first ask the AI to explain the error and identify the root cause before suggesting a solution.

The biggest lesson I learned was that the quality of the output depends heavily on the quality of the prompt. The more specific I was about both the goal and the expected result, the better the generated code became. AI worked best when I treated it like a development assistant rather than expecting it to solve everything automatically.
