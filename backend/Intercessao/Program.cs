using System.Text;
using Intercessao.Data;
using Intercessao.Entities;
using Intercessao.Middleware;
using Intercessao.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// EF Core + SQLite
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opt =>
{
    opt.Password.RequiredLength = 6;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireDigit = false;
    opt.Lockout.MaxFailedAccessAttempts = 5;
    opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
    opt.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT — lê de env vars (Jwt__Key, Jwt__Issuer, Jwt__Audience) ou appsettings
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key não configurada.");

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(opt =>
{
    opt.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS — origens do appsettings + FRONTEND_URL env var (Railway)
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? ["http://localhost:3000", "http://localhost:5173"];
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
if (!string.IsNullOrWhiteSpace(frontendUrl))
    corsOrigins = [.. corsOrigins, frontendUrl];

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p =>
        p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Migrations (dev) / EnsureCreated (prod) + Seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    await db.Database.EnsureCreatedAsync();

    await SeedData.InicializarAsync(db, userManager, roleManager);

    // Safety-net: garante que devadmin tem nome e role mesmo se o ORM falhou
    await FixDevAdminAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseMiddleware<TrocaSenhaMiddleware>();
app.UseAuthorization();
app.MapControllers();

// Porta dinâmica para Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

static async Task FixDevAdminAsync(AppDbContext db)
{
    try
    {
        var nomeRows = await db.Database.ExecuteSqlRawAsync(
            "UPDATE AspNetUsers SET Nome = 'Dev Admin' WHERE NormalizedUserName = 'DEVADMIN' AND (Nome IS NULL OR Nome = '')");
        Console.Error.WriteLine($"[FixDevAdmin] Nome rows updated: {nomeRows}");

        var roleRows = await db.Database.ExecuteSqlRawAsync(@"
            INSERT OR IGNORE INTO AspNetUserRoles (UserId, RoleId)
            SELECT u.Id, r.Id
            FROM AspNetUsers u
            JOIN AspNetRoles r ON r.NormalizedName = 'DEVADMIN'
            WHERE u.NormalizedUserName = 'DEVADMIN'");
        Console.Error.WriteLine($"[FixDevAdmin] Role rows inserted: {roleRows}");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[FixDevAdmin] ERROR: {ex.GetType().Name}: {ex.Message}");
    }
}
