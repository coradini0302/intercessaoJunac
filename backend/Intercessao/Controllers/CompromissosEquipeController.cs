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
[Route("api/compromissos-equipe")]
[Authorize]
public class CompromissosEquipeController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    /// <summary>Lista compromissos da equipe. Pode filtrar por encontro e/ou semana.</summary>
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId, [FromQuery] int? semana)
    {
        var query = db.CompromissosEquipe
            .Include(c => c.Encontro)
            .Include(c => c.CriadoPor)
            .AsQueryable();

        if (encontroId.HasValue) query = query.Where(c => c.EncontroId == encontroId.Value);
        if (semana.HasValue) query = query.Where(c => c.NumeroSemana == semana.Value);

        var lista = await query
            .OrderBy(c => c.NumeroSemana)
            .ThenBy(c => c.DataHora == null)
            .ThenBy(c => c.DataHora)
            .ThenBy(c => c.CriadoEm)
            .ToListAsync();

        return Ok(lista.Select(Mapear));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var compromisso = await db.CompromissosEquipe
            .Include(c => c.Encontro)
            .Include(c => c.CriadoPor)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (compromisso is null) return NotFound();
        return Ok(Mapear(compromisso));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarCompromissoEquipeRequest request)
    {
        var encontroExiste = await db.Encontros.AnyAsync(e => e.Id == request.EncontroId);
        if (!encontroExiste) return BadRequest(new { erro = "Encontro não encontrado." });

        var compromisso = new CompromissoEquipe
        {
            EncontroId = request.EncontroId,
            NumeroSemana = request.NumeroSemana,
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            DataHora = request.DataHora,
            DiaInteiro = request.DiaInteiro,
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow
        };

        db.CompromissosEquipe.Add(compromisso);
        await db.SaveChangesAsync();

        await db.Entry(compromisso).Reference(c => c.Encontro).LoadAsync();
        await db.Entry(compromisso).Reference(c => c.CriadoPor).LoadAsync();
        return Ok(Mapear(compromisso));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarCompromissoEquipeRequest request)
    {
        var compromisso = await db.CompromissosEquipe
            .Include(c => c.Encontro)
            .Include(c => c.CriadoPor)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (compromisso is null) return NotFound();

        compromisso.Titulo = request.Titulo;
        compromisso.Conteudo = request.Conteudo;
        compromisso.DataHora = request.DataHora;
        compromisso.DiaInteiro = request.DiaInteiro;
        compromisso.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(compromisso));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var compromisso = await db.CompromissosEquipe
            .FirstOrDefaultAsync(c => c.Id == id);

        if (compromisso is null) return NotFound();

        db.CompromissosEquipe.Remove(compromisso);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static CompromissoEquipeResponse Mapear(CompromissoEquipe c)
    {
        var semanaAtual = SemanaOracaoService.ObterSemanaAtual();
        var (inicio, fim) = SemanaOracaoService.ObterDatesDaSemana(c.NumeroSemana);

        return new CompromissoEquipeResponse
        {
            Id = c.Id,
            EncontroId = c.EncontroId,
            NomeEncontro = c.Encontro?.Nome ?? string.Empty,
            NumeroSemana = c.NumeroSemana,
            DataInicioSemana = inicio,
            DataFimSemana = fim,
            SemanaAtual = semanaAtual == c.NumeroSemana,
            Titulo = c.Titulo,
            Conteudo = c.Conteudo,
            DataHora = c.DataHora,
            DiaInteiro = c.DiaInteiro,
            CriadoPorId = c.CriadoPorId,
            NomeCriadoPor = c.CriadoPor?.Nome ?? string.Empty,
            CriadoEm = c.CriadoEm,
            AtualizadoEm = c.AtualizadoEm
        };
    }
}
