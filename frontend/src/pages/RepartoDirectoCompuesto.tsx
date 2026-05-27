import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { apiPost } from '../lib/api';

interface PartesCompuesto { nombre: string; capital: string; tiempo: string }
interface State {
  monto: string;
  partes: PartesCompuesto[];
}

const inicial: State = {
  monto: '1000000',
  partes: [
    { nombre: 'Inversor 1', capital: '500000', tiempo: '6' },
    { nombre: 'Inversor 2', capital: '300000', tiempo: '12' },
  ],
};

export const RepartoDirectoCompuesto = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/reparto/compuesto', { monto: state.monto, partes: state.partes });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Reparto Proporcional Directo Compuesto"
      category="Repartos"
      description="Distribuye un monto según múltiples criterios (ej: capital × tiempo)"
      inputs={
        <div className="space-y-3">
          <InputField label="Monto Total" value={state.monto} onChange={(v) => setState({ ...state, monto: v })} suffix="COP" />
        </div>
      }
      actions={<button className="btn-primary" onClick={calcular}>Calcular</button>}
      results={error ? <div className="text-danger">{error}</div> : result ? (
        <div className="space-y-3">
          <ResultValue label="Monto Total" value={state.monto} highlight />
          {result.partes?.map((p: any, i: number) => (
            <div key={i} className="text-text-muted text-sm">
              {p.nombre}: {p.parte}
            </div>
          ))}
        </div>
      ) : null}
    />
  );
};
