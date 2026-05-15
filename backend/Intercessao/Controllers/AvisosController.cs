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
[Route("api/avisos")]
[Authorize]
public class AvisosController(
    AppDbContext db,
    IAuditoriaService auditoria,
    IWebHostEnvironment env) : ControllerBase
{
    private const long MaxUploadBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly string[] ExtensoesMidia = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
    private string? UserNome => User.FindFirst("nome")?.Value;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? encontroId)
    {
        var query = db.Avisos
            .Include(a => a.CriadoPor)
            .Where(a => a.Ativo)
            .AsQueryable();

        if (encontroId.HasValue)
            query = query.Where(a => a.EncontroId == encontroId.Value);

        var avisos = await query
            .OrderByDescending(a => a.CriadoEm)
            .ToListAsync();

        return Ok(avisos.Select(a => MapearResumo(a)));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var aviso = await db.Avisos
            .Include(a => a.CriadoPor)
            .Include(a => a.Comentarios).ThenInclude(c => c.Usuario)
            .FirstOrDefaultAsync(a => a.Id == id && a.Ativo);

        if (aviso is null) return NotFound();
        return Ok(MapearDetalhado(aviso));
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Criar([FromBody] CriarAvisoRequest request)
    {
        if (!await db.Encontros.AnyAsync(e => e.Id == request.EncontroId))
            return BadRequest(new { erro = "Encontro não encontrado." });

        var aviso = new Aviso
        {
            Titulo = request.Titulo,
            Conteudo = request.Conteudo,
            PermiteComentarios = request.PermiteComentarios,
            EncontroId = request.EncontroId,
            CriadoPorId = UserId!,
            TipoMidia = TipoMidia.Nenhuma,
            Ativo = true,
            CriadoEm = DateTime.UtcNow
        };

        db.Avisos.Add(aviso);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AvisoCriado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Aviso), entidadeId: aviso.Id.ToString());

        return CreatedAtAction(nameof(ObterPorId), new { id = aviso.Id }, MapearResumo(aviso));
    }

    [HttpPost("{id:int}/midia")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> UploadMidia(int id, IFormFile arquivo)
    {
        var aviso = await db.Avisos.FindAsync(id);
        if (aviso is null) return NotFound();

        if (arquivo.Length > MaxUploadBytes)
            return BadRequest(new { erro = "Arquivo muito grande. Limite: 5 MB." });

        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        if (!ExtensoesMidia.Contains(ext))
            return BadRequest(new { erro = "Extensão não permitida." });

        var pasta = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "avisos");
        Directory.CreateDirectory(pasta);

        var nomeArquivo = $"{aviso.Id}_{Guid.NewGuid():N}{ext}";
        var caminho = Path.Combine(pasta, nomeArquivo);

        await using (var stream = System.IO.File.Create(caminho))
            await arquivo.CopyToAsync(stream);

        if (aviso.NomeArquivoMidia is not null)
        {
            var antigo = Path.Combine(pasta, aviso.NomeArquivoMidia);
            if (System.IO.File.Exists(antigo)) System.IO.File.Delete(antigo);
        }

        aviso.NomeArquivoMidia = nomeArquivo;
        aviso.UrlMidia = $"/uploads/avisos/{nomeArquivo}";
        aviso.TipoMidia = ext == ".gif" ? TipoMidia.Gif : TipoMidia.Imagem;
        aviso.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { urlMidia = aviso.UrlMidia });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarAvisoRequest request)
    {
        var aviso = await db.Avisos.FindAsync(id);
        if (aviso is null) return NotFound();

        aviso.Titulo = request.Titulo;
        aviso.Conteudo = request.Conteudo;
        aviso.PermiteComentarios = request.PermiteComentarios;
        aviso.Ativo = request.Ativo;
        aviso.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AvisoAtualizado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Aviso), entidadeId: aviso.Id.ToString());

        return Ok(MapearResumo(aviso));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOuSuperior)]
    public async Task<IActionResult> Excluir(int id)
    {
        var aviso = await db.Avisos.FindAsync(id);
        if (aviso is null) return NotFound();

        aviso.Ativo = false;
        aviso.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.AvisoExcluido,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(Aviso), entidadeId: id.ToString());

        return NoContent();
    }

    [HttpPost("{id:int}/comentarios")]
    public async Task<IActionResult> AdicionarComentario(int id, [FromBody] ComentarioRequest request)
    {
        var aviso = await db.Avisos.FindAsync(id);
        if (aviso is null || !aviso.Ativo) return NotFound();

        if (!aviso.PermiteComentarios)
            return BadRequest(new { erro = "Comentários desativados neste aviso." });

        if (string.IsNullOrWhiteSpace(request.Texto))
            return BadRequest(new { erro = "Escreva um comentário." });

        var comentario = new AvisoComentario
        {
            AvisoId = id,
            UsuarioId = UserId!,
            Texto = request.Texto,
            CriadoEm = DateTime.UtcNow
        };

        db.AvisoComentarios.Add(comentario);
        await db.SaveChangesAsync();

        await db.Entry(comentario).Reference(c => c.Usuario).LoadAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.ComentarioCriado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(AvisoComentario), entidadeId: comentario.Id.ToString());

        return Ok(MapearComentario(comentario));
    }

    [HttpPost("{id:int}/comentarios/{comentarioId:int}/midia")]
    public async Task<IActionResult> UploadMidiaComentario(int id, int comentarioId, IFormFile arquivo)
    {
        var comentario = await db.AvisoComentarios
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Id == comentarioId && c.AvisoId == id);

        if (comentario is null) return NotFound();
        if (comentario.UsuarioId != UserId && !User.IsInRole(Roles.Admin) && !User.IsInRole(Roles.DevAdmin))
            return Forbid();

        if (arquivo.Length > MaxUploadBytes)
            return BadRequest(new { erro = "Arquivo muito grande. Limite: 5 MB." });

        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        if (!ExtensoesMidia.Contains(ext))
            return BadRequest(new { erro = "Extensão não permitida." });

        var pasta = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "comentarios");
        Directory.CreateDirectory(pasta);

        var nomeArquivo = $"{comentario.Id}_{Guid.NewGuid():N}{ext}";
        var caminho = Path.Combine(pasta, nomeArquivo);

        await using (var stream = System.IO.File.Create(caminho))
            await arquivo.CopyToAsync(stream);

        if (comentario.UrlMidia is not null)
        {
            var antigo = Path.Combine(env.WebRootPath ?? "wwwroot", comentario.UrlMidia.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(antigo)) System.IO.File.Delete(antigo);
        }

        comentario.UrlMidia = $"/uploads/comentarios/{nomeArquivo}";
        await db.SaveChangesAsync();

        return Ok(MapearComentario(comentario));
    }

    [HttpDelete("{id:int}/comentarios/{comentarioId:int}")]
    public async Task<IActionResult> ExcluirComentario(int id, int comentarioId)
    {
        var comentario = await db.AvisoComentarios
            .FirstOrDefaultAsync(c => c.Id == comentarioId && c.AvisoId == id);

        if (comentario is null) return NotFound();

        var isAdmin = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.DevAdmin);
        if (!isAdmin && comentario.UsuarioId != UserId)
            return Forbid();

        db.AvisoComentarios.Remove(comentario);
        await db.SaveChangesAsync();

        await auditoria.RegistrarAsync(AcaoAuditoria.ComentarioExcluido,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(AvisoComentario), entidadeId: comentarioId.ToString());

        return NoContent();
    }

    private static AvisoResponse MapearResumo(Aviso a) => new()
    {
        Id = a.Id,
        EncontroId = a.EncontroId,
        Titulo = a.Titulo,
        Conteudo = a.Conteudo,
        PermiteComentarios = a.PermiteComentarios,
        TipoMidia = a.TipoMidia,
        UrlMidia = a.UrlMidia,
        Ativo = a.Ativo,
        CriadoPorId = a.CriadoPorId,
        NomeCriador = a.CriadoPor?.Nome ?? string.Empty,
        CriadoEm = a.CriadoEm,
        AtualizadoEm = a.AtualizadoEm,
        TotalComentarios = a.Comentarios?.Count ?? 0
    };

    private static AvisoResponse MapearDetalhado(Aviso a)
    {
        var response = MapearResumo(a);
        response.Comentarios = a.Comentarios?.Select(MapearComentario).ToList() ?? [];
        return response;
    }

    private static ComentarioResponse MapearComentario(AvisoComentario c) => new()
    {
        Id = c.Id,
        UsuarioId = c.UsuarioId,
        NomeUsuario = c.Usuario?.Nome ?? string.Empty,
        ApelidoUsuario = c.Usuario?.Apelido,
        Texto = c.Texto,
        UrlMidia = c.UrlMidia,
        FotoUrl = c.Usuario?.FotoUrl,
        CriadoEm = c.CriadoEm
    };
}
