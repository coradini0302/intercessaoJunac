using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarAgendaSemanalRequest
{
    [Range(1, 16)] public int NumeroSemana { get; set; }
    [Required] public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public int EncontroId { get; set; }
}

public class AtualizarAgendaSemanalRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
}

public class AgendaSemanalResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public int NumeroSemana { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool SemanaAtual { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriador { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
