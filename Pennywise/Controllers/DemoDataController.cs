using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pennywise.Application.Interfaces;
using Microsoft.Extensions.Hosting;

namespace Pennywise.Controllers;

/// <summary>
/// Provides a secured endpoint to insert one-off demo data into the database.
/// </summary>
[ApiController]
[Route("api/demo-data")]
public sealed class DemoDataController : ControllerBase
{
    private readonly IDemoDataService _demoDataService;
    private readonly IHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the <see cref="DemoDataController"/> class.
    /// </summary>
    /// <param name="demoDataService">Service that seeds demo data.</param>
    /// <param name="environment">Host environment for dev-only guarding.</param>
    public DemoDataController(IDemoDataService demoDataService, IHostEnvironment environment)
    {
        _demoDataService = demoDataService;
        _environment = environment;
    }

    /// <summary>
    /// Inserts demo accounts, categories, and transactions once. Subsequent calls return 409.
    /// </summary>
    [HttpPost("seed")]
    public async Task<ActionResult> Seed(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var result = await _demoDataService.SeedAsync(cancellationToken);

        return result switch
        {
            DemoDataSeedResult.AlreadySeeded => Conflict(new { message = "Demo data has already been created." }),
            _ => StatusCode(StatusCodes.Status201Created, new { message = "Demo data inserted." })
        };
    }

    /// <summary>
    /// Removes the previously inserted demo data set. If not present, returns 404.
    /// </summary>
    [HttpDelete("seed")]
    public async Task<ActionResult> Clear(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var removed = await _demoDataService.ClearAsync(cancellationToken);
        return removed
            ? NoContent()
            : NotFound(new { message = "No demo data to remove." });
    }
}
