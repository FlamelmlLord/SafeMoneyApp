import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface PartesSimple { nombre: string; peso: string }
interface PartesCompuesto { nombre: string; capital: string; tiempo: string }

interface State {
  modo: 'simple' | 'compuesto';
  monto: string;
  partesSimple: PartesSimple[];
  partesCompuesto: PartesCompuesto[];
}

const inicial: State = {
  modo: 'simple',
  monto: '1000000',
  partesSimple: [
    { nombre: 'Socio A', peso: '3' },
    { nombre: 'Socio B', peso: '2' },
    { nombre: 'Socio C', peso: '5' },
  ],
  partesCompuesto: [
    { nombre: 'Inversor 1', capital: '500000', tiempo: '6' },
    { nombre: 'Inversor 2', capital: '300000', tiempo: '12' },
  ],
};

export const RepartoProporcional = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const endpoint = state.modo === 'simple' ? '/reparto/simple' : '/reparto/compuesto';
      const partes = state.modo === 'simple' ? state.partesSimple : state.partesCompuesto;
      const data = await apiPost<any>(endpoint, { monto: state.monto, partes });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Reparto Proporcional"
      category="Fundamentos"
      description="Distribuye un monto entre varias partes según pesos. Simple: un solo criterio (capital o tiempo). Compuesto: capital × tiempo."
      formula={state.modo === 'simple' ? 'parte_k = monto \\cdot \\dfrac{peso_k}{\\sum peso_i}' : 'parte_k = monto \\cdot \\dfrac{capital_k \\cdot tiempo_k}{\\sum (capital_i \\cdot tiempo_i)}'}
      inputs={
        <div className="space-y-4">
          <div className="inline-flex rounded-lg border border-bg-border p-0.5">
            {(['simple', 'compuesto'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setState({ ...state, modo: m })}
                className={`px-3 py-1 text-xs rounded-md font-medium ${state.modo === m ? 'bg-accent text-bg' : 'text-text-muted'}`}
              >
                {m === 'simple' ? 'Simple' : 'Compuesto (Capital × Tiempo)'}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Monto a repartir (COP)</label>
            <input className="input" value={state.monto} onChange={(e) => setState({ ...state, monto: e.target.value })} />
          </div>

          {state.modo === 'simple' ? (
            <div className="space-y-2">
              <label className="label">Partes (nombre y peso)</label>
              {state.partesSimple.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    value={p.nombre}
                    onChange={(e) => {
                      const ns = [...state.partesSimple];
                      ns[i] = { ...ns[i], nombre: e.target.value };
                      setState({ ...state, partesSimple: ns });
                    }}
                    placeholder="Nombre"
                  />
                  <input
                    className="input w-24"
                    value={p.peso}
                    onChange={(e) => {
                      const ns = [...state.partesSimple];
                      ns[i] = { ...ns[i], peso: e.target.value };
                      setState({ ...state, partesSimple: ns });
                    }}
                    placeholder="Peso"
                  />
                  <button
                    className="btn-ghost px-2"
                    onClick={() => setState({ ...state, partesSimple: state.partesSimple.filter((_, idx) => idx !== i) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn-outline text-xs"
                onClick={() => setState({ ...state, partesSimple: [...state.partesSimple, { nombre: '', peso: '1' }] })}
              >
                + Agregar parte
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="label">Partes (capital × tiempo)</label>
              {state.partesCompuesto.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr,7rem,5rem,auto] gap-2">
                  <input
                    className="input"
                    value={p.nombre}
                    onChange={(e) => {
                      const ns = [...state.partesCompuesto];
                      ns[i] = { ...ns[i], nombre: e.target.value };
                      setState({ ...state, partesCompuesto: ns });
                    }}
                    placeholder="Nombre"
                  />
                  <input
                    className="input"
                    value={p.capital}
                    onChange={(e) => {
                      const ns = [...state.partesCompuesto];
                      ns[i] = { ...ns[i], capital: e.target.value };
                      setState({ ...state, partesCompuesto: ns });
                    }}
                    placeholder="Capital"
                  />
                  <input
                    className="input"
                    value={p.tiempo}
                    onChange={(e) => {
                      const ns = [...state.partesCompuesto];
                      ns[i] = { ...ns[i], tiempo: e.target.value };
                      setState({ ...state, partesCompuesto: ns });
                    }}
                    placeholder="Tiempo"
                  />
                  <button
                    className="btn-ghost px-2"
                    onClick={() => setState({ ...state, partesCompuesto: state.partesCompuesto.filter((_, idx) => idx !== i) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn-outline text-xs"
                onClick={() => setState({ ...state, partesCompuesto: [...state.partesCompuesto, { nombre: '', capital: '0', tiempo: '0' }] })}
              >
                + Agregar parte
              </button>
            </div>
          )}
        </div>
      }
      actions={
        <>
          <button className="btn-primary" onClick={calcular}>Calcular</button>
          <ScenarioIO moduleId="reparto-proporcional" state={state} onImport={setState} />
        </>
      }
      results={
        error ? (
          <div className="text-danger">{error}</div>
        ) : result ? (
          <div className="space-y-3">
            <table className="table-fin">
              <thead>
                <tr><th>Nombre</th><th>Fracción</th><th>Parte</th></tr>
              </thead>
              <tbody>
                {result.partes.map((p: any, i: number) => (
                  <tr key={i}>
                    <td>{p.nombre || `Parte ${i + 1}`}</td>
                    <td className="text-text-muted">{Number(p.fraccion).toFixed(4)}</td>
                    <td className="text-success font-semibold">{fmtCOP(p.parte)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-text-muted">
              Verificación: la suma da {fmtCOP(result.verificacion)} {result.cuadra ? '✓' : '⚠️'}
            </div>
          </div>
        ) : null
      }
    />
  );
};
