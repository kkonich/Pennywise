using System.ComponentModel.DataAnnotations;
using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Request payload for creating a transaction.
/// </summary>
public sealed class TransactionCreateRequest : IValidatableObject
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
    /// Whether the transaction is an expense or income. Defaults to the category's type when omitted.
    /// </summary>
    public TransactionType? Type { get; set; }

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

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (AccountId == Guid.Empty)
        {
            yield return new ValidationResult("AccountId is required.", [nameof(AccountId)]);
        }

        if (CategoryId == Guid.Empty)
        {
            yield return new ValidationResult("CategoryId is required.", [nameof(CategoryId)]);
        }

        if (Type.HasValue && !Enum.IsDefined(typeof(TransactionType), Type.Value))
        {
            yield return new ValidationResult("Type is required and must be either Income or Expense.", [nameof(Type)]);
        }

        if (BookedOn == default)
        {
            yield return new ValidationResult("BookedOn is required.", [nameof(BookedOn)]);
        }

        if (Amount == 0)
        {
            yield return new ValidationResult("Amount must not be zero.", [nameof(Amount)]);
        }
    }
}
