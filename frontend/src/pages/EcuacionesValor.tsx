import { useState } from 'react';

import { Calculator } from '../components/Calculator';

import {
  InputField,
  ResultValue,
  SelectField
} from '../components/InputField';

import { ScenarioIO } from '../components/ScenarioIO';

import { StepByStep } from '../components/StepByStep';

import {
  Timeline,
  type FlujoTimeline
} from '../components/Timeline';

import {
  apiPost,
  type CalcResultadoSimple
} from '../lib/api';

import { fmtCOP } from '../lib/format';

interface Flujo {

  monto: string;

  periodo: number;

  lado: 'izquierda' | 'derecha';

  tieneX: boolean;

  coeficienteX: string;
}

interface State {

  tipoTasa: 'nominal' | 'efectiva';

  frecuencia: string;

  i: string;

  fechaFocal: string;

  flujos: Flujo[];
}

const inicial: State = {

  tipoTasa: 'nominal',

  frecuencia: '12',

  i: '0.18',

  fechaFocal: '18',

  flujos: [

    {
      monto: '3200000',
      periodo: 3,
      lado: 'izquierda',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '1200000',
      periodo: 5,
      lado: 'izquierda',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '4200000',
      periodo: 11,
      lado: 'izquierda',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '2000000',
      periodo: 15,
      lado: 'izquierda',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '7000000',
      periodo: 0,
      lado: 'derecha',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '3000000',
      periodo: 8,
      lado: 'derecha',
      tieneX: false,
      coeficienteX: '1'
    },

    {
      monto: '0',
      periodo: 18,
      lado: 'derecha',
      tieneX: true,
      coeficienteX: '1'
    },
  ],
};

export const EcuacionesValor = () => {

  const [s, setS] = useState<State>(inicial);

  const [r, setR] =
    useState<CalcResultadoSimple | null>(null);

  const [err, setErr] =
    useState<string | null>(null);

  const resolver = async () => {

    setErr(null);

    try {

      setR(await apiPost(
        '/ecuaciones-valor/resolver',
        {

          flujos: s.flujos,

          fechaFocal: Number(s.fechaFocal),

          i: s.i,

          tipoTasa: s.tipoTasa,

          frecuencia: Number(s.frecuencia),
        }
      ));

    } catch (e: any) {

      setErr(e.message);
    }
  };

  const setFlujo = (
    idx: number,
    key: keyof Flujo,
    val: any
  ) => {

    const next = [...s.flujos];

    (next[idx] as any)[key] = val;

    setS({
      ...s,
      flujos: next
    });
  };

  const addFlujo = () =>
    setS({
      ...s,
      flujos: [
        ...s.flujos,
        {
          monto: '0',
          periodo: 0,
          lado: 'izquierda',
          tieneX: false,
          coeficienteX: '1'
        }
      ]
    });

  const removeFlujo = (i: number) =>
    setS({
      ...s,
      flujos: s.flujos.filter(
        (_, idx) => idx !== i
      )
    });

  const flujosTimeline: FlujoTimeline[] =
    s.flujos.map((f) => ({

      periodo: f.periodo,

      monto: f.monto,

      etiqueta: f.tieneX
        ? `${f.coeficienteX}·X`
        : undefined,

      tipo: f.tieneX
        ? 'incognita'
        : (
          f.lado === 'izquierda'
            ? 'positivo'
            : 'negativo'
        ),
    }));

  const maxPer = Math.max(
    ...s.flujos.map((f) => f.periodo),
    Number(s.fechaFocal),
    12
  );

  return (

    <Calculator

      title="Ecuaciones de Valor"

      category="Amortización y avanzados"

      description="
Resuelve refinanciaciones, reemplazos de deuda y consolidaciones llevando todos los flujos a una fecha focal usando interés compuesto.
      "

      formula="\sum F(1+i)^n"

      inputs={

        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-3">

            <SelectField
              label="Tipo de tasa"

              value={s.tipoTasa}

              onChange={(v) =>
                setS({
                  ...s,
                  tipoTasa: v as any
                })
              }

              options={[
                {
                  value: 'nominal',
                  label: 'Nominal'
                },

                {
                  value: 'efectiva',
                  label: 'Efectiva'
                },
              ]}
            />

            <SelectField
              label="Frecuencia"

              value={s.frecuencia}

              onChange={(v) =>
                setS({
                  ...s,
                  frecuencia: v
                })
              }

              options={[
                {
                  value: '12',
                  label: 'Mensual'
                },

                {
                  value: '6',
                  label: 'Bimestral'
                },

                {
                  value: '4',
                  label: 'Trimestral'
                },

                {
                  value: '3',
                  label: 'Cuatrimestral'
                },

                {
                  value: '2',
                  label: 'Semestral'
                },

                {
                  value: '1',
                  label: 'Anual'
                },
              ]}
            />

          </div>

          <InputField
            label={
              s.tipoTasa === 'nominal'
                ? 'Tasa nominal J'
                : 'Tasa efectiva i'
            }

            value={s.i}

            onChange={(v) =>
              setS({
                ...s,
                i: v
              })
            }

            hint="0.18 = 18%"
          />

          <InputField
            label="Fecha focal"

            value={s.fechaFocal}

            onChange={(v) =>
              setS({
                ...s,
                fechaFocal: v
              })
            }
          />

          <div className="space-y-2">

            <label className="label">
              Flujos
            </label>

            {s.flujos.map((f, i) => (

              <div
                key={i}
                className="
border border-bg-border
rounded-lg
p-3
space-y-2
"
              >

                <div className="
grid
grid-cols-4
gap-2
">

                  <input
                    className="input"

                    disabled={f.tieneX}

                    value={
                      f.tieneX
                        ? '(X)'
                        : f.monto
                    }

                    onChange={(e) =>
                      setFlujo(
                        i,
                        'monto',
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="number"

                    className="input"

                    value={f.periodo}

                    onChange={(e) =>
                      setFlujo(
                        i,
                        'periodo',
                        Number(e.target.value)
                      )
                    }
                  />

                  <select
                    className="input"

                    value={f.lado}

                    onChange={(e) =>
                      setFlujo(
                        i,
                        'lado',
                        e.target.value as any
                      )
                    }
                  >

                    <option value="izquierda">
                      Deuda
                    </option>

                    <option value="derecha">
                      Pago
                    </option>

                  </select>

                  <button
                    className="btn-outline"

                    onClick={() =>
                      removeFlujo(i)
                    }
                  >
                    ✕
                  </button>

                </div>

                <div className="
flex
items-center
gap-3
text-xs
">

                  <label className="
flex
items-center
gap-2
">

                    <input
                      type="checkbox"

                      checked={f.tieneX}

                      onChange={(e) =>
                        setFlujo(
                          i,
                          'tieneX',
                          e.target.checked
                        )
                      }
                    />

                    Contiene X

                  </label>

                  {f.tieneX && (

                    <InputField
                      label="Coef X"

                      value={f.coeficienteX}

                      onChange={(v) =>
                        setFlujo(
                          i,
                          'coeficienteX',
                          v
                        )
                      }
                    />
                  )}

                </div>

              </div>

            ))}

            <button
              className="btn-outline"

              onClick={addFlujo}
            >
              + Agregar flujo
            </button>

          </div>

        </div>
      }

      actions={
        <>

          <button
            className="btn-primary"
            onClick={resolver}
          >
            Resolver X
          </button>

          <ScenarioIO
            moduleId="ecuaciones-valor"
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
              label="Valor de X"
              value={fmtCOP(r.resultado)}
              highlight
            />

            <StepByStep pasos={r.pasos} />

          </div>

        ) : null
      }

      extra={
        <section className="card mt-6">

          <h3 className="
text-sm
font-medium
mb-3
">
            Línea de tiempo
          </h3>

          <Timeline
            flujos={flujosTimeline}
            periodos={maxPer + 1}
            fechaFocal={Number(s.fechaFocal)}
          />

        </section>
      }
    />
  );
};