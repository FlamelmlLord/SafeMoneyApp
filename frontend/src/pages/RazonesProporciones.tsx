import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
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
      category="Fundamentos"
      description="Comparación entre cantidades y equivalencia de razones"
      inputs={
        <div className="space-y-3">
          <SelectField label="Modo" value={state.modo} onChange={(v) => setState({ ...state, modo: v as any })} options={[
            { value: 'razon', label: 'Razón Simple' },
            { value: 'proporcion', label: 'Proporción' },
          ]} />
          <InputField label="Valor A" value={state.a} onChange={(v) => setState({ ...state, a: v })} />
          <InputField label="Valor B" value={state.b} onChange={(v) => setState({ ...state, b: v })} />
          {state.modo === 'proporcion' && <InputField label="Valor C" value={state.c} onChange={(v) => setState({ ...state, c: v })} />}
        </div>
      }
      actions={<button className="btn-primary" onClick={calcular}>Calcular</button>}
      results={error ? <div className="text-danger">{error}</div> : result ? (
        <div className="space-y-3">
          <ResultValue label="Resultado" value={JSON.stringify(result)} highlight />
        </div>
      ) : null}
    />
  );
};
