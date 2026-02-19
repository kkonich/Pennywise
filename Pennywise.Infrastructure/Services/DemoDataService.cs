using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Pennywise.Application.Interfaces;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;

namespace Pennywise.Infrastructure.Services;

public sealed class DemoDataService : IDemoDataService
{
    private readonly PennywiseDbContext _dbContext;
    private static readonly DemoData Demo = BuildDemoData();

    public DemoDataService(PennywiseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DemoDataSeedResult> SeedAsync(CancellationToken cancellationToken = default)
    {
        var sampleAccountIds = Demo.Accounts.Select(account => account.Id).ToArray();
        var sampleCategoryIds = Demo.Categories.Select(category => category.Id).ToArray();
        var sampleTransactionIds = Demo.Transactions.Select(transaction => transaction.Id).ToArray();

        var accountsExist = await _dbContext.Accounts
            .IgnoreQueryFilters()
            .AnyAsync(account => sampleAccountIds.Contains(account.Id), cancellationToken);

        var categoriesExist = await _dbContext.Categories
            .IgnoreQueryFilters()
            .AnyAsync(category => sampleCategoryIds.Contains(category.Id), cancellationToken);

        var transactionsExist = await _dbContext.Transactions
            .IgnoreQueryFilters()
            .AnyAsync(transaction => sampleTransactionIds.Contains(transaction.Id), cancellationToken);

        if (accountsExist || categoriesExist || transactionsExist)
        {
            return DemoDataSeedResult.AlreadySeeded;
        }

        await using var dbTransaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        await _dbContext.Accounts.AddRangeAsync(Demo.Accounts, cancellationToken);
        await _dbContext.Categories.AddRangeAsync(Demo.Categories, cancellationToken);
        await _dbContext.Transactions.AddRangeAsync(Demo.Transactions, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await dbTransaction.CommitAsync(cancellationToken);

        return DemoDataSeedResult.Created;
    }

    public async Task<bool> ClearAsync(CancellationToken cancellationToken = default)
    {
        var accountIds = Demo.Accounts.Select(a => a.Id).ToArray();
        var categoryIds = Demo.Categories.Select(c => c.Id).ToArray();
        var transactionIds = Demo.Transactions.Select(t => t.Id).ToArray();

        var anyDemoData = await _dbContext.Transactions.IgnoreQueryFilters()
            .AnyAsync(t => transactionIds.Contains(t.Id), cancellationToken)
            || await _dbContext.Accounts.IgnoreQueryFilters()
                .AnyAsync(a => accountIds.Contains(a.Id), cancellationToken)
            || await _dbContext.Categories.IgnoreQueryFilters()
                .AnyAsync(c => categoryIds.Contains(c.Id), cancellationToken);

        if (!anyDemoData)
        {
            return false;
        }

        await using var dbTransaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var transactions = await _dbContext.Transactions.IgnoreQueryFilters()
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync(cancellationToken);
        _dbContext.Transactions.RemoveRange(transactions);

        var accounts = await _dbContext.Accounts.IgnoreQueryFilters()
            .Where(a => accountIds.Contains(a.Id))
            .ToListAsync(cancellationToken);
        _dbContext.Accounts.RemoveRange(accounts);

        var categories = await _dbContext.Categories.IgnoreQueryFilters()
            .Where(c => categoryIds.Contains(c.Id))
            .ToListAsync(cancellationToken);
        _dbContext.Categories.RemoveRange(categories);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await dbTransaction.CommitAsync(cancellationToken);

        return true;
    }

    private static DemoData BuildDemoData()
    {
        var now = DateTimeOffset.UtcNow;
        var baseDate = new DateOnly(now.Year, now.Month, 1).AddMonths(-3);

        var checkingId = new Guid("11111111-1111-1111-1111-111111111111");
        var creditId = new Guid("22222222-2222-2222-2222-222222222222");

        var accounts = new List<Account>
        {
            new()
            {
                Id = checkingId,
                Name = "Girokonto",
                Balance = 2450.50m,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = creditId,
                Name = "Kreditkarte",
                Balance = -230.40m,
                CreatedAt = now.AddMonths(-6)
            }
        };

        var salaryCategoryId = new Guid("33333333-3333-3333-3333-333333333333");
        var freelanceCategoryId = new Guid("44444444-4444-4444-4444-444444444444");
        var rentCategoryId = new Guid("55555555-5555-5555-5555-555555555555");
        var groceriesCategoryId = new Guid("66666666-6666-6666-6666-666666666666");
        var utilitiesCategoryId = new Guid("77777777-7777-7777-7777-777777777777");
        var transportCategoryId = new Guid("88888888-8888-8888-8888-888888888888");
        var entertainmentCategoryId = new Guid("99999999-9999-9999-9999-999999999999");

        var categories = new List<Category>
        {
            new()
            {
                Id = salaryCategoryId,
                Name = "Gehalt",
                Type = CategoryType.Income,
                SortOrder = 1,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = freelanceCategoryId,
                Name = "Freelance",
                Type = CategoryType.Income,
                SortOrder = 2,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = rentCategoryId,
                Name = "Miete",
                Type = CategoryType.Expense,
                SortOrder = 10,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = groceriesCategoryId,
                Name = "Lebensmittel",
                Type = CategoryType.Expense,
                SortOrder = 11,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = utilitiesCategoryId,
                Name = "Strom & Heizung",
                Type = CategoryType.Expense,
                SortOrder = 12,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = transportCategoryId,
                Name = "Mobilität",
                Type = CategoryType.Expense,
                SortOrder = 13,
                CreatedAt = now.AddMonths(-6)
            },
            new()
            {
                Id = entertainmentCategoryId,
                Name = "Freizeit",
                Type = CategoryType.Expense,
                SortOrder = 14,
                CreatedAt = now.AddMonths(-6)
            }
        };

        var transactions = new List<Transaction>
        {
            new()
            {
                Id = new Guid("aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
                AccountId = checkingId,
                CategoryId = salaryCategoryId,
                Type = TransactionType.Income,
                BookedOn = baseDate,
                Amount = 3200m,
                Note = "Gehalt Dezember",
                Merchant = "Employer GmbH",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                AccountId = checkingId,
                CategoryId = rentCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddDays(1),
                Amount = 1200m,
                Note = "Miete",
                Merchant = "Vermieter",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                AccountId = checkingId,
                CategoryId = utilitiesCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddDays(3),
                Amount = 160m,
                Note = "Gas & Strom",
                Merchant = "Energie AG",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                AccountId = checkingId,
                CategoryId = groceriesCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddDays(5),
                Amount = 220.50m,
                Note = "Wocheneinkauf",
                Merchant = "Supermarkt",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5"),
                AccountId = creditId,
                CategoryId = transportCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddDays(7),
                Amount = 78.90m,
                Note = "Monatskarte",
                Merchant = "HVV",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6"),
                AccountId = creditId,
                CategoryId = entertainmentCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddDays(9),
                Amount = 45m,
                Note = "Kino",
                Merchant = "Cinemax",
                CreatedAt = now.AddMonths(-3)
            },
            new()
            {
                Id = new Guid("aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7"),
                AccountId = checkingId,
                CategoryId = freelanceCategoryId,
                Type = TransactionType.Income,
                BookedOn = baseDate.AddMonths(1).AddDays(2),
                Amount = 850m,
                Note = "Webprojekt",
                Merchant = "Freelance Kunde",
                CreatedAt = now.AddMonths(-2)
            },
            new()
            {
                Id = new Guid("aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaa8"),
                AccountId = checkingId,
                CategoryId = groceriesCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddMonths(1).AddDays(5),
                Amount = 195.30m,
                Note = "Wocheneinkauf",
                Merchant = "Bio Markt",
                CreatedAt = now.AddMonths(-2)
            },
            new()
            {
                Id = new Guid("aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaa9"),
                AccountId = creditId,
                CategoryId = transportCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddMonths(1).AddDays(10),
                Amount = 65m,
                Note = "Bahnfahrt",
                Merchant = "Deutsche Bahn",
                CreatedAt = now.AddMonths(-2)
            },
            new()
            {
                Id = new Guid("aaaaaa10-aaaa-aaaa-aaaa-aaaaaaaaaa10"),
                AccountId = checkingId,
                CategoryId = entertainmentCategoryId,
                Type = TransactionType.Expense,
                BookedOn = baseDate.AddMonths(2).AddDays(4),
                Amount = 89.99m,
                Note = "Konzert",
                Merchant = "Elbphilharmonie",
                CreatedAt = now.AddMonths(-1)
            },
            new()
            {
                Id = new Guid("aaaaaa11-aaaa-aaaa-aaaa-aaaaaaaaaa11"),
                AccountId = checkingId,
                CategoryId = salaryCategoryId,
                Type = TransactionType.Income,
                BookedOn = baseDate.AddMonths(1),
                Amount = 3200m,
                Note = "Gehalt Januar",
                Merchant = "Employer GmbH",
                CreatedAt = now.AddMonths(-1)
            }
        };

        return new DemoData(accounts, categories, transactions);
    }

    private sealed record DemoData(
        IReadOnlyList<Account> Accounts,
        IReadOnlyList<Category> Categories,
        IReadOnlyList<Transaction> Transactions);
}


