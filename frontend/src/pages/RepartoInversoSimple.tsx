import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';

interface PartesSimple { nombre: string; peso: string }
interface State {
  monto: string;
  partes: PartesSimple[];
}

const inicial: State = {
  monto: '1000',
  partes: [
    { nombre: 'Parte 1', peso: '2' },
    { nombre: 'Parte 2', peso: '4' },
    { nombre: 'Parte 3', peso: '5' },
  ],
};

export const RepartoInversoSimple = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/reparto/inverso-simple', { monto: state.monto, partes: state.partes });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Reparto Proporcional Inverso Simple"
      description="Distribuye un monto inversamente proporcional a unos índices"
      inputs={[
        { label: 'Monto Total', value: state.monto, onChange: (e) => setState({ ...state, monto: e.target.value }) },
      ]}
      result={result}
      error={error}
      onCalculate={calcular}
    />
  );
};
