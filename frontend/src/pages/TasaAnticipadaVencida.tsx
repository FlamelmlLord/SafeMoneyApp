import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtRate } from '../lib/format';

interface State { direccion: 'v-a' | 'a-v'; tasa: string }
const inicial: State = { direccion: 'v-a', tasa: '0.10' };

export const TasaAnticipadaVencida = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try { setR(await apiPost('/tasas/anticipada-vencida', s)); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Tasa Anticipada ↔ Vencida"
      category="Compuesto y tasas"
      description="Una tasa anticipada se cobra al inicio del período (descuento bancario); una vencida al final. Esta calculadora convierte entre ambas."
      formula="i_a = \dfrac{i}{1+i} \quad ; \quad i = \dfrac{i_a}{1 - i_a}"
      inputs={
        <div className="space-y-3">
          <SelectField label="Dirección" value={s.direccion} onChange={(v) => setS({ ...s, direccion: v as any })} options={[
            { value: 'v-a', label: 'Vencida → Anticipada' },
            { value: 'a-v', label: 'Anticipada → Vencida' },
          ]} />
          <InputField label={s.direccion === 'v-a' ? 'Tasa vencida i' : 'Tasa anticipada i_a'} value={s.tasa} onChange={(v) => setS({ ...s, tasa: v })} hint="Decimal: 0.10 = 10%" />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Convertir</button>
        <ScenarioIO moduleId="tasa-anticipada-vencida" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={s.direccion === 'v-a' ? 'Tasa anticipada i_a' : 'Tasa vencida i'} value={fmtRate(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
