import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import {
  InputField,
  ResultValue,
  SelectField
} from '../components/InputField';

import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';

import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface State {

  tipo: 'vencida' | 'anticipada';

  tipoTasa: 'efectiva' | 'nominal';

  A: string;
  tasa: string;

  periodoTasa: string;
}

const inicial: State = {

  tipo: 'vencida',

  tipoTasa: 'nominal',

  A: '100000',

  tasa: '0.33',

  periodoTasa: '12',
};

const periodos = [

  { value: '12', label: 'Mensual (12)' },
  { value: '6', label: 'Bimestral (6)' },
  { value: '4', label: 'Trimestral (4)' },
  { value: '3', label: 'Cuatrimestral (3)' },
  { value: '2', label: 'Semestral (2)' },
  { value: '1', label: 'Anual (1)' },
];

export const Perpetuidades = () => {

  const [s, setS] = useState<State>(inicial);

  const [r, setR] =
    useState<CalcResultadoSimple | null>(null);

  const [err, setErr] =
    useState<string | null>(null);

  const calcular = async () => {

    setErr(null);

    try {

      setR(await apiPost(
        '/anualidades/perpetuidad',
        {
          tipo: s.tipo,

          tipoTasa: s.tipoTasa,

          A: s.A,

          tasa: s.tasa,

          m: Number(s.periodoTasa),
        }
      ));

    } catch (e: any) {

      setErr(e.message);
    }
  };

  return (

    <Calculator

      title="Perpetuidades"

      category="Series uniformes"

      description="
Serie infinita de pagos iguales.
Puede manejar tasas efectivas o nominales.
"

      formula={
        s.tipo === 'vencida'
          ? 'VP_{\\infty}=\\dfrac{A}{i}'
          : 'VP_{\\infty ant}=\\dfrac{A}{i}(1+i)'
      }

      inputs={

        <div className="space-y-3">

          <SelectField
            label="Tipo de perpetuidad"
            value={s.tipo}
            onChange={(v) =>
              setS({ ...s, tipo: v as any })
            }
            options={[
              {
                value: 'vencida',
                label: 'Vencida'
              },
              {
                value: 'anticipada',
                label: 'Anticipada'
              },
            ]}
          />

          <InputField
            label="Renta A"
            value={s.A}
            onChange={(v) =>
              setS({ ...s, A: v })
            }
            suffix="COP"
          />

          <SelectField
            label="Tipo de tasa"
            value={s.tipoTasa}
            onChange={(v) =>
              setS({ ...s, tipoTasa: v as any })
            }
            options={[
              {
                value: 'efectiva',
                label: 'Efectiva'
              },
              {
                value: 'nominal',
                label: 'Nominal'
              },
            ]}
          />

          <InputField
            label="Tasa"
            value={s.tasa}
            onChange={(v) =>
              setS({ ...s, tasa: v })
            }
            hint="0.33 = 33%"
          />

          <SelectField
            label="Periodo de la tasa"
            value={s.periodoTasa}
            onChange={(v) =>
              setS({ ...s, periodoTasa: v })
            }
            options={periodos}
          />

        </div>
      }

      actions={
        <>
          <button
            className="btn-primary"
            onClick={calcular}
          >
            Calcular VP∞
          </button>

          <ScenarioIO
            moduleId="perpetuidades"
            state={s}
            onImport={setS}
          />
        </>
      }

      results={
        err ? (
          <div className="text-danger">
            {err}
          </div>
        ) : r ? (

          <div className="space-y-3">

            <ResultValue
              label="Valor Presente"
              value={fmtCOP(r.resultado)}
              highlight
            />

            <StepByStep pasos={r.pasos} />

          </div>

        ) : null
      }
    />
  );
};