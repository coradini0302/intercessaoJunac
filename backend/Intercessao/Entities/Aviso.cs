using Intercessao.Enums;

namespace Intercessao.Entities;

public class Aviso
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public Encontro Encontro { get; set; } = null!;
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public bool PermiteComentarios { get; set; }
    public TipoMidia TipoMidia { get; set; } = TipoMidia.Nenhuma;
    public string? UrlMidia { get; set; }
    public string? NomeArquivoMidia { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser CriadoPor { get; set; } = null!;
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<AvisoComentario> Comentarios { get; set; } = [];
}
