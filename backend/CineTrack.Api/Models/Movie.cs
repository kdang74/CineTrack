namespace CineTrack.Api.Models;

public class Movie
{
    public int Id { get; set; }
    public int TmdbId { get; set; }
    public string MediaType { get; set; } = "movie"; // "movie" or "tv"
    public string Title { get; set; } = string.Empty;
    public string? Overview { get; set; }
    public string? PosterPath { get; set; }
    public string? BackdropPath { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public double TmdbRating { get; set; }
    public int TmdbVoteCount { get; set; }
    public string? GenreIds { get; set; } // JSON array stored as string

    public ICollection<WatchlistItem> WatchlistItems { get; set; } = [];
    public ICollection<MovieTag> MovieTags { get; set; } = [];
    public ICollection<ActivityEvent> ActivityEvents { get; set; } = [];
}
