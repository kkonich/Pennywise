using Microsoft.AspNetCore.Mvc;
using Pennywise.Application.Interfaces;
using Pennywise.Contracts.Settings;

namespace Pennywise.Controllers;

/// <summary>
/// API endpoints for user-wide settings.
/// </summary>
[ApiController]
[Route("api/settings")]
public sealed class SettingsController : ControllerBase
{
    private readonly IUserSettingsRepository _settingsRepository;

    public SettingsController(IUserSettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    /// <summary>
    /// Returns current user settings.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SettingsResponse>> Get(CancellationToken cancellationToken)
    {
        var settings = await _settingsRepository.GetAsync(cancellationToken);
        return Ok(new SettingsResponse { CurrencyCode = settings.CurrencyCode });
    }

    /// <summary>
    /// Updates user settings.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<SettingsResponse>> Update(SettingsUpdateRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.CurrencyCode))
        {
            return BadRequest("Currency code must not be empty.");
        }

        var normalizedCode = request.CurrencyCode.Trim().ToUpperInvariant();
        if (normalizedCode.Length != 3)
        {
            return BadRequest("Currency code must be a 3-letter ISO value.");
        }
        var settings = await _settingsRepository.SetCurrencyCodeAsync(normalizedCode, cancellationToken);
        return Ok(new SettingsResponse { CurrencyCode = settings.CurrencyCode });
    }
}
