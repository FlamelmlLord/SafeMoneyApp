import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State {
  a: string;
  b: string;
  c: string;
  modo: 'razon' | 'proporcion';
}

const inicial: State = {
  a: '2',
  b: '5',
  c: '10',
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
        modo: state.modo,
        a: state.a,
        b: state.b,
        c: state.c,
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
            { value: 'razon', label: 'Razón Simple (a:b)' },
            { value: 'proporcion', label: 'Proporción (a:b = c:x)' },
          ]} />
          <InputField label="Valor A" value={state.a} onChange={(v) => setState({ ...state, a: v })} />
          <InputField label="Valor B" value={state.b} onChange={(v) => setState({ ...state, b: v })} />
          {state.modo === 'proporcion' && <InputField label="Valor C" value={state.c} onChange={(v) => setState({ ...state, c: v })} />}
        </div>
      }
      actions={<button className="btn-primary" onClick={calcular}>Calcular</button>}
      results={error ? <div className="text-danger">{error}</div> : result ? (
        <div className="space-y-3">
          {state.modo === 'razon' ? (
            <>
              <ResultValue label="Razón" value={result.razonFormato} highlight />
              <ResultValue label="Valor" value={Number(result.valor).toFixed(4)} />
            </>
          ) : (
            <>
              <ResultValue label="Proporción" value={result.proporcion} highlight />
              <ResultValue label="X (término desconocido)" value={result.x} />
              <ResultValue label="Verificación" value={result.verificacion} />
            </>
          )}
        </div>
      ) : null}
    />
  );
};
