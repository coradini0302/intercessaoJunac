import { useRef, useState } from 'react';
import type { MembroEquipe } from '../../types';

export function getMentionHandle(membro: MembroEquipe): string {
  return membro.apelido?.split(' ')[0] || membro.nome.split(' ')[0];
}

export function renderMentions(texto: string, membros: MembroEquipe[]) {
  const handles = new Set(membros.map(m => getMentionHandle(m).toLowerCase()));
  const parts = texto.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (!part.startsWith('@')) return <span key={i}>{part}</span>;
    const word = part.slice(1).toLowerCase();
    if (word === 'todos' || handles.has(word))
      return <span key={i} className="font-bold text-primary-600">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

const TODOS_OPTION = { id: '__todos__', label: '@todos', descricao: 'Mencionar todos' };

interface Props {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  membros: MembroEquipe[];
  placeholder?: string;
  maxLength?: number;
}

export function MentionInput({ value, onChange, onEnter, onPaste, membros, placeholder, maxLength }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (inputRef.current) {
        const pos = before.length + handle.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    if (e.key === 'Enter' && !e.shiftKey) onEnter?.();
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
      />
      {query !== null && options.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
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
  );
}
