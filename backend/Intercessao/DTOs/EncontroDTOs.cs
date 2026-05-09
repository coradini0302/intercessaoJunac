using System.ComponentModel.DataAnnotations;
using Intercessao.Enums;

namespace Intercessao.DTOs;

public class CriarEncontroRequest
{
    [Required] public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
}

public class AtualizarEncontroRequest
{
    [Required] public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public StatusEncontro Status { get; set; }
}

public class EncontroResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public StatusEncontro Status { get; set; }
    public string StatusDescricao { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
}
