using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarAnotacaoRequest
{
    public string? Titulo { get; set; }
    [Required] public string Conteudo { get; set; } = string.Empty;
}

public class AtualizarAnotacaoRequest
{
    public string? Titulo { get; set; }
    [Required] public string Conteudo { get; set; } = string.Empty;
}

public class AnotacaoResponse
{
    public int Id { get; set; }
    public string? Titulo { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
