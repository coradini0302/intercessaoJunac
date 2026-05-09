import { Users } from 'lucide-react';
import { useEquipe } from '../hooks/useUsuarios';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { displayName, roleLabel } from '../lib/utils';

const roleVariant = {
  DevAdmin: 'purple' as const,
  Admin: 'blue' as const,
  Intercessor: 'gray' as const,
};

export function EquipePage() {
  const { data: equipe, isLoading } = useEquipe();

  return (
    <div className="flex flex-col">
      <TopBar title="Equipe de Intercessão" back />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {!isLoading && !equipe?.length && (
          <EmptyState icon={<Users size={28} />} title="Nenhum membro encontrado" />
        )}

        {equipe?.map((membro) => (
          <Card key={membro.id}>
            <div className="flex items-center gap-3">
              <Avatar nome={membro.nome} fotoUrl={membro.fotoUrl} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-tight">
                  {displayName(membro.nome, membro.apelido)}
                </p>
                {membro.apelido && (
                  <p className="text-xs text-slate-400 leading-tight">{membro.nome}</p>
                )}
              </div>
              <Badge label={roleLabel(membro.role)} variant={roleVariant[membro.role]} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
