namespace CineTrack.Api.DTOs;

public record MovieDto(
    int Id,
    int TmdbId,
    string MediaType,
    string Title,
    string? Overview,
    string? PosterPath,
    string? BackdropPath,
    DateTime? ReleaseDate,
    double TmdbRating,
    int TmdbVoteCount,
    string[]? Genres
);

public record TmdbSearchResult(
    int Id,
    string MediaType,
    string Title,
    string? Overview,
    string? PosterPath,
    string? BackdropPath,
    string? ReleaseDate,
    double VoteAverage,
    int VoteCount,
    int[]? GenreIds
);

public record TmdbSearchResponse(
    int Page,
    IEnumerable<TmdbSearchResult> Results,
    int TotalPages,
    int TotalResults
);
