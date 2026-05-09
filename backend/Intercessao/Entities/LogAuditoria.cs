using Intercessao.Enums;

namespace Intercessao.Entities;

public class LogAuditoria
{
    public int Id { get; set; }
    public string? UsuarioId { get; set; }
    public string? NomeUsuario { get; set; }
    public AcaoAuditoria Acao { get; set; }
    public string? Entidade { get; set; }
    public string? EntidadeId { get; set; }
    public string? Descricao { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
