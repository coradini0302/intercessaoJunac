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
[Route("api/encontros")]
[Authorize]
public class EncontrosController(AppDbContext db, IAuditoriaService auditoria) : ControllerBase
{
    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Listar()
    {
        var encontros = await db.Encontros
            .OrderByDescending(e => e.CriadoEm)
            .Select(e => Mapear(e))
            .ToListAsync();

        return Ok(encontros);
    }

    [HttpGet("ativo")]
    public async Task<IActionResult> ObterAtivo()
    {
        var encontro = await db.Encontros
            .Where(e => e.Status == StatusEncontro.Ativo)
            .OrderByDescending(e => e.CriadoEm)
            .FirstOrDefaultAsync();

        if (encontro is null) return NotFound(new { erro = "Nenhum encontro ativo no momento." });
        return Ok(Mapear(encontro));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var encontro = await db.Encontros.FindAsync(id);
        if (encontro is null) return NotFound();
        return Ok(Mapear(encontro));
    }

    [HttpPost]
    [Authorize(Roles = Roles.DevAdmin)]
    public async Task<IActionResult> Criar([FromBody] CriarEncontroRequest request)
    {
        var encontro = new Encontro
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            Status = StatusEncontro.Planejado,
            CriadoEm = DateTime.UtcNow
        };

        db.Encontros.Add(encontro);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.EncontroCriado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Encontro), entidadeId: encontro.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = encontro.Id }, Mapear(encontro));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarEncontroRequest request)
    {
        var encontro = await db.Encontros.FindAsync(id);
        if (encontro is null) return NotFound();

        encontro.Nome = request.Nome;
        encontro.Descricao = request.Descricao;
        encontro.DataInicio = request.DataInicio;
        encontro.DataFim = request.DataFim;
        encontro.Status = request.Status;
        encontro.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.EncontroAtualizado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Encontro), entidadeId: encontro.Id.ToString());

        return Ok(Mapear(encontro));
    }

    private static EncontroResponse Mapear(Encontro e) => new()
    {
        Id = e.Id,
        Nome = e.Nome,
        Descricao = e.Descricao,
        DataInicio = e.DataInicio,
        DataFim = e.DataFim,
        Status = e.Status,
        StatusDescricao = e.Status.ToString(),
        CriadoEm = e.CriadoEm
    };
}
