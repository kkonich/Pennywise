using Microsoft.AspNetCore.Mvc;
using Pennywise.Application.Interfaces;
using Pennywise.Contracts.Transactions;
using Pennywise.Domain.Entities;

namespace Pennywise.Controllers;

/// <summary>
/// API endpoints for managing transactions.
/// </summary>
[ApiController]
[Route("api/transactions")]
public sealed class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _repository;
    private readonly IAccountRepository _accountRepository;
    private readonly ICategoryRepository _categoryRepository;

    /// <summary>
    /// Initializes a new instance of the <see cref="TransactionsController"/> class.
    /// </summary>
    /// <param name="repository">Transaction repository.</param>
    /// <param name="accountRepository">Account repository.</param>
    /// <param name="categoryRepository">Category repository.</param>
    public TransactionsController(
        ITransactionRepository repository,
        IAccountRepository accountRepository,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _accountRepository = accountRepository;
        _categoryRepository = categoryRepository;
    }

    /// <summary>
    /// Returns all transactions sorted by booked date, newest first.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransactionResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var transactions = await _repository.GetAllAsync(cancellationToken);
        var response = transactions.Select(MapToResponse).ToList();
        return Ok(response);
    }

    /// <summary>
    /// Returns all transactions for a specific account id.
    /// </summary>
    [HttpGet("account/{accountId:guid}")]
    public async Task<ActionResult<IReadOnlyList<TransactionResponse>>> GetByAccountId(Guid accountId, CancellationToken cancellationToken)
    {
        var transactions = await _repository.GetByAccountIdAsync(accountId, cancellationToken);
        var response = transactions.Select(MapToResponse).ToList();
        return Ok(response);
    }

    /// <summary>
    /// Returns a single transaction by its id.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransactionResponse>> Get(Guid id, CancellationToken cancellationToken)
    {
        var transaction = await _repository.GetAsync(id, cancellationToken);
        if (transaction is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(transaction));
    }

    /// <summary>
    /// Creates a new transaction.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> Create(TransactionCreateRequest request, CancellationToken cancellationToken)
    {
        var referenceError = await ValidateReferencesAsync(request.AccountId, request.CategoryId, cancellationToken);
        if (referenceError is not null)
        {
            return referenceError;
        }

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            BookedOn = request.BookedOn,
            Amount = request.Amount,
            Note = request.Note,
            Merchant = request.Merchant,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(transaction, cancellationToken);

        var response = MapToResponse(transaction);
        return CreatedAtAction(nameof(Get), new { id = transaction.Id }, response);
    }

    /// <summary>
    /// Updates an existing transaction.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, TransactionUpdateRequest request, CancellationToken cancellationToken)
    {
        var transaction = await _repository.GetAsync(id, cancellationToken);
        if (transaction is null)
        {
            return NotFound();
        }

        var referenceError = await ValidateReferencesAsync(request.AccountId, request.CategoryId, cancellationToken);
        if (referenceError is not null)
        {
            return referenceError;
        }

        transaction.AccountId = request.AccountId;
        transaction.CategoryId = request.CategoryId;
        transaction.BookedOn = request.BookedOn;
        transaction.Amount = request.Amount;
        transaction.Note = request.Note;
        transaction.Merchant = request.Merchant;

        await _repository.UpdateAsync(transaction, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Deletes a transaction by its id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var transaction = await _repository.GetAsync(id, cancellationToken);
        if (transaction is null)
        {
            return NotFound();
        }

        await _repository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static TransactionResponse MapToResponse(Transaction transaction)
    {
        return new TransactionResponse
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            CategoryId = transaction.CategoryId,
            BookedOn = transaction.BookedOn,
            Amount = transaction.Amount,
            Note = transaction.Note,
            Merchant = transaction.Merchant,
            CreatedAt = transaction.CreatedAt
        };
    }

    private async Task<ActionResult?> ValidateReferencesAsync(Guid accountId, Guid categoryId, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        var account = await _accountRepository.GetAsync(accountId, cancellationToken);
        if (account is null)
        {
            errors[nameof(TransactionCreateRequest.AccountId)] = ["Referenced account was not found."];
        }

        var category = await _categoryRepository.GetAsync(categoryId, cancellationToken);
        if (category is null)
        {
            errors[nameof(TransactionCreateRequest.CategoryId)] = ["Referenced category was not found."];
        }

        if (errors.Count == 0)
        {
            return null;
        }

        return ValidationProblem(new ValidationProblemDetails(errors));
    }
}
