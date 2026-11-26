import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left font-semibold"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 pt-0 animate-fade-in">{children}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function ProgressBar({ value, color = 'var(--primary)' }: { value: number; color?: string }) {
  return (
    <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-lg bg-[var(--surface-2)] gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === o.value ? 'bg-[var(--surface)] shadow-sm' : 'text-[var(--text-muted)]'
          }`}
          style={value === o.value ? { color: 'var(--primary)' } : {}}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
