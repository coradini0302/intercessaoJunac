import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  right?: React.ReactNode;
  gradient?: boolean;
}

export function TopBar({ title, subtitle, back, right, gradient = false }: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === 'string') navigate(back);
    else navigate(-1);
  };

  return (
    <header
      className={`sticky top-0 z-30 flex items-center px-4 md:px-6 h-14 md:h-16 gap-2 ${
        gradient
          ? 'bg-gradient-to-r from-primary-600 to-primary-400'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      {back && (
        <button
          onClick={handleBack}
          className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 md:hidden ${
            gradient ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className={`font-semibold text-base md:text-lg leading-tight truncate ${gradient ? 'text-white' : 'text-slate-800'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`text-xs truncate ${gradient ? 'text-white/80' : 'text-slate-400'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
