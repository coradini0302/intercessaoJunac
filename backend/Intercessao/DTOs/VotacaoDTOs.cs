using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarVotacaoRequest
{
    [Required] public string Pergunta { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    [MinLength(2)] public List<string> Opcoes { get; set; } = [];
    public DateTime? DataFim { get; set; }
    public int EncontroId { get; set; }
}

public class AtualizarVotacaoRequest
{
    [Required] public string Pergunta { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataFim { get; set; }
}

public class VotarRequest
{
    public int OpcaoId { get; set; }
}

public class OpcaoResponse
{
    public int Id { get; set; }
    public string Texto { get; set; } = string.Empty;
    public int Ordem { get; set; }
    public int TotalVotos { get; set; }
    public double Percentual { get; set; }
}

public class VotacaoResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public string Pergunta { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativa { get; set; }
    public DateTime? DataFim { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriador { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public int TotalVotos { get; set; }
    public int? MinhaOpcaoId { get; set; }
    public bool JaVotei { get; set; }
    public List<OpcaoResponse> Opcoes { get; set; } = [];
}
