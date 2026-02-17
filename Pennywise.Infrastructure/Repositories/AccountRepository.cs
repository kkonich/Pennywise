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

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var account = await _dbContext.Accounts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (account is null)
        {
            return;
        }

        account.IsArchived = true;

        var transactions = await _dbContext.Transactions
            .IgnoreQueryFilters()
            .Where(t => t.AccountId == id)
            .ToListAsync(cancellationToken);

        foreach (var transaction in transactions)
        {
            transaction.IsArchived = true;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
