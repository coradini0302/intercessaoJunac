using System.ComponentModel.DataAnnotations;

namespace Intercessao.DTOs;

public class LoginRequest
{
    [Required] public string Login { get; set; } = string.Empty;
    [Required] public string Senha { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool TrocaSenhaObrigatoria { get; set; }
    public DateTime Expiracao { get; set; }
}

public class TrocaSenhaRequest
{
    [Required] public string SenhaAtual { get; set; } = string.Empty;
    [Required, MinLength(6)] public string NovaSenha { get; set; } = string.Empty;
    [Required, Compare(nameof(NovaSenha))] public string ConfirmarSenha { get; set; } = string.Empty;
}
