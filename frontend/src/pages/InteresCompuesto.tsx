import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Var = 'F' | 'P' | 'i' | 'n' | 'I';
interface State { calcular: Var; P: string; F: string; i: string; n: string }

const inicial: State = { calcular: 'F', P: '1000', F: '', i: '0.10', n: '5' };

export const InteresCompuesto = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [comp, setComp] = useState<{ serie: { n: number; simple: string; compuesto: string }[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const body: Record<string, string> = { calcular: s.calcular };
      // I requiere P, i, n. Otros requieren los 3 valores conocidos excepto la incógnita.
      if (s.calcular === 'I') {
        body.P = s.P; body.i = s.i; body.n = s.n;
      } else {
        if (s.calcular !== 'F') body.F = s.F;
        if (s.calcular !== 'P') body.P = s.P;
        if (s.calcular !== 'i') body.i = s.i;
        if (s.calcular !== 'n') body.n = s.n;
      }
      setR(await apiPost('/interes-compuesto/calcular', body));
    } catch (e: any) { setErr(e.message); }
  };

  const verComparativa = async () => {
    setErr(null);
    try {
      setComp(await apiPost('/interes-compuesto/comparativa', { P: s.P, i: s.i, nMax: Number(s.n) || 12 }));
    } catch (e: any) { setErr(e.message); }
  };

  const labelResultado = s.calcular === 'i' ? 'Tasa periódica' : s.calcular === 'n' ? 'Periodos' : `Valor ${s.calcular}`;
  const formatear = (v: string) => s.calcular === 'i' ? fmtRate(v) : s.calcular === 'n' ? Number(v).toFixed(4) : fmtCOP(v);

  return (
    <Calculator
      title="Interés Compuesto"
      category="Compuesto y tasas"
      description="El interés del período se suma al capital y genera nuevo interés. Resulta en crecimiento exponencial, en contraste con el lineal del interés simple."
      formula="F = P(1 + i)^n \quad ; \quad P = F(1 + i)^{-n}"
      inputs={
        <div className="space-y-3">
          <SelectField label="¿Qué deseas calcular?" value={s.calcular} onChange={(v) => setS({ ...s, calcular: v as Var })} options={[
            { value: 'F', label: 'Valor Futuro (F)' },
            { value: 'P', label: 'Valor Presente (P)' },
            { value: 'i', label: 'Tasa (i)' },
            { value: 'n', label: 'Periodos (n)' },
            { value: 'I', label: 'Interés total (I)' },
          ]} />
          {(s.calcular !== 'P') && <InputField label="P" value={s.P} onChange={(v) => setS({ ...s, P: v })} suffix="COP" />}
          {(s.calcular !== 'F' && s.calcular !== 'I') && <InputField label="F" value={s.F} onChange={(v) => setS({ ...s, F: v })} suffix="COP" />}
          {(s.calcular !== 'i') && <InputField label="i" value={s.i} onChange={(v) => setS({ ...s, i: v })} hint="0.10 = 10%" />}
          {(s.calcular !== 'n') && <InputField label="n" value={s.n} onChange={(v) => setS({ ...s, n: v })} />}
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular</button>
        <button className="btn-outline" onClick={verComparativa}>Comparar vs simple</button>
        <ScenarioIO moduleId="interes-compuesto" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={labelResultado} value={formatear(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
      extra={comp && (
        <section className="card space-y-3 mt-6">
          <h3 className="text-lg font-semibold">Comparativa: Interés Simple vs Compuesto</h3>
          <p className="text-sm text-text-muted">Con P={fmtCOP(s.P)} e i={fmtRate(s.i)}, crecimiento del capital en {comp.serie.length - 1} periodos.</p>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={comp.serie} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#252d3a" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#8b949e" />
                <YAxis stroke="#8b949e" tickFormatter={(v) => Number(v).toLocaleString('es-CO')} />
                <Tooltip
                  contentStyle={{ background: '#11161f', border: '1px solid #252d3a', borderRadius: 8 }}
                  formatter={(v: any) => fmtCOP(v)}
                />
                <Legend />
                <Line type="monotone" dataKey="simple" stroke="#f59e0b" strokeWidth={2} name="Simple" dot={false} />
                <Line type="monotone" dataKey="compuesto" stroke="#7c9eff" strokeWidth={2} name="Compuesto" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    />
  );
};
