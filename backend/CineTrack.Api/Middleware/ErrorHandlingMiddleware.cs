using System.Text.Json;

namespace CineTrack.Api.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            var error = new { error = "An unexpected error occurred.", detail = context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment() ? ex.Message : null };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
    }
}
