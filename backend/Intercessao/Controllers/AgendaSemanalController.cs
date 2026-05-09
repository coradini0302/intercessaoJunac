using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Intercessao.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/agenda-semanal")]
[Authorize]
public class AgendaSemanalController(AppDbContext db) : ControllerBase
{
    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId, [FromQuery] int? semana)
    {
        var query = db.AgendaSemanal
            .Include(a => a.CriadoPor)
            .AsQueryable();

        if (encontroId.HasValue) query = query.Where(a => a.EncontroId == encontroId.Value);
        if (semana.HasValue) query = query.Where(a => a.NumeroSemana == semana.Value);

        var items = await query.OrderBy(a => a.NumeroSemana).ToListAsync();
        var semanaAtual = SemanaOracaoService.ObterSemanaAtual();

        return Ok(items.Select(a => Mapear(a, semanaAtual)));
    }

    [HttpGet("atual")]
    public async Task<IActionResult> SemanaAtual([FromQuery] int? encontroId)
    {
        var semanaAtual = SemanaOracaoService.ObterSemanaAtual();
        if (semanaAtual is null)
            return NotFound(new { erro = "Período de orações ainda não iniciou ou já encerrou." });

        var query = db.AgendaSemanal
            .Include(a => a.CriadoPor)
            .Where(a => a.NumeroSemana == semanaAtual.Value);

        if (encontroId.HasValue) query = query.Where(a => a.EncontroId == encontroId.Value);

        var items = await query.ToListAsync();
        return Ok(items.Select(a => Mapear(a, semanaAtual)));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var item = await db.AgendaSemanal
            .Include(a => a.CriadoPor)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (item is null) return NotFound();

        return Ok(Mapear(item, SemanaOracaoService.ObterSemanaAtual()));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] CriarAgendaSemanalRequest request)
    {
        if (!await db.Encontros.AnyAsync(e => e.Id == request.EncontroId))
            return BadRequest(new { erro = "Encontro não encontrado." });

        var (inicio, fim) = SemanaOracaoService.ObterDatesDaSemana(request.NumeroSemana);

        var item = new AgendaSemanal
        {
            EncontroId = request.EncontroId,
            NumeroSemana = request.NumeroSemana,
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            DataInicio = inicio,
            DataFim = fim,
            CriadoPorId = UserId!,
            CriadoEm = DateTime.UtcNow
        };

        db.AgendaSemanal.Add(item);
        await db.SaveChangesAsync();
        await db.Entry(item).Reference(x => x.CriadoPor).LoadAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = item.Id },
            Mapear(item, SemanaOracaoService.ObterSemanaAtual()));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarAgendaSemanalRequest request)
    {
        var item = await db.AgendaSemanal
            .Include(a => a.CriadoPor)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (item is null) return NotFound();

        item.Titulo = request.Titulo;
        item.Conteudo = request.Conteudo;
        item.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(item, SemanaOracaoService.ObterSemanaAtual()));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var item = await db.AgendaSemanal.FindAsync(id);
        if (item is null) return NotFound();

        db.AgendaSemanal.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static AgendaSemanalResponse Mapear(AgendaSemanal a, int? semanaAtual) => new()
    {
        Id = a.Id,
        EncontroId = a.EncontroId,
        NumeroSemana = a.NumeroSemana,
        Titulo = a.Titulo,
        Conteudo = a.Conteudo,
        DataInicio = a.DataInicio,
        DataFim = a.DataFim,
        SemanaAtual = a.NumeroSemana == semanaAtual,
        CriadoPorId = a.CriadoPorId,
        NomeCriador = a.CriadoPor?.Nome ?? string.Empty,
        CriadoEm = a.CriadoEm,
        AtualizadoEm = a.AtualizadoEm
    };
}
