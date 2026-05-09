using Intercessao.Enums;

namespace Intercessao.Entities;

public class Escala
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public Encontro Encontro { get; set; } = null!;
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataHora { get; set; }
    public string? Local { get; set; }
    public StatusEscala Status { get; set; } = StatusEscala.Pendente;
    public string? ResponsavelId { get; set; }
    public ApplicationUser? Responsavel { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<EscalaParticipante> Participantes { get; set; } = [];
}
