using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class CriarUsuarioRequest
{
    [Required] public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    [Required] public string Login { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = string.Empty;
}

public class AtualizarUsuarioRequest
{
    [Required] public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    public string? Login { get; set; }
    [EmailAddress] public string? Email { get; set; }
    public string? Role { get; set; }
}

public class UsuarioResponse
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    public string Login { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public bool TrocouSenha { get; set; }
    public DateTime CriadoEm { get; set; }
    public string? FotoUrl { get; set; }
}

public class ResetarSenhaResponse
{
    public string SenhaTemporaria { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
}
