using CineTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CineTrack.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<MovieTag> MovieTags => Set<MovieTag>();
    public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.OAuthSubject).IsUnique();
            e.HasIndex(u => u.Email);
        });

        modelBuilder.Entity<Movie>(e =>
        {
            e.HasIndex(m => new { m.TmdbId, m.MediaType }).IsUnique();
        });

        modelBuilder.Entity<WatchlistItem>(e =>
        {
            e.HasIndex(w => new { w.UserId, w.MovieId }).IsUnique();
            e.HasOne(w => w.User).WithMany(u => u.WatchlistItems).HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(w => w.Movie).WithMany(m => m.WatchlistItems).HasForeignKey(w => w.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MovieTag>(e =>
        {
            e.HasKey(mt => new { mt.MovieId, mt.TagId });
            e.HasOne(mt => mt.Movie).WithMany(m => m.MovieTags).HasForeignKey(mt => mt.MovieId);
            e.HasOne(mt => mt.Tag).WithMany(t => t.MovieTags).HasForeignKey(mt => mt.TagId);
        });

        modelBuilder.Entity<ActivityEvent>(e =>
        {
            e.HasOne(a => a.User).WithMany(u => u.ActivityEvents).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Movie).WithMany(m => m.ActivityEvents).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
