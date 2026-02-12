using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pennywise.Contracts.Transactions;
using Xunit;

namespace Pennywise.Tests;

public sealed class TransactionRequestValidationTests
{
    [Fact(DisplayName = "TransactionCreateRequest requires core booking fields")]
    public void CreateRequest_missing_required_fields_returns_validation_errors()
    {
        var request = new TransactionCreateRequest();

        var errors = Validate(request);

        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionCreateRequest.AccountId)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionCreateRequest.CategoryId)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionCreateRequest.BookedOn)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionCreateRequest.Amount)));
    }

    [Fact(DisplayName = "TransactionUpdateRequest requires core booking fields")]
    public void UpdateRequest_missing_required_fields_returns_validation_errors()
    {
        var request = new TransactionUpdateRequest();

        var errors = Validate(request);

        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionUpdateRequest.AccountId)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionUpdateRequest.CategoryId)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionUpdateRequest.BookedOn)));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(TransactionUpdateRequest.Amount)));
    }

    [Fact(DisplayName = "TransactionCreateRequest passes with valid required fields")]
    public void CreateRequest_with_required_fields_is_valid()
    {
        var request = new TransactionCreateRequest
        {
            AccountId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = 123.45m,
            Note = string.Empty
        };

        var errors = Validate(request);

        Assert.Empty(errors);
    }

    private static List<ValidationResult> Validate(object instance)
    {
        var context = new ValidationContext(instance);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(instance, context, results, validateAllProperties: true);
        return results;
    }
}
