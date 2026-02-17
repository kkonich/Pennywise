using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Pennywise.Application.Interfaces;
using Pennywise.Contracts.Transactions;
using Pennywise.Controllers;
using Pennywise.Domain.Entities;
using Xunit;

namespace Pennywise.Tests;

public sealed class TransactionsControllerReferenceValidationTests
{
    // Missing account reference must short-circuit with 400.
    [Fact(DisplayName = "Create returns 400 when AccountId does not exist")]
    public async Task Create_unknown_account_returns_bad_request()
    {
        var sut = CreateSut();

        var categoryId = Guid.NewGuid();

        SetupAccountMissing(sut);
        SetupCategoryExists(sut, categoryId);

        // Act
        var result = await sut.Controller.Create(
            CreateValidCreateRequest(Guid.NewGuid(), categoryId),
            CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problem = Assert.IsType<ValidationProblemDetails>(badRequest.Value);
        Assert.Contains(nameof(TransactionCreateRequest.AccountId), problem.Errors.Keys);

        sut.TransactionRepository.Verify(
            r => r.AddAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    // Missing category reference must short-circuit with 400.
    [Fact(DisplayName = "Create returns 400 when CategoryId does not exist")]
    public async Task Create_unknown_category_returns_bad_request()
    {
        var sut = CreateSut();

        var accountId = Guid.NewGuid();

        SetupAccountExists(sut, accountId);
        SetupCategoryMissing(sut);

        // Act
        var result = await sut.Controller.Create(
            CreateValidCreateRequest(accountId, Guid.NewGuid()),
            CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problem = Assert.IsType<ValidationProblemDetails>(badRequest.Value);
        Assert.Contains(nameof(TransactionCreateRequest.CategoryId), problem.Errors.Keys);

        sut.TransactionRepository.Verify(
            r => r.AddAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    // Update validates references before persisting any changes.
    [Fact(DisplayName = "Update returns 400 when referenced ids do not exist")]
    public async Task Update_unknown_references_returns_bad_request()
    {
        var sut = CreateSut();

        var existingTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 25m,
            Note = "Lunch",
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Existing transaction required so Update reaches reference validation path.
        sut.TransactionRepository
            .Setup(r => r.GetAsync(existingTransaction.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTransaction);
        SetupAccountMissing(sut);
        SetupCategoryMissing(sut);

        // Act
        var result = await sut.Controller.Update(
            existingTransaction.Id,
            CreateValidUpdateRequest(Guid.NewGuid(), Guid.NewGuid()),
            CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var problem = Assert.IsType<ValidationProblemDetails>(badRequest.Value);
        Assert.Contains(nameof(TransactionUpdateRequest.AccountId), problem.Errors.Keys);
        Assert.Contains(nameof(TransactionUpdateRequest.CategoryId), problem.Errors.Keys);

        sut.TransactionRepository.Verify(
            r => r.UpdateAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    // Valid references should create a transaction and return 201.
    [Fact(DisplayName = "Create returns 201 when AccountId and CategoryId exist")]
    public async Task Create_valid_references_returns_created()
    {
        var sut = CreateSut();

        var accountId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        SetupAccountExists(sut, accountId);
        SetupCategoryExists(sut, categoryId);

        // Act
        var result = await sut.Controller.Create(
            CreateValidCreateRequest(accountId, categoryId),
            CancellationToken.None);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(TransactionsController.Get), created.ActionName);

        sut.TransactionRepository.Verify(
            r => r.AddAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static TransactionCreateRequest CreateValidCreateRequest(Guid accountId, Guid categoryId)
    {
        return new TransactionCreateRequest
        {
            AccountId = accountId,
            CategoryId = categoryId,
            Type = TransactionType.Expense,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 10m,
            Note = "Coffee"
        };
    }

    private static TransactionUpdateRequest CreateValidUpdateRequest(Guid accountId, Guid categoryId)
    {
        return new TransactionUpdateRequest
        {
            AccountId = accountId,
            CategoryId = categoryId,
            Type = TransactionType.Income,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 30m,
            Note = "Updated"
        };
    }

    private static Sut CreateSut()
    {
        var transactionRepository = new Mock<ITransactionRepository>();
        var accountRepository = new Mock<IAccountRepository>();
        var categoryRepository = new Mock<ICategoryRepository>();
        var controller = new TransactionsController(
            transactionRepository.Object,
            accountRepository.Object,
            categoryRepository.Object);

        return new Sut(controller, transactionRepository, accountRepository, categoryRepository);
    }

    private static Account NewAccount(Guid id)
    {
        return new Account
        {
            Id = id,
            Name = "Cash",
            Balance = 0m,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static Category NewCategory(Guid id)
    {
        return new Category
        {
            Id = id,
            Name = "Food",
            Type = CategoryType.Expense,
            SortOrder = 1,
            IsArchived = false,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private sealed record Sut(
        TransactionsController Controller,
        Mock<ITransactionRepository> TransactionRepository,
        Mock<IAccountRepository> AccountRepository,
        Mock<ICategoryRepository> CategoryRepository);

    // Configure account lookup to resolve successfully for a specific id.
    private static void SetupAccountExists(Sut sut, Guid accountId)
    {
        sut.AccountRepository
            .Setup(r => r.GetAsync(accountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(NewAccount(accountId));
    }

    // Configure account lookup to always fail.
    private static void SetupAccountMissing(Sut sut)
    {
        sut.AccountRepository
            .Setup(r => r.GetAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Account?)null);
    }

    // Configure category lookup to resolve successfully for a specific id.
    private static void SetupCategoryExists(Sut sut, Guid categoryId)
    {
        sut.CategoryRepository
            .Setup(r => r.GetAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(NewCategory(categoryId));
    }

    // Configure category lookup to always fail.
    private static void SetupCategoryMissing(Sut sut)
    {
        sut.CategoryRepository
            .Setup(r => r.GetAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);
    }
}
