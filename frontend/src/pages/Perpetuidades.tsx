import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { tipo: 'vencida' | 'anticipada'; A: string; i: string }
const inicial: State = { tipo: 'vencida', A: '100', i: '0.05' };

export const Perpetuidades = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const tipo = s.tipo === 'vencida' ? 'perpetuidad-vencida' : 'perpetuidad-anticipada';
      setR(await apiPost('/anualidades/calcular', { tipo, calcular: 'P', A: s.A, i: s.i }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Perpetuidades"
      category="Series uniformes"
      description="Serie de pagos iguales que se extiende indefinidamente. Útil para valorar bonos perpetuos, fideicomisos y dividendos estables."
      formula={s.tipo === 'vencida' ? 'VP_{\\infty} = \\dfrac{A}{i}' : 'VP_{\\infty\\;ant} = \\dfrac{A}{i} \\cdot (1+i)'}
      inputs={
        <div className="space-y-3">
          <SelectField label="Tipo" value={s.tipo} onChange={(v) => setS({ ...s, tipo: v as any })} options={[
            { value: 'vencida', label: 'Vencida (pago al final)' },
            { value: 'anticipada', label: 'Anticipada (al inicio)' },
          ]} />
          <InputField label="Cuota perpetua A" value={s.A} onChange={(v) => setS({ ...s, A: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular VP∞</button>
        <ScenarioIO moduleId="perpetuidades" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Valor Presente de la perpetuidad" value={fmtCOP(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
