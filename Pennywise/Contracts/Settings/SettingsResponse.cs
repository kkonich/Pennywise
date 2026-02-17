namespace Pennywise.Contracts.Settings;

/// <summary>
/// Response payload for user settings.
/// </summary>
public sealed class SettingsResponse
{
    /// <summary>
    /// ISO currency code applied to all accounts and transactions.
    /// </summary>
    public string CurrencyCode { get; set; } = "EUR";
}
