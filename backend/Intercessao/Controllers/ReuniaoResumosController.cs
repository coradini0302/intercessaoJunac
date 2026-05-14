using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/reuniao-resumos")]
[Authorize]
public class ReuniaoResumosController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var lista = await db.ReuniaoResumos
            .Include(r => r.CriadoPor)
            .OrderByDescending(r => r.DataReuniao)
            .ThenByDescending(r => r.CriadoEm)
            .ToListAsync();
        return Ok(lista.Select(Mapear));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var resumo = await db.ReuniaoResumos
            .Include(r => r.CriadoPor)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (resumo is null) return NotFound();
        return Ok(Mapear(resumo));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] CriarReuniaoResumoRequest request)
    {
        var resumo = new ReuniaoResumo
        {
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            DataReuniao = DateTime.SpecifyKind(request.DataReuniao.Date, DateTimeKind.Utc),
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow
        };
        db.ReuniaoResumos.Add(resumo);
        await db.SaveChangesAsync();
        await db.Entry(resumo).Reference(r => r.CriadoPor).LoadAsync();
        return Ok(Mapear(resumo));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarReuniaoResumoRequest request)
    {
        var resumo = await db.ReuniaoResumos
            .Include(r => r.CriadoPor)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (resumo is null) return NotFound();

        resumo.Titulo = request.Titulo;
        resumo.Conteudo = request.Conteudo;
        resumo.DataReuniao = DateTime.SpecifyKind(request.DataReuniao.Date, DateTimeKind.Utc);
        resumo.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(Mapear(resumo));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var resumo = await db.ReuniaoResumos.FirstOrDefaultAsync(r => r.Id == id);
        if (resumo is null) return NotFound();
        db.ReuniaoResumos.Remove(resumo);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ReuniaoResumoResponse Mapear(ReuniaoResumo r) => new()
    {
        Id = r.Id,
        Titulo = r.Titulo,
        Conteudo = r.Conteudo,
        DataReuniao = r.DataReuniao,
        CriadoPorId = r.CriadoPorId,
        NomeCriador = r.CriadoPor?.Nome ?? string.Empty,
        CriadoEm = r.CriadoEm,
        AtualizadoEm = r.AtualizadoEm
    };
}
