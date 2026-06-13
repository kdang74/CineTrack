# ── Build stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore dependencies first (cached layer if .csproj hasn't changed)
# Paths are relative to the repo root (Docker context = repo root)
COPY backend/CineTrack.Api/CineTrack.Api.csproj backend/CineTrack.Api/
RUN dotnet restore backend/CineTrack.Api/CineTrack.Api.csproj

# Copy the backend source and publish
COPY backend/CineTrack.Api/ backend/CineTrack.Api/
WORKDIR /src/backend/CineTrack.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .

# Render sets PORT env variable; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "CineTrack.Api.dll"]
