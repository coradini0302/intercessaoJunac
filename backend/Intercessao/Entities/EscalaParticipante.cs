namespace Intercessao.Entities;

public class EscalaParticipante
{
    public int Id { get; set; }
    public int EscalaId { get; set; }
    public Escala Escala { get; set; } = null!;
    public string UsuarioId { get; set; } = string.Empty;
    public ApplicationUser Usuario { get; set; } = null!;
    public string? Funcao { get; set; }
    public bool Confirmado { get; set; }
}
