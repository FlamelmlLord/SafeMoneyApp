import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

type Modo = 'F-dado-A' | 'A-dado-F' | 'n-dado-A-F' | 'i-dado-A-F';
interface State { modo: Modo; tipo: 'vencida' | 'anticipada'; A: string; F: string; i: string; n: string }
const inicial: State = { modo: 'F-dado-A', tipo: 'vencida', A: '100000', F: '5000000', i: '0.01', n: '36' };

export const Capitalizacion = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      let body: any = { tipo: s.tipo };
      if (s.modo === 'F-dado-A') { body.calcular = 'F'; body.A = s.A; body.i = s.i; body.n = s.n; }
      else if (s.modo === 'A-dado-F') { body.calcular = 'A'; body.F = s.F; body.i = s.i; body.n = s.n; }
      else if (s.modo === 'n-dado-A-F') { body.calcular = 'n'; body.A = s.A; body.F = s.F; body.i = s.i; }
      else if (s.modo === 'i-dado-A-F') { body.calcular = 'i'; body.A = s.A; body.F = s.F; body.n = s.n; }
      setR(await apiPost('/anualidades/calcular', body));
    } catch (e: any) { setErr(e.message); }
  };

  const labelResult = s.modo === 'F-dado-A' ? 'Meta alcanzada F' :
                      s.modo === 'A-dado-F' ? 'Depósito periódico A' :
                      s.modo === 'n-dado-A-F' ? 'Períodos necesarios n' : 'Tasa requerida i';

  const formatResult = (v: string) => s.modo === 'i-dado-A-F' ? fmtRate(v) : s.modo === 'n-dado-A-F' ? Number(v).toFixed(2) : fmtCOP(v);

  return (
    <Calculator
      title="Capitalización (Ahorro para meta)"
      category="Series uniformes"
      description="Calculadora orientada al ahorro: dado un depósito periódico, alcanzar un valor futuro F. O dada una meta, calcular el depósito requerido, el tiempo o la tasa."
      formula="F = A \cdot \dfrac{(1+i)^n - 1}{i} \quad ; \quad A = F \cdot \dfrac{i}{(1+i)^n - 1}"
      inputs={
        <div className="space-y-3">
          <SelectField label="Modo" value={s.modo} onChange={(v) => setS({ ...s, modo: v as Modo })} options={[
            { value: 'F-dado-A', label: 'Dado depósito A → calcular F' },
            { value: 'A-dado-F', label: 'Dada meta F → calcular A' },
            { value: 'n-dado-A-F', label: 'Dados A y F → calcular n' },
            { value: 'i-dado-A-F', label: 'Dados A y F → calcular i' },
          ]} />
          <SelectField label="Tipo de capitalización" value={s.tipo} onChange={(v) => setS({ ...s, tipo: v as any })} options={[
            { value: 'vencida', label: 'Vencida (depósito al final del período)' },
            { value: 'anticipada', label: 'Anticipada (al inicio del período)' },
          ]} />
          {(s.modo !== 'A-dado-F') && <InputField label="Depósito periódico A" value={s.A} onChange={(v) => setS({ ...s, A: v })} suffix="COP" />}
          {(s.modo !== 'F-dado-A') && <InputField label="Meta F" value={s.F} onChange={(v) => setS({ ...s, F: v })} suffix="COP" />}
          {(s.modo !== 'i-dado-A-F') && <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} hint="0.01 = 1% mensual" />}
          {(s.modo !== 'n-dado-A-F') && <InputField label="Número de periodos n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />}
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular</button>
        <ScenarioIO moduleId="capitalizacion" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={labelResult} value={formatResult(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
