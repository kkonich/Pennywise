using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Categories;

/// <summary>
/// Request payload for creating a category.
/// </summary>
public sealed class CategoryCreateRequest
{
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
    public bool? IsArchived { get; set; }
}
