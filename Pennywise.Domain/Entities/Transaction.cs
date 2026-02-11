namespace Pennywise.Domain.Entities;

public sealed class Transaction
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public DateOnly BookedOn { get; set; }
    public decimal Amount { get; set; }
    public string Note { get; set; } = string.Empty;
    public string? Merchant { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Account? Account { get; set; }
    public Category? Category { get; set; }
}
