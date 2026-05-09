using System.ComponentModel.DataAnnotations;
using Intercessao.Enums;

namespace Intercessao.DTOs;

public class CriarEscalaRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataHora { get; set; }
    public string? Local { get; set; }
    public int EncontroId { get; set; }
    public string? ResponsavelId { get; set; }
}

public class AtualizarEscalaRequest
{
    [Required] public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataHora { get; set; }
    public string? Local { get; set; }
    public StatusEscala Status { get; set; }
    public string? ResponsavelId { get; set; }
}

public class AdicionarParticipanteRequest
{
    [Required] public string UsuarioId { get; set; } = string.Empty;
    public string? Funcao { get; set; }
}

public class ParticipanteResponse
{
    public int Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string NomeUsuario { get; set; } = string.Empty;
    public string? Apelido { get; set; }
    public string? FotoUrl { get; set; }
    public string? Funcao { get; set; }
    public bool Confirmado { get; set; }
}

public class EscalaResponse
{
    public int Id { get; set; }
    public int EncontroId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime? DataHora { get; set; }
    public string? Local { get; set; }
    public StatusEscala Status { get; set; }
    public string StatusDescricao { get; set; } = string.Empty;
    public string? ResponsavelId { get; set; }
    public string? NomeResponsavel { get; set; }
    public string? ApelidoResponsavel { get; set; }
    public DateTime CriadoEm { get; set; }
    public List<ParticipanteResponse> Participantes { get; set; } = [];
}
