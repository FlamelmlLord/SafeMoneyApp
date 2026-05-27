import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtRate } from '../lib/format';

interface State { tipoOrigen: string; tipoDestino: string; tasa: string; mOrigen: string; mDestino: string }
const inicial: State = { tipoOrigen: 'nominal', tipoDestino: 'efectiva', tasa: '0.24', mOrigen: '12', mDestino: '1' };

const tipos = [
  { value: 'nominal', label: 'Nominal anual vencida' },
  { value: 'periodica', label: 'Periódica vencida' },
  { value: 'efectiva', label: 'Efectiva anual vencida' },
  { value: 'anticipada-periodica', label: 'Periódica anticipada' },
  { value: 'anticipada-efectiva', label: 'Efectiva anual anticipada' },
];

export const EquivalenciaTasas = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);
    try {
      setR(await apiPost('/tasas/convertir', {
        tipoOrigen: s.tipoOrigen,
        tipoDestino: s.tipoDestino,
        tasa: s.tasa,
        mOrigen: Number(s.mOrigen),
        mDestino: Number(s.mDestino),
      }));
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Calculator
      title="Equivalencia universal de tasas"
      category="Compuesto y tasas"
      description="Convertidor universal entre cualquier par de tasas (nominal, periódica, efectiva, anticipada o vencida) con cualquier frecuencia de capitalización."
      formula="i_1 \cdot m_1 = j_1 \;\;\Longleftrightarrow\;\; (1+i_1)^{m_1} - 1 = EA = (1+i_2)^{m_2} - 1"
      inputs={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Tipo origen" value={s.tipoOrigen} onChange={(v) => setS({ ...s, tipoOrigen: v })} options={tipos} />
            <SelectField label="Tipo destino" value={s.tipoDestino} onChange={(v) => setS({ ...s, tipoDestino: v })} options={tipos} />
          </div>
          <InputField label="Tasa origen" value={s.tasa} onChange={(v) => setS({ ...s, tasa: v })} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="m origen (períodos/año)" value={s.mOrigen} onChange={(v) => setS({ ...s, mOrigen: v })} />
            <InputField label="m destino (períodos/año)" value={s.mDestino} onChange={(v) => setS({ ...s, mDestino: v })} />
          </div>
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={calcular}>Convertir</button>
        <ScenarioIO moduleId="equivalencia-tasas" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label={`Tasa destino (${tipos.find(t => t.value === s.tipoDestino)?.label})`} value={fmtRate(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
    />
  );
};
