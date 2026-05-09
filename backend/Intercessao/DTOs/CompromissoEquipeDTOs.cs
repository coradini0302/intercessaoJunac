using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarCompromissoEquipeRequest
{
    public int EncontroId { get; set; }
    [Range(1, 16)] public int NumeroSemana { get; set; }
    [Required, MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    [Required, MinLength(1)] public string Conteudo { get; set; } = string.Empty;
}

public class AtualizarCompromissoEquipeRequest
{
    [Required, MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    [Required, MinLength(1)] public string Conteudo { get; set; } = string.Empty;
}

public class CompromissoEquipeResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public string NomeEncontro { get; set; } = string.Empty;
    public int NumeroSemana { get; set; }
    public DateTime DataInicioSemana { get; set; }
    public DateTime DataFimSemana { get; set; }
    public bool SemanaAtual { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriadoPor { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
