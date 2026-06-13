using CineTrack.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace CineTrack.Api.DTOs;

public record WatchlistItemDto(
    int Id,
    MovieDto Movie,
    string Status,
    int? UserRating,
    string? Notes,
    DateTime AddedAt,
    DateTime? WatchedAt
);

public record AddToWatchlistRequest(
    [Required] int TmdbId,
    [Required] string MediaType,
    [Required] string Title,
    string? Overview,
    string? PosterPath,
    string? BackdropPath,
    string? ReleaseDate,
    double TmdbRating,
    int TmdbVoteCount,
    int[]? GenreIds
);

public record UpdateWatchlistRequest(
    [Required] string Status,
    [Range(1, 10)] int? UserRating,
    string? Notes
);
