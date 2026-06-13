namespace CineTrack.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<MovieTag> MovieTags { get; set; } = [];
}
