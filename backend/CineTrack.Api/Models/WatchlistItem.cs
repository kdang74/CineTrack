namespace CineTrack.Api.Models;

public enum WatchStatus
{
    Watchlist,
    Watching,
    Watched,
    Dropped
}

public class WatchlistItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int MovieId { get; set; }
    public WatchStatus Status { get; set; } = WatchStatus.Watchlist;
    public int? UserRating { get; set; } // 1–10
    public string? Notes { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime? WatchedAt { get; set; }

    public User User { get; set; } = null!;
    public Movie Movie { get; set; } = null!;
}
