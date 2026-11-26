import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className={`card w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-2)]" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 p-5 border-t" style={{ borderColor: 'var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </Modal>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 p-3 rounded-2xl bg-[var(--surface-2)]" style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressRing({ value, size = 80, stroke = 8, color = 'var(--primary)' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
        {Math.round(value)}%
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    not_started: { bg: '#e2e8f0', text: '#475569', label: 'Not Started' },
    learning: { bg: '#dbeafe', text: '#1d4ed8', label: 'Learning' },
    practicing: { bg: '#fde68a', text: '#92400e', label: 'Practicing' },
    completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
    in_progress: { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
    overdue: { bg: '#fee2e2', text: '#b91c1c', label: 'Overdue' },
    low: { bg: '#e2e8f0', text: '#475569', label: 'Low' },
    medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
    high: { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
    easy: { bg: '#dcfce7', text: '#15803d', label: 'Easy' },
    hard: { bg: '#fee2e2', text: '#b91c1c', label: 'Hard' },
  };
  const s = map[status] || { bg: '#e2e8f0', text: '#475569', label: status };
  return <span className="badge" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>;
}
