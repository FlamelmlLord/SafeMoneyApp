import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';

interface State {
  a: string;
  b: string;
  c: string;
  modo: 'razon' | 'proporcion';
}

const inicial: State = {
  a: '28',
  b: '73000000',
  c: '12',
  modo: 'razon',
};

export const RazonesProporciones = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/razones/calcular', {
        ...state,
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Razones y Proporciones"
      description="Comparación entre cantidades y equivalencia de razones"
      inputs={[
        {
          label: 'Modo',
          type: 'select',
          value: state.modo,
          options: [
            { value: 'razon', label: 'Razón Simple' },
            { value: 'proporcion', label: 'Proporción' },
          ],
          onChange: (e) => setState({ ...state, modo: e.target.value as 'razon' | 'proporcion' }),
        },
        {
          label: 'Valor A',
          value: state.a,
          onChange: (e) => setState({ ...state, a: e.target.value }),
        },
        {
          label: 'Valor B',
          value: state.b,
          onChange: (e) => setState({ ...state, b: e.target.value }),
        },
        ...(state.modo === 'proporcion' ? [{
          label: 'Valor C',
          value: state.c,
          onChange: (e) => setState({ ...state, c: e.target.value }),
        }] : []),
      ]}
      result={result}
      error={error}
      onCalculate={calcular}
    />
  );
};
