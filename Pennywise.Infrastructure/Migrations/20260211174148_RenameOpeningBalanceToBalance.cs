using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pennywise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameOpeningBalanceToBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpeningBalance",
                table: "Accounts",
                newName: "Balance");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Balance",
                table: "Accounts",
                newName: "OpeningBalance");
        }
    }
}
