import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

interface State { tipo: 'comercial' | 'racional'; F: string; tasa: string; n: string }
const inicial: State = { tipo: 'comercial', F: '1000000', tasa: '0.10', n: '0.5' };

export const DescuentoSimple = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<any | null>(null);
  const [conv, setConv] = useState<{ resultado: string; pasos: any[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      const body: any = { tipo: s.tipo, F: s.F, n: s.n };
      if (s.tipo === 'comercial') body.d = s.tasa; else body.i = s.tasa;
      setR(await apiPost('/descuento-simple/calcular', body));
    } catch (e: any) { setErr(e.message); }
  };

  const convertirTasa = async () => {
    setErr(null);
    try {
      const body: any = { direccion: s.tipo === 'comercial' ? 'd-a-i' : 'i-a-d', n: s.n };
      if (s.tipo === 'comercial') body.d = s.tasa; else body.i = s.tasa;
      setConv(await apiPost('/descuento-simple/convertir-tasa', body));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Descuento Simple"
      category="Fundamentos"
      description="Descuento aplicado al valor nominal F antes de su vencimiento. El descuento comercial usa el valor nominal como base; el racional (matemático) usa el valor presente."
      formula={s.tipo === 'comercial' ? 'D = F \\cdot d \\cdot n \\quad ; \\quad V_t = F - D' : 'D_r = \\dfrac{F \\cdot i \\cdot n}{1 + i \\cdot n}'}
      inputs={
        <div className="space-y-3">
          <SelectField label="Tipo de descuento" value={s.tipo} onChange={(v) => setS({ ...s, tipo: v as any })} options={[
            { value: 'comercial', label: 'Comercial (bancario)' },
            { value: 'racional', label: 'Racional (matemático)' },
          ]} />
          <InputField label="Valor nominal F" value={s.F} onChange={(v) => setS({ ...s, F: v })} suffix="COP" />
          <InputField label={s.tipo === 'comercial' ? 'Tasa de descuento d' : 'Tasa de interés i'} value={s.tasa} onChange={(v) => setS({ ...s, tasa: v })} hint="Decimal: 0.10 = 10%" />
          <InputField label="Tiempo n (en años o fracción)" value={s.n} onChange={(v) => setS({ ...s, n: v })} hint="Ej. 0.5 = 6 meses" />
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Calcular descuento</button>
        <button className="btn-outline" onClick={convertirTasa}>Convertir d↔i</button>
        <ScenarioIO moduleId="descuento-simple" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Descuento" value={fmtCOP(r.resultado.descuento)} />
          <ResultValue label="Valor de la transacción" value={fmtCOP(r.resultado.valorTransaccion)} highlight />
          <StepByStep pasos={r.pasos} />
          {conv && (
            <div className="mt-4 pt-4 border-t border-bg-border">
              <h4 className="text-sm font-medium text-text-muted mb-2">Conversión de tasa</h4>
              <ResultValue label={s.tipo === 'comercial' ? 'Tasa de interés equivalente i' : 'Tasa de descuento equivalente d'} value={fmtRate(conv.resultado)} />
            </div>
          )}
        </div>
      ) : null}
    />
  );
};
