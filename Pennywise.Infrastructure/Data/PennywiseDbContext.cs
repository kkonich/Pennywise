using Microsoft.EntityFrameworkCore;

namespace Pennywise.Infrastructure.Data;

public sealed class PennywiseDbContext : DbContext
{
    public PennywiseDbContext(DbContextOptions<PennywiseDbContext> options)
        : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
    }
}
