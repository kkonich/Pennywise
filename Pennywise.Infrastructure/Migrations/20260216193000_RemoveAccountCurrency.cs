using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Pennywise.Infrastructure.Data;

#nullable disable

namespace Pennywise.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PennywiseDbContext))]
    [Migration("20260216193000_RemoveAccountCurrency")]
    public partial class RemoveAccountCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyCode",
                table: "Accounts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrencyCode",
                table: "Accounts",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "EUR");
        }
    }
}
