using System;
using System.Linq;
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
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 12.50m,
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
        Assert.Equal("Lunch", fetched.Note);
        Assert.Equal("Cafe", fetched.Merchant);
    }

    [Fact(DisplayName = "GetPagedAsync returns transactions sorted by booked_on then created_at")]
    public async Task GetPagedAsync_returns_transactions_sorted_by_booked_on_then_created_at()
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
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 5m,
            Note = "Coffee",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2)
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 50m,
            Note = "Groceries",
            Merchant = "Market",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 20m,
            Note = "Dinner",
            Merchant = "Bistro",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-1)
        });

        var (transactions, totalCount) = await repository.GetPagedAsync(page: 1, pageSize: 25);

        Assert.Equal(3, totalCount);
        Assert.Equal(3, transactions.Count);
        Assert.Equal("Groceries", transactions[0].Note);
        Assert.Equal("Dinner", transactions[1].Note);
        Assert.Equal("Coffee", transactions[2].Note);
    }

    [Fact(DisplayName = "GetPagedAsync returns requested page and total count")]
    public async Task GetPagedAsync_returns_page_items_and_total_count()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);
        var bookedOn = new DateOnly(2026, 1, 1);
        var createdAtBase = new DateTimeOffset(2026, 1, 1, 8, 0, 0, TimeSpan.Zero);

        for (var index = 1; index <= 5; index++)
        {
            await repository.AddAsync(new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                CategoryId = category.Id,
                Type = TransactionType.Expense,
                BookedOn = bookedOn,
                Amount = index,
                Note = $"Transaction {index}",
                Merchant = "Store",
                CreatedAt = createdAtBase.AddMinutes(index)
            });
        }

        var (items, totalCount) = await repository.GetPagedAsync(page: 2, pageSize: 2);

        Assert.Equal(5, totalCount);
        Assert.Equal(2, items.Count);
        Assert.Equal("Transaction 3", items[0].Note);
        Assert.Equal("Transaction 2", items[1].Note);
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
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 12.50m,
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
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 15m,
            Note = "Groceries",
            Merchant = "Market",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = otherAccount.Id,
            CategoryId = category.Id,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 20m,
            Note = "Other",
            Merchant = "Shop",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 5m,
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
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 12.50m,
            Note = "Lunch",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(transaction);

        await repository.DeleteAsync(transaction.Id);

        var fetched = await repository.GetAsync(transaction.Id);
        var archived = await context.Transactions.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == transaction.Id);

        Assert.Null(fetched);
        Assert.NotNull(archived);
        Assert.True(archived!.IsArchived);
    }

    [Fact(DisplayName = "GetPagedAsync applies filters")]
    public async Task GetPagedAsync_applies_filters()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var accountA = await CreateAccountAsync(context);
        var accountB = await CreateAccountAsync(context);
        var categoryA = await CreateCategoryAsync(context);
        var categoryB = await CreateCategoryAsync(context);

        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = accountA.Id,
            CategoryId = categoryA.Id,
            Type = TransactionType.Expense,
            BookedOn = new DateOnly(2026, 2, 10),
            Amount = 49.99m,
            Note = "Supermarket",
            Merchant = "Amazon",
            CreatedAt = DateTimeOffset.UtcNow
        });

        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = accountA.Id,
            CategoryId = categoryA.Id,
            Type = TransactionType.Expense,
            BookedOn = new DateOnly(2026, 1, 10),
            Amount = 10m,
            Note = "Coffee",
            Merchant = "Cafe",
            CreatedAt = DateTimeOffset.UtcNow
        });

        await repository.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = accountB.Id,
            CategoryId = categoryB.Id,
            Type = TransactionType.Income,
            BookedOn = new DateOnly(2026, 2, 11),
            Amount = 50m,
            Note = "Supermarket",
            Merchant = "Amazon",
            CreatedAt = DateTimeOffset.UtcNow
        });

        var (items, totalCount) = await repository.GetPagedAsync(
            page: 1,
            pageSize: 25,
            filter: new Pennywise.Application.Interfaces.TransactionPageFilter
            {
                AccountId = accountA.Id,
                CategoryId = categoryA.Id,
                Type = TransactionType.Expense,
                BookedFrom = new DateOnly(2026, 2, 1),
                BookedTo = new DateOnly(2026, 2, 28),
                MinAmount = 40m,
                MaxAmount = 60m,
                SearchTerm = "amazon"
            });

        Assert.Equal(1, totalCount);
        Assert.Single(items);
        Assert.Equal(accountA.Id, items[0].AccountId);
        Assert.Equal(categoryA.Id, items[0].CategoryId);
        Assert.Equal(49.99m, items[0].Amount);
        Assert.Equal("Supermarket", items[0].Note);
    }

    [Fact(DisplayName = "ArchiveManyAsync archives multiple transactions")]
    public async Task ArchiveManyAsync_archives_multiple_transactions()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new TransactionRepository(context);

        var account = await CreateAccountAsync(context);
        var category = await CreateCategoryAsync(context);

        var first = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 25m,
            Note = "First",
            Merchant = "Store",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var second = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Income,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 100m,
            Note = "Second",
            Merchant = "Employer",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(first);
        await repository.AddAsync(second);

        await repository.ArchiveManyAsync(new[] { first.Id, second.Id });

        var (items, totalCount) = await repository.GetPagedAsync(page: 1, pageSize: 10);
        var archivedTransactions = await context.Transactions.IgnoreQueryFilters()
            .Where(t => t.IsArchived)
            .ToListAsync();

        Assert.Equal(0, totalCount);
        Assert.Empty(items);
        Assert.Equal(2, archivedTransactions.Count);
        Assert.All(archivedTransactions, t => Assert.True(t.IsArchived));
    }

    private async Task<Account> CreateAccountAsync(PennywiseDbContext context)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Main",
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
