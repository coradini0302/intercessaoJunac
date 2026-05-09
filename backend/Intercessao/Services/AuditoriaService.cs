using Intercessao.Data;
using Intercessao.Entities;
using Intercessao.Enums;

namespace Intercessao.Services;

public class AuditoriaService(AppDbContext db) : IAuditoriaService
{
    public async Task RegistrarAsync(
        AcaoAuditoria acao,
        string? usuarioId = null,
        string? nomeUsuario = null,
        string? entidade = null,
        string? entidadeId = null,
        string? descricao = null,
        string? ipAddress = null)
    {
        db.LogsAuditoria.Add(new LogAuditoria
        {
            Acao = acao,
            UsuarioId = usuarioId,
            NomeUsuario = nomeUsuario,
            Entidade = entidade,
            EntidadeId = entidadeId,
            Descricao = descricao,
            IpAddress = ipAddress,
            CriadoEm = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
    }
}
