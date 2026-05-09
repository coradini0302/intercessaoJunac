using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarInformacaoRestritaRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
    public int EncontroId { get; set; }
}

public class AtualizarInformacaoRestritaRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
}

public class InformacaoRestritaResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriador { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
