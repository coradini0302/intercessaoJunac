using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/alto-mar")]
[Authorize]
public class AltoMarController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    private bool IsAdmin => User.IsInRole(Roles.DevAdmin) || User.IsInRole(Roles.Admin);

    // GET /api/alto-mar
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var ideias = await db.AltoMarIdeias
            .Include(i => i.CriadoPor)
            .Include(i => i.Comentarios).ThenInclude(c => c.CriadoPor)
            .OrderByDescending(i => i.CriadoEm)
            .ToListAsync();

        return Ok(ideias.Select(MapIdeia));
    }

    // POST /api/alto-mar
    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarAltoMarIdeiaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Título e conteúdo são obrigatórios." });

        var ideia = new AltoMarIdeia
        {
            Titulo = request.Titulo.Trim(),
            Conteudo = request.Conteudo.Trim(),
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow
        };

        db.AltoMarIdeias.Add(ideia);
        await db.SaveChangesAsync();
        await db.Entry(ideia).Reference(i => i.CriadoPor).LoadAsync();

        return Ok(MapIdeia(ideia));
    }

    // PUT /api/alto-mar/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] AtualizarAltoMarIdeiaRequest request)
    {
        var ideia = await db.AltoMarIdeias
            .Include(i => i.CriadoPor)
            .Include(i => i.Comentarios).ThenInclude(c => c.CriadoPor)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (ideia is null) return NotFound();
        if (ideia.CriadoPorId != UserId) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Título e conteúdo são obrigatórios." });

        ideia.Titulo = request.Titulo.Trim();
        ideia.Conteudo = request.Conteudo.Trim();
        ideia.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(MapIdeia(ideia));
    }

    // DELETE /api/alto-mar/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var ideia = await db.AltoMarIdeias.FindAsync(id);
        if (ideia is null) return NotFound();
        if (ideia.CriadoPorId != UserId && !IsAdmin) return Forbid();

        db.AltoMarIdeias.Remove(ideia);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/alto-mar/{id}/comentarios
    [HttpPost("{id:int}/comentarios")]
    public async Task<IActionResult> Comentar(int id, [FromBody] CriarAltoMarComentarioRequest request)
    {
        if (!await db.AltoMarIdeias.AnyAsync(i => i.Id == id)) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Texto))
            return BadRequest(new { erro = "Texto é obrigatório." });

        var comentario = new AltoMarComentario
        {
            IdeiaId = id,
            Texto = request.Texto.Trim(),
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow
        };

        db.AltoMarComentarios.Add(comentario);
        await db.SaveChangesAsync();
        await db.Entry(comentario).Reference(c => c.CriadoPor).LoadAsync();

        return Ok(MapComentario(comentario));
    }

    // DELETE /api/alto-mar/{id}/comentarios/{comentarioId}
    [HttpDelete("{id:int}/comentarios/{comentarioId:int}")]
    public async Task<IActionResult> DeletarComentario(int id, int comentarioId)
    {
        var comentario = await db.AltoMarComentarios
            .FirstOrDefaultAsync(c => c.Id == comentarioId && c.IdeiaId == id);

        if (comentario is null) return NotFound();
        if (comentario.CriadoPorId != UserId && !IsAdmin) return Forbid();

        db.AltoMarComentarios.Remove(comentario);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static AltoMarIdeiaResponse MapIdeia(AltoMarIdeia i) => new(
        i.Id, i.Titulo, i.Conteudo,
        i.CriadoPorId, i.CriadoPor?.Nome ?? string.Empty, i.CriadoPor?.FotoUrl,
        i.CriadoEm, i.AtualizadoEm,
        (i.Comentarios ?? []).OrderBy(c => c.CriadoEm).Select(MapComentario).ToList()
    );

    private static AltoMarComentarioResponse MapComentario(AltoMarComentario c) => new(
        c.Id, c.Texto, c.CriadoPorId, c.CriadoPor?.Nome ?? string.Empty, c.CriadoPor?.FotoUrl, c.CriadoEm
    );
}
