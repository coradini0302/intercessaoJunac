using Intercessao.Enums;

namespace Intercessao.Entities;

public class DinamicaMembro
{
    public TipoDinamica Tipo { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public ApplicationUser? Usuario { get; set; }
}
