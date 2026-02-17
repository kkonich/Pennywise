using Pennywise.Domain.Entities;

namespace Pennywise.Application.Interfaces;

public interface IUserSettingsRepository
{
    Task<UserSettings> GetAsync(CancellationToken cancellationToken = default);
    Task<UserSettings> SetCurrencyCodeAsync(string currencyCode, CancellationToken cancellationToken = default);
}
