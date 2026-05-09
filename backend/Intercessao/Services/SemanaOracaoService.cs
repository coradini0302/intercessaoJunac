namespace Intercessao.Services;

public static class SemanaOracaoService
{
    // 16 semanas encerram em 22/08/2026
    public static readonly DateTime DataFimPeriodo = new(2026, 8, 22, 20, 0, 0, DateTimeKind.Utc);
    public static readonly DateTime DataInicioPeriodo = DataFimPeriodo.AddDays(-16 * 7).Date;
    public const int TotalSemanas = 16;

    public static (DateTime inicio, DateTime fim) ObterDatesDaSemana(int numeroSemana)
    {
        var inicio = DataInicioPeriodo.AddDays((numeroSemana - 1) * 7);
        var fim = inicio.AddDays(6);
        return (inicio, fim);
    }

    public static int? ObterSemanaAtual()
    {
        var hoje = DateTime.UtcNow.Date;
        if (hoje < DataInicioPeriodo || hoje > DataFimPeriodo.Date) return null;

        var dias = (hoje - DataInicioPeriodo).Days;
        return (dias / 7) + 1;
    }

    public static IEnumerable<(int Semana, DateTime Inicio, DateTime Fim)> ListarTodasSemanas()
    {
        for (var i = 1; i <= TotalSemanas; i++)
        {
            var (inicio, fim) = ObterDatesDaSemana(i);
            yield return (i, inicio, fim);
        }
    }
}
