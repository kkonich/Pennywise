using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Pennywise.Infrastructure.Data;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        var connectionString = context.Configuration.GetConnectionString("Pennywise");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Missing connection string 'Pennywise'.");
        }

        services.AddDbContext<PennywiseDbContext>(options =>
            options.UseNpgsql(connectionString));
    })
    .Build();

Console.WriteLine("Pennywise configured. DB context is ready.");
