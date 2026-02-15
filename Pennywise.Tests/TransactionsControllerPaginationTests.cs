using System;
using System.Collections.Generic;
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

public sealed class TransactionsControllerPaginationTests
{
    [Fact(DisplayName = "GetAll returns paged response with metadata")]
    public async Task GetAll_valid_query_returns_page_response()
    {
        var transactionRepository = new Mock<ITransactionRepository>();
        var accountRepository = new Mock<IAccountRepository>();
        var categoryRepository = new Mock<ICategoryRepository>();

        var transactions = new List<Transaction>
        {
            new()
            {
                Id = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid(),
                BookedOn = new DateOnly(2026, 1, 12),
                Amount = 19.99m,
                Note = "Groceries",
                Merchant = "Market",
                CreatedAt = new DateTimeOffset(2026, 1, 12, 10, 0, 0, TimeSpan.Zero)
            },
            new()
            {
                Id = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid(),
                BookedOn = new DateOnly(2026, 1, 11),
                Amount = 3.50m,
                Note = "Coffee",
                Merchant = "Cafe",
                CreatedAt = new DateTimeOffset(2026, 1, 11, 9, 0, 0, TimeSpan.Zero)
            }
        };

        transactionRepository
            .Setup(r => r.GetPagedAsync(2, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync((transactions, 5));

        var controller = new TransactionsController(
            transactionRepository.Object,
            accountRepository.Object,
            categoryRepository.Object);

        var result = await controller.GetAll(page: 2, pageSize: 2, cancellationToken: CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<TransactionPageResponse>(ok.Value);
        Assert.Equal(5, response.TotalCount);
        Assert.Equal(2, response.Page);
        Assert.Equal(2, response.PageSize);
        Assert.Equal(3, response.TotalPages);
        Assert.Equal(2, response.Items.Count);
        Assert.Equal(transactions[0].Id, response.Items[0].Id);
        Assert.Equal(transactions[1].Id, response.Items[1].Id);
    }

    [Fact(DisplayName = "GetAll returns 400 when page is less than 1")]
    public async Task GetAll_invalid_page_returns_bad_request()
    {
        var transactionRepository = new Mock<ITransactionRepository>();
        var controller = new TransactionsController(
            transactionRepository.Object,
            Mock.Of<IAccountRepository>(),
            Mock.Of<ICategoryRepository>());

        var result = await controller.GetAll(page: 0, pageSize: 25, cancellationToken: CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Query parameter 'page' must be greater than or equal to 1.", badRequest.Value);
        transactionRepository.Verify(
            r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "GetAll returns 400 when pageSize is outside allowed range")]
    public async Task GetAll_invalid_page_size_returns_bad_request()
    {
        var transactionRepository = new Mock<ITransactionRepository>();
        var controller = new TransactionsController(
            transactionRepository.Object,
            Mock.Of<IAccountRepository>(),
            Mock.Of<ICategoryRepository>());

        var result = await controller.GetAll(page: 1, pageSize: 101, cancellationToken: CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Query parameter 'pageSize' must be between 1 and 100.", badRequest.Value);
        transactionRepository.Verify(
            r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "GetAll returns zero total pages when there are no transactions")]
    public async Task GetAll_without_items_returns_zero_total_pages()
    {
        var transactionRepository = new Mock<ITransactionRepository>();
        transactionRepository
            .Setup(r => r.GetPagedAsync(1, 25, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Transaction>(), 0));

        var controller = new TransactionsController(
            transactionRepository.Object,
            Mock.Of<IAccountRepository>(),
            Mock.Of<ICategoryRepository>());

        var result = await controller.GetAll(page: 1, pageSize: 25, cancellationToken: CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<TransactionPageResponse>(ok.Value);
        Assert.Equal(0, response.TotalCount);
        Assert.Equal(0, response.TotalPages);
        Assert.Empty(response.Items);
    }
}
