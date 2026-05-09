using Intercessao.Enums;

namespace Intercessao.Entities;

public class Encontro
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public StatusEncontro Status { get; set; } = StatusEncontro.Planejado;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<Escala> Escalas { get; set; } = [];
    public ICollection<Aviso> Avisos { get; set; } = [];
    public ICollection<InformacaoRestrita> InformacoesRestritas { get; set; } = [];
}
