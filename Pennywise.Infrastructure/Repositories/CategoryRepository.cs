using Microsoft.EntityFrameworkCore;
using Pennywise.Application.Interfaces;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;

namespace Pennywise.Infrastructure.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly PennywiseDbContext _dbContext;

    public CategoryRepository(PennywiseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Category?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(category => category.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(category => !category.IsArchived)
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        _dbContext.Categories.Update(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ArchiveManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return;
        }

        var targetIds = ids
            .Where(id => id != CategoryDefaults.UncategorizedId)
            .Distinct()
            .ToArray();

        if (targetIds.Length == 0)
        {
            return;
        }

        var categories = await _dbContext.Categories
            .IgnoreQueryFilters()
            .Where(category => targetIds.Contains(category.Id))
            .ToListAsync(cancellationToken);

        if (categories.Count == 0)
        {
            return;
        }

        var uncategorized = await EnsureUncategorizedAsync(cancellationToken);

        var transactions = await _dbContext.Transactions
            .IgnoreQueryFilters()
            .Where(transaction => targetIds.Contains(transaction.CategoryId))
            .ToListAsync(cancellationToken);

        foreach (var transaction in transactions)
        {
            transaction.CategoryId = uncategorized.Id;
        }

        foreach (var category in categories)
        {
            category.IsArchived = true;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await ArchiveManyAsync(new[] { id }, cancellationToken);
    }

    private async Task<Category> EnsureUncategorizedAsync(CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Categories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == CategoryDefaults.UncategorizedId, cancellationToken);

        if (existing is not null)
        {
            existing.IsArchived = false;
            return existing;
        }

        var category = new Category
        {
            Id = CategoryDefaults.UncategorizedId,
            Name = CategoryDefaults.UncategorizedName,
            Type = CategoryType.Expense,
            SortOrder = 0,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Categories.Add(category);
        return category;
    }
}
