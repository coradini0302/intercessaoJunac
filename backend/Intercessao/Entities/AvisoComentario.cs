namespace Intercessao.Entities;

public class AvisoComentario
{
    public int Id { get; set; }
    public int AvisoId { get; set; }
    public Aviso Aviso { get; set; } = null!;
    public string UsuarioId { get; set; } = string.Empty;
    public ApplicationUser Usuario { get; set; } = null!;
    public string Texto { get; set; } = string.Empty;
    public string? UrlMidia { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
