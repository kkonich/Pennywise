using Microsoft.EntityFrameworkCore;
using Pennywise.Domain.Entities;

namespace Pennywise.Infrastructure.Data;

public sealed class PennywiseDbContext : DbContext
{
    public PennywiseDbContext(DbContextOptions<PennywiseDbContext> options)
        : base(options)
    {
    }

    public DbSet<Account> Accounts => Set<Account>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(account => account.Id);
            entity.Property(account => account.Name).HasMaxLength(200);
            entity.Property(account => account.CurrencyCode).HasMaxLength(3);
            entity.Property(account => account.OpeningBalance).HasPrecision(18, 2);
        });
    }
}
