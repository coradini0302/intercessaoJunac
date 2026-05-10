namespace Intercessao.Entities;

public class CompromisoIntercedido
{
    public int Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public ApplicationUser Usuario { get; set; } = null!;

    public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime? DataHora { get; set; }
    public bool DiaInteiro { get; set; } = true;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
