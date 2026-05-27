import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ResultTable } from '../components/ResultTable';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost, type AmortizacionResult } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State { sistema: 'frances' | 'aleman' | 'americano' | 'colombiano'; P: string; i: string; n: string; inflacion: string }
const inicial: State = { sistema: 'frances', P: '10000000', i: '0.02', n: '12', inflacion: '0' };

const sistemaLabels: Record<State['sistema'], string> = {
  frances: 'Francés (cuota fija)',
  aleman: 'Alemán (capital fijo)',
  americano: 'Americano (solo interés)',
  colombiano: 'Colombiano (UVR / cuota constante)',
};

const sistemaDescripcion: Record<State['sistema'], string> = {
  frances: 'Cuota fija. La parte de interés decrece y el abono a capital crece.',
  aleman: 'Capital amortizado constante en cada cuota. Las cuotas decrecen con el tiempo.',
  americano: 'Sólo se pagan intereses periódicos; el capital se paga íntegramente al vencimiento.',
  colombiano: 'Sistema indexado a UVR / inflación. Si la inflación es cero, coincide con el sistema francés.',
};

const sistemaFormula: Record<State['sistema'], string> = {
  frances: 'A = P \\cdot \\dfrac{i}{1 - (1+i)^{-n}}',
  aleman: '\\text{abono fijo} = \\dfrac{P}{n} \\; ; \\; \\text{interés}_k = \\text{saldo}_{k-1} \\cdot i',
  americano: '\\text{cuota}_k = P \\cdot i \\; (\\text{si } k < n) \\; ; \\; \\text{cuota}_n = P(1+i)',
  colombiano: 'i_{real} = \\dfrac{1+i}{1+\\pi} - 1 \\; ; \\; \\text{cuota crece con } \\pi',
};

export const Amortizacion = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<AmortizacionResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const generar = async () => {
    setErr(null);
    try {
      const body: any = { sistema: s.sistema, P: s.P, i: s.i, n: Number(s.n) };
      if (s.sistema === 'colombiano') body.inflacion = s.inflacion;
      setR(await apiPost('/amortizacion/generar', body));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Tablas de Amortización"
      category="Amortización y avanzados"
      description={
        <>
          Genera la tabla completa de un crédito en los cuatro sistemas más usados.
          <div className="mt-2 text-text-subtle italic">{sistemaDescripcion[s.sistema]}</div>
        </>
      }
      formula={sistemaFormula[s.sistema]}
      inputs={
        <div className="space-y-3">
          <SelectField label="Sistema de amortización" value={s.sistema} onChange={(v) => setS({ ...s, sistema: v as State['sistema'] })} options={(Object.keys(sistemaLabels) as State['sistema'][]).map(k => ({ value: k, label: sistemaLabels[k] }))} />
          <InputField label="Capital P" value={s.P} onChange={(v) => setS({ ...s, P: v })} suffix="COP" />
          <InputField label="Tasa periódica i" value={s.i} onChange={(v) => setS({ ...s, i: v })} hint="0.02 = 2% mensual" />
          <InputField label="Plazo n" value={s.n} onChange={(v) => setS({ ...s, n: v })} hint="Número de periodos" />
          {s.sistema === 'colombiano' && (
            <InputField label="Inflación esperada π" value={s.inflacion} onChange={(v) => setS({ ...s, inflacion: v })} hint="0.04 = 4% anual aproximada" />
          )}
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={generar}>Generar tabla</button>
        <ScenarioIO moduleId="amortizacion" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          {r.cuota && <ResultValue label="Cuota fija" value={fmtCOP(r.cuota)} highlight />}
          {r.cuotaReal && <ResultValue label="Cuota real (en UVR)" value={fmtCOP(r.cuotaReal)} />}
          <ResultValue label="Total intereses" value={fmtCOP(r.totales.interes)} />
          <ResultValue label="Total a pagar" value={fmtCOP(r.totales.total)} />
          {r.nota && <p className="text-xs text-text-subtle italic">{r.nota}</p>}
        </div>
      ) : null}
      extra={r && (
        <section className="card mt-6">
          <ResultTable filas={r.tabla} title={`Amortización ${sistemaLabels[s.sistema]}`} />
        </section>
      )}
    />
  );
};
