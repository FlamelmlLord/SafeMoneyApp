import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

export const RepartoInversoSimple = () => {

  const [monto, setMonto] = useState('1000000');

  const [partes, setPartes] = useState([
    { nombre: 'A', valor: '2' },
    { nombre: 'B', valor: '4' },
    { nombre: 'C', valor: '8' },
  ]);

  const [result, setResult] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);

  const calcular = async () => {

    setError(null);

    setResult(null);

    try {

      const partesPayload = partes.map((p) => ({
        nombre: p.nombre,
        peso: p.valor,
      }));

      const data = await apiPost<any>(
        '/reparto/inverso-simple',
        {
          monto,
          partes: partesPayload,
        }
      );

      setResult(data);

    } catch (e: any) {

      setError(e.message);
    }
  };

  const updateParte = (
    idx: number,
    key: 'nombre' | 'valor',
    value: string
  ) => {

    const ns = [...partes];

    ns[idx] = {
      ...ns[idx],
      [key]: value,
    };

    setPartes(ns);
  };

  return (
    <Calculator
      title="Reparto Proporcional Inverso Simple"
      category="Repartos"
      description="Distribuye un monto inversamente proporcional a unos índices"
      formula={'parte_k = monto \\cdot \\dfrac{1/indice_k}{\\sum (1/indice_i)}'}
      inputs={
        <div className="space-y-4">

          <div>
            <label className="label">
              Monto a repartir (COP)
            </label>

            <input
              className="input"
              value={monto}
              onChange={(e) =>
                setMonto(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">

            <label className="label">
              Partes e índices
            </label>

            {partes.map((p, i) => (

              <div
                key={i}
                className="flex gap-2"
              >

                <input
                  className="input"
                  value={p.nombre}
                  onChange={(e) =>
                    updateParte(
                      i,
                      'nombre',
                      e.target.value
                    )
                  }
                  placeholder="Nombre"
                />

                <input
                  className="input w-32"
                  value={p.valor}
                  onChange={(e) =>
                    updateParte(
                      i,
                      'valor',
                      e.target.value
                    )
                  }
                  placeholder="Índice"
                />

                <button
                  className="btn-ghost px-2"
                  onClick={() =>
                    setPartes(
                      partes.filter(
                        (_, idx) =>
                          idx !== i
                      )
                    )
                  }
                >
                  ✕
                </button>

              </div>
            ))}

            <button
              className="btn-outline text-xs"
              onClick={() =>
                setPartes([
                  ...partes,
                  {
                    nombre: '',
                    valor: '1',
                  },
                ])
              }
            >
              + Agregar parte
            </button>

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
            moduleId="reparto-inverso-simple"
            state={{
              monto,
              partes,
            }}
            onImport={(s: any) => {
              setMonto(s.monto);
              setPartes(s.partes || []);
            }}
          />
        </>
      }
      results={
        error ? (

          <div className="text-danger">
            {error}
          </div>

        ) : result ? (

          <div className="space-y-3">

            <table className="table-fin">

              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Índice</th>
                  <th>Inverso</th>
                  <th>Parte</th>
                </tr>
              </thead>

              <tbody>

                {result.partes.map(
                  (p: any, i: number) => (

                    <tr key={i}>

                      <td>
                        {p.nombre}
                      </td>

                      <td>
                        {p.indice}
                      </td>

                      <td className="text-text-muted">
                        {Number(
                          p.inverso
                        ).toFixed(6)}
                      </td>

                      <td className="text-success font-semibold">
                        {fmtCOP(
                          p.parte
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

            <div className="text-xs text-text-muted">

              Verificación:
              la suma da{' '}

              {fmtCOP(
                result.verificacion
              )}

              {' '}

              {result.cuadra
                ? '✓'
                : '⚠️'}

            </div>

          </div>

        ) : null
      }
    />
  );
};

export default RepartoInversoSimple;