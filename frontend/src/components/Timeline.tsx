import { fmtCOP } from '../lib/format';

export interface FlujoTimeline {
  periodo: number;
  monto: number | string;
  etiqueta?: string;
  tipo?: 'positivo' | 'negativo' | 'incognita';
}

interface Props {
  flujos: FlujoTimeline[];
  periodos: number;
  fechaFocal?: number;
}

export const Timeline = ({ flujos, periodos, fechaFocal }: Props) => {
  const W = 760;
  const H = 160;
  const padX = 40;
  const yLine = H / 2;
  const step = (W - 2 * padX) / Math.max(1, periodos);

  return (
    <div className="border border-bg-border rounded-lg p-4 bg-bg-elevated/30 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]" role="img" aria-label="Línea de tiempo financiera">
        <line x1={padX} y1={yLine} x2={W - padX} y2={yLine} stroke="#252d3a" strokeWidth="2" />
        {Array.from({ length: periodos + 1 }, (_, i) => i).map((i) => {
          const x = padX + i * step;
          const isFocal = fechaFocal === i;
          return (
            <g key={`t-${i}`}>
              <line x1={x} y1={yLine - 8} x2={x} y2={yLine + 8} stroke={isFocal ? '#7c9eff' : '#6e7681'} strokeWidth={isFocal ? 2 : 1} />
              <text x={x} y={yLine + 24} textAnchor="middle" fontSize="11" fill={isFocal ? '#7c9eff' : '#8b949e'} fontFamily="JetBrains Mono">
                {i}
              </text>
              {isFocal && (
                <text x={x} y={yLine - 14} textAnchor="middle" fontSize="9" fill="#7c9eff" fontFamily="Inter">
                  focal
                </text>
              )}
            </g>
          );
        })}
        {flujos.map((f, i) => {
          const x = padX + f.periodo * step;
          const sign = f.tipo === 'negativo' ? -1 : 1;
          const isUnknown = f.tipo === 'incognita';
          const arrowY1 = yLine - sign * 6;
          const arrowY2 = yLine - sign * 50;
          const color = isUnknown ? '#f59e0b' : f.tipo === 'negativo' ? '#ef4444' : '#22c55e';
          return (
            <g key={`f-${i}`}>
              <line x1={x} y1={arrowY1} x2={x} y2={arrowY2} stroke={color} strokeWidth="2" />
              <polygon
                points={`${x - 4},${arrowY1 - sign * 4} ${x + 4},${arrowY1 - sign * 4} ${x},${arrowY1}`}
                fill={color}
              />
              <text
                x={x}
                y={sign > 0 ? arrowY2 - 8 : arrowY2 + 16}
                textAnchor="middle"
                fontSize="11"
                fill={color}
                fontFamily="JetBrains Mono"
              >
                {isUnknown ? f.etiqueta || 'X' : fmtCOP(f.monto)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
