namespace Pennywise.Contracts.Transactions;

/// <summary>
/// Represents a paged transaction result including items and pagination metadata.
/// </summary>
public sealed class TransactionPageResponse
{
    /// <summary>
    /// The transactions returned for the requested page.
    /// </summary>
    public required IReadOnlyList<TransactionResponse> Items { get; init; }

    /// <summary>
    /// The total number of transactions across all pages.
    /// </summary>
    public required int TotalCount { get; init; }

    /// <summary>
    /// The current page number (1-based).
    /// </summary>
    public required int Page { get; init; }

    /// <summary>
    /// The requested number of items per page.
    /// </summary>
    public required int PageSize { get; init; }

    /// <summary>
    /// The total number of available pages for the given page size.
    /// </summary>
    public required int TotalPages { get; init; }
}
