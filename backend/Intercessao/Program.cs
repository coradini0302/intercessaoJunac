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

// EF Core — PostgreSQL em produção (DATABASE_URL), SQLite em dev
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (databaseUrl is not null)
{
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseNpgsql(ParseDatabaseUrl(databaseUrl)));
}
else
{
    var dbPath = Environment.GetEnvironmentVariable("DB_PATH");
    if (dbPath is not null)
        Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);
    var connectionString = dbPath is not null
        ? $"Data Source={dbPath}"
        : builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=intercejunac.db";
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseSqlite(connectionString));
}

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

    // Patch de schema: adiciona colunas que podem faltar em DBs antigos
    await ApplySchemaPatches(db);

    await SeedData.InicializarAsync(db, userManager, roleManager);
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

static async Task ApplySchemaPatches(AppDbContext db)
{
    bool isPostgres = db.Database.ProviderName?.Contains("Npgsql") == true;

    // PostgreSQL suporta IF NOT EXISTS; SQLite não — usamos try/catch
    string[] patches = isPostgres
        ? [
            """ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS "EquipeIntercessao" TEXT""",
            """ALTER TABLE "AvisoComentarios" ADD COLUMN IF NOT EXISTS "UrlMidia" TEXT""",
            """ALTER TABLE "CompromissosEquipe" ADD COLUMN IF NOT EXISTS "DataHora" TIMESTAMPTZ""",
            """ALTER TABLE "CompromissosEquipe" ADD COLUMN IF NOT EXISTS "DiaInteiro" BOOLEAN DEFAULT true""",
            """ALTER TABLE "CompromissosIntercedidos" ADD COLUMN IF NOT EXISTS "DataHora" TIMESTAMPTZ""",
            """ALTER TABLE "CompromissosIntercedidos" ADD COLUMN IF NOT EXISTS "DiaInteiro" BOOLEAN DEFAULT true""",
          ]
        : [
            "ALTER TABLE AspNetUsers ADD COLUMN EquipeIntercessao TEXT",
            "ALTER TABLE AvisoComentarios ADD COLUMN UrlMidia TEXT",
            "ALTER TABLE CompromissosEquipe ADD COLUMN DataHora TEXT",
            "ALTER TABLE CompromissosEquipe ADD COLUMN DiaInteiro INTEGER DEFAULT 1",
            "ALTER TABLE CompromissosIntercedidos ADD COLUMN DataHora TEXT",
            "ALTER TABLE CompromissosIntercedidos ADD COLUMN DiaInteiro INTEGER DEFAULT 1",
          ];

    foreach (var sql in patches)
    {
        try { await db.Database.ExecuteSqlRawAsync(sql); }
        catch { /* coluna já existe */ }
    }
}

static string ParseDatabaseUrl(string url)
{
    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var db = uri.AbsolutePath.TrimStart('/');
    var port = uri.Port > 0 ? uri.Port : 5432;
    return $"Host={uri.Host};Port={port};Database={db};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
