namespace Pennywise.Contracts.Accounts;

/// <summary>
/// Response payload for account data.
/// </summary>
public sealed class AccountResponse
{
    /// <summary>
    /// Unique identifier of the account.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Display name of the account.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// ISO currency code (e.g., EUR, USD).
    /// </summary>
    public string CurrencyCode { get; set; } = string.Empty;

    /// <summary>
    /// Current balance of the account.
    /// </summary>
    public decimal Balance { get; set; }

    /// <summary>
    /// Creation timestamp in UTC.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
