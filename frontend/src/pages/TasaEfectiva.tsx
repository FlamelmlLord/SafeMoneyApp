import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtRate } from '../lib/format';

interface State { tipoOrigen: 'nominal' | 'periodica'; tasa: string; m: string }
const inicial: State = { tipoOrigen: 'nominal', tasa: '0.24', m: '12' };

export const TasaEfectiva = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const m = Number(s.m);
      setR(await apiPost('/tasas/convertir', { tipoOrigen: s.tipoOrigen, tipoDestino: 'efectiva', tasa: s.tasa, mOrigen: m, mDestino: 1 }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Tasa Efectiva Anual (EA / Iea)"
      category="Compuesto y tasas"
      description="La tasa efectiva anual mide la rentabilidad o costo real anual considerando la capitalización. Útil para comparar productos con frecuencias distintas."
      formula="EA = (1 + i)^m - 1"
      inputs={
        <div className="space-y-3">
          <SelectField label="Tipo de tasa origen" value={s.tipoOrigen} onChange={(v) => setS({ ...s, tipoOrigen: v as any })} options={[
            { value: 'nominal', label: 'Nominal anual (J)' },
            { value: 'periodica', label: 'Periódica (i)' },
          ]} />
          <InputField label={s.tipoOrigen === 'nominal' ? 'J' : 'i'} value={s.tasa} onChange={(v) => setS({ ...s, tasa: v })} hint="Decimal: 0.24 = 24%" />
          <SelectField label="Frecuencia m" value={s.m} onChange={(v) => setS({ ...s, m: v })} options={[
            { value: '12', label: 'Mensual (12)' },
            { value: '6', label: 'Bimestral (6)' },
            { value: '4', label: 'Trimestral (4)' },
            { value: '3', label: 'Cuatrimestral (3)' },
            { value: '2', label: 'Semestral (2)' },
            { value: '24', label: 'Quincenal (24)' },
            { value: '360', label: 'Diaria (360)' },
          ]} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular EA</button>
        <ScenarioIO moduleId="tasa-efectiva" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Tasa Efectiva Anual (EA)" value={fmtRate(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
