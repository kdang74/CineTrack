namespace CineTrack.Api.Models;

public class User
{
    public int Id { get; set; }
    public string OAuthSubject { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Email { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public bool IsSimulated { get; set; } = false;

    public ICollection<WatchlistItem> WatchlistItems { get; set; } = [];
    public ICollection<ActivityEvent> ActivityEvents { get; set; } = [];
}
