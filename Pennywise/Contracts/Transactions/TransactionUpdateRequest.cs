using System.ComponentModel.DataAnnotations;
using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Request payload for updating a transaction.
/// </summary>
public sealed class TransactionUpdateRequest : IValidatableObject
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
    /// Updated transaction type (Income or Expense). Defaults to the category's type when omitted.
    /// </summary>
    public TransactionType? Type { get; set; }

    /// <summary>
    /// Updated booking date of the transaction.
    /// </summary>
    public DateOnly BookedOn { get; set; }

    /// <summary>
    /// Updated transaction amount.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Updated note for the transaction.
    /// </summary>
    public string Note { get; set; } = string.Empty;

    /// <summary>
    /// Updated merchant name for the transaction.
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
