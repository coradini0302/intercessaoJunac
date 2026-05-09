using Microsoft.AspNetCore.Identity;

namespace Intercessao.Entities;

public class ApplicationUser : IdentityUser
{
    public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    public bool TrocouSenha { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public string? FotoUrl { get; set; }
    public string? FotoNomeArquivo { get; set; }
    public string? EquipeIntercessao { get; set; }

    public ICollection<EscalaParticipante> EscalasParticipadas { get; set; } = [];
    public ICollection<Anotacao> Anotacoes { get; set; } = [];
    public ICollection<AvisoComentario> Comentarios { get; set; } = [];
    public ICollection<Aviso> AvisosCriados { get; set; } = [];
    public ICollection<InformacaoRestrita> InformacoesRestritasCriadas { get; set; } = [];
    public ICollection<CompromisoIntercedido> CompromissosIntercedidos { get; set; } = [];
    public ICollection<VotacaoVoto> Votos { get; set; } = [];
}
