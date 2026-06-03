using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarCompromisoIntercedidoRequest
{
    [Required, MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public DateTime? DataHora { get; set; }
    public bool DiaInteiro { get; set; } = true;
}

public class AtualizarCompromisoIntercedidoRequest
{
    [Required, MaxLength(200)] public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public DateTime? DataHora { get; set; }
    public bool DiaInteiro { get; set; } = true;
}

public class CompromisoIntercedidoResponse
{
    public int Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string NomeUsuario { get; set; } = string.Empty;
    public string? ApelidoUsuario { get; set; }
    public string? FotoUrl { get; set; }
    public string? EquipeIntercessao { get; set; }
    public int NumeroSemana { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Conteudo { get; set; }
    public bool Ativo { get; set; }
    public DateTime? DataHora { get; set; }
    public bool DiaInteiro { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
