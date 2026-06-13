namespace CineTrack.Api.Models;

public class MovieTag
{
    public int MovieId { get; set; }
    public int TagId { get; set; }

    public Movie Movie { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
