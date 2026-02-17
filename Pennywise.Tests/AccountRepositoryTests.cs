using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;
using Pennywise.Infrastructure.Repositories;
using Testcontainers.PostgreSql;
using Xunit;

namespace Pennywise.Tests;

public sealed class AccountRepositoryTests : IAsyncLifetime
{

    private readonly PostgreSqlContainer _container;
    private DbContextOptions<PennywiseDbContext> _options = default!;
    
    public AccountRepositoryTests()
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
    
    [Fact(DisplayName = "AddAsync persists account")]
    public async Task AddAsync_WhenSaved_GetAsyncReturnsAccount()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new AccountRepository(context);

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Main",
            Balance = 100m,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(account);

        var fetched = await repository.GetAsync(account.Id);

        Assert.NotNull(fetched);
        Assert.Equal("Main", fetched!.Name);
        Assert.Equal(100m, fetched.Balance);
    }
    
    [Fact(DisplayName = "GetAllAsync returns persisted accounts")]
    public async Task GetAllAsync_returns_accounts_sorted_by_name()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new AccountRepository(context);
    
        await repository.AddAsync(new Account
        {
            Id = Guid.NewGuid(),
            Name = "Savings",
            Balance = 0m,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Account
        {
            Id = Guid.NewGuid(),
            Name = "Cash",
            Balance = 0m,
            CreatedAt = DateTimeOffset.UtcNow
        });
    
        var accounts = await repository.GetAllAsync();
    
        Assert.Equal(2, accounts.Count);
        Assert.Equal("Cash", accounts[0].Name);
        Assert.Equal("Savings", accounts[1].Name);
    }
    
    [Fact(DisplayName = "UpdateAsync updates account")]
    public async Task UpdateAsync_persists_changes()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new AccountRepository(context);
    
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Main",
            Balance = 100m,
            CreatedAt = DateTimeOffset.UtcNow
        };
    
        await repository.AddAsync(account);
    
        account.Name = "Main Updated";
        account.Balance = 250m;
    
        await repository.UpdateAsync(account);
    
        var fetched = await repository.GetAsync(account.Id);
    
        Assert.NotNull(fetched);
        Assert.Equal("Main Updated", fetched!.Name);
        Assert.Equal(250m, fetched.Balance);
    }
    
    [Fact(DisplayName =  "DeleteAsync deletes account")]
    public async Task DeleteAsync_removes_account()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new AccountRepository(context);
    
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Main",
            Balance = 100m,
            CreatedAt = DateTimeOffset.UtcNow
        };
    
        await repository.AddAsync(account);
    
        await repository.DeleteAsync(account.Id);
    
        var fetched = await repository.GetAsync(account.Id);
    
        Assert.Null(fetched);
    }

    [Fact(DisplayName = "DeleteAsync deletes related transactions")]
    public async Task DeleteAsync_removes_related_transactions()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new AccountRepository(context);

        var accountId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        await context.Categories.AddAsync(new Category
        {
            Id = categoryId,
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await repository.AddAsync(new Account
        {
            Id = accountId,
            Name = "Main",
            Balance = 100m,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await context.Transactions.AddAsync(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            CategoryId = categoryId,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = -15m,
            Note = "Milk",
            Merchant = "Store",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await context.SaveChangesAsync();

        await repository.DeleteAsync(accountId);

        var transactionCount = await context.Transactions.CountAsync();
        Assert.Equal(0, transactionCount);
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
