import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtRate } from '../lib/format';

interface State { direccion: 'nominal-a-periodica' | 'periodica-a-nominal'; tasa: string; m: string }
const inicial: State = { direccion: 'nominal-a-periodica', tasa: '0.24', m: '12' };

export const TasaNominalPeriodica = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const tipoOrigen = s.direccion === 'nominal-a-periodica' ? 'nominal' : 'periodica';
      const tipoDestino = s.direccion === 'nominal-a-periodica' ? 'periodica' : 'nominal';
      const m = Number(s.m);
      setR(await apiPost('/tasas/convertir', { tipoOrigen, tipoDestino, tasa: s.tasa, mOrigen: m, mDestino: m }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Tasa Nominal ↔ Periódica"
      category="Compuesto y tasas"
      description="La tasa nominal anual (J) es la suma simple de las tasas periódicas; la tasa periódica (i) es la que realmente se aplica cada período de capitalización."
      formula="i = \dfrac{J}{m} \quad ; \quad J = i \cdot m \quad (m=\text{frecuencia de capitalización})"
      inputs={
        <div className="space-y-3">
          <SelectField label="Dirección" value={s.direccion} onChange={(v) => setS({ ...s, direccion: v as any })} options={[
            { value: 'nominal-a-periodica', label: 'Nominal → Periódica' },
            { value: 'periodica-a-nominal', label: 'Periódica → Nominal' },
          ]} />
          <InputField label={s.direccion === 'nominal-a-periodica' ? 'Tasa nominal anual J' : 'Tasa periódica i'} value={s.tasa} onChange={(v) => setS({ ...s, tasa: v })} hint="Decimal: 0.24 = 24%" />
          <SelectField label="Frecuencia m (períodos por año)" value={s.m} onChange={(v) => setS({ ...s, m: v })} options={[
            { value: '12', label: '12 - mensual' },
            { value: '6', label: '6 - bimestral' },
            { value: '4', label: '4 - trimestral' },
            { value: '3', label: '3 - cuatrimestral' },
            { value: '2', label: '2 - semestral' },
            { value: '24', label: '24 - quincenal' },
          ]} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Convertir</button>
        <ScenarioIO moduleId="tasa-nominal-periodica" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={s.direccion === 'nominal-a-periodica' ? 'Tasa periódica i' : 'Tasa nominal J'} value={fmtRate(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
