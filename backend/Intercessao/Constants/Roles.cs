namespace Intercessao.Constants;

public static class Roles
{
    public const string DevAdmin = "DevAdmin";
    public const string Admin = "Admin";
    public const string Intercessor = "Intercessor";

    public const string AdminOuSuperior = $"{DevAdmin},{Admin}";
    public const string Todos = $"{DevAdmin},{Admin},{Intercessor}";
}
