using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarReuniaoResumoRequest
{
    [Required] [MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
    [Required] public DateTime DataReuniao { get; set; }
}

public class AtualizarReuniaoResumoRequest
{
    [Required] [MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
    [Required] public DateTime DataReuniao { get; set; }
}

public class ReuniaoResumoResponse
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public DateTime DataReuniao { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriador { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
