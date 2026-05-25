import { useState, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
}

export default function FloatingInput({
  label,
  icon,
  showToggle,
  type = 'text',
  className = '',
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasValue = props.value !== undefined && String(props.value).length > 0;
  const inputType = showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        type={inputType}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`peer w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${icon ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-12' : 'pr-4'}`}
      />
      <label
        className={`pointer-events-none absolute transition-all duration-200 ${
          icon ? 'left-10' : 'left-4'
        } ${
          focused || hasValue
            ? '-top-2.5 bg-white px-1 text-xs font-semibold text-brand-600'
            : 'top-3.5 text-sm text-slate-400'
        }`}
      >
        {label}
      </label>
      {showToggle && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-brand-600"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  );
}
