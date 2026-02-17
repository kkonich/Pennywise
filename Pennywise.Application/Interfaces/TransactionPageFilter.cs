using Pennywise.Domain.Entities;

namespace Pennywise.Application.Interfaces;

public sealed class TransactionPageFilter
{
    public Guid? AccountId { get; init; }
    public Guid? CategoryId { get; init; }
    public DateOnly? BookedFrom { get; init; }
    public DateOnly? BookedTo { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public string? SearchTerm { get; init; }
    public TransactionType? Type { get; init; }
}
