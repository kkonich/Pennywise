using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Categories;

/// <summary>
/// Response payload for category data.
/// </summary>
public sealed class CategoryResponse
{
    /// <summary>
    /// Unique identifier of the category.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Display name of the category.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Category type (expense or income).
    /// </summary>
    public CategoryType Type { get; set; }

    /// <summary>
    /// Sorting order of the category.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Indicates whether the category is archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Creation timestamp in UTC.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
