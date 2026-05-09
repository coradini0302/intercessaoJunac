using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/compromissos-intercedidos")]
[Authorize]
public class CompromisoIntercedidoController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    /// <summary>Meus compromissos de oração para meus intercedidos.</summary>
    [HttpGet("meus")]
    public async Task<IActionResult> MeusCompromissos([FromQuery] bool? ativo)
    {
        var query = db.CompromissosIntercedidos
            .Include(c => c.Usuario)
            .Where(c => c.UsuarioId == UserId);

        if (ativo.HasValue) query = query.Where(c => c.Ativo == ativo.Value);

        var lista = await query.OrderByDescending(c => c.CriadoEm).ToListAsync();
        return Ok(lista.Select(Mapear));
    }

    /// <summary>Admin: compromissos de um intercessor específico.</summary>
    [HttpGet("usuario/{usuarioId}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> PorUsuario(string usuarioId, [FromQuery] bool? ativo)
    {
        var query = db.CompromissosIntercedidos
            .Include(c => c.Usuario)
            .Where(c => c.UsuarioId == usuarioId);

        if (ativo.HasValue) query = query.Where(c => c.Ativo == ativo.Value);

        var lista = await query.OrderByDescending(c => c.CriadoEm).ToListAsync();
        return Ok(lista.Select(Mapear));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarCompromisoIntercedidoRequest request)
    {
        var compromisso = new CompromisoIntercedido
        {
            UsuarioId = UserId,
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            Ativo = true,
            CriadoEm = DateTime.UtcNow
        };

        db.CompromissosIntercedidos.Add(compromisso);
        await db.SaveChangesAsync();

        await db.Entry(compromisso).Reference(c => c.Usuario).LoadAsync();
        return Ok(Mapear(compromisso));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarCompromisoIntercedidoRequest request)
    {
        var compromisso = await db.CompromissosIntercedidos
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == UserId);

        if (compromisso is null) return NotFound();

        compromisso.Titulo = request.Titulo;
        compromisso.Conteudo = request.Conteudo;
        compromisso.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(compromisso));
    }

    /// <summary>Arquiva ou desarquiva um compromisso (toggle de Ativo).</summary>
    [HttpPatch("{id:int}/arquivar")]
    public async Task<IActionResult> Arquivar(int id)
    {
        var compromisso = await db.CompromissosIntercedidos
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == UserId);

        if (compromisso is null) return NotFound();

        compromisso.Ativo = !compromisso.Ativo;
        compromisso.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(compromisso));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var compromisso = await db.CompromissosIntercedidos
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == UserId);

        if (compromisso is null) return NotFound();

        db.CompromissosIntercedidos.Remove(compromisso);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static CompromisoIntercedidoResponse Mapear(CompromisoIntercedido c) => new()
    {
        Id = c.Id,
        UsuarioId = c.UsuarioId,
        NomeUsuario = c.Usuario?.Nome ?? string.Empty,
        ApelidoUsuario = c.Usuario?.Apelido,
        FotoUrl = c.Usuario?.FotoUrl,
        EquipeIntercessao = c.Usuario?.EquipeIntercessao,
        Titulo = c.Titulo,
        Conteudo = c.Conteudo,
        Ativo = c.Ativo,
        CriadoEm = c.CriadoEm,
        AtualizadoEm = c.AtualizadoEm
    };
}
