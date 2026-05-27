import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { Timeline } from '../components/Timeline';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { A: string; i: string; n: string; k: string }
const inicial: State = { A: '100', i: '0.05', n: '10', k: '3' };

export const AnualidadesDiferidas = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      setR(await apiPost('/anualidades/calcular', { tipo: 'diferida', calcular: 'P', A: s.A, i: s.i, n: s.n, k: Number(s.k) }));
    } catch (e: any) { setErr(e.message); }
  };

  const n = Number(s.n) || 0;
  const k = Number(s.k) || 0;
  const flujos = Array.from({ length: n }, (_, i) => ({ periodo: k + i + 1, monto: s.A, tipo: 'negativo' as const }));

  return (
    <Calculator
      title="Anualidades Diferidas"
      category="Series uniformes"
      description="Una anualidad cuyos pagos inician después de k períodos de gracia. El interés se acumula durante el diferimiento pero no hay pagos."
      formula="P_{dif} = \dfrac{P_{vencida}}{(1+i)^k} = A \cdot \dfrac{1 - (1+i)^{-n}}{i} \cdot (1+i)^{-k}"
      inputs={
        <div className="space-y-3">
          <InputField label="Cuota A" value={s.A} onChange={(v) => setS({ ...s, A: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} />
          <InputField label="Pagos n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />
          <InputField label="Período de gracia k" value={s.k} onChange={(v) => setS({ ...s, k: v })} hint="Períodos antes del primer pago" />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular VP diferido</button>
        <ScenarioIO moduleId="anualidades-diferidas" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Valor Presente diferido" value={fmtCOP(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
      extra={n > 0 && (n + k) <= 30 && (
        <section className="card mt-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">Línea de tiempo (gracia: {k} períodos, luego {n} pagos)</h3>
          <Timeline flujos={flujos} periodos={n + k} />
        </section>
      )}
    />
  );
};
