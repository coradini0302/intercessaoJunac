namespace Intercessao.Enums;

public enum TipoDinamica
{
    LavaPes = 0,
    SacoDoChoro = 1,
    PartilhaDoPao = 2,
    Fogueira = 3
}

public static class TipoDinamicaExtensions
{
    public static string GetNome(this TipoDinamica tipo) => tipo switch
    {
        TipoDinamica.LavaPes => "Lava-pés",
        TipoDinamica.SacoDoChoro => "Saco do Choro",
        TipoDinamica.PartilhaDoPao => "Partilha do Pão",
        TipoDinamica.Fogueira => "Fogueira",
        _ => tipo.ToString()
    };
}
