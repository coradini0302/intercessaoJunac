using System.Security.Claims;

namespace Intercessao.Middleware;

public class TrocaSenhaMiddleware(RequestDelegate next)
{
    private static readonly string[] RotasLiberadas =
    [
        "/api/auth/login",
        "/api/auth/trocar-senha",
        "/openapi",
        "/scalar"
    ];

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var trocouSenha = context.User.FindFirst("trocouSenha")?.Value;
            if (trocouSenha == "false")
            {
                var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
                var liberada = RotasLiberadas.Any(r => path.StartsWith(r));

                if (!liberada)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        erro = "Troca de senha obrigatória.",
                        codigo = "TROCA_SENHA_OBRIGATORIA"
                    });
                    return;
                }
            }
        }

        await next(context);
    }
}
