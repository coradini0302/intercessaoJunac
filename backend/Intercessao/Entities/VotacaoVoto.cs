namespace Intercessao.Entities;

public class VotacaoVoto
{
    public int Id { get; set; }
    public int VotacaoId { get; set; }
    public Votacao Votacao { get; set; } = null!;
    public int OpcaoId { get; set; }
    public VotacaoOpcao Opcao { get; set; } = null!;
    public string UsuarioId { get; set; } = string.Empty;
    public ApplicationUser Usuario { get; set; } = null!;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
