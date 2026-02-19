using System.Threading;
using System.Threading.Tasks;

namespace Pennywise.Application.Interfaces;

public enum DemoDataSeedResult
{
    Created = 0,
    AlreadySeeded = 1
}

public interface IDemoDataService
{
    Task<DemoDataSeedResult> SeedAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(CancellationToken cancellationToken = default);
    Task<bool> ClearAsync(CancellationToken cancellationToken = default);
}
