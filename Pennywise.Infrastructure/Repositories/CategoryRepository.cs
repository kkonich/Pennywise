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

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
        {
            return;
        }

        category.IsArchived = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
