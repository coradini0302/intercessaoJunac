namespace Intercessao.Enums;

public enum AcaoAuditoria
{
    Login = 0,
    Logout = 1,
    TentativaLoginFalha = 2,
    SenhaTrocada = 3,
    SenhaResetada = 4,

    UsuarioCriado = 10,
    UsuarioAtualizado = 11,
    UsuarioAtivado = 12,
    UsuarioDesativado = 13,
    UsuarioExcluido = 14,

    EncontroCriado = 20,
    EncontroAtualizado = 21,

    EscalaCriada = 30,
    EscalaAtualizada = 31,
    EscalaExcluida = 32,
    ParticipanteAdicionado = 33,
    ParticipanteRemovido = 34,

    AvisoCriado = 40,
    AvisoAtualizado = 41,
    AvisoExcluido = 42,
    ComentarioCriado = 43,
    ComentarioExcluido = 44,

    AnotacaoCriada = 50,
    AnotacaoAtualizada = 51,
    AnotacaoExcluida = 52,

    InformacaoRestritaCriada = 60,
    InformacaoRestritaAtualizada = 61,
    InformacaoRestritaExcluida = 62
}
