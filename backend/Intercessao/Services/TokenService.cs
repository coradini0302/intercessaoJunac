using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Intercessao.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Intercessao.Services;

public class TokenService(IConfiguration config) : ITokenService
{
    public (string token, DateTime expiracao) GerarToken(ApplicationUser user, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracao = DateTime.UtcNow.AddHours(config.GetValue<int>("Jwt:ExpirationHours", 12));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("nome", user.Nome),
            new("trocouSenha", user.TrocouSenha.ToString().ToLower())
        };

        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiracao,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiracao);
    }
}
