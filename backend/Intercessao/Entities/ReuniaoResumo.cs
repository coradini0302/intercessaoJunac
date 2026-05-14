namespace Intercessao.Entities;

public class ReuniaoResumo
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public DateTime DataReuniao { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser? CriadoPor { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
