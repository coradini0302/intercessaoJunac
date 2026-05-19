using Intercessao.Enums;

namespace Intercessao.DTOs;

public record DinamicaPostResponse(
    int Id,
    int Tipo,
    string NomeDinamica,
    string? Titulo,
    string Conteudo,
    string CriadoPorId,
    string NomeCriador,
    string? FotoCriador,
    DateTime CriadoEm,
    DateTime? AtualizadoEm
);

public record CriarDinamicaPostRequest(string? Titulo, string Conteudo);

public record AtualizarDinamicaPostRequest(string? Titulo, string Conteudo);

public record DinamicaMembroResponse(
    string UsuarioId,
    string Nome,
    string? Apelido,
    string? FotoUrl
);

public record DinamicaMembrosTipoResponse(int Tipo, string NomeDinamica, List<DinamicaMembroResponse> Membros);

public record SetDinamicaMembrosRequest(List<string> UsuarioIds);
