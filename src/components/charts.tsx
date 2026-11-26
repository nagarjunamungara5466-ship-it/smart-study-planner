interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  max?: number;
}

export function BarChart({ data, color = 'var(--primary)', height = 160, max }: BarChartProps) {
  const maxVal = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full flex items-end justify-center" style={{ height: height - 28 }}>
            <div
              className="w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{
                height: `${(d.value / maxVal) * 100}%`,
                backgroundColor: color,
                minHeight: d.value > 0 ? 4 : 0,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, color = 'var(--primary)', height = 160 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const w = 100;
  const h = 100;
  const pts = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - (d.value / maxVal) * h;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(' L ')}`;
  const area = `${path} L ${w},${h} L 0,${h} Z`;
  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = (i / Math.max(1, data.length - 1)) * w;
          const y = h - (d.value / maxVal) * h;
          return <circle key={i} cx={x} cy={y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
          {segments.map((s, i) => {
            const len = (s.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{total}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
            <span className="font-semibold ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
