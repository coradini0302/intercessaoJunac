using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class AtualizarPerfilRequest
{
    [Required, MinLength(2)] public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
}

public class PerfilPublicoResponse
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    public string? FotoUrl { get; set; }
    public string Role { get; set; } = string.Empty;
}

public class PerfilCompletoResponse : PerfilPublicoResponse
{
    public string Email { get; set; } = string.Empty;
    public bool TrocouSenha { get; set; }
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
}
