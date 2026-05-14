using Intercessao.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Intercessao.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Encontro> Encontros => Set<Encontro>();
    public DbSet<Escala> Escalas => Set<Escala>();
    public DbSet<EscalaParticipante> EscalaParticipantes => Set<EscalaParticipante>();
    public DbSet<Aviso> Avisos => Set<Aviso>();
    public DbSet<AvisoComentario> AvisoComentarios => Set<AvisoComentario>();
    public DbSet<Anotacao> Anotacoes => Set<Anotacao>();
    public DbSet<InformacaoRestrita> InformacoesRestritas => Set<InformacaoRestrita>();
    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<CompromisoIntercedido> CompromissosIntercedidos => Set<CompromisoIntercedido>();
    public DbSet<CompromissoEquipe> CompromissosEquipe => Set<CompromissoEquipe>();
    public DbSet<AgendaSemanal> AgendaSemanal => Set<AgendaSemanal>();
    public DbSet<Votacao> Votacoes => Set<Votacao>();
    public DbSet<VotacaoOpcao> VotacaoOpcoes => Set<VotacaoOpcao>();
    public DbSet<VotacaoVoto> VotacaoVotos => Set<VotacaoVoto>();
    public DbSet<ReuniaoResumo> ReuniaoResumos => Set<ReuniaoResumo>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(e =>
        {
            e.Property(u => u.Nome).HasMaxLength(150).IsRequired();
            e.Property(u => u.Apelido).HasMaxLength(50);
            e.Property(u => u.FotoNomeArquivo).HasMaxLength(200);
            e.Property(u => u.EquipeIntercessao).HasMaxLength(100);
        });

        builder.Entity<Encontro>(e =>
        {
            e.Property(x => x.Nome).HasMaxLength(100).IsRequired();
            e.Property(x => x.Descricao).HasMaxLength(500);
        });

        builder.Entity<Escala>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Local).HasMaxLength(200);
            e.HasOne(x => x.Encontro).WithMany(x => x.Escalas).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Responsavel).WithMany().HasForeignKey(x => x.ResponsavelId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<EscalaParticipante>(e =>
        {
            e.Property(x => x.Funcao).HasMaxLength(100);
            e.HasOne(x => x.Escala).WithMany(x => x.Participantes).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Usuario).WithMany(x => x.EscalasParticipadas).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.EscalaId, x.UsuarioId }).IsUnique();
        });

        builder.Entity<Aviso>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Encontro).WithMany(x => x.Avisos).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.CriadoPor).WithMany(x => x.AvisosCriados).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<AvisoComentario>(e =>
        {
            e.Property(x => x.Texto).HasMaxLength(500).IsRequired();
            e.HasOne(x => x.Aviso).WithMany(x => x.Comentarios).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Usuario).WithMany(x => x.Comentarios).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Anotacao>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200);
            e.HasOne(x => x.Usuario).WithMany(x => x.Anotacoes).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<InformacaoRestrita>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Encontro).WithMany(x => x.InformacoesRestritas).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.CriadoPor).WithMany(x => x.InformacoesRestritasCriadas).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<LogAuditoria>(e =>
        {
            e.Property(x => x.NomeUsuario).HasMaxLength(150);
            e.Property(x => x.Entidade).HasMaxLength(100);
            e.Property(x => x.EntidadeId).HasMaxLength(100);
            e.Property(x => x.IpAddress).HasMaxLength(50);
            e.HasIndex(x => x.CriadoEm);
        });

        builder.Entity<CompromisoIntercedido>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Usuario).WithMany(x => x.CompromissosIntercedidos).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CompromissoEquipe>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Encontro).WithMany().OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.CriadoPor).WithMany().OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.EncontroId, x.NumeroSemana });
        });

        builder.Entity<AgendaSemanal>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Encontro).WithMany().OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.CriadoPor).WithMany().OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.EncontroId, x.NumeroSemana });
        });

        builder.Entity<Votacao>(e =>
        {
            e.Property(x => x.Pergunta).HasMaxLength(500).IsRequired();
            e.HasOne(x => x.Encontro).WithMany().OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.CriadoPor).WithMany().OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<VotacaoOpcao>(e =>
        {
            e.Property(x => x.Texto).HasMaxLength(300).IsRequired();
            e.HasOne(x => x.Votacao).WithMany(x => x.Opcoes).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<VotacaoVoto>(e =>
        {
            e.HasOne(x => x.Votacao).WithMany(x => x.Votos).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Opcao).WithMany(x => x.Votos).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Usuario).WithMany(x => x.Votos).OnDelete(DeleteBehavior.Restrict);
            // Um voto por usuário por votação
            e.HasIndex(x => new { x.VotacaoId, x.UsuarioId }).IsUnique();
        });

        builder.Entity<ReuniaoResumo>(e =>
        {
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.CriadoPor).WithMany().HasForeignKey(x => x.CriadoPorId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
