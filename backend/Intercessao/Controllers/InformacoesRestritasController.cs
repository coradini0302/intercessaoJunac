using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Intercessao.Enums;
using Intercessao.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/informacoes-restritas")]
[Authorize(Roles = Roles.AdminOuSuperior)]
public class InformacoesRestritasController(AppDbContext db, IAuditoriaService auditoria) : ControllerBase
{
    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId)
    {
        var query = db.InformacoesRestritas
            .Include(i => i.CriadoPor)
            .AsQueryable();

        if (encontroId.HasValue)
            query = query.Where(i => i.EncontroId == encontroId.Value);

        var infos = await query
            .OrderByDescending(i => i.CriadoEm)
            .ToListAsync();

        return Ok(infos.Select(Mapear));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var info = await db.InformacoesRestritas
            .Include(i => i.CriadoPor)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (info is null) return NotFound();
        return Ok(Mapear(info));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarInformacaoRestritaRequest request)
    {
        if (!await db.Encontros.AnyAsync(e => e.Id == request.EncontroId))
            return BadRequest(new { erro = "Encontro não encontrado." });

        var info = new InformacaoRestrita
        {
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            EncontroId = request.EncontroId,
            CriadoPorId = UserId!,
            CriadoEm = DateTime.UtcNow
        };

        db.InformacoesRestritas.Add(info);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.InformacaoRestritaCriada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(InformacaoRestrita), entidadeId: info.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = info.Id }, Mapear(info));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarInformacaoRestritaRequest request)
    {
        var info = await db.InformacoesRestritas.FindAsync(id);
        if (info is null) return NotFound();

        info.Titulo = request.Titulo;
        info.Conteudo = request.Conteudo;
        info.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.InformacaoRestritaAtualizada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(InformacaoRestrita), entidadeId: info.Id.ToString());

        return Ok(Mapear(info));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var info = await db.InformacoesRestritas.FindAsync(id);
        if (info is null) return NotFound();

        db.InformacoesRestritas.Remove(info);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.InformacaoRestritaExcluida,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(InformacaoRestrita), entidadeId: id.ToString());

        return NoContent();
    }

    private static InformacaoRestritaResponse Mapear(InformacaoRestrita i) => new()
    {
        Id = i.Id,
        EncontroId = i.EncontroId,
        Titulo = i.Titulo,
        Conteudo = i.Conteudo,
        CriadoPorId = i.CriadoPorId,
        NomeCriador = i.CriadoPor?.Nome ?? string.Empty,
        CriadoEm = i.CriadoEm,
        AtualizadoEm = i.AtualizadoEm
    };
}
