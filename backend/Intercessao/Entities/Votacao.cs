namespace Intercessao.Entities;

public class Votacao
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public Encontro Encontro { get; set; } = null!;

    public string Pergunta { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativa { get; set; } = true;
    public DateTime? DataFim { get; set; }

    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser CriadoPor { get; set; } = null!;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<VotacaoOpcao> Opcoes { get; set; } = [];
    public ICollection<VotacaoVoto> Votos { get; set; } = [];
}
