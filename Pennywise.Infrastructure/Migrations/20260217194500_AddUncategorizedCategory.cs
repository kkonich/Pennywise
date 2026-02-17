using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pennywise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUncategorizedCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO "Category" ("Id", "Name", "Type", "SortOrder", "IsArchived", "CreatedAt")
                VALUES ('00000000-0000-0000-0000-000000000002', 'Uncategorized', 0, 0, FALSE, NOW() AT TIME ZONE 'UTC')
                ON CONFLICT ("Id") DO UPDATE
                  SET "IsArchived" = FALSE,
                      "Name" = EXCLUDED."Name",
                      "Type" = EXCLUDED."Type",
                      "SortOrder" = EXCLUDED."SortOrder";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"Category\" WHERE \"Id\" = '00000000-0000-0000-0000-000000000002';");
        }
    }
}
