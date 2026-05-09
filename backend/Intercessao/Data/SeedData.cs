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
        const string loginAdmin = "devadmin";
        var admin = await userManager.FindByNameAsync(loginAdmin);

        if (admin is null)
        {
            var novoUser = new ApplicationUser
            {
                UserName = loginAdmin,
                Email = "dev@intercejunac.com",
                Nome = "Dev Admin",
                Ativo = true,
                TrocouSenha = false,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(novoUser, "Junac@2025");
            if (!result.Succeeded) return;
            admin = novoUser;
        }

        // Garante que nome e ativo estão corretos mesmo para usuário já existente
        bool precisaAtualizar = false;
        if (string.IsNullOrWhiteSpace(admin.Nome)) { admin.Nome = "Dev Admin"; precisaAtualizar = true; }
        if (!admin.Ativo) { admin.Ativo = true; precisaAtualizar = true; }
        if (precisaAtualizar) await userManager.UpdateAsync(admin);

        // Garante que o role está atribuído
        if (!await userManager.IsInRoleAsync(admin, Roles.DevAdmin))
            await userManager.AddToRoleAsync(admin, Roles.DevAdmin);
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
