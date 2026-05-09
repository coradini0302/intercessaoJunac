using Intercessao.Constants;
using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Intercessao.Enums;
using Intercessao.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/escalas")]
[Authorize]
public class EscalasController(
    AppDbContext db,
    UserManager<ApplicationUser> userManager,
    IAuditoriaService auditoria) : ControllerBase
{
    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId)
    {
        var query = db.Escalas
            .Include(e => e.Participantes).ThenInclude(p => p.Usuario)
            .Include(e => e.Responsavel)
            .AsQueryable();

        if (encontroId.HasValue)
            query = query.Where(e => e.EncontroId == encontroId.Value);

        var escalas = await query
            .OrderBy(e => e.DataHora)
            .ThenBy(e => e.Titulo)
            .ToListAsync();

        return Ok(escalas.Select(Mapear));
    }

    /// <summary>Escalas em que o usuário logado é participante.</summary>
    [HttpGet("minhas")]
    public async Task<IActionResult> MinhasEscalas([FromQuery] int? encontroId)
    {
        var query = db.Escalas
            .Include(e => e.Participantes).ThenInclude(p => p.Usuario)
            .Where(e => e.Participantes.Any(p => p.UsuarioId == UserId));

        if (encontroId.HasValue)
            query = query.Where(e => e.EncontroId == encontroId.Value);

        var escalas = await query
            .OrderBy(e => e.DataHora)
            .ThenBy(e => e.Titulo)
            .ToListAsync();

        return Ok(escalas.Select(Mapear));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var escala = await db.Escalas
            .Include(e => e.Participantes).ThenInclude(p => p.Usuario)
            .Include(e => e.Responsavel)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (escala is null) return NotFound();
        return Ok(Mapear(escala));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] CriarEscalaRequest request)
    {
        if (!await db.Encontros.AnyAsync(e => e.Id == request.EncontroId))
            return BadRequest(new { erro = "Encontro não encontrado." });

        var escala = new Escala
        {
            Titulo = request.Titulo,
            Descricao = request.Descricao,
            DataHora = request.DataHora,
            Local = request.Local,
            EncontroId = request.EncontroId,
            ResponsavelId = request.ResponsavelId,
            Status = StatusEscala.Pendente,
            CriadoEm = DateTime.UtcNow
        };

        db.Escalas.Add(escala);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.EscalaCriada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Escala), entidadeId: escala.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = escala.Id }, Mapear(escala));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarEscalaRequest request)
    {
        var escala = await db.Escalas.FindAsync(id);
        if (escala is null) return NotFound();

        escala.Titulo = request.Titulo;
        escala.Descricao = request.Descricao;
        escala.DataHora = request.DataHora;
        escala.Local = request.Local;
        escala.Status = request.Status;
        escala.ResponsavelId = request.ResponsavelId;
        escala.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.EscalaAtualizada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Escala), entidadeId: escala.Id.ToString());

        return Ok(Mapear(escala));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var escala = await db.Escalas.FindAsync(id);
        if (escala is null) return NotFound();

        db.Escalas.Remove(escala);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.EscalaExcluida,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Escala), entidadeId: id.ToString());

        return NoContent();
    }

    [HttpPost("{id:int}/participantes")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> AdicionarParticipante(int id, [FromBody] AdicionarParticipanteRequest request)
    {
        var escala = await db.Escalas.FindAsync(id);
        if (escala is null) return NotFound();

        var usuario = await userManager.FindByIdAsync(request.UsuarioId);
        if (usuario is null || !usuario.Ativo)
            return BadRequest(new { erro = "Usuário não encontrado ou inativo." });

        var jaParticipa = await db.EscalaParticipantes
            .AnyAsync(p => p.EscalaId == id && p.UsuarioId == request.UsuarioId);

        if (jaParticipa)
            return Conflict(new { erro = "Usuário já está nesta escala." });

        var participante = new EscalaParticipante
        {
            EscalaId = id,
            UsuarioId = request.UsuarioId,
            Funcao = request.Funcao,
            Confirmado = false
        };

        db.EscalaParticipantes.Add(participante);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.ParticipanteAdicionado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(EscalaParticipante), entidadeId: participante.Id.ToString(),
            descricao: $"Escala {id} - Usuário {request.UsuarioId}");

        return Ok(new ParticipanteResponse
        {
            Id = participante.Id,
            UsuarioId = usuario.Id,
            NomeUsuario = usuario.Nome,
            Apelido = usuario.Apelido,
            FotoUrl = usuario.FotoUrl,
            Funcao = participante.Funcao,
            Confirmado = participante.Confirmado
        });
    }

    [HttpDelete("{id:int}/participantes/{participanteId:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> RemoverParticipante(int id, int participanteId)
    {
        var participante = await db.EscalaParticipantes
            .FirstOrDefaultAsync(p => p.Id == participanteId && p.EscalaId == id);

        if (participante is null) return NotFound();

        db.EscalaParticipantes.Remove(participante);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.ParticipanteRemovido,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(EscalaParticipante), entidadeId: participanteId.ToString());

        return NoContent();
    }

    private static EscalaResponse Mapear(Escala e) => new()
    {
        Id = e.Id,
        EncontroId = e.EncontroId,
        Titulo = e.Titulo,
        Descricao = e.Descricao,
        DataHora = e.DataHora,
        Local = e.Local,
        Status = e.Status,
        StatusDescricao = e.Status.ToString(),
        ResponsavelId = e.ResponsavelId,
        NomeResponsavel = e.Responsavel?.Nome,
        ApelidoResponsavel = e.Responsavel?.Apelido,
        CriadoEm = e.CriadoEm,
        Participantes = e.Participantes?.Select(p => new ParticipanteResponse
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            NomeUsuario = p.Usuario?.Nome ?? string.Empty,
            Apelido = p.Usuario?.Apelido,
            FotoUrl = p.Usuario?.FotoUrl,
            Funcao = p.Funcao,
            Confirmado = p.Confirmado
        }).ToList() ?? []
    };
}
