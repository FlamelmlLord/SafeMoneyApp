import { useRef } from 'react';
import { useAppStore } from '../store';

interface Props<T> {
  moduleId: string;
  state: T;
  onImport: (state: T) => void;
}

export function ScenarioIO<T>({ moduleId, state, onImport }: Props<T>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dayBase = useAppStore((s) => s.dayBase);

  const exportJson = () => {
    const payload = {
      app: 'ingenieria-economica',
      version: 1,
      modulo: moduleId,
      generadoEn: new Date().toISOString(),
      tipoAnio: dayBase === 360 ? 'comercial (360)' : 'civil (365)',
      estado: state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escenario-${moduleId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (json.modulo !== moduleId) {
        alert(`Este escenario es del módulo "${json.modulo}", no de "${moduleId}".`);
        return;
      }
      onImport(json.estado as T);
    } catch {
      alert('El archivo no es un JSON válido.');
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={exportJson} className="btn-outline text-xs px-3 py-1.5">
        ⤓ Exportar escenario
      </button>
      <button onClick={() => fileRef.current?.click()} className="btn-outline text-xs px-3 py-1.5">
        ⤒ Importar escenario
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
