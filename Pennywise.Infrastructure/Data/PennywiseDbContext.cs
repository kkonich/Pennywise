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
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(account => account.Id);
            entity.Property(account => account.Name).HasMaxLength(200);
            entity.Property(account => account.Balance).HasPrecision(18, 2);
            entity.HasQueryFilter(account => !account.IsArchived);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);
            entity.ToTable("Category");
            entity.HasQueryFilter(category => !category.IsArchived);
        });

        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.HasKey(settings => settings.Id);
            entity.ToTable("UserSettings");
            entity.Property(settings => settings.Id).ValueGeneratedNever();
            entity.Property(settings => settings.CurrencyCode).HasMaxLength(3);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(transaction => transaction.Id);
            entity.ToTable("Transaction");
            entity.HasIndex(transaction => new { transaction.BookedOn, transaction.CreatedAt });
            entity.HasQueryFilter(transaction => !transaction.IsArchived);

            entity.HasOne(transaction => transaction.Account)
                .WithMany(account => account.Transactions)
                .HasForeignKey(transaction => transaction.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(transaction => transaction.Category)
                .WithMany(category => category.Transactions)
                .HasForeignKey(transaction => transaction.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
