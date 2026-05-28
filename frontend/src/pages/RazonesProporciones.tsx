import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State {
  a: string;
  b: string;
  c: string;
  x: string;
  modo: 'razon' | 'proporcion';
  calcular: 'x' | 'c';
}

const inicial: State = {
  a: '2',
  b: '5',
  c: '10',
  x: '',
  modo: 'razon',
  calcular: 'x',
};

export const RazonesProporciones = () => {
  const [state, setState] = useState<State>(inicial);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcularRes = async () => {
    setError(null);
    try {
      const data = await apiPost<any>('/razones/calcular', {
        modo: state.modo,
        a: state.a,
        b: state.b,
        ...(state.modo === 'proporcion' ? {
          calcular: state.calcular,
          c: state.calcular === 'x' ? state.c : undefined,
          x: state.calcular === 'c' ? state.x : undefined,
        } : {}),
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
            { value: 'proporcion', label: 'Proporción (a:b :: c:x)' },
          ]} />
          
          {state.modo === 'proporcion' && (
            <SelectField 
              label="¿Qué deseas calcular?" 
              value={state.calcular} 
              onChange={(v) => setState({ ...state, calcular: v as any })} 
              options={[
                { value: 'x', label: 'Calcular X (conoces a, b, c)' },
                { value: 'c', label: 'Calcular C (conoces a, b, x)' },
              ]} 
            />
          )}
          
          <InputField label="Valor A" value={state.a} onChange={(v) => setState({ ...state, a: v })} />
          <InputField label="Valor B" value={state.b} onChange={(v) => setState({ ...state, b: v })} />
          
          {state.modo === 'proporcion' && state.calcular === 'x' && (
            <InputField label="Valor C" value={state.c} onChange={(v) => setState({ ...state, c: v })} />
          )}
          
          {state.modo === 'proporcion' && state.calcular === 'c' && (
            <InputField label="Valor X" value={state.x} onChange={(v) => setState({ ...state, x: v })} />
          )}
        </div>
      }
      actions={<button className="btn-primary" onClick={calcularRes}>Calcular</button>}
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
              <ResultValue label={state.calcular === 'x' ? 'X (término desconocido)' : 'C (término desconocido)'} value={state.calcular === 'x' ? result.x : result.c} />
              <ResultValue label="Verificación" value={result.verificacion} />
            </>
          )}
        </div>
      ) : null}
    />
  );
};
