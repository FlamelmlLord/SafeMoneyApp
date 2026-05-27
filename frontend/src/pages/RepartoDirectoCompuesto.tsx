import { useState } from 'react';
import { Calculator } from '../components/Calculator';
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
      description="Distribuye un monto según múltiples criterios (ej: capital × tiempo)"
      inputs={[
        { label: 'Monto Total', value: state.monto, onChange: (e) => setState({ ...state, monto: e.target.value }) },
      ]}
      result={result}
      error={error}
      onCalculate={calcular}
    />
  );
};
