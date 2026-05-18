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
[Route("api/votacoes")]
[Authorize]
public class VotacoesController(AppDbContext db, IAuditoriaService auditoria) : ControllerBase
{
    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId)
    {
        var query = db.Votacoes
            .Include(v => v.CriadoPor)
            .Include(v => v.Opcoes).ThenInclude(o => o.Votos)
            .Include(v => v.Votos)
            .AsQueryable();

        if (encontroId.HasValue) query = query.Where(v => v.EncontroId == encontroId.Value);

        var votacoes = await query.OrderByDescending(v => v.CriadoEm).ToListAsync();
        return Ok(votacoes.Select(v => Mapear(v, UserId)));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var votacao = await db.Votacoes
            .Include(v => v.CriadoPor)
            .Include(v => v.Opcoes).ThenInclude(o => o.Votos)
            .Include(v => v.Votos)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (votacao is null) return NotFound();
        return Ok(Mapear(votacao, UserId));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] CriarVotacaoRequest request)
    {
        if (request.Opcoes.Count < 2)
            return BadRequest(new { erro = "A votação precisa de pelo menos 2 opções." });

        if (!await db.Encontros.AnyAsync(e => e.Id == request.EncontroId))
            return BadRequest(new { erro = "Encontro não encontrado." });

        var votacao = new Votacao
        {
            EncontroId = request.EncontroId,
            Pergunta = request.Pergunta,
            Descricao = request.Descricao,
            Ativa = true,
            DataFim = request.DataFim,
            CriadoPorId = UserId,
            CriadoEm = DateTime.UtcNow,
            Opcoes = request.Opcoes.Select((texto, i) => new VotacaoOpcao
            {
                Texto = texto,
                Ordem = i + 1
            }).ToList()
        };

        db.Votacoes.Add(votacao);
        await db.SaveChangesAsync();

        await db.Entry(votacao).Reference(v => v.CriadoPor).LoadAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AvisoCriado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Votacao), entidadeId: votacao.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = votacao.Id }, Mapear(votacao, UserId));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarVotacaoRequest request)
    {
        var votacao = await db.Votacoes
            .Include(v => v.CriadoPor)
            .Include(v => v.Opcoes).ThenInclude(o => o.Votos)
            .Include(v => v.Votos)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (votacao is null) return NotFound();

        votacao.Pergunta = request.Pergunta;
        votacao.Descricao = request.Descricao;
        votacao.DataFim = request.DataFim;
        votacao.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(votacao, UserId));
    }

    [HttpPost("{id:int}/encerrar")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Encerrar(int id)
    {
        var votacao = await db.Votacoes
            .Include(v => v.CriadoPor)
            .Include(v => v.Opcoes).ThenInclude(o => o.Votos)
            .Include(v => v.Votos)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (votacao is null) return NotFound();

        votacao.Ativa = false;
        votacao.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(Mapear(votacao, UserId));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var votacao = await db.Votacoes.FindAsync(id);
        if (votacao is null) return NotFound();

        db.Votacoes.Remove(votacao);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/votar")]
    public async Task<IActionResult> Votar(int id, [FromBody] VotarRequest request)
    {
        var votacao = await db.Votacoes
            .Include(v => v.Opcoes)
            .Include(v => v.Votos)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (votacao is null) return NotFound();

        if (!votacao.Ativa)
            return BadRequest(new { erro = "Esta votação está encerrada." });

        if (votacao.DataFim.HasValue && votacao.DataFim.Value < DateTime.UtcNow)
            return BadRequest(new { erro = "O prazo desta votação expirou." });

        if (!votacao.Opcoes.Any(o => o.Id == request.OpcaoId))
            return BadRequest(new { erro = "Opção inválida." });

        var votoExistente = votacao.Votos.FirstOrDefault(v => v.UsuarioId == UserId);
        if (votoExistente is not null)
        {
            votoExistente.OpcaoId = request.OpcaoId;
        }
        else
        {
            db.VotacaoVotos.Add(new VotacaoVoto
            {
                VotacaoId = id,
                OpcaoId = request.OpcaoId,
                UsuarioId = UserId,
                CriadoEm = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();

        // Recarrega para retornar resultado atualizado
        await db.Entry(votacao).Collection(v => v.Votos).LoadAsync();
        foreach (var opcao in votacao.Opcoes)
            await db.Entry(opcao).Collection(o => o.Votos).LoadAsync();

        return Ok(Mapear(votacao, UserId));
    }

    private static VotacaoResponse Mapear(Votacao v, string userId)
    {
        var totalVotos = v.Votos.Count;
        var meuVoto = v.Votos.FirstOrDefault(x => x.UsuarioId == userId);

        return new VotacaoResponse
        {
            Id = v.Id,
            EncontroId = v.EncontroId,
            Pergunta = v.Pergunta,
            Descricao = v.Descricao,
            Ativa = v.Ativa,
            DataFim = v.DataFim,
            CriadoPorId = v.CriadoPorId,
            NomeCriador = v.CriadoPor?.Nome ?? string.Empty,
            CriadoEm = v.CriadoEm,
            TotalVotos = totalVotos,
            JaVotei = meuVoto is not null,
            MinhaOpcaoId = meuVoto?.OpcaoId,
            Opcoes = v.Opcoes.OrderBy(o => o.Ordem).Select(o => new OpcaoResponse
            {
                Id = o.Id,
                Texto = o.Texto,
                Ordem = o.Ordem,
                TotalVotos = o.Votos?.Count ?? 0,
                Percentual = totalVotos == 0 ? 0 : Math.Round((o.Votos?.Count ?? 0) * 100.0 / totalVotos, 1)
            }).ToList()
        };
    }
}
