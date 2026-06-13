namespace CineTrack.Api.DTOs;

public record UserDto(
    int Id,
    string DisplayName,
    string? AvatarUrl,
    string? Email,
    DateTime JoinedAt,
    int WatchlistCount,
    int WatchedCount
);

public record ActivityEventDto(
    int Id,
    string UserDisplayName,
    string? UserAvatarUrl,
    string Action,
    string? Details,
    string? MovieTitle,
    string? MoviePosterPath,
    int? MovieTmdbId,
    string? MediaType,
    DateTime OccurredAt
);

public record StatsDto(
    int TotalMovies,
    int TotalUsers,
    int TotalWatched,
    IEnumerable<MovieDto> TrendingMovies
);
