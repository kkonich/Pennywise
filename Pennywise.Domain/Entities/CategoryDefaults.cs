using System;

namespace Pennywise.Domain.Entities;

/// <summary>
/// Default category constants.
/// </summary>
public static class CategoryDefaults
{
    public static readonly Guid UncategorizedId = new("00000000-0000-0000-0000-000000000002");
    public const string UncategorizedName = "Uncategorized";
}
