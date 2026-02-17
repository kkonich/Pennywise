using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Pennywise.Infrastructure.Data;

#nullable disable

namespace Pennywise.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PennywiseDbContext))]
    [Migration("20260215164000_AddTransactionQueryIndexes")]
    public partial class AddTransactionQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Transaction_BookedOn_CreatedAt",
                table: "Transaction",
                columns: new[] { "BookedOn", "CreatedAt" });

            migrationBuilder.Sql(@"CREATE EXTENSION IF NOT EXISTS pg_trgm;");
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ""IX_Transaction_Note_Trgm"" ON ""Transaction"" USING GIN (""Note"" gin_trgm_ops);");
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ""IX_Transaction_Merchant_Trgm"" ON ""Transaction"" USING GIN (""Merchant"" gin_trgm_ops) WHERE ""Merchant"" IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_Transaction_Merchant_Trgm"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_Transaction_Note_Trgm"";");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_BookedOn_CreatedAt",
                table: "Transaction");
        }
    }
}
