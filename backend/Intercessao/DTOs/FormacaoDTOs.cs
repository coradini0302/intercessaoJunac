namespace Intercessao.DTOs;

public record FormacaoResponse(
    int Id,
    string Titulo,
    string Conteudo,
    string CriadoPorId,
    string NomeCriador,
    DateTime CriadoEm,
    DateTime? AtualizadoEm
);

public record FormacaoRequest(string Titulo, string Conteudo);
