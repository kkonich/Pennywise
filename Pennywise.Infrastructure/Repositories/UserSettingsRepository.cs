using Microsoft.EntityFrameworkCore;
using Pennywise.Application.Interfaces;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;

namespace Pennywise.Infrastructure.Repositories;

public sealed class UserSettingsRepository : IUserSettingsRepository
{
    private readonly PennywiseDbContext _dbContext;

    public UserSettingsRepository(PennywiseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserSettings> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _dbContext.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is not null)
        {
            return settings;
        }

        var now = DateTimeOffset.UtcNow;
        var defaultSettings = new UserSettings
        {
            Id = UserSettings.SingletonId,
            CurrencyCode = "EUR",
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.UserSettings.Add(defaultSettings);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return defaultSettings;
    }

    public async Task<UserSettings> SetCurrencyCodeAsync(string currencyCode, CancellationToken cancellationToken = default)
    {
        var settings = await _dbContext.UserSettings.FirstOrDefaultAsync(cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (settings is null)
        {
            settings = new UserSettings
            {
                Id = UserSettings.SingletonId,
                CurrencyCode = currencyCode,
                CreatedAt = now,
                UpdatedAt = now
            };
            _dbContext.UserSettings.Add(settings);
        }
        else
        {
            settings.CurrencyCode = currencyCode;
            settings.UpdatedAt = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return settings;
    }
}
