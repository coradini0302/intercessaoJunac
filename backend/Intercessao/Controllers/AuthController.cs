using Intercessao.Data;
using Intercessao.DTOs;
using Intercessao.Entities;
using Intercessao.Enums;
using Intercessao.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenService tokenService,
    IAuditoriaService auditoria,
    IWebHostEnvironment env) : ControllerBase
{
    private const long MaxFotoBytes = 3 * 1024 * 1024; // 3 MB
    private static readonly string[] ExtensoesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];

    private string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value ?? string.Empty;

    // ─── Login ───────────────────────────────────────────────────────────────

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var user = await userManager.FindByNameAsync(request.Login);
        if (user is null || !user.Ativo)
        {
            await auditoria.RegistrarAsync(AcaoAuditoria.TentativaLoginFalha,
                descricao: $"Login: {request.Login}", ipAddress: ip);
            return Unauthorized(new { erro = "Credenciais inválidas." });
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Senha, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            await auditoria.RegistrarAsync(AcaoAuditoria.TentativaLoginFalha,
                usuarioId: user.Id, nomeUsuario: user.Nome, ipAddress: ip);

            if (result.IsLockedOut)
                return Unauthorized(new { erro = "Conta bloqueada temporariamente. Tente novamente em alguns minutos." });

            return Unauthorized(new { erro = "Credenciais inválidas." });
        }

        var roles = await userManager.GetRolesAsync(user);
        var (token, expiracao) = tokenService.GerarToken(user, roles);

        await auditoria.RegistrarAsync(AcaoAuditoria.Login,
            usuarioId: user.Id, nomeUsuario: user.Nome, ipAddress: ip);

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            Nome = user.Nome,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? string.Empty,
            TrocaSenhaObrigatoria = !user.TrocouSenha,
            Expiracao = expiracao
        });
    }

    // ─── Troca de senha obrigatória no primeiro acesso ───────────────────────

    [HttpPost("trocar-senha")]
    [Authorize]
    public async Task<IActionResult> TrocarSenha([FromBody] TrocaSenhaRequest request)
    {
        var user = await userManager.FindByIdAsync(UserId);
        if (user is null) return Unauthorized();

        var result = await userManager.ChangePasswordAsync(user, request.SenhaAtual, request.NovaSenha);
        if (!result.Succeeded)
            return BadRequest(new { erros = result.Errors.Select(e => e.Description) });

        user.TrocouSenha = true;
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);
        var (token, expiracao) = tokenService.GerarToken(user, roles);

        await auditoria.RegistrarAsync(AcaoAuditoria.SenhaTrocada,
            usuarioId: user.Id, nomeUsuario: user.Nome,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            Nome = user.Nome,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? string.Empty,
            TrocaSenhaObrigatoria = false,
            Expiracao = expiracao
        });
    }

    // ─── Perfil próprio ───────────────────────────────────────────────────────

    [HttpGet("perfil")]
    [Authorize]
    public async Task<IActionResult> Perfil()
    {
        var user = await userManager.FindByIdAsync(UserId);
        if (user is null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new PerfilCompletoResponse
        {
            Id = user.Id,
            Nome = user.Nome,
            Apelido = user.Apelido,
            Email = user.Email!,
            FotoUrl = user.FotoUrl,
            Role = roles.FirstOrDefault() ?? string.Empty,
            TrocouSenha = user.TrocouSenha,
            Ativo = user.Ativo,
            CriadoEm = user.CriadoEm
        });
    }

    [HttpPut("perfil")]
    [Authorize]
    public async Task<IActionResult> AtualizarPerfil([FromBody] AtualizarPerfilRequest request)
    {
        var user = await userManager.FindByIdAsync(UserId);
        if (user is null) return Unauthorized();

        user.Nome = request.Nome;
        user.Apelido = request.Apelido;
        user.AtualizadoEm = DateTime.UtcNow;

        await userManager.UpdateAsync(user);

        // Reissue token com nome atualizado
        var roles = await userManager.GetRolesAsync(user);
        var (token, expiracao) = tokenService.GerarToken(user, roles);

        return Ok(new
        {
            perfil = new PerfilCompletoResponse
            {
                Id = user.Id,
                Nome = user.Nome,
                Apelido = user.Apelido,
                Email = user.Email!,
                FotoUrl = user.FotoUrl,
                Role = roles.FirstOrDefault() ?? string.Empty,
                TrocouSenha = user.TrocouSenha,
                Ativo = user.Ativo,
                CriadoEm = user.CriadoEm
            },
            novoToken = token,
            expiracao
        });
    }

    [HttpPost("perfil/foto")]
    [Authorize]
    public async Task<IActionResult> UploadFoto(IFormFile foto)
    {
        if (foto.Length > MaxFotoBytes)
            return BadRequest(new { erro = "Foto muito grande. Limite: 3 MB." });

        var ext = Path.GetExtension(foto.FileName).ToLowerInvariant();
        if (!ExtensoesPermitidas.Contains(ext))
            return BadRequest(new { erro = "Extensão não permitida. Use jpg, png ou webp." });

        var user = await userManager.FindByIdAsync(UserId);
        if (user is null) return Unauthorized();

        var pasta = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "fotos");
        Directory.CreateDirectory(pasta);

        // Remove foto anterior
        if (user.FotoNomeArquivo is not null)
        {
            var antigo = Path.Combine(pasta, user.FotoNomeArquivo);
            if (System.IO.File.Exists(antigo)) System.IO.File.Delete(antigo);
        }

        var nomeArquivo = $"{user.Id}_{Guid.NewGuid():N}{ext}";
        await using (var stream = System.IO.File.Create(Path.Combine(pasta, nomeArquivo)))
            await foto.CopyToAsync(stream);

        user.FotoNomeArquivo = nomeArquivo;
        user.FotoUrl = $"/uploads/fotos/{nomeArquivo}";
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        return Ok(new { fotoUrl = user.FotoUrl });
    }

    [HttpDelete("perfil/foto")]
    [Authorize]
    public async Task<IActionResult> RemoverFoto()
    {
        var user = await userManager.FindByIdAsync(UserId);
        if (user is null) return Unauthorized();

        if (user.FotoNomeArquivo is not null)
        {
            var pasta = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "fotos");
            var caminho = Path.Combine(pasta, user.FotoNomeArquivo);
            if (System.IO.File.Exists(caminho)) System.IO.File.Delete(caminho);
        }

        user.FotoUrl = null;
        user.FotoNomeArquivo = null;
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        return NoContent();
    }

    // ─── Perfil público de outro usuário ─────────────────────────────────────

    [HttpGet("perfil/{id}")]
    [Authorize]
    public async Task<IActionResult> PerfilPublico(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null || !user.Ativo) return NotFound();

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new PerfilPublicoResponse
        {
            Id = user.Id,
            Nome = user.Nome,
            Apelido = user.Apelido,
            FotoUrl = user.FotoUrl,
            Role = roles.FirstOrDefault() ?? string.Empty
        });
    }
}
