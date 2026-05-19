using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Intercessao.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/dinamicas")]
[Authorize]
public class DinamicasController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    private bool IsAdmin => User.IsInRole(Roles.DevAdmin) || User.IsInRole(Roles.Admin);

    private async Task<bool> IsMembro(TipoDinamica tipo) =>
        IsAdmin || await db.DinamicasMembros.AnyAsync(m => m.Tipo == tipo && m.UsuarioId == UserId);

    // GET /api/dinamicas/minhas — retorna quais dinâmicas o usuário pode ver
    [HttpGet("minhas")]
    public async Task<IActionResult> MinhasDinamicas()
    {
        if (IsAdmin)
            return Ok(new[] { 0, 1, 2, 3 });

        var tipos = await db.DinamicasMembros
            .Where(m => m.UsuarioId == UserId)
            .Select(m => (int)m.Tipo)
            .ToListAsync();

        return Ok(tipos);
    }

    // GET /api/dinamicas/membros — admin: todos os membros por dinâmica
    [HttpGet("membros")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> GetTodosMembros()
    {
        var membros = await db.DinamicasMembros
            .Include(m => m.Usuario)
            .ToListAsync();

        var result = Enum.GetValues<TipoDinamica>().Select(tipo => new DinamicaMembrosTipoResponse(
            (int)tipo,
            tipo.GetNome(),
            membros
                .Where(m => m.Tipo == tipo)
                .Select(m => new DinamicaMembroResponse(
                    m.UsuarioId,
                    m.Usuario?.Nome ?? string.Empty,
                    m.Usuario?.Apelido,
                    m.Usuario?.FotoUrl))
                .ToList()
        ));

        return Ok(result);
    }

    // PUT /api/dinamicas/{tipo}/membros — admin: define membros de uma dinâmica
    [HttpPut("{tipo:int}/membros")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> SetMembros(int tipo, [FromBody] SetDinamicaMembrosRequest request)
    {
        if (!Enum.IsDefined(typeof(TipoDinamica), tipo)) return BadRequest();
        var tipoDinamica = (TipoDinamica)tipo;

        var existing = await db.DinamicasMembros.Where(m => m.Tipo == tipoDinamica).ToListAsync();
        db.DinamicasMembros.RemoveRange(existing);

        foreach (var userId in request.UsuarioIds.Distinct())
            db.DinamicasMembros.Add(new DinamicaMembro { Tipo = tipoDinamica, UsuarioId = userId });

        await db.SaveChangesAsync();

        var atualizados = await db.DinamicasMembros
            .Where(m => m.Tipo == tipoDinamica)
            .Include(m => m.Usuario)
            .ToListAsync();

        return Ok(atualizados.Select(m => new DinamicaMembroResponse(
            m.UsuarioId, m.Usuario?.Nome ?? string.Empty, m.Usuario?.Apelido, m.Usuario?.FotoUrl)));
    }

    // GET /api/dinamicas/{tipo}/posts — todos podem ler
    [HttpGet("{tipo:int}/posts")]
    public async Task<IActionResult> GetPosts(int tipo)
    {
        if (!Enum.IsDefined(typeof(TipoDinamica), tipo)) return BadRequest();
        var tipoDinamica = (TipoDinamica)tipo;

        var posts = await db.DinamicasPosts
            .Include(p => p.CriadoPor)
            .Where(p => p.Tipo == tipoDinamica)
            .OrderByDescending(p => p.CriadoEm)
            .ToListAsync();

        return Ok(posts.Select(MapPost));
    }

    // POST /api/dinamicas/{tipo}/posts
    [HttpPost("{tipo:int}/posts")]
    public async Task<IActionResult> CriarPost(int tipo, [FromBody] CriarDinamicaPostRequest request)
    {
        if (!Enum.IsDefined(typeof(TipoDinamica), tipo)) return BadRequest();
        var tipoDinamica = (TipoDinamica)tipo;

        if (!await IsMembro(tipoDinamica)) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Conteúdo é obrigatório." });

        var post = new DinamicaPost
        {
            Tipo = tipoDinamica,
            Titulo = string.IsNullOrWhiteSpace(request.Titulo) ? null : request.Titulo.Trim(),
            Conteudo = request.Conteudo.Trim(),
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow
        };

        db.DinamicasPosts.Add(post);
        await db.SaveChangesAsync();
        await db.Entry(post).Reference(p => p.CriadoPor).LoadAsync();

        return Ok(MapPost(post));
    }

    // PUT /api/dinamicas/{tipo}/posts/{postId}
    [HttpPut("{tipo:int}/posts/{postId:int}")]
    public async Task<IActionResult> EditarPost(int tipo, int postId, [FromBody] AtualizarDinamicaPostRequest request)
    {
        var post = await db.DinamicasPosts
            .Include(p => p.CriadoPor)
            .FirstOrDefaultAsync(p => p.Id == postId && (int)p.Tipo == tipo);

        if (post is null) return NotFound();
        if (post.CriadoPorId != UserId && !IsAdmin) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Conteudo))
            return BadRequest(new { erro = "Conteúdo é obrigatório." });

        post.Titulo = string.IsNullOrWhiteSpace(request.Titulo) ? null : request.Titulo.Trim();
        post.Conteudo = request.Conteudo.Trim();
        post.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(MapPost(post));
    }

    // DELETE /api/dinamicas/{tipo}/posts/{postId}
    [HttpDelete("{tipo:int}/posts/{postId:int}")]
    public async Task<IActionResult> DeletarPost(int tipo, int postId)
    {
        var post = await db.DinamicasPosts.FindAsync(postId);
        if (post is null || (int)post.Tipo != tipo) return NotFound();
        if (post.CriadoPorId != UserId && !IsAdmin) return Forbid();

        db.DinamicasPosts.Remove(post);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static DinamicaPostResponse MapPost(DinamicaPost p) => new(
        p.Id, (int)p.Tipo, p.Tipo.GetNome(),
        p.Titulo, p.Conteudo,
        p.CriadoPorId, p.CriadoPor?.Nome ?? string.Empty, p.CriadoPor?.FotoUrl,
        p.CriadoEm, p.AtualizadoEm
    );
}
