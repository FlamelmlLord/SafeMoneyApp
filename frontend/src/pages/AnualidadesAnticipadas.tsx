import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { Timeline } from '../components/Timeline';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { calcular: 'P' | 'F'; A: string; i: string; n: string }
const inicial: State = { calcular: 'P', A: '100', i: '0.05', n: '10' };

export const AnualidadesAnticipadas = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      setR(await apiPost('/anualidades/calcular', { tipo: 'anticipada', calcular: s.calcular, A: s.A, i: s.i, n: s.n }));
    } catch (e: any) { setErr(e.message); }
  };

  const n = Number(s.n) || 0;
  const flujos = Array.from({ length: n }, (_, i) => ({ periodo: i, monto: s.A, tipo: 'negativo' as const }));

  return (
    <Calculator
      title="Anualidades Anticipadas"
      category="Series uniformes"
      description="Serie de pagos iguales al inicio de cada período (a diferencia de las vencidas). Es la modalidad típica de arrendamientos y leasing."
      formula="P_{ant} = A \cdot \dfrac{1 - (1+i)^{-n}}{i} \cdot (1+i)"
      inputs={
        <div className="space-y-3">
          <SelectField label="¿Qué deseas calcular?" value={s.calcular} onChange={(v) => setS({ ...s, calcular: v as 'P' | 'F' })} options={[
            { value: 'P', label: 'Valor Presente (P)' },
            { value: 'F', label: 'Valor Futuro (F)' },
          ]} />
          <InputField label="Cuota A" value={s.A} onChange={(v) => setS({ ...s, A: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} />
          <InputField label="Número de pagos n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular</button>
        <ScenarioIO moduleId="anualidades-anticipadas" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={s.calcular === 'P' ? 'Valor Presente anticipada' : 'Valor Futuro anticipada'} value={fmtCOP(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
      extra={n > 0 && n <= 30 && (
        <section className="card mt-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">Línea de tiempo</h3>
          <Timeline flujos={flujos} periodos={n} />
        </section>
      )}
    />
  );
};
