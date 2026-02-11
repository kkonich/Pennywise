namespace Pennywise.Contracts.Accounts;

/// <summary>
/// Request payload for updating an account.
/// </summary>
public sealed class AccountUpdateRequest
{
    /// <summary>
    /// Updated display name of the account.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Updated ISO currency code (e.g., EUR, USD).
    /// </summary>
    public string CurrencyCode { get; set; } = string.Empty;

    /// <summary>
    /// Updated balance of the account.
    /// </summary>
    public decimal Balance { get; set; }
}
