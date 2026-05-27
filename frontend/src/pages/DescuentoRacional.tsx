import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

type Var = 'Dr' | 'F' | 'i' | 'n';
interface State {
  calcular: Var;
  P: string;
  F: string;
  i: string;
  n: string;
}

const inicial: State = {
  calcular: 'Dr',
  P: '1000000',
  F: '100000',
  i: '0.10',
  n: '180',
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
      category="Descuento Simple"
      description="Calcula el descuento racional, también conocido como descuento matemático"
      inputs={
        <div className="space-y-3">
          <SelectField label="¿Qué deseas calcular?" value={state.calcular} onChange={(v) => setState({ ...state, calcular: v as Var })} options={[
            { value: 'Dr', label: 'Descuento Racional' },
            { value: 'F', label: 'Valor Futuro' },
            { value: 'i', label: 'Tasa de Interés' },
            { value: 'n', label: 'Tiempo' },
          ]} />
          <InputField label="Valor Presente (P)" value={state.P} onChange={(v) => setState({ ...state, P: v })} suffix="COP" />
          <InputField label="Tasa (i)" value={state.i} onChange={(v) => setState({ ...state, i: v })} hint="Decimal: 0.10 = 10%" />
          <InputField label="Días (n)" value={state.n} onChange={(v) => setState({ ...state, n: v })} />
        </div>
      }
      actions={<button className="btn-primary" onClick={calcular}>Calcular</button>}
      results={error ? <div className="text-danger">{error}</div> : result ? (
        <div className="space-y-3">
          <ResultValue label={`${state.calcular === 'i' ? 'Tasa' : state.calcular === 'n' ? 'Días' : 'Descuento Racional'}`} value={fmtCOP(result.resultado)} highlight />
        </div>
      ) : null}
    />
  );
};
