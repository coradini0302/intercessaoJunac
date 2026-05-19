using Intercessao.Enums;

namespace Intercessao.Entities;

public class DinamicaPost
{
    public int Id { get; set; }
    public TipoDinamica Tipo { get; set; }
    public string? Titulo { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser? CriadoPor { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
