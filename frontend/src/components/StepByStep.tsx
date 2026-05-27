import { useState } from 'react';
import type { Paso } from '../lib/api';

export const StepByStep = ({ pasos }: { pasos: Paso[] }) => {
  const [open, setOpen] = useState(false);
  if (!pasos?.length) return null;
  return (
    <div className="border border-bg-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-text-muted hover:text-text hover:bg-bg-elevated transition-colors"
      >
        <span>{open ? '▼' : '▶'} Ver procedimiento paso a paso</span>
        <span className="text-xs text-text-subtle">{pasos.length} paso(s)</span>
      </button>
      {open && (
        <ol className="px-4 py-3 space-y-2 border-t border-bg-border bg-bg-elevated/30 animate-fade-in">
          {pasos.map((p, i) => (
            <li key={i} className="text-sm font-mono">
              <span className="text-accent mr-2">{i + 1}.</span>
              <span className="text-text">{p.expr}</span>
              {p.detalle && <div className="text-xs text-text-subtle ml-6 mt-1">{p.detalle}</div>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
