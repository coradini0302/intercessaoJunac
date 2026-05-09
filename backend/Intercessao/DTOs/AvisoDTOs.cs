using System.ComponentModel.DataAnnotations;
using Intercessao.Enums;

namespace Intercessao.DTOs;

public class CriarAvisoRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
    public bool PermiteComentarios { get; set; }
    public int EncontroId { get; set; }
}

public class AtualizarAvisoRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    [Required] public string Conteudo { get; set; } = string.Empty;
    public bool PermiteComentarios { get; set; }
    public bool Ativo { get; set; } = true;
}

public class ComentarioRequest
{
    [Required, MinLength(1), MaxLength(500)] public string Texto { get; set; } = string.Empty;
}

public class ComentarioResponse
{
    public int Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string NomeUsuario { get; set; } = string.Empty;
    public string? ApelidoUsuario { get; set; }
    public string Texto { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
}

public class AvisoResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public bool PermiteComentarios { get; set; }
    public TipoMidia TipoMidia { get; set; }
    public string? UrlMidia { get; set; }
    public bool Ativo { get; set; }
    public string CriadoPorId { get; set; } = string.Empty;
    public string NomeCriador { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
    public int TotalComentarios { get; set; }
    public List<ComentarioResponse> Comentarios { get; set; } = [];
}
