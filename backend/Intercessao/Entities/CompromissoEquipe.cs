namespace Intercessao.Entities;

public class CompromissoEquipe
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public Encontro Encontro { get; set; } = null!;

    public int NumeroSemana { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public DateTime? DataHora { get; set; }
    public bool DiaInteiro { get; set; } = true;

    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser CriadoPor { get; set; } = null!;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
