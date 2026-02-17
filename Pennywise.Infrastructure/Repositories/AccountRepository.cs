using Microsoft.EntityFrameworkCore;
using Pennywise.Application.Interfaces;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;

namespace Pennywise.Infrastructure.Repositories;

public sealed class AccountRepository : IAccountRepository
{
    private readonly PennywiseDbContext _dbContext;

    public AccountRepository(PennywiseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Account?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(account => account.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Account>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Accounts
            .AsNoTracking()
            .Where(account => !account.IsArchived)
            .OrderBy(account => account.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Account account, CancellationToken cancellationToken = default)
    {
        _dbContext.Accounts.Add(account);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Account account, CancellationToken cancellationToken = default)
    {
        _dbContext.Accounts.Update(account);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ArchiveManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return;
        }

        var accounts = await _dbContext.Accounts
            .IgnoreQueryFilters()
            .Where(account => ids.Contains(account.Id))
            .ToListAsync(cancellationToken);

        if (accounts.Count == 0)
        {
            return;
        }

        var accountIds = accounts.Select(account => account.Id).ToArray();

        var transactions = await _dbContext.Transactions
            .IgnoreQueryFilters()
            .Where(transaction => accountIds.Contains(transaction.AccountId))
            .ToListAsync(cancellationToken);

        foreach (var account in accounts)
        {
            account.IsArchived = true;
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
