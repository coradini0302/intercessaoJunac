namespace Intercessao.DTOs;

public record AltoMarComentarioResponse(
    int Id,
    string Texto,
    string CriadoPorId,
    string NomeCriador,
    string? FotoCriador,
    DateTime CriadoEm
);

public record AltoMarIdeiaResponse(
    int Id,
    string Titulo,
    string Conteudo,
    string CriadoPorId,
    string NomeCriador,
    string? FotoCriador,
    DateTime CriadoEm,
    DateTime? AtualizadoEm,
    List<AltoMarComentarioResponse> Comentarios
);

public record CriarAltoMarIdeiaRequest(string Titulo, string Conteudo);

public record AtualizarAltoMarIdeiaRequest(string Titulo, string Conteudo);

public record CriarAltoMarComentarioRequest(string Texto);
