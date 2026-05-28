import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface Parte {
  nombre: string;
  directos: string[];
  inversos: string[];
}

export const RepartoMixto = () => {

  const [monto, setMonto] = useState('50000000');

  const [factoresDirectos, setFactoresDirectos] = useState([
    'Factor Directo A',
  ]);

  const [factoresInversos, setFactoresInversos] = useState([
    'Factor Inverso A',
  ]);

  const [partes, setPartes] = useState<Parte[]>([
    {
      nombre: 'Persona 1',
      directos: ['10'],
      inversos: ['2'],
    },
    {
      nombre: 'Persona 2',
      directos: ['5'],
      inversos: ['1'],
    },
  ]);

  const [result, setResult] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);

  // =========================
  // FACTORES DIRECTOS
  // =========================

  const agregarFactorDirecto = () => {

    setFactoresDirectos([
      ...factoresDirectos,
      `Factor Directo ${String.fromCharCode(65 + factoresDirectos.length)}`
    ]);

    setPartes(
      partes.map((p) => ({
        ...p,
        directos: [...p.directos, '1'],
      }))
    );
  };

  const eliminarFactorDirecto = (idx: number) => {

    setFactoresDirectos(
      factoresDirectos.filter((_, i) => i !== idx)
    );

    setPartes(
      partes.map((p) => ({
        ...p,
        directos: p.directos.filter((_, i) => i !== idx),
      }))
    );
  };

  // =========================
  // FACTORES INVERSOS
  // =========================

  const agregarFactorInverso = () => {

    setFactoresInversos([
      ...factoresInversos,
      `Factor Inverso ${String.fromCharCode(65 + factoresInversos.length)}`
    ]);

    setPartes(
      partes.map((p) => ({
        ...p,
        inversos: [...p.inversos, '1'],
      }))
    );
  };

  const eliminarFactorInverso = (idx: number) => {

    setFactoresInversos(
      factoresInversos.filter((_, i) => i !== idx)
    );

    setPartes(
      partes.map((p) => ({
        ...p,
        inversos: p.inversos.filter((_, i) => i !== idx),
      }))
    );
  };

  // =========================
  // PARTICIPANTES
  // =========================

  const agregarParte = () => {

    setPartes([
      ...partes,
      {
        nombre: '',
        directos: factoresDirectos.map(() => '1'),
        inversos: factoresInversos.map(() => '1'),
      },
    ]);
  };

  const updateParteNombre = (
    idx: number,
    value: string
  ) => {

    const arr = [...partes];

    arr[idx].nombre = value;

    setPartes(arr);
  };

  const updateFactorDirecto = (
    parteIdx: number,
    factorIdx: number,
    value: string
  ) => {

    const arr = [...partes];

    arr[parteIdx].directos[factorIdx] = value;

    setPartes(arr);
  };

  const updateFactorInverso = (
    parteIdx: number,
    factorIdx: number,
    value: string
  ) => {

    const arr = [...partes];

    arr[parteIdx].inversos[factorIdx] = value;

    setPartes(arr);
  };

  // =========================
  // CALCULAR
  // =========================

  const calcular = async () => {

    setError(null);

    try {

      const data = await apiPost<any>(
        '/reparto/mixto',
        {
          monto,
          partes,
        }
      );

      setResult(data);

    } catch (e: any) {

      setError(e.message);
    }
  };

  return (
    <Calculator
      title="Reparto Proporcional Mixto"
      category="Repartos"

      description="Distribuye usando factores directos e inversos."

      formula={`Indice = (Directos)/(Inversos)
Parte = Monto × (Indice / ΣIndices)`}

      inputs={
        <div className="space-y-6">

          <div>
            <label className="label">
              Monto Total
            </label>

            <input
              className="input"
              value={monto}
              onChange={(e) =>
                setMonto(e.target.value)
              }
            />
          </div>

          {/* FACTORES DIRECTOS */}

          <div className="space-y-2">

            <div className="flex justify-between items-center">
              <label className="label">
                Factores Directos
              </label>

              <button
                className="btn-outline text-xs"
                onClick={agregarFactorDirecto}
              >
                + Agregar
              </button>
            </div>

            {factoresDirectos.map((f, idx) => (
              <div key={idx} className="flex gap-2">

                <input
                  className="input"
                  value={f}
                  onChange={(e) => {

                    const arr = [...factoresDirectos];

                    arr[idx] = e.target.value;

                    setFactoresDirectos(arr);
                  }}
                />

                <button
                  className="btn-ghost px-2"
                  onClick={() =>
                    eliminarFactorDirecto(idx)
                  }
                >
                  ✕
                </button>

              </div>
            ))}
          </div>

          {/* FACTORES INVERSOS */}

          <div className="space-y-2">

            <div className="flex justify-between items-center">
              <label className="label">
                Factores Inversos
              </label>

              <button
                className="btn-outline text-xs"
                onClick={agregarFactorInverso}
              >
                + Agregar
              </button>
            </div>

            {factoresInversos.map((f, idx) => (
              <div key={idx} className="flex gap-2">

                <input
                  className="input"
                  value={f}
                  onChange={(e) => {

                    const arr = [...factoresInversos];

                    arr[idx] = e.target.value;

                    setFactoresInversos(arr);
                  }}
                />

                <button
                  className="btn-ghost px-2"
                  onClick={() =>
                    eliminarFactorInverso(idx)
                  }
                >
                  ✕
                </button>

              </div>
            ))}
          </div>

          {/* PARTICIPANTES */}

          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <label className="label">
                Participantes
              </label>

              <button
                className="btn-outline text-xs"
                onClick={agregarParte}
              >
                + Agregar Participante
              </button>
            </div>

            {partes.map((p, idx) => (

              <div
                key={idx}
                className="border border-bg-border rounded-lg p-3 space-y-4"
              >

                <input
                  className="input"
                  placeholder="Nombre"
                  value={p.nombre}
                  onChange={(e) =>
                    updateParteNombre(
                      idx,
                      e.target.value
                    )
                  }
                />

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="label text-xs">
                      Factores Directos
                    </label>

                    <div className="space-y-2">

                      {factoresDirectos.map((f, factorIdx) => (

                        <input
                          key={factorIdx}
                          className="input"
                          placeholder={f}
                          value={p.directos[factorIdx]}
                          onChange={(e) =>
                            updateFactorDirecto(
                              idx,
                              factorIdx,
                              e.target.value
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs">
                      Factores Inversos
                    </label>

                    <div className="space-y-2">

                      {factoresInversos.map((f, factorIdx) => (

                        <input
                          key={factorIdx}
                          className="input"
                          placeholder={f}
                          value={p.inversos[factorIdx]}
                          onChange={(e) =>
                            updateFactorInverso(
                              idx,
                              factorIdx,
                              e.target.value
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      }

      actions={
        <button
          className="btn-primary"
          onClick={calcular}
        >
          Calcular
        </button>
      }

      results={
        error ? (
          <div className="text-danger">
            {error}
          </div>
        ) : result ? (

          <div className="space-y-4">

            <table className="table-fin">

              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Índice</th>
                  <th>%</th>
                  <th>Parte</th>
                </tr>
              </thead>

              <tbody>

                {result.partes.map((p: any, i: number) => (

                  <tr key={i}>

                    <td>{p.nombre}</td>

                    <td>
                      {Number(p.indice).toFixed(4)}
                    </td>

                    <td>
                      {Number(p.porcentaje).toFixed(2)}%
                    </td>

                    <td className="text-success font-semibold">
                      {fmtCOP(p.parte)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs text-text-muted">
              Verificación:
              {' '}
              {fmtCOP(result.verificacion)}
              {' '}
              {result.cuadra ? '✓' : '⚠️'}
            </div>

          </div>

        ) : null
      }
    />
  );
};

export default RepartoMixto;