using CineTrack.Api.Data;
using CineTrack.Api.Services;

namespace CineTrack.Api.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        // POST /api/admin/seed — trigger database seeding
        // Protected by admin key header (not OAuth — called before any users exist)
        app.MapPost("/api/admin/seed", async (
            HttpContext ctx,
            AppDbContext db,
            TmdbService tmdb,
            ILogger<Program> logger,
            IConfiguration config,
            bool? force) =>
        {
            var expectedKey = config["Admin:SeedKey"];
            var providedKey = ctx.Request.Headers["X-Admin-Key"].FirstOrDefault();
            if (string.IsNullOrEmpty(expectedKey) || providedKey != expectedKey)
                return Results.Unauthorized();

            var result = await DatabaseSeeder.SeedAsync(db, tmdb, logger, force ?? false);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        });
    }
}
