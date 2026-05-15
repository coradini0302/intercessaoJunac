import { useRef, useState } from 'react';
import type { MembroEquipe } from '../../types';
import { getMentionHandle } from './MentionInput';

const TODOS_OPTION = { id: '__todos__', label: '@todos', descricao: 'Mencionar todos' };

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  membros: MembroEquipe[];
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export function MentionTextarea({ label, value, onChange, membros, placeholder, rows = 4, hint }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [mentionAt, setMentionAt] = useState(0);
  const [idx, setIdx] = useState(0);

  const showTodos = query !== null && 'todos'.startsWith(query.toLowerCase());
  const filteredMembros = query !== null
    ? membros.filter(m => getMentionHandle(m).toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
    : [];
  const options = [
    ...(showTodos ? [TODOS_OPTION] : []),
    ...filteredMembros.map(m => ({ id: m.id, label: `@${getMentionHandle(m)}`, descricao: m.nome })),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    const pos = e.target.selectionStart ?? text.length;
    const before = text.slice(0, pos);
    const match = before.match(/@(\w*)$/);
    if (match) {
      setQuery(match[1]);
      setMentionAt(pos - match[0].length);
      setIdx(0);
    } else {
      setQuery(null);
    }
  };

  const insertHandle = (handle: string) => {
    const typed = query ?? '';
    const before = value.slice(0, mentionAt);
    const after = value.slice(mentionAt + 1 + typed.length);
    onChange(`${before}@${handle} ${after}`);
    setQuery(null);
    setTimeout(() => {
      if (ref.current) {
        const pos = before.length + handle.length + 2;
        ref.current.focus();
        ref.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (query !== null && options.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, options.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const opt = options[idx];
        insertHandle(opt.id === '__todos__' ? 'todos' : opt.label.slice(1));
        return;
      }
      if (e.key === 'Escape') { setQuery(null); return; }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400 resize-none"
        />
        {query !== null && options.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
            {options.map((opt, i) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertHandle(opt.id === '__todos__' ? 'todos' : opt.label.slice(1));
                }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors ${i === idx ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
              >
                <span className="text-sm font-semibold text-primary-600">{opt.label}</span>
                <span className="text-xs text-slate-400 truncate">{opt.descricao}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
