namespace Intercessao.Entities;

public class VotacaoOpcao
{
    public int Id { get; set; }
    public int VotacaoId { get; set; }
    public Votacao Votacao { get; set; } = null!;
    public string Texto { get; set; } = string.Empty;
    public int Ordem { get; set; }

    public ICollection<VotacaoVoto> Votos { get; set; } = [];
}
