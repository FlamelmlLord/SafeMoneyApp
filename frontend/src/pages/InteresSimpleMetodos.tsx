import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';

interface State {
  P: string;
  i: string;
  n: string;
  metodo: 'bancario' | 'comercial' | 'racional' | 'ideal';
}

const inicial: State = {
  P: '1000000',
  i: '0.10',
  n: '120',
  metodo: 'bancario',
};

export const InteresSimpleMetodos = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/interes-simple/calcular', {
        P: state.P,
        i: state.i,
        n: state.n,
        metodo: state.metodo,
        calcular: 'F',
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Interés Simple - Métodos de Cálculo"
      description="Calcula interés simple usando diferentes métodos (Bancario, Comercial, Racional, Ideal)"
      inputs={[
        {
          label: 'Método',
          type: 'select',
          value: state.metodo,
          options: [
            { value: 'bancario', label: 'Bancario (360 días, mes exacto)' },
            { value: 'comercial', label: 'Comercial (360 días, mes 30)' },
            { value: 'racional', label: 'Racional (365 días, exacto)' },
            { value: 'ideal', label: 'Ideal (365 días, mes 30)' },
          ],
          onChange: (e) => setState({ ...state, metodo: e.target.value as any }),
        },
        { label: 'Capital (P)', value: state.P, onChange: (e) => setState({ ...state, P: e.target.value }) },
        { label: 'Tasa (i)', value: state.i, onChange: (e) => setState({ ...state, i: e.target.value }) },
        { label: 'Días (n)', value: state.n, onChange: (e) => setState({ ...state, n: e.target.value }) },
      ]}
      result={result}
      error={error}
      onCalculate={calcular}
    />
  );
};
