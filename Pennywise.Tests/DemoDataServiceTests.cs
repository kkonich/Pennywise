using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Moq;
using Pennywise.Application.Interfaces;
using Pennywise.Controllers;
using Pennywise.Domain.Entities;
using Pennywise.Infrastructure.Data;
using Pennywise.Infrastructure.Services;
using Xunit;

namespace Pennywise.Tests;

public sealed class DemoDataServiceTests
{
    private static PennywiseDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PennywiseDbContext>()
            .UseInMemoryDatabase(dbName)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new PennywiseDbContext(options);
    }

    [Fact]
    public async Task SeedAsync_InsertsOnce_AndIsIdempotent()
    {
        await using var context = CreateContext(nameof(SeedAsync_InsertsOnce_AndIsIdempotent));
        var service = new DemoDataService(context);

        Assert.False(await service.ExistsAsync());
        var first = await service.SeedAsync();
        Assert.True(await service.ExistsAsync());
        var second = await service.SeedAsync();

        Assert.Equal(DemoDataSeedResult.Created, first);
        Assert.Equal(DemoDataSeedResult.AlreadySeeded, second);
        Assert.Equal(2, await context.Accounts.CountAsync());
        Assert.Equal(7, await context.Categories.CountAsync());
        Assert.Equal(11, await context.Transactions.CountAsync());
    }

    [Fact]
    public async Task SeedAsync_AbortsWhenPartialDemoDataExists()
    {
        await using var context = CreateContext(nameof(SeedAsync_AbortsWhenPartialDemoDataExists));
        var service = new DemoDataService(context);

        context.Accounts.Add(new Account
        {
            Id = new Guid("11111111-1111-1111-1111-111111111111"),
            Name = "Existing",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await context.SaveChangesAsync();

        var result = await service.SeedAsync();

        Assert.Equal(DemoDataSeedResult.AlreadySeeded, result);
        Assert.True(await service.ExistsAsync());
        Assert.Single(context.Accounts);
        Assert.Equal(0, await context.Transactions.CountAsync());
    }

    [Fact]
    public async Task ClearAsync_RemovesDemoDataAndIsIdempotent()
    {
        await using var context = CreateContext(nameof(ClearAsync_RemovesDemoDataAndIsIdempotent));
        var service = new DemoDataService(context);

        await service.SeedAsync();
        var removedFirst = await service.ClearAsync();
        var removedSecond = await service.ClearAsync();

        Assert.True(removedFirst);
        Assert.False(removedSecond);
        Assert.False(await service.ExistsAsync());
        Assert.Equal(0, await context.Accounts.CountAsync());
        Assert.Equal(0, await context.Categories.CountAsync());
        Assert.Equal(0, await context.Transactions.CountAsync());
    }

    [Fact]
    public async Task ClearAsync_DoesNotDeleteNonDemoData()
    {
        await using var context = CreateContext(nameof(ClearAsync_DoesNotDeleteNonDemoData));
        var service = new DemoDataService(context);

        var otherAccountId = Guid.NewGuid();
        context.Accounts.Add(new Account
        {
            Id = otherAccountId,
            Name = "MyAccount",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await context.SaveChangesAsync();

        await service.SeedAsync();
        await service.ClearAsync();

        Assert.Single(context.Accounts); // the non-demo account remains
        Assert.Equal(otherAccountId, context.Accounts.Single().Id);
        Assert.False(await service.ExistsAsync());
    }

    [Fact]
    public async Task ExistsAsync_IsTrue_WhenAnyDemoTransactionPresent()
    {
        await using var context = CreateContext(nameof(ExistsAsync_IsTrue_WhenAnyDemoTransactionPresent));
        var service = new DemoDataService(context);

        context.Transactions.Add(new Transaction
        {
            Id = new Guid("aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
            AccountId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Type = TransactionType.Income,
            Amount = 10,
            BookedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTimeOffset.UtcNow
        });
        await context.SaveChangesAsync();

        Assert.True(await service.ExistsAsync());
    }
}

public sealed class DemoDataControllerTests
{
    private static DemoDataController CreateController(DemoDataSeedResult seedResult, bool clearResult, bool isDev)
    {
        var service = new Mock<IDemoDataService>();
        service.Setup(s => s.SeedAsync(It.IsAny<System.Threading.CancellationToken>())).ReturnsAsync(seedResult);
        service.Setup(s => s.ClearAsync(It.IsAny<System.Threading.CancellationToken>())).ReturnsAsync(clearResult);
        service.Setup(s => s.ExistsAsync(It.IsAny<System.Threading.CancellationToken>())).ReturnsAsync(true);

        var env = new Mock<Microsoft.Extensions.Hosting.IHostEnvironment>();
        env.Setup(e => e.IsDevelopment()).Returns(isDev);

        return new DemoDataController(service.Object, env.Object);
    }

    [Fact]
    public async Task Seed_Returns404_WhenNotDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, true, isDev: false);
        var result = await controller.Seed(default);
        Assert.IsType<Microsoft.AspNetCore.Mvc.NotFoundResult>(result);
    }

    [Fact]
    public async Task Seed_Returns201_WhenCreated_InDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, true, isDev: true);
        var action = await controller.Seed(default);
        var objectResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ObjectResult>(action);
        Assert.Equal(StatusCodes.Status201Created, objectResult.StatusCode);
    }

    [Fact]
    public async Task Seed_Returns409_WhenAlreadySeeded_InDev()
    {
        var controller = CreateController(DemoDataSeedResult.AlreadySeeded, true, isDev: true);
        var action = await controller.Seed(default);
        var objectResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ObjectResult>(action);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    [Fact]
    public async Task Clear_Returns404_WhenNotDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, clearResult: true, isDev: false);
        var result = await controller.Clear(default);
        Assert.IsType<Microsoft.AspNetCore.Mvc.NotFoundResult>(result);
    }

    [Fact]
    public async Task Clear_Returns204_WhenRemoved_InDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, clearResult: true, isDev: true);
        var action = await controller.Clear(default);
        Assert.IsType<Microsoft.AspNetCore.Mvc.NoContentResult>(action);
    }

    [Fact]
    public async Task Clear_Returns404_WhenNoData_InDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, clearResult: false, isDev: true);
        var action = await controller.Clear(default);
        var objectResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ObjectResult>(action);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    [Fact]
    public async Task Exists_Returns404_WhenNotDev()
    {
        var controller = CreateController(DemoDataSeedResult.Created, clearResult: true, isDev: false);
        var result = await controller.Exists(default);
        Assert.IsType<Microsoft.AspNetCore.Mvc.NotFoundResult>(result);
    }

    [Fact]
    public async Task Exists_ReturnsOk_WithFlag_InDev()
    {
        var service = new Mock<IDemoDataService>();
        service.Setup(s => s.ExistsAsync(It.IsAny<System.Threading.CancellationToken>())).ReturnsAsync(true);

        var env = new Mock<IHostEnvironment>();
        env.Setup(e => e.IsDevelopment()).Returns(true);

        var controller = new DemoDataController(service.Object, env.Object);

        var action = await controller.Exists(default);
        var ok = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(action);
        dynamic payload = ok.Value!;
        Assert.True((bool)payload.exists);
    }
}
