namespace Intercessao.Entities;

public class AgendaSemanal
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public Encontro Encontro { get; set; } = null!;

    public int NumeroSemana { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }

    // Datas da semana calculadas a partir do NumeroSemana, mas armazenadas para facilitar consulta
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }

    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser CriadoPor { get; set; } = null!;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
