FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Intercessao/Intercessao.csproj", "Intercessao/"]
RUN dotnet restore "Intercessao/Intercessao.csproj"
COPY . .
RUN dotnet publish "Intercessao/Intercessao.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p wwwroot/uploads/fotos
ENTRYPOINT ["dotnet", "Intercessao.dll"]
