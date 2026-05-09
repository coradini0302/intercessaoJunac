using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Intercessao.Migrations
{
    /// <inheritdoc />
    public partial class ReestruturaCompromissos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompromisoOracao");

            migrationBuilder.AddColumn<string>(
                name: "EquipeIntercessao",
                table: "AspNetUsers",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CompromissosEquipe",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EncontroId = table.Column<int>(type: "INTEGER", nullable: false),
                    NumeroSemana = table.Column<int>(type: "INTEGER", nullable: false),
                    Titulo = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Conteudo = table.Column<string>(type: "TEXT", nullable: false),
                    CriadoPorId = table.Column<string>(type: "TEXT", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompromissosEquipe", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompromissosEquipe_AspNetUsers_CriadoPorId",
                        column: x => x.CriadoPorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompromissosEquipe_Encontros_EncontroId",
                        column: x => x.EncontroId,
                        principalTable: "Encontros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompromissosIntercedidos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UsuarioId = table.Column<string>(type: "TEXT", nullable: false),
                    Titulo = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Conteudo = table.Column<string>(type: "TEXT", nullable: false),
                    Ativo = table.Column<bool>(type: "INTEGER", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompromissosIntercedidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompromissosIntercedidos_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompromissosEquipe_CriadoPorId",
                table: "CompromissosEquipe",
                column: "CriadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_CompromissosEquipe_EncontroId_NumeroSemana",
                table: "CompromissosEquipe",
                columns: new[] { "EncontroId", "NumeroSemana" });

            migrationBuilder.CreateIndex(
                name: "IX_CompromissosIntercedidos_UsuarioId",
                table: "CompromissosIntercedidos",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompromissosEquipe");

            migrationBuilder.DropTable(
                name: "CompromissosIntercedidos");

            migrationBuilder.DropColumn(
                name: "EquipeIntercessao",
                table: "AspNetUsers");

            migrationBuilder.CreateTable(
                name: "CompromisoOracao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UsuarioId = table.Column<string>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Conteudo = table.Column<string>(type: "TEXT", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataFimSemana = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataInicioSemana = table.Column<DateTime>(type: "TEXT", nullable: false),
                    NumeroSemana = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompromisoOracao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompromisoOracao_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompromisoOracao_UsuarioId_NumeroSemana",
                table: "CompromisoOracao",
                columns: new[] { "UsuarioId", "NumeroSemana" },
                unique: true);
        }
    }
}
