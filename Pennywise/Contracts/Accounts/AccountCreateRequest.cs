namespace Pennywise.Contracts.Accounts;

/// <summary>
/// Request payload for creating an account.
/// </summary>
public sealed class AccountCreateRequest
{
    /// <summary>
    /// Display name of the account.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// ISO currency code (e.g., EUR, USD).
    /// </summary>
    public string CurrencyCode { get; set; } = string.Empty;

    /// <summary>
    /// Initial balance of the account.
    /// </summary>
    public decimal Balance { get; set; }
}
