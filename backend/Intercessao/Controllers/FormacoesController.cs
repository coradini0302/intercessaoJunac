using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/formacoes")]
[Authorize]
public class FormacoesController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var formacoes = await db.Formacoes
            .Include(f => f.CriadoPor)
            .OrderByDescending(f => f.CriadoEm)
            .ToListAsync();

        return Ok(formacoes.Select(Mapear));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var formacao = await db.Formacoes
            .Include(f => f.CriadoPor)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (formacao is null) return NotFound();
        return Ok(Mapear(formacao));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] FormacaoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Título e conteúdo são obrigatórios." });

        var formacao = new Formacao
        {
            Titulo = request.Titulo.Trim(),
            Conteudo = request.Conteudo.Trim(),
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow,
        };

        db.Formacoes.Add(formacao);
        await db.SaveChangesAsync();
        await db.Entry(formacao).Reference(f => f.CriadoPor).LoadAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = formacao.Id }, Mapear(formacao));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] FormacaoRequest request)
    {
        var formacao = await db.Formacoes.Include(f => f.CriadoPor).FirstOrDefaultAsync(f => f.Id == id);
        if (formacao is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Título e conteúdo são obrigatórios." });

        formacao.Titulo = request.Titulo.Trim();
        formacao.Conteudo = request.Conteudo.Trim();
        formacao.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(formacao));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var formacao = await db.Formacoes.FindAsync(id);
        if (formacao is null) return NotFound();

        db.Formacoes.Remove(formacao);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static FormacaoResponse Mapear(Formacao f) => new(
        f.Id, f.Titulo, f.Conteudo,
        f.CriadoPorId, f.CriadoPor?.Nome ?? string.Empty,
        f.CriadoEm, f.AtualizadoEm
    );
}
