using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;
using Pennywise.Infrastructure.Repositories;
using Testcontainers.PostgreSql;
using Xunit;

namespace Pennywise.Tests;

public sealed class CategoryRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container;
    private DbContextOptions<PennywiseDbContext> _options = default!;

    public CategoryRepositoryTests()
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

    [Fact(DisplayName = "AddAsync persists category")]
    public async Task AddAsync_WhenSaved_GetAsyncReturnsCategory()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new CategoryRepository(context);

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 10,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(category);

        var fetched = await repository.GetAsync(category.Id);

        Assert.NotNull(fetched);
        Assert.Equal("Groceries", fetched!.Name);
        Assert.Equal(CategoryType.Expense, fetched.Type);
        Assert.Equal(10, fetched.SortOrder);
        Assert.False(fetched.IsArchived);
    }

    [Fact(DisplayName = "GetAllAsync returns persisted categories")]
    public async Task GetAllAsync_returns_categories_sorted_by_sort_order_then_name()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new CategoryRepository(context);

        await repository.AddAsync(new Category
        {
            Id = Guid.NewGuid(),
            Name = "Salary",
            Type = CategoryType.Income,
            SortOrder = 2,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Category
        {
            Id = Guid.NewGuid(),
            Name = "Bonus",
            Type = CategoryType.Income,
            SortOrder = 2,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await repository.AddAsync(new Category
        {
            Id = Guid.NewGuid(),
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        });

        var categories = await repository.GetAllAsync();

        Assert.Equal(3, categories.Count);
        Assert.Equal("Groceries", categories[0].Name);
        Assert.Equal("Bonus", categories[1].Name);
        Assert.Equal("Salary", categories[2].Name);
    }

    [Fact(DisplayName = "UpdateAsync updates category")]
    public async Task UpdateAsync_persists_changes()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new CategoryRepository(context);

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(category);

        category.Name = "Groceries Updated";
        category.SortOrder = 5;
        category.IsArchived = true;

        await repository.UpdateAsync(category);

        var fetched = await repository.GetAsync(category.Id);
        var archived = await context.Categories.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == category.Id);

        Assert.Null(fetched);
        Assert.NotNull(archived);
        Assert.Equal("Groceries Updated", archived!.Name);
        Assert.Equal(5, archived.SortOrder);
        Assert.True(archived.IsArchived);
    }

    [Fact(DisplayName = "DeleteAsync deletes category")]
    public async Task DeleteAsync_removes_category()
    {
        await using var context = await CreateNewContextAsync();
        var repository = new CategoryRepository(context);

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Groceries",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(category);

        await repository.DeleteAsync(category.Id);

        var fetched = await repository.GetAsync(category.Id);
        var archived = await context.Categories.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == category.Id);

        Assert.Null(fetched);
        Assert.NotNull(archived);
        Assert.True(archived!.IsArchived);
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
