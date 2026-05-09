import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, leftIcon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800
            placeholder:text-slate-400
            border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
            disabled:bg-slate-50 disabled:text-slate-400
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <textarea
        {...props}
        className={`
          w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800
          placeholder:text-slate-400
          border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100
          outline-none transition-all resize-none
          disabled:bg-slate-50 disabled:text-slate-400
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
