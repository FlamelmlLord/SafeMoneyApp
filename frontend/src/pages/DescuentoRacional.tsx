import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';

interface State {
  P: string;
  A: string;
  i: string;
  n: string;
  calcular: 'Dr' | 'i' | 'n' | 'F';
}

const inicial: State = {
  P: '1000000',
  A: '100000',
  i: '0.10',
  n: '180',
  calcular: 'Dr',
};

export const DescuentoRacional = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/descuento-simple/racional', {
        ...state,
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Descuento Simple - Método Racional"
      description="Calcula el descuento racional, también conocido como descuento matemático"
      inputs={[
        {
          label: 'Qué calcular',
          type: 'select',
          value: state.calcular,
          options: [
            { value: 'Dr', label: 'Descuento Racional' },
            { value: 'F', label: 'Valor Futuro' },
            { value: 'i', label: 'Tasa de Interés' },
            { value: 'n', label: 'Tiempo' },
          ],
          onChange: (e) => setState({ ...state, calcular: e.target.value as any }),
        },
        { label: 'Valor Presente (P)', value: state.P, onChange: (e) => setState({ ...state, P: e.target.value }) },
        { label: 'Tasa (i)', value: state.i, onChange: (e) => setState({ ...state, i: e.target.value }) },
        { label: 'Días (n)', value: state.n, onChange: (e) => setState({ ...state, n: e.target.value }) },
      ]}
      result={result}
      error={error}
      onCalculate={calcular}
    />
  );
};
