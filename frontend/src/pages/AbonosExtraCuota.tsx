import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { ResultTable } from '../components/ResultTable';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost, type ExtraPaymentResult } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { P: string; i: string; n: string; abono: string; periodoAbono: string }
const inicial: State = { P: '10000000', i: '0.02', n: '24', abono: '1000000', periodoAbono: '6' };

export const AbonosExtraCuota = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<ExtraPaymentResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      setR(await apiPost('/abonos-extra/reducir-cuota', { P: s.P, i: s.i, n: Number(s.n), abono: s.abono, periodoAbono: Number(s.periodoAbono) }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Abonos Extraordinarios — Reducir Cuota"
      category="Amortización y avanzados"
      description="Aplicar un pago extra al saldo mantiene el plazo original pero reduce la cuota mensual subsecuente. Útil para mejorar flujo de caja."
      formula="\text{Nueva cuota} = \text{Saldo}_{k} \cdot \dfrac{i}{1-(1+i)^{-(n-k)}}"
      inputs={
        <div className="space-y-3">
          <InputField label="Capital P" value={s.P} onChange={(v) => setS({ ...s, P: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} />
          <InputField label="Plazo n (sin cambio)" value={s.n} onChange={(v) => setS({ ...s, n: v })} />
          <InputField label="Monto del abono extra" value={s.abono} onChange={(v) => setS({ ...s, abono: v })} suffix="COP" />
          <InputField label="Período en que se aplica" value={s.periodoAbono} onChange={(v) => setS({ ...s, periodoAbono: v })} />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular nueva cuota</button>
        <ScenarioIO moduleId="abonos-extra-cuota" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Cuota original" value={fmtCOP(r.comparacion?.cuotaOriginal ?? '0')} />
          <ResultValue label="Cuota nueva" value={fmtCOP(r.comparacion?.cuotaNueva ?? '0')} highlight />
          <ResultValue label="Ahorro por cuota" value={fmtCOP(r.comparacion?.ahorroPorCuota ?? '0')} />
          <ResultValue label="Total intereses" value={fmtCOP(r.totales.interes)} />
        </div>
      ) : null}
      extra={r && (
        <section className="card mt-6">
          <ResultTable filas={r.tabla} showAbonoExtra title="Amortización con abono extra (reducir cuota)" />
        </section>
      )}
    />
  );
};
