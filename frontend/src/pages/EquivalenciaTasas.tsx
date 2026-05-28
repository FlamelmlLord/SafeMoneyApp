import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost } from '../lib/api';
import { fmtRate } from '../lib/format';

type Tipo = 'efectiva' | 'nominal';

interface State {
  tipoOrigen: Tipo;
  tipoDestino: Tipo;
  tasa: string;
  periodoOrigen: string;
  periodoDestino: string;
}

const inicial: State = {
  tipoOrigen: 'efectiva',
  tipoDestino: 'efectiva',
  tasa: '0.02',
  periodoOrigen: '12',
  periodoDestino: '4',
};

const periodos = [
  { value: '12', label: 'Mensual' },
  { value: '6', label: 'Bimestral' },
  { value: '4', label: 'Trimestral' },
  { value: '3', label: 'Cuatrimestral' },
  { value: '2', label: 'Semestral' },
  { value: '1', label: 'Anual' },
];

export const EquivalenciaTasas = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {
    setErr(null);

    try {
      const data = await apiPost('/tasas/convertir', {
        tipoOrigen: s.tipoOrigen,
        tipoDestino: s.tipoDestino,
        tasa: s.tasa,
        mOrigen: Number(s.periodoOrigen),
        mDestino: Number(s.periodoDestino),
      });

      setR(data);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <Calculator
      title="Equivalencia de Tasas"
      category="Tasas"
      description="Convierte tasas efectivas y nominales entre diferentes periodicidades."
      formula="(1+i_1)^{m_1} = (1+i_2)^{m_2}"
      inputs={
        <div className="space-y-3">

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Tipo origen"
              value={s.tipoOrigen}
              onChange={(v) => setS({ ...s, tipoOrigen: v as Tipo })}
              options={[
                { value: 'efectiva', label: 'Efectiva' },
                { value: 'nominal', label: 'Nominal' },
              ]}
            />

            <SelectField
              label="Tipo destino"
              value={s.tipoDestino}
              onChange={(v) => setS({ ...s, tipoDestino: v as Tipo })}
              options={[
                { value: 'efectiva', label: 'Efectiva' },
                { value: 'nominal', label: 'Nominal' },
              ]}
            />
          </div>

          <InputField
            label="Tasa"
            value={s.tasa}
            onChange={(v) => setS({ ...s, tasa: v })}
            hint="Decimal: 0.02 = 2%"
          />

          <div className="grid grid-cols-2 gap-3">

            <SelectField
              label="Periodicidad origen"
              value={s.periodoOrigen}
              onChange={(v) => setS({ ...s, periodoOrigen: v })}
              options={periodos}
            />

            <SelectField
              label="Periodicidad destino"
              value={s.periodoDestino}
              onChange={(v) => setS({ ...s, periodoDestino: v })}
              options={periodos}
            />

          </div>

        </div>
      }
      actions={
        <>
          <button className="btn-primary" onClick={calcular}>
            Convertir
          </button>

          <ScenarioIO
            moduleId="equivalencia-tasas"
            state={s}
            onImport={setS}
          />
        </>
      }
      results={
        err ? (
          <div className="text-danger">{err}</div>
        ) : r ? (
          <div className="space-y-3">

            <ResultValue
              label="Tasa equivalente"
              value={fmtRate(r.resultado)}
              highlight
            />

            <StepByStep pasos={r.pasos} />

          </div>
        ) : null
      }
    />
  );
};