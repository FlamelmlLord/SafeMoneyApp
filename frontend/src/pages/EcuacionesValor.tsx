import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { ScenarioIO } from '../components/ScenarioIO';
import { StepByStep } from '../components/StepByStep';
import { Timeline, type FlujoTimeline } from '../components/Timeline';
import { apiPost, type CalcResultadoSimple } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface Flujo {
  monto: string;
  periodo: number;
  lado: 'izquierda' | 'derecha';
  tieneX: boolean;
  coeficienteX: string;
}

interface State { i: string; fechaFocal: string; flujos: Flujo[] }

const inicial: State = {
  i: '0.01',
  fechaFocal: '0',
  flujos: [
    { monto: '1000000', periodo: 0, lado: 'izquierda', tieneX: false, coeficienteX: '1' },
    { monto: '0', periodo: 6, lado: 'derecha', tieneX: true, coeficienteX: '1' },
    { monto: '0', periodo: 12, lado: 'derecha', tieneX: true, coeficienteX: '1' },
  ],
};

export const EcuacionesValor = () => {
  const [s, setS] = useState<State>(inicial);
  const [r, setR] = useState<CalcResultadoSimple | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const resolver = async () => {
    setErr(null);
    try {
      setR(await apiPost('/ecuaciones-valor/resolver', {
        flujos: s.flujos,
        fechaFocal: Number(s.fechaFocal),
        i: s.i,
      }));
    } catch (e: any) { setErr(e.message); }
  };

  const setFlujo = (idx: number, key: keyof Flujo, val: any) => {
    const next = [...s.flujos];
    (next[idx] as any)[key] = val;
    setS({ ...s, flujos: next });
  };

  const addFlujo = () => setS({ ...s, flujos: [...s.flujos, { monto: '0', periodo: 0, lado: 'izquierda', tieneX: false, coeficienteX: '1' }] });
  const removeFlujo = (i: number) => setS({ ...s, flujos: s.flujos.filter((_, idx) => idx !== i) });

  const flujosTimeline: FlujoTimeline[] = s.flujos.map((f) => ({
    periodo: f.periodo,
    monto: f.monto,
    etiqueta: f.tieneX ? `${f.coeficienteX}·X` : undefined,
    tipo: f.tieneX ? 'incognita' : (f.lado === 'izquierda' ? 'positivo' : 'negativo'),
  }));
  const maxPer = Math.max(...s.flujos.map((f) => f.periodo), Number(s.fechaFocal), 12);

  return (
    <Calculator
      title="Ecuaciones de Valor"
      category="Amortización y avanzados"
      description="Resuelve una incógnita X dentro de una ecuación de valor con múltiples flujos en distintas fechas. Los flujos se llevan a una fecha focal con la tasa periódica equivalente."
      formula="\sum_{izquierda} F_k (1+i)^{focal - k} = \sum_{derecha} F_k (1+i)^{focal - k}"
      inputs={
        <div className="space-y-4">
          <InputField
            label="Tasa periódica i"
            value={s.i}
            onChange={(v) => setS({ ...s, i: v })}
            hint="Tasa efectiva del período en que se expresa la línea de tiempo. Ej. 0.01 = 1% mensual."
          />

          <div>
            <label className="label">Fecha focal (período de referencia)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-outline px-3 py-2 font-mono"
                onClick={() => setS({ ...s, fechaFocal: String(Math.max(0, Number(s.fechaFocal) - 1)) })}
                aria-label="Disminuir fecha focal"
              >
                −
              </button>
              <input
                className="input text-center font-mono"
                value={s.fechaFocal}
                onChange={(e) => setS({ ...s, fechaFocal: e.target.value })}
                inputMode="numeric"
              />
              <button
                type="button"
                className="btn-outline px-3 py-2 font-mono"
                onClick={() => setS({ ...s, fechaFocal: String(Number(s.fechaFocal) + 1) })}
                aria-label="Aumentar fecha focal"
              >
                +
              </button>
            </div>
            <div className="text-xs text-text-subtle mt-1">
              Período al que se llevan todos los flujos para plantear la ecuación. Puede ser 0 (presente), el período de alguno de los flujos o cualquier otro punto.
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Flujos de la línea de tiempo</label>
            <p className="text-xs text-text-subtle -mt-1 mb-2">
              Cada fila es un flujo. <span className="text-success">Izquierda</span> son los valores que se reciben o se deben (deudas); <span className="text-danger">derecha</span> son los pagos que cancelan esos valores. Marca <em>Contiene X</em> en los flujos cuya cuantía es la incógnita.
            </p>

            {/* Encabezados de columna */}
            <div className="grid grid-cols-[1fr,5rem,8rem,auto] gap-2 px-2 text-[11px] uppercase tracking-wider text-text-subtle font-semibold">
              <span>Monto (COP)</span>
              <span>Período</span>
              <span>Lado de la ecuación</span>
              <span className="sr-only">Eliminar</span>
            </div>

            {s.flujos.map((f, i) => (
              <div key={i} className="border border-bg-border rounded-lg p-2 space-y-2 bg-bg-elevated/30">
                <div className="grid grid-cols-[1fr,5rem,8rem,auto] gap-2 items-center">
                  <input
                    className="input"
                    disabled={f.tieneX}
                    value={f.tieneX ? '(incógnita X)' : f.monto}
                    onChange={(e) => setFlujo(i, 'monto', e.target.value)}
                    placeholder="Ej. 1000000"
                    aria-label={`Monto del flujo ${i + 1}`}
                  />
                  <input
                    className="input text-center"
                    value={f.periodo}
                    type="number"
                    min={0}
                    onChange={(e) => setFlujo(i, 'periodo', Number(e.target.value))}
                    placeholder="0"
                    aria-label={`Período del flujo ${i + 1}`}
                  />
                  <select
                    className="input"
                    value={f.lado}
                    onChange={(e) => setFlujo(i, 'lado', e.target.value as any)}
                    aria-label={`Lado del flujo ${i + 1}`}
                  >
                    <option value="izquierda">Izquierda (deuda)</option>
                    <option value="derecha">Derecha (pago)</option>
                  </select>
                  <button
                    className="btn-ghost px-2"
                    onClick={() => removeFlujo(i)}
                    aria-label={`Eliminar flujo ${i + 1}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted pl-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f.tieneX}
                      onChange={(e) => setFlujo(i, 'tieneX', e.target.checked)}
                    />
                    Este flujo contiene la incógnita X
                  </label>
                  {f.tieneX && (
                    <label className="flex items-center gap-1.5">
                      <span>Coeficiente que multiplica a X:</span>
                      <input
                        className="input w-16 py-0.5 text-xs font-mono"
                        value={f.coeficienteX}
                        onChange={(e) => setFlujo(i, 'coeficienteX', e.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
            <button className="btn-outline text-xs" onClick={addFlujo}>+ Agregar flujo</button>
          </div>
        </div>
      }
      actions={<>
        <button className="btn-primary" onClick={resolver}>Resolver X</button>
        <ScenarioIO moduleId="ecuaciones-valor" state={s} onImport={setS} />
      </>}
      results={err ? <div className="text-danger">{err}</div> : r ? (
        <div className="space-y-3">
          <ResultValue label="Valor de X" value={fmtCOP(r.resultado)} highlight />
          <StepByStep pasos={r.pasos} />
        </div>
      ) : null}
      extra={
        <section className="card mt-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">Línea de tiempo</h3>
          <Timeline flujos={flujosTimeline} periodos={maxPer + 1} fechaFocal={Number(s.fechaFocal)} />
          <div className="text-xs text-text-subtle mt-3 flex flex-wrap gap-4">
            <span><span className="inline-block w-3 h-3 rounded-full bg-success mr-1.5 align-middle"/>Izquierda (deudas)</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-danger mr-1.5 align-middle"/>Derecha (pagos)</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-warning mr-1.5 align-middle"/>Incógnita X</span>
          </div>
        </section>
      }
    />
  );
};
