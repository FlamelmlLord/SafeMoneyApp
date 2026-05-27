import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { ResultTable } from '../components/ResultTable';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost, type ExtraPaymentResult } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { P: string; i: string; n: string; abono: string; periodoAbono: string }
const inicial: State = { P: '10000000', i: '0.02', n: '24', abono: '1000000', periodoAbono: '6' };

export const AbonosExtraTiempo = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<ExtraPaymentResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      setR(await apiPost('/abonos-extra/reducir-tiempo', { P: s.P, i: s.i, n: Number(s.n), abono: s.abono, periodoAbono: Number(s.periodoAbono) }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Abonos Extraordinarios — Reducir Tiempo"
      category="Amortización y avanzados"
      description="Aplicar un pago extra al saldo mantiene la cuota original pero acorta el plazo. Estrategia común para liberarse del crédito antes."
      formula="\text{Cuota fija} = P \cdot \dfrac{i}{1-(1+i)^{-n}} \quad ; \quad \text{nuevo } n = ?"
      inputs={
        <div className="space-y-3">
          <InputField label="Capital P" value={s.P} onChange={(v) => setS({ ...s, P: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} />
          <InputField label="Plazo original n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />
          <InputField label="Monto del abono extra" value={s.abono} onChange={(v) => setS({ ...s, abono: v })} suffix="COP" />
          <InputField label="Período en que se aplica" value={s.periodoAbono} onChange={(v) => setS({ ...s, periodoAbono: v })} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular ahorro</button>
        <ScenarioIO moduleId="abonos-extra-tiempo" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Cuota original (sin cambio)" value={fmtCOP(r.cuota ?? '0')} />
          <ResultValue label="Plazo original" value={`${r.comparacion?.nOriginal} periodos`} />
          <ResultValue label="Plazo nuevo" value={`${r.comparacion?.nNuevo} periodos`} highlight />
          <ResultValue label="Períodos ahorrados" value={`${r.comparacion?.periodosAhorrados} periodos`} />
          <ResultValue label="Total intereses con abono" value={fmtCOP(r.totales.interes)} />
        </div>
      ) : null}
      extra={r && (
        <section className="card mt-6">
          <ResultTable filas={r.tabla} showAbonoExtra title="Amortización con abono extra (reducir tiempo)" />
        </section>
      )}
    />
  );
};
