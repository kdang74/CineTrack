using CineTrack.Api.Data;
using CineTrack.Api.Endpoints;
using CineTrack.Api.Hubs;
using CineTrack.Api.Middleware;
using CineTrack.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Trust Render's (and other reverse proxies') X-Forwarded-Proto header so
// ASP.NET Core sees the request as HTTPS and generates correct redirect URIs for Google OAuth.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Allow any proxy — Render's IP range is not fixed
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Database — PostgreSQL in production, SQLite in development
var postgresConn = builder.Configuration.GetConnectionString("Postgres");
var sqliteConn   = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=cinetrack.db";
var isProduction = builder.Environment.IsProduction();

// Render supplies the connection string as a postgres:// URI — convert to ADO.NET format
if (!string.IsNullOrEmpty(postgresConn) &&
    (postgresConn.StartsWith("postgres://") || postgresConn.StartsWith("postgresql://")))
{
    var uri = new Uri(postgresConn);
    var userInfo = uri.UserInfo.Split(':');
    var port = uri.Port > 0 ? uri.Port : 5432;
    postgresConn = $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};" +
                  $"Username={userInfo[0]};Password={userInfo[1]};" +
                  $"SSL Mode=Require;Trust Server Certificate=true";
}

if (isProduction && !string.IsNullOrEmpty(postgresConn))
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(postgresConn));
else
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite(sqliteConn));

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax;
    options.Cookie.SecurePolicy = isProduction ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    // Api auth middleware handles 302→401 conversion for API routes
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google:ClientId is required");
    options.ClientSecret = builder.Configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google:ClientSecret is required");
    options.CallbackPath = "/signin-google";
    options.SaveTokens = true;
    // Google returns the picture claim in the id_token as "picture"
    // We access it via the standard ClaimTypes in the callback
});

builder.Services.AddAuthorization();

// CORS
var frontendUrl = builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
builder.Services.AddCors(opt => opt.AddPolicy("Frontend", policy =>
    policy.WithOrigins(frontendUrl)
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));

// SignalR
builder.Services.AddSignalR();

// HTTP client for TMDB
// TMDB v3 API Key is sent as ?api_key= query param (not Bearer — that is for v4 Read Access Token)
var tmdbApiKey = builder.Configuration["Tmdb:ApiKey"] ?? throw new InvalidOperationException("Tmdb:ApiKey is required");
builder.Services.AddHttpClient<TmdbService>(client =>
{
    client.BaseAddress = new Uri($"https://api.themoviedb.org/3/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddSingleton<TmdbApiKey>(_ => new TmdbApiKey(tmdbApiKey));

builder.Services.AddScoped<WatchlistService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CineTrack API", Version = "v1", Description = "Movie & TV Watchlist API" });
});

var app = builder.Build();

// Create the database schema if it doesn't exist yet
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

// Must be first — makes ASP.NET Core aware it's behind Render's HTTPS proxy
app.UseForwardedHeaders();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<ApiAuthMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Skip HTTPS redirection in production — Render's load balancer handles SSL termination
if (!app.Environment.IsProduction())
    app.UseHttpsRedirection();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint (used by Render to verify the service is running)
app.MapGet("/healthz", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .ExcludeFromDescription();

// Map endpoints
app.MapAuthEndpoints();
app.MapMovieEndpoints();
app.MapWatchlistEndpoints();
app.MapActivityEndpoints();
app.MapAdminEndpoints();

// SignalR hub
app.MapHub<ActivityHub>("/hubs/activity");

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
