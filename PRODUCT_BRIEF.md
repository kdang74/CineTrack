# PRODUCT_BRIEF.md — CineTrack

## App Name and Core Purpose

**CineTrack** is a community-driven Movie & TV watchlist platform. Users can discover titles, save them to a personal watchlist, log what they've watched, assign ratings, and observe what the broader community is watching in real time.

## Who is it for? What problem does it solve?

CineTrack is for anyone who has lost track of what they want to watch next or forgotten whether they already watched something. Streaming services are fragmented across multiple platforms, and there is no single neutral place to track content across all of them. CineTrack solves this by being the source of truth for a user's personal watch history and future queue, independent of any streaming service.

## Domain

**Movies & TV Shows** — users discover, track, rate, and review films and television series.

## Third-party API

**TMDB (The Movie Database)** — `https://developer.themoviedb.org/`

TMDB provides free, comprehensive metadata for movies and TV shows including titles, posters, overviews, release dates, genres, and ratings. It is the industry standard for community movie apps.

## Advanced Integration

**Option A — SignalR** (recommended): A live activity feed that broadcasts events (user added a title, marked something watched, left a rating) to all connected browser sessions in real time without page refresh.

## Main Entities and Relationships

```
User ──< WatchlistItem >── Movie
Movie >──< Tag  (many-to-many via MovieTag)
User ──< ActivityEvent >── Movie
```

- **User**: Id, OAuthSubject (Google sub), DisplayName, AvatarUrl, JoinedAt
- **Movie**: Id, TmdbId, Title, Overview, PosterPath, ReleaseDate, MediaType, GenreIds
- **WatchlistItem**: Id, UserId (FK), MovieId (FK), Status, UserRating, Notes, AddedAt, WatchedAt
- **Tag**: Id, Name (genre labels e.g. "Action", "Drama")
- **MovieTag**: MovieId, TagId (join table)
- **ActivityEvent**: Id, UserId (FK), MovieId (FK), Action, OccurredAt

## Five Most Important User Stories

1. *As a visitor, I want to search for any movie or TV show so that I can discover titles without needing an account.*
2. *As a signed-in user, I want to add a title to my watchlist so that I remember to watch it later.*
3. *As a signed-in user, I want to mark a title as Watched and give it a star rating so that I can track what I've seen and how much I liked it.*
4. *As a signed-in user, I want to see a live activity feed of what the community is watching so that the platform feels alive and I get recommendations through social proof.*
5. *As a signed-in user, I want my watchlist to persist across devices and browser sessions so that my data is never lost.*

## OAuth Provider

**Google** via OAuth 2.0 / OpenID Connect (Google Cloud Console → OAuth 2.0 Client ID)

## Hosting Plan

- **Frontend**: Vercel (React + Vite, static deployment)
- **Backend**: Render (ASP.NET Core container)
- **Database**: Render PostgreSQL (managed, durable)
