using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Pennywise.Infrastructure.Data;

#nullable disable

namespace Pennywise.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PennywiseDbContext))]
    [Migration("20260216173000_AddUserSettings")]
    public partial class AddUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.Id);
                });

            // Seed singleton row; raw SQL avoids model-mapping issues during migration.
            migrationBuilder.Sql(
                """
                INSERT INTO "UserSettings" ("Id", "CurrencyCode", "CreatedAt", "UpdatedAt")
                VALUES ('00000000-0000-0000-0000-000000000001', 'EUR', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
                ON CONFLICT DO NOTHING;
                """);

            migrationBuilder.Sql(
                @"UPDATE ""Accounts"" SET ""CurrencyCode"" = 'EUR' WHERE ""CurrencyCode"" IS NULL OR ""CurrencyCode"" = '';"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSettings");
        }
    }
}
