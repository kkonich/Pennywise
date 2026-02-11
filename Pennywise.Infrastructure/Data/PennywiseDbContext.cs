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
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(account => account.Id);
            entity.Property(account => account.Name).HasMaxLength(200);
            entity.Property(account => account.CurrencyCode).HasMaxLength(3);
            entity.Property(account => account.Balance).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);
            entity.ToTable("Category");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(transaction => transaction.Id);
            entity.ToTable("Transaction");
        });
    }
}
