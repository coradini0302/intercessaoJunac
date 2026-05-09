using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Intercessao.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaResponsavelEscala : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResponsavelId",
                table: "Escalas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Escalas_ResponsavelId",
                table: "Escalas",
                column: "ResponsavelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Escalas_AspNetUsers_ResponsavelId",
                table: "Escalas",
                column: "ResponsavelId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Escalas_AspNetUsers_ResponsavelId",
                table: "Escalas");

            migrationBuilder.DropIndex(
                name: "IX_Escalas_ResponsavelId",
                table: "Escalas");

            migrationBuilder.DropColumn(
                name: "ResponsavelId",
                table: "Escalas");
        }
    }
}
