using Pennywise.Domain.Entities;

namespace Pennywise.Contracts.Categories;

/// <summary>
/// Request payload for updating a category.
/// </summary>
public sealed class CategoryUpdateRequest
{
    /// <summary>
    /// Updated display name of the category.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Updated category type (expense or income).
    /// </summary>
    public CategoryType Type { get; set; }

    /// <summary>
    /// Updated sorting order of the category.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Updated archived status of the category.
    /// </summary>
    public bool IsArchived { get; set; }
}
