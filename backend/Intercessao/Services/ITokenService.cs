using Intercessao.Entities;

namespace Intercessao.Services;

public interface ITokenService
{
    (string token, DateTime expiracao) GerarToken(ApplicationUser user, IList<string> roles);
}
