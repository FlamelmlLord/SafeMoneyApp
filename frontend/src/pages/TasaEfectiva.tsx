import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import {
  InputField,
  ResultValue,
  SelectField
} from '../components/InputField';

import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

interface State {
  capital: string;
  tasa: string;
  tiempo: string;

  tipo: 'vencida' | 'anticipada';

  frecuenciaOrigen: string;
  frecuenciaDestino: string;
}

const inicial: State = {
  capital: '1000000',
  tasa: '0.08',
  tiempo: '1',

  tipo: 'vencida',

  frecuenciaOrigen: '12',
  frecuenciaDestino: '4',
};

const frecuencias = [
  { value: '360', label: 'Diaria' },
  { value: '24', label: 'Quincenal' },
  { value: '12', label: 'Mensual' },
  { value: '6', label: 'Bimestral' },
  { value: '4', label: 'Trimestral' },
  { value: '3', label: 'Cuatrimestral' },
  { value: '2', label: 'Semestral' },
  { value: '1', label: 'Anual' },
];

export const TasaEfectiva = () => {

  const [s, setS] = useState<State>(inicial);

  const [r, setR] = useState<any | null>(null);

  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {

    setErr(null);

    try {

      const data = await apiPost(
        '/tasas/tasa-efectiva-comparar',
        {
          capital: s.capital,
          tasa: s.tasa,
          tiempo: s.tiempo,

          tipo: s.tipo,

          mOrigen: Number(s.frecuenciaOrigen),
          mDestino: Number(s.frecuenciaDestino),
        }
      );

      setR(data);

    } catch (e: any) {

      setErr(e.message);
    }
  };

  return (
    <Calculator
      title="Tasas Efectivas"
      category="Tasas"

      description="
Convierte tasas efectivas entre diferentes periodos y compara el monto final de una inversión usando capitalización compuesta.
      "

      formula="F = P(1+i)^n"

      inputs={
        <div className="space-y-3">

          <InputField
            label="Capital"
            value={s.capital}
            onChange={(v) => setS({ ...s, capital: v })}
            suffix="COP"
          />

          <InputField
            label="Tasa"
            value={s.tasa}
            onChange={(v) => setS({ ...s, tasa: v })}
            hint="0.08 = 8%"
          />

          <InputField
            label="Tiempo (años)"
            value={s.tiempo}
            onChange={(v) => setS({ ...s, tiempo: v })}
          />

          <SelectField
            label="Tipo de tasa"
            value={s.tipo}
            onChange={(v) => setS({ ...s, tipo: v as any })}
            options={[
              { value: 'vencida', label: 'Vencida' },
              { value: 'anticipada', label: 'Anticipada' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">

            <SelectField
              label="Frecuencia origen"
              value={s.frecuenciaOrigen}
              onChange={(v) => setS({ ...s, frecuenciaOrigen: v })}
              options={frecuencias}
            />

            <SelectField
              label="Frecuencia destino"
              value={s.frecuenciaDestino}
              onChange={(v) => setS({ ...s, frecuenciaDestino: v })}
              options={frecuencias}
            />

          </div>

        </div>
      }

      actions={
        <>
          <button
            className="btn-primary"
            onClick={calcular}
          >
            Calcular
          </button>

          <ScenarioIO
            moduleId="tasas-efectivas"
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
              value={fmtRate(r.tasaEquivalente)}
            />

            <ResultValue
              label="Monto final"
              value={fmtCOP(r.montoFinal)}
              highlight
            />

            <StepByStep pasos={r.pasos} />

          </div>
        ) : null
      }
    />
  );
};