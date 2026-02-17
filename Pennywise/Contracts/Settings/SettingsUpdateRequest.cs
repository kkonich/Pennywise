namespace Pennywise.Contracts.Settings;

/// <summary>
/// Request payload for updating user settings.
/// </summary>
public sealed class SettingsUpdateRequest
{
    /// <summary>
    /// ISO currency code applied globally.
    /// </summary>
    public string CurrencyCode { get; set; } = "EUR";
}
