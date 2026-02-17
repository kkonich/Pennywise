using Microsoft.EntityFrameworkCore;
using Pennywise.Application.Interfaces;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;

namespace Pennywise.Infrastructure.Repositories;

public sealed class TransactionRepository : ITransactionRepository
{
    private readonly PennywiseDbContext _dbContext;

    public TransactionRepository(PennywiseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Transaction?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Transactions
            .AsNoTracking()
            .FirstOrDefaultAsync(transaction => transaction.Id == id, cancellationToken);
    }
    
    public async Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        TransactionPageFilter? filter = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Transactions
            .AsNoTracking()
            .Where(t => !t.IsArchived)
            .AsQueryable();

        if (filter?.AccountId is not null)
        {
            query = query.Where(transaction => transaction.AccountId == filter.AccountId);
        }

        if (filter?.CategoryId is not null)
        {
            query = query.Where(transaction => transaction.CategoryId == filter.CategoryId);
        }

        if (filter?.Type is not null)
        {
            query = query.Where(transaction => transaction.Type == filter.Type);
        }

        if (filter?.BookedFrom is not null)
        {
            query = query.Where(transaction => transaction.BookedOn >= filter.BookedFrom);
        }

        if (filter?.BookedTo is not null)
        {
            query = query.Where(transaction => transaction.BookedOn <= filter.BookedTo);
        }

        if (filter?.MinAmount is not null)
        {
            query = query.Where(transaction => transaction.Amount >= filter.MinAmount);
        }

        if (filter?.MaxAmount is not null)
        {
            query = query.Where(transaction => transaction.Amount <= filter.MaxAmount);
        }

        if (!string.IsNullOrWhiteSpace(filter?.SearchTerm))
        {
            var searchPattern = $"%{filter.SearchTerm.Trim()}%";
            query = query.Where(transaction =>
                EF.Functions.ILike(transaction.Note, searchPattern) ||
                (transaction.Merchant != null && EF.Functions.ILike(transaction.Merchant, searchPattern)));
        }

        query = query
            .OrderByDescending(transaction => transaction.BookedOn)
            .ThenByDescending(transaction => transaction.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Transaction>> GetByAccountIdAsync(Guid accountId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Transactions
            .AsNoTracking()
            .Where(transaction => !transaction.IsArchived)
            .Where(transaction => transaction.AccountId == accountId)
            .OrderByDescending(transaction => transaction.BookedOn)
            .ThenByDescending(transaction => transaction.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _dbContext.Transactions.Update(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ArchiveManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return;
        }

        var transactions = await _dbContext.Transactions
            .IgnoreQueryFilters()
            .Where(transaction => ids.Contains(transaction.Id))
            .ToListAsync(cancellationToken);

        if (transactions.Count == 0)
        {
            return;
        }

        foreach (var transaction in transactions)
        {
            transaction.IsArchived = true;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await ArchiveManyAsync(new[] { id }, cancellationToken);
    }
}
