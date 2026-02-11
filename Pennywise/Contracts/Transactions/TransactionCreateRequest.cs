namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Request payload for creating a transaction.
/// </summary>
public sealed class TransactionCreateRequest
{
    /// <summary>
    /// Related account identifier.
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Related category identifier.
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Booking date of the transaction.
    /// </summary>
    public DateOnly BookedOn { get; set; }

    /// <summary>
    /// Transaction amount.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Note for the transaction.
    /// </summary>
    public string Note { get; set; } = string.Empty;

    /// <summary>
    /// Merchant name for the transaction.
    /// </summary>
    public string? Merchant { get; set; }
}
