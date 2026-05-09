import { buildImageUrl } from '../../lib/api';

interface AvatarProps {
  nome: string;
  fotoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

function initials(nome: string): string {
  return nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function Avatar({ nome, fotoUrl, size = 'md', className = '' }: AvatarProps) {
  const url = buildImageUrl(fotoUrl ?? null);
  const sz = sizes[size];

  if (url) {
    return (
      <img
        src={url}
        alt={nome}
        className={`${sz} rounded-full object-cover bg-primary-100 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shrink-0 ${className}`}
    >
      {initials(nome)}
    </div>
  );
}
