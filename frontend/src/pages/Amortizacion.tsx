import { useState } from 'react';

import { Calculator } from '../components/Calculator';

import {
  InputField,
  ResultValue,
} from '../components/InputField';

import { ResultTable } from '../components/ResultTable';

import { ScenarioIO } from '../components/ScenarioIO';

import {
  apiPost,
  type ExtraPaymentResult,
} from '../lib/api';

import { fmtCOP } from '../lib/format';

interface Abono {
  periodo: string;
  valor: string;
  tipo: 'reducir-tiempo' | 'reducir-cuota';
}

interface State {
  P: string;
  i: string;
  n: string;

  abonos: Abono[];
}

const inicial: State = {
  P: '2000000',
  i: '0.10',
  n: '6',

  abonos: [],
};

export const Amortizacion = () => {

  const [s, setS] =
    useState<State>(inicial);

  const [r, setR] =
    useState<ExtraPaymentResult | null>(null);

  const [err, setErr] =
    useState<string | null>(null);

  const agregarAbono = () => {

    setS({
      ...s,
      abonos: [
        ...s.abonos,
        {
          periodo: '',
          valor: '',
          tipo: 'reducir-tiempo',
        },
      ],
    });
  };

  const actualizarAbono = (
    index: number,
    campo: keyof Abono,
    valor: string
  ) => {

    const nuevos = [...s.abonos];

    nuevos[index] = {
      ...nuevos[index],
      [campo]: valor,
    };

    setS({
      ...s,
      abonos: nuevos,
    });
  };

  const eliminarAbono = (index: number) => {

    setS({
      ...s,
      abonos: s.abonos.filter(
        (_, i) => i !== index
      ),
    });
  };

  const calcular = async () => {

    setErr(null);

    try {

      const r = await apiPost(
        '/amortizacion/calcular',
        {
          P: s.P,
          i: s.i,
          n: Number(s.n),

          abonos: s.abonos.map(a => ({
            periodo: Number(a.periodo),
            valor: a.valor,
            tipo: a.tipo,
          })),
        }
      );

      setR(r);

    } catch (e: any) {

      setErr(e.message);
    }
  };

  return (
    <Calculator
      title="Tabla de Amortización"
      category="Amortización"
      description="
      Construcción automática de tabla de amortización con posibilidad de agregar múltiples abonos extraordinarios para reducir tiempo o reducir cuota.
      "
      formula="A = P \\cdot \\dfrac{i}{1-(1+i)^{-n}}"

      inputs={

        <div className="space-y-4">

          <InputField
            label="Préstamo / Capital"
            value={s.P}
            onChange={(v) =>
              setS({
                ...s,
                P: v,
              })
            }
            suffix="COP"
          />

          <InputField
            label="Tasa periódica"
            value={s.i}
            onChange={(v) =>
              setS({
                ...s,
                i: v,
              })
            }
            hint="0.10 = 10%"
          />

          <InputField
            label="Número de períodos"
            value={s.n}
            onChange={(v) =>
              setS({
                ...s,
                n: v,
              })
            }
          />

          <div className="border rounded-xl p-4 space-y-4">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold">
                Abonos extraordinarios
              </h3>

              <button
                className="btn-primary"
                onClick={agregarAbono}
              >
                Agregar abono
              </button>
            </div>

            {s.abonos.length === 0 && (
              <p className="text-sm text-text-subtle">
                No hay abonos agregados.
              </p>
            )}

            {s.abonos.map((a, index) => (

              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-3"
              >

                <InputField
                  label="Período"
                  value={a.periodo}
                  onChange={(v) =>
                    actualizarAbono(
                      index,
                      'periodo',
                      v
                    )
                  }
                />

                <InputField
                  label="Valor"
                  value={a.valor}
                  onChange={(v) =>
                    actualizarAbono(
                      index,
                      'valor',
                      v
                    )
                  }
                  suffix="COP"
                />

                <div>

                  <label className="text-sm font-medium">
                    Tipo
                  </label>

                  <select
                    className="input w-full mt-1"
                    value={a.tipo}
                    onChange={(e) =>
                      actualizarAbono(
                        index,
                        'tipo',
                        e.target.value
                      )
                    }
                  >
                    <option value="reducir-tiempo">
                      Reducir períodos
                    </option>

                    <option value="reducir-cuota">
                      Reducir cuota
                    </option>
                  </select>
                </div>

                <div className="flex items-end">

                  <button
                    className="btn-danger w-full"
                    onClick={() =>
                      eliminarAbono(index)
                    }
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      }

      actions={
        <>
          <button
            className="btn-primary"
            onClick={calcular}
          >
            Generar tabla
          </button>

          <ScenarioIO
            moduleId="amortizacion"
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
              label="Cuota inicial"
              value={fmtCOP(r.cuota)}
              highlight
            />

            <ResultValue
              label="Total intereses"
              value={fmtCOP(
                r.totales.interes
              )}
            />

            <ResultValue
              label="Total pagado"
              value={fmtCOP(
                r.totales.total
              )}
            />

          </div>

        ) : null
      }

      extra={
        r && (
          <section className="card mt-6">

            <ResultTable
              filas={r.tabla}
              showAbonoExtra
              title="Tabla de amortización"
            />

          </section>
        )
      }
    />
  );
};