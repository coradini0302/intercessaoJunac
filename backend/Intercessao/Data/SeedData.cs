using Intercessao.Constants;
using Intercessao.Entities;
using Intercessao.Enums;
using Microsoft.AspNetCore.Identity;

namespace Intercessao.Data;

public static class SeedData
{
    public static async Task InicializarAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        await CriarRolesAsync(roleManager);
        await CriarAdminInicialAsync(userManager);
        await CriarEncontroInicialAsync(db);
    }

    private static async Task CriarRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = [Roles.DevAdmin, Roles.Admin, Roles.Intercessor];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    private static async Task CriarAdminInicialAsync(UserManager<ApplicationUser> userManager)
    {
        const string email = "dev@intercejunac.com";
        if (await userManager.FindByEmailAsync(email) is not null) return;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            Nome = "Dev Admin",
            Ativo = true,
            TrocouSenha = false,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, "Junac@2025");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(user, Roles.DevAdmin);
    }

    private static async Task CriarEncontroInicialAsync(AppDbContext db)
    {
        if (!db.Encontros.Any())
        {
            db.Encontros.Add(new Encontro
            {
                Nome = "JUNAC XXIX",
                Descricao = "29º Encontro JUNAC",
                Status = StatusEncontro.Ativo,
                CriadoEm = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
            return;
        }

        // Se existe mas nenhum está ativo, ativa o primeiro
        if (!db.Encontros.Any(e => e.Status == StatusEncontro.Ativo))
        {
            var encontro = db.Encontros.OrderBy(e => e.CriadoEm).First();
            encontro.Status = StatusEncontro.Ativo;
            await db.SaveChangesAsync();
        }
    }
}
