using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;
using Pennywise.Infrastructure.Repositories;
using Testcontainers.PostgreSql;
using Xunit;

namespace Pennywise.Tests;

public sealed class TransactionRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container;
    private DbContextOptions<PennywiseDbContext> _options = default!;

    public TransactionRepositoryTests()
    {
        const string user = "pennywise";
        var pass = Guid.NewGuid().ToString("N");

        _container = new PostgreSqlBuilder()
            .WithDatabase("pennywise_test")
            .WithUsername(user)
            .WithPassword(pass)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        _options = new DbContextOptionsBuilder<PennywiseDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .Options;
    }

    public Task DisposeAsync()
    {
        return _container.DisposeAsync().AsTask();
    }

    [Fact(DisplayName = "AddAsync persists transaction")]
    public async Task AddAsync_WhenSaved_GetAsyncReturnsTransaction()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 12.50m,
            Type = TransactionType.Expense,
            Note = "Lunch",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(transaction);

        var fetched = await repository.GetAsync(transaction.Id);

        Assert.NotNull(fetched);
        Assert.Equal(transaction.AccountId, fetched!.AccountId);
        Assert.Equal(transaction.CategoryId, fetched.CategoryId);
        Assert.Equal(12.50m, fetched.Amount);
        Assert.Equal(TransactionType.Expense, fetched.Type);
        Assert.Equal("Lunch", fetched.Note);
        Assert.Equal("Cafe", fetched.Merchant);
    }

    [Fact(DisplayName = "GetAllAsync returns persisted transactions")]
    public async Task GetAllAsync_returns_transactions_sorted_by_booked_on_then_created_at()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 5m,
            Type = TransactionType.Expense,
            Note = "Coffee",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2)
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 11),
            Amount = 50m,
            Type = TransactionType.Expense,
            Note = "Groceries",
            Merchant = "Market",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 20m,
            Type = TransactionType.Expense,
            Note = "Dinner",
            Merchant = "Bistro",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-1)
        });

        var transactions = await repository.GetAllAsync();

        Assert.Equal(3, transactions.Count);
        Assert.Equal("Groceries", transactions[0].Note);
        Assert.Equal("Dinner", transactions[1].Note);
        Assert.Equal("Coffee", transactions[2].Note);
    }

    [Fact(DisplayName = "UpdateAsync updates transaction")]
    public async Task UpdateAsync_persists_changes()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 12.50m,
            Type = TransactionType.Expense,
            Note = "Lunch",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(transaction);

        transaction.Amount = 15m;
        transaction.Note = "Lunch Updated";
        transaction.Merchant = null;

        await repository.UpdateAsync(transaction);

        var fetched = await repository.GetAsync(transaction.Id);

        Assert.NotNull(fetched);
        Assert.Equal(15m, fetched!.Amount);
        Assert.Equal("Lunch Updated", fetched.Note);
        Assert.Null(fetched.Merchant);
    }

    [Fact(DisplayName = "GetByAccountIdAsync returns transactions for account")]
    public async Task GetByAccountIdAsync_returns_only_account_transactions()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var otherAccount = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 11),
            Amount = 15m,
            Type = TransactionType.Expense,
            Note = "Groceries",
            Merchant = "Market",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = otherAccount.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 20m,
            Type = TransactionType.Expense,
            Note = "Other",
            Merchant = "Shop",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 5m,
            Type = TransactionType.Expense,
            Note = "Coffee",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5)
        });

        var transactions = await repository.GetByAccountIdAsync(account.Id);

        Assert.Equal(2, transactions.Count);
        Assert.All(transactions, t => Assert.Equal(account.Id, t.AccountId));
        Assert.Equal("Groceries", transactions[0].Note);
        Assert.Equal("Coffee", transactions[1].Note);
    }

    [Fact(DisplayName = "DeleteAsync deletes transaction")]
    public async Task DeleteAsync_removes_transaction()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 12.50m,
            Type = TransactionType.Expense,
            Note = "Lunch",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(transaction);

        await repository.DeleteAsync(transaction.Id);

        var fetched = await repository.GetAsync(transaction.Id);

        Assert.Null(fetched);
    }

    private async Task<Account> CreateAccountAsync(PennywiseDbContext context)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Main",
            CurrencyCode = "EUR",
            Balance = 0m,
            CreatedAt = DateTimeOffset.UtcNow
        };

        context.Accounts.Add(account);
        await context.SaveChangesAsync();
        return account;
    }

    private async Task<Category> CreateCategoryAsync(PennywiseDbContext context)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    // Helper function
    private async Task<PennywiseDbContext> CreateNewContextAsync()
    {
        var context = new PennywiseDbContext(_options);
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        return context;
    }
}
