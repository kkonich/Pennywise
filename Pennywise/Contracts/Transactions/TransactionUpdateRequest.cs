using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Request payload for updating a transaction.
/// </summary>
public sealed class TransactionUpdateRequest
{
    /// <summary>
    /// Updated related account identifier.
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Updated related category identifier.
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Updated booking date of the transaction.
    /// </summary>
    public DateOnly BookedOn { get; set; }

    /// <summary>
    /// Updated transaction amount.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Updated transaction type (expense or income).
    /// </summary>
    public TransactionType Type { get; set; }

    /// <summary>
    /// Updated note for the transaction.
    /// </summary>
    public string Note { get; set; } = string.Empty;

    /// <summary>
    /// Updated merchant name for the transaction.
    /// </summary>
    public string? Merchant { get; set; }
}
