import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import {
  InputField,
  ResultValue,
  SelectField
} from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { Timeline } from '../components/Timeline';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

type TipoAnualidad =
  | 'vencida'
  | 'anticipada'
  | 'diferida'
  | 'general';

type Calcular =
  | 'P'
  | 'F'
  | 'A';

interface State {
  tipo: TipoAnualidad;
  calcular: Calcular;

  P: string;
  F: string;
  A: string;

  tasa: string;

  tipoTasa: 'efectiva' | 'nominal';

  periodoTasa: string;
  periodoPago: string;

  n: string;
  k: string;
}

const PERIODOS = [
  { value: '12', label: 'Mensual (12)' },
  { value: '6', label: 'Bimestral (6)' },
  { value: '4', label: 'Trimestral (4)' },
  { value: '3', label: 'Cuatrimestral (3)' },
  { value: '2', label: 'Semestral (2)' },
  { value: '1', label: 'Anual (1)' },
];

const inicial: State = {
  tipo: 'vencida',
  calcular: 'A',

  P: '4000000',
  F: '0',
  A: '0',

  tasa: '0.40',

  tipoTasa: 'nominal',

  periodoTasa: '4',
  periodoPago: '4',

  n: '4',
  k: '0',
};

export const Anualidades = () => {

  const [s, setS] = useState<State>(inicial);

  const [r, setR] = useState<CalcResultadoSimple | null>(null);

  const [err, setErr] = useState<string | null>(null);

  const calcular = async () => {

    setErr(null);

    try {

      setR(await apiPost('/anualidades/unificadas', {
        tipo: s.tipo,
        calcular: s.calcular,

        P: s.P,
        F: s.F,
        A: s.A,

        tasa: s.tasa,
        tipoTasa: s.tipoTasa,

        periodoTasa: Number(s.periodoTasa),
        periodoPago: Number(s.periodoPago),

        n: Number(s.n),
        k: Number(s.k),
      }));

    } catch (e: any) {

      setErr(e.message);
    }
  };

  const n = Number(s.n) || 0;
  const k = Number(s.k) || 0;

  const inicio =
    s.tipo === 'anticipada'
      ? k
      : k + 1;

  const flujos = Array.from(
    { length: n },
    (_, i) => ({
      periodo: inicio + i,
      monto: s.A || '0',
      tipo: 'negativo' as const
    })
  );

  return (
    <Calculator
      title="Series Uniformes / Anualidades"
      category="Series Uniformes"

      description="
      Resuelve anualidades vencidas, anticipadas,
      diferidas y generales.
      Permite calcular valor presente,
      valor futuro o cuota.
      "

      formula={
        s.tipo === 'vencida'
          ? 'P = A \\cdot \\dfrac{1-(1+i)^{-n}}{i}'
          : s.tipo === 'anticipada'
            ? 'P = A \\cdot \\dfrac{1-(1+i)^{-n}}{i}(1+i)'
            : s.tipo === 'diferida'
              ? 'P = A \\cdot \\dfrac{1-(1+i)^{-n}}{i}(1+i)^{-k}'
              : 'i_p = (1+i_c)^{m_c/m_p}-1'
      }

      inputs={
        <div className="space-y-4">

          {/* TIPO */}

          <SelectField
            label="Tipo de anualidad"
            value={s.tipo}
            onChange={(v) =>
              setS({
                ...s,
                tipo: v as TipoAnualidad
              })
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
              {
                value: 'diferida',
                label: 'Diferida'
              },
              {
                value: 'general',
                label: 'General'
              },
            ]}
          />

          {/* QUE CALCULAR */}

          <SelectField
            label="¿Qué deseas calcular?"
            value={s.calcular}
            onChange={(v) =>
              setS({
                ...s,
                calcular: v as Calcular
              })
            }
            options={[
              {
                value: 'P',
                label: 'Valor Presente (P)'
              },
              {
                value: 'F',
                label: 'Valor Futuro (F)'
              },
              {
                value: 'A',
                label: 'Cuota (A)'
              },
            ]}
          />

          {/* DATOS */}

          {s.calcular !== 'P' && (
            <InputField
              label="Valor Presente P"
              value={s.P}
              onChange={(v) =>
                setS({ ...s, P: v })
              }
              suffix="COP"
            />
          )}

          {s.calcular !== 'F' && (
            <InputField
              label="Valor Futuro F"
              value={s.F}
              onChange={(v) =>
                setS({ ...s, F: v })
              }
              suffix="COP"
            />
          )}

          {s.calcular !== 'A' && (
            <InputField
              label="Cuota A"
              value={s.A}
              onChange={(v) =>
                setS({ ...s, A: v })
              }
              suffix="COP"
            />
          )}

          {/* TASA */}

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
              hint="0.32 = 32%"
            />

          </div>

          {/* PERIODOS */}

          <div className="grid grid-cols-2 gap-3">

            <SelectField
              label="Periodo de la tasa"
              value={s.periodoTasa}
              onChange={(v) =>
                setS({
                  ...s,
                  periodoTasa: v
                })
              }
              options={PERIODOS}
            />

            <SelectField
              label="Periodo de pago"
              value={s.periodoPago}
              onChange={(v) =>
                setS({
                  ...s,
                  periodoPago: v
                })
              }
              options={PERIODOS}
            />

          </div>

          {/* N */}

          <InputField
            label="Número de pagos n"
            value={s.n}
            onChange={(v) =>
              setS({ ...s, n: v })
            }
          />

          {/* DIFERIDA */}

          {s.tipo === 'diferida' && (
            <InputField
              label="Períodos de gracia k"
              value={s.k}
              onChange={(v) =>
                setS({ ...s, k: v })
              }
            />
          )}

        </div>
      }

      actions={
        <>
          <button
            className="btn-primary"
            onClick={calcular}
          >
            Resolver
          </button>

          <ScenarioIO
            moduleId="anualidades-unificadas"
            state={s}
            onImport={setS}
          />
        </>
      }

      results={
        err
          ? (
            <div className="text-danger">
              {err}
            </div>
          )
          : r
            ? (
              <div className="space-y-3">

                {s.calcular === 'P' && (
                  <ResultValue
                    label="Valor Presente"
                    value={fmtCOP(r.resultado)}
                    highlight
                  />
                )}

                {s.calcular === 'F' && (
                  <ResultValue
                    label="Valor Futuro"
                    value={fmtCOP(r.resultado)}
                    highlight
                  />
                )}

                {s.calcular === 'A' && (
                  <ResultValue
                    label="Cuota"
                    value={fmtCOP(r.resultado)}
                    highlight
                  />
                )}

                {'tasaEquivalente' in r && (
                  <ResultValue
                    label="Tasa periódica equivalente"
                    value={fmtRate((r as any).tasaEquivalente)}
                  />
                )}

                <StepByStep pasos={r.pasos} />

              </div>
            )
            : null
      }

      extra={
        n > 0 && n <= 40 && (
          <section className="card mt-6">

            <h3 className="text-sm font-medium text-text-muted mb-3">
              Línea de tiempo
            </h3>

            <Timeline
              flujos={flujos}
              periodos={n + k + 2}
            />

          </section>
        )
      }
    />
  );
};