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
[Route("api/anotacoes")]
[Authorize]
public class AnotacoesController(AppDbContext db, IAuditoriaService auditoria) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var anotacoes = await db.Anotacoes
            .Where(a => a.UsuarioId == UserId)
            .OrderByDescending(a => a.AtualizadoEm ?? a.CriadoEm)
            .Select(a => Mapear(a))
            .ToListAsync();

        return Ok(anotacoes);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var anotacao = await db.Anotacoes
            .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == UserId);

        if (anotacao is null) return NotFound();
        return Ok(Mapear(anotacao));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarAnotacaoRequest request)
    {
        var anotacao = new Anotacao
        {
            UsuarioId = UserId,
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            CriadoEm = DateTime.UtcNow
        };

        db.Anotacoes.Add(anotacao);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AnotacaoCriada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Anotacao), entidadeId: anotacao.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = anotacao.Id }, Mapear(anotacao));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarAnotacaoRequest request)
    {
        var anotacao = await db.Anotacoes
            .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == UserId);

        if (anotacao is null) return NotFound();

        anotacao.Titulo = request.Titulo;
        anotacao.Conteudo = request.Conteudo;
        anotacao.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AnotacaoAtualizada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Anotacao), entidadeId: anotacao.Id.ToString());

        return Ok(Mapear(anotacao));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var anotacao = await db.Anotacoes
            .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == UserId);

        if (anotacao is null) return NotFound();

        db.Anotacoes.Remove(anotacao);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AnotacaoExcluida,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Anotacao), entidadeId: id.ToString());

        return NoContent();
    }

    private static AnotacaoResponse Mapear(Anotacao a) => new()
    {
        Id = a.Id,
        Titulo = a.Titulo,
        Conteudo = a.Conteudo,
        CriadoEm = a.CriadoEm,
        AtualizadoEm = a.AtualizadoEm
    };
}
