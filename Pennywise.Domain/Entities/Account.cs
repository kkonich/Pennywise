namespace Pennywise.Domain.Entities;

public sealed class Account
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public List<Transaction> Transactions { get; set; } = new();
}
