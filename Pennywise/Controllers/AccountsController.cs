using Microsoft.AspNetCore.Mvc;
using Pennywise.Application.Interfaces;
using Pennywise.Contracts.Accounts;
using Pennywise.Domain.Entities;

namespace Pennywise.Controllers;

/// <summary>
/// API endpoints for managing accounts.
/// </summary>
[ApiController]
[Route("api/accounts")]
public sealed class AccountsController : ControllerBase
{
    private readonly IAccountRepository _repository;

    /// <summary>
    /// Initializes a new instance of the <see cref="AccountsController"/> class.
    /// </summary>
    /// <param name="repository">Account repository.</param>
    public AccountsController(IAccountRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Returns all accounts sorted by name.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AccountResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var accounts = await _repository.GetAllAsync(cancellationToken);
        var response = accounts.Select(MapToResponse).ToList();
        return Ok(response);
    }

    /// <summary>
    /// Returns a single account by its id.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AccountResponse>> Get(Guid id, CancellationToken cancellationToken)
    {
        var account = await _repository.GetAsync(id, cancellationToken);
        if (account is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(account));
    }

    /// <summary>
    /// Creates a new account.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AccountResponse>> Create(AccountCreateRequest request, CancellationToken cancellationToken)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            CurrencyCode = request.CurrencyCode,
            Balance = request.Balance,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(account, cancellationToken);

        var response = MapToResponse(account);
        return CreatedAtAction(nameof(Get), new { id = account.Id }, response);
    }

    /// <summary>
    /// Updates an existing account.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, AccountUpdateRequest request, CancellationToken cancellationToken)
    {
        var account = await _repository.GetAsync(id, cancellationToken);
        if (account is null)
        {
            return NotFound();
        }

        account.Name = request.Name;
        account.CurrencyCode = request.CurrencyCode;
        account.Balance = request.Balance;

        await _repository.UpdateAsync(account, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Deletes an account by its id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var account = await _repository.GetAsync(id, cancellationToken);
        if (account is null)
        {
            return NotFound();
        }

        await _repository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static AccountResponse MapToResponse(Account account)
    {
        return new AccountResponse
        {
            Id = account.Id,
            Name = account.Name,
            CurrencyCode = account.CurrencyCode,
            Balance = account.Balance,
            CreatedAt = account.CreatedAt
        };
    }
}
