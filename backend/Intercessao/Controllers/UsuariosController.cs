using Intercessao.Constants;
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
[Route("api/usuarios")]
[Authorize(Roles = Roles.AdminOuSuperior)]
public class UsuariosController(
    UserManager<ApplicationUser> userManager,
    IAuditoriaService auditoria) : ControllerBase
{
    private string? UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;
    private string? UserNome => User.FindFirst("nome")?.Value;

    /// <summary>Todos os membros ativos da equipe — visível para qualquer intercessor logado.</summary>
    [HttpGet("equipe")]
    [Authorize]
    public async Task<IActionResult> ListarEquipe()
    {
        var usuarios = await userManager.Users
            .Where(u => u.Ativo)
            .OrderBy(u => u.Nome)
            .ToListAsync();

        var resultado = new List<PerfilPublicoResponse>();
        foreach (var u in usuarios)
        {
            var roles = await userManager.GetRolesAsync(u);
            resultado.Add(new PerfilPublicoResponse
            {
                Id = u.Id,
                Nome = u.Nome,
                Apelido = u.Apelido,
                FotoUrl = u.FotoUrl,
                Role = roles.FirstOrDefault() ?? string.Empty
            });
        }

        return Ok(resultado);
    }

    /// <summary>CRUD completo de usuários — somente Admin/DevAdmin.</summary>
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await userManager.Users
            .OrderBy(u => u.Nome)
            .ToListAsync();

        var resultado = new List<UsuarioResponse>();
        foreach (var u in usuarios)
        {
            var roles = await userManager.GetRolesAsync(u);
            resultado.Add(MapearUsuario(u, roles.FirstOrDefault() ?? string.Empty));
        }

        return Ok(resultado);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(MapearUsuario(user, roles.FirstOrDefault() ?? string.Empty));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioRequest request)
    {
        if (!RoleValida(request.Role))
            return BadRequest(new { erro = $"Role inválida. Use: {Roles.DevAdmin}, {Roles.Admin} ou {Roles.Intercessor}." });

        if (await userManager.FindByNameAsync(request.Login) is not null)
            return Conflict(new { erro = "Login já em uso." });

        var senhaTemp = GerarSenhaTemporaria();
        var user = new ApplicationUser
        {
            UserName = request.Login,
            Email = $"{request.Login}@intercejunac.com",
            Nome = request.Nome,
            Apelido = request.Apelido,
            Ativo = true,
            TrocouSenha = false,
            EmailConfirmed = true,
            CriadoEm = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, senhaTemp);
        if (!result.Succeeded)
            return BadRequest(new { erros = result.Errors.Select(e => e.Description) });

        await userManager.AddToRoleAsync(user, request.Role);

        await auditoria.RegistrarAsync(AcaoAuditoria.UsuarioCriado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(ApplicationUser), entidadeId: user.Id,
            descricao: $"Usuário criado: {user.Email}");

        return Ok(new
        {
            usuario = MapearUsuario(user, request.Role),
            senhaTemporaria = senhaTemp,
            mensagem = "Usuário criado. Repasse a senha temporária ao usuário — ele deverá trocá-la no primeiro acesso."
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] AtualizarUsuarioRequest request)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        user.Nome = request.Nome;
        user.Apelido = request.Apelido;
        user.AtualizadoEm = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Login) && request.Login != user.UserName)
        {
            if (await userManager.FindByNameAsync(request.Login) is not null)
                return Conflict(new { erro = "Login já em uso." });
            user.UserName = request.Login;
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            if (await userManager.FindByEmailAsync(request.Email) is not null)
                return Conflict(new { erro = "E-mail já em uso." });
            user.Email = request.Email;
        }

        await userManager.UpdateAsync(user);

        if (!string.IsNullOrWhiteSpace(request.Role) && RoleValida(request.Role))
        {
            var rolesAtuais = await userManager.GetRolesAsync(user);
            await userManager.RemoveFromRolesAsync(user, rolesAtuais);
            await userManager.AddToRoleAsync(user, request.Role);
        }

        var roles = await userManager.GetRolesAsync(user);
        await auditoria.RegistrarAsync(AcaoAuditoria.UsuarioAtualizado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(ApplicationUser), entidadeId: user.Id);

        return Ok(MapearUsuario(user, roles.FirstOrDefault() ?? string.Empty));
    }

    [HttpPost("{id}/ativar")]
    public async Task<IActionResult> Ativar(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        user.Ativo = true;
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        await auditoria.RegistrarAsync(AcaoAuditoria.UsuarioAtivado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(ApplicationUser), entidadeId: user.Id);

        return NoContent();
    }

    [HttpPost("{id}/desativar")]
    public async Task<IActionResult> Desativar(string id)
    {
        if (id == UserId) return BadRequest(new { erro = "Você não pode desativar sua própria conta." });

        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        user.Ativo = false;
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        await auditoria.RegistrarAsync(AcaoAuditoria.UsuarioDesativado,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(ApplicationUser), entidadeId: user.Id);

        return NoContent();
    }

    [HttpPost("{id}/resetar-senha")]
    public async Task<IActionResult> ResetarSenha(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var senhaTemp = GerarSenhaTemporaria();
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, token, senhaTemp);

        if (!result.Succeeded)
            return BadRequest(new { erros = result.Errors.Select(e => e.Description) });

        user.TrocouSenha = false;
        user.AtualizadoEm = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        await auditoria.RegistrarAsync(AcaoAuditoria.SenhaResetada,
            usuarioId: UserId, nomeUsuario: UserNome,
            entidade: nameof(ApplicationUser), entidadeId: user.Id);

        return Ok(new ResetarSenhaResponse
        {
            SenhaTemporaria = senhaTemp,
            Mensagem = "Senha resetada. Repasse a nova senha temporária ao usuário."
        });
    }

    private static UsuarioResponse MapearUsuario(ApplicationUser user, string role) => new()
    {
        Id = user.Id,
        Nome = user.Nome,
        Apelido = user.Apelido,
        Login = user.UserName ?? string.Empty,
        Email = user.Email!,
        Role = role,
        Ativo = user.Ativo,
        TrocouSenha = user.TrocouSenha,
        CriadoEm = user.CriadoEm
    };

    private static bool RoleValida(string role) =>
        role is Roles.DevAdmin or Roles.Admin or Roles.Intercessor;

    private static string GerarSenhaTemporaria()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
        var random = new Random();
        return new string(Enumerable.Range(0, 10).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
