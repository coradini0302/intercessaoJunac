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
                Email = "gabriel@intercejunac.com",
                Nome = "Gabriel Coradini",
                Apelido = "Ronaldo",
                Ativo = true,
                TrocouSenha = false,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(novoUser, "Junac@2025");
            if (!result.Succeeded)
            {
                Console.Error.WriteLine($"[SeedData] CreateAsync failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return;
            }
            admin = novoUser;
        }

        // Garante que nome, apelido e ativo estão corretos mesmo para usuário já existente
        bool precisaAtualizar = false;
        if (admin.Nome != "Gabriel Coradini") { admin.Nome = "Gabriel Coradini"; precisaAtualizar = true; }
        if (admin.Apelido != "Ronaldo") { admin.Apelido = "Ronaldo"; precisaAtualizar = true; }
        if (!admin.Ativo) { admin.Ativo = true; precisaAtualizar = true; }
        if (precisaAtualizar)
        {
            var r = await userManager.UpdateAsync(admin);
            if (!r.Succeeded)
                Console.Error.WriteLine($"[SeedData] UpdateAsync failed: {string.Join(", ", r.Errors.Select(e => e.Description))}");
        }

        // Garante que tem exatamente a role Admin
        if (await userManager.IsInRoleAsync(admin, Roles.DevAdmin))
            await userManager.RemoveFromRoleAsync(admin, Roles.DevAdmin);

        if (!await userManager.IsInRoleAsync(admin, Roles.Admin))
        {
            var r = await userManager.AddToRoleAsync(admin, Roles.Admin);
            if (!r.Succeeded)
                Console.Error.WriteLine($"[SeedData] AddToRoleAsync failed: {string.Join(", ", r.Errors.Select(e => e.Description))}");
        }
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
