namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Response payload for transaction data.
/// </summary>
public sealed class TransactionResponse
{
    /// <summary>
    /// Unique identifier of the transaction.
    /// </summary>
    public Guid Id { get; set; }

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

    /// <summary>
    /// Creation timestamp in UTC.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
