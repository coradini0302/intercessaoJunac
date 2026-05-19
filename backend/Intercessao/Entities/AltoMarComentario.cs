namespace Intercessao.Entities;

public class AltoMarComentario
{
    public int Id { get; set; }
    public int IdeiaId { get; set; }
    public AltoMarIdeia? Ideia { get; set; }
    public string Texto { get; set; } = string.Empty;
    public string CriadoPorId { get; set; } = string.Empty;
    public ApplicationUser? CriadoPor { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
