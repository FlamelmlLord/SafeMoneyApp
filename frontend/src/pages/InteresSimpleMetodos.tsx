import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

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
      category="Interés Simple"
      description="Calcula interés simple usando diferentes métodos (Bancario, Comercial, Racional, Ideal)"
      inputs={
        <div className="space-y-3">
          <SelectField label="Método" value={state.metodo} onChange={(v) => setState({ ...state, metodo: v as any })} options={[
            { value: 'bancario', label: 'Bancario (360 días, mes exacto)' },
            { value: 'comercial', label: 'Comercial (360 días, mes 30)' },
            { value: 'racional', label: 'Racional (365 días, exacto)' },
            { value: 'ideal', label: 'Ideal (365 días, mes 30)' },
          ]} />
          <InputField label="Capital (P)" value={state.P} onChange={(v) => setState({ ...state, P: v })} suffix="COP" />
          <InputField label="Tasa (i)" value={state.i} onChange={(v) => setState({ ...state, i: v })} hint="Decimal: 0.10 = 10%" />
          <InputField label="Días (n)" value={state.n} onChange={(v) => setState({ ...state, n: v })} />
        </div>
      }
      actions={<button className="btn-primary" onClick={calcular}>Calcular</button>}
      results={error ? <div className="text-danger">{error}</div> : result ? (
        <div className="space-y-3">
          <ResultValue label="Valor Futuro" value={fmtCOP(result.F)} highlight />
          <ResultValue label="Interés" value={fmtCOP(result.I)} />
        </div>
      ) : null}
    />
  );
};
