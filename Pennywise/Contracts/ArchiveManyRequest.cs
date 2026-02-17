namespace Pennywise.Contracts;

/// <summary>
/// Request payload for archiving multiple entities at once.
/// </summary>
public sealed class ArchiveManyRequest
{
    /// <summary>
    /// Identifiers of the entities to archive.
    /// </summary>
    public List<Guid> Ids { get; set; } = new();
}
