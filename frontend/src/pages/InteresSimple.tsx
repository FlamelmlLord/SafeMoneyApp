import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

type Var = 'F' | 'P' | 'i' | 'n';
interface State { calcular: Var; P: string; F: string; i: string; n: string }

const inicial: State = { calcular: 'F', P: '1000000', F: '', i: '0.02', n: '12' };

export const InteresSimple = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const body: Record<string, string> = { calcular: s.calcular };
      if (s.calcular !== 'F') body.F = s.F;
      if (s.calcular !== 'P') body.P = s.P;
      if (s.calcular !== 'i') body.i = s.i;
      if (s.calcular !== 'n') body.n = s.n;
      setR(await apiPost('/interes-simple/calcular', body));
    } catch (e: any) { setErr(e.message); }
  };

  const labelResultado = s.calcular === 'i' ? 'Tasa periódica i' : s.calcular === 'n' ? 'Número de periodos' : `Valor ${s.calcular}`;
  const formatear = (v: string) => s.calcular === 'i' ? fmtRate(v) : s.calcular === 'n' ? Number(v).toFixed(4) : fmtCOP(v);

  return (
    <Calculator
      title="Interés Simple"
      category="Fundamentos"
      description="El interés crece linealmente con el tiempo y no se capitaliza. Útil para préstamos a corto plazo, letras y cálculos comerciales clásicos."
      formula="I = P \cdot i \cdot n \quad ; \quad F = P(1 + i \cdot n)"
      inputs={
        <div className="space-y-3">
          <SelectField label="¿Qué deseas calcular?" value={s.calcular} onChange={(v) => setS({ ...s, calcular: v as Var })} options={[
            { value: 'F', label: 'Valor Futuro (F)' },
            { value: 'P', label: 'Valor Presente (P)' },
            { value: 'i', label: 'Tasa periódica (i)' },
            { value: 'n', label: 'Número de periodos (n)' },
          ]} />
          {s.calcular !== 'P' && <InputField label="Valor presente P" value={s.P} onChange={(v) => setS({ ...s, P: v })} suffix="COP" />}
          {s.calcular !== 'F' && <InputField label="Valor futuro F" value={s.F} onChange={(v) => setS({ ...s, F: v })} suffix="COP" />}
          {s.calcular !== 'i' && <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} hint="Decimal: 0.02 = 2%" />}
          {s.calcular !== 'n' && <InputField label="Número de periodos n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />}
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular</button>
        <ScenarioIO moduleId="interes-simple" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={labelResultado} value={formatear(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
