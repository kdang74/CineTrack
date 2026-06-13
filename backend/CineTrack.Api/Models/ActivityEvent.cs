namespace CineTrack.Api.Models;

public class ActivityEvent
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? MovieId { get; set; }
    public string Action { get; set; } = string.Empty; // "added", "watched", "rated", "dropped"
    public string? Details { get; set; } // e.g. "rated 8/10"
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Movie? Movie { get; set; }
}
