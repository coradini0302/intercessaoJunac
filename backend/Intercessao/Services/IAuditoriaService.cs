using Intercessao.Enums;

namespace Intercessao.Services;

public interface IAuditoriaService
{
    Task RegistrarAsync(
        AcaoAuditoria acao,
        string? usuarioId = null,
        string? nomeUsuario = null,
        string? entidade = null,
        string? entidadeId = null,
        string? descricao = null,
        string? ipAddress = null);
}
