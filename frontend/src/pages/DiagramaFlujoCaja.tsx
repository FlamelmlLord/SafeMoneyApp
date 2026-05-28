import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue } from '../components/InputField';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

interface State {
    P: string;
    i: string;
    n: string;
}

const inicial: State = {
    P: '20000000',
    i: '0.17',
    n: '1',
};

export const DiagramaFlujoCaja = () => {
    const [state, setState] = useState<State>(inicial);

    const [result, setResult] = useState<any | null>(null);

    const [error, setError] = useState<string | null>(null);

    const calcular = async () => {
        setError(null);

        try {
            const data = await apiPost<any>(
                '/interes-simple/calcular',
                {
                    calcular: 'F',
                    P: state.P,
                    i: state.i,
                    n: state.n,
                }
            );

            setResult(data);
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <Calculator
            title="Diagramas de Flujo de Caja"
            category="Interés Simple"
            description="Representación gráfica de operaciones financieras mediante líneas de tiempo y flujos de dinero."

            formula={'F = P(1 + i \\cdot n)'}

            inputs={
                <div className="space-y-3">
                    <InputField
                        label="Valor Presente P"
                        value={state.P}
                        onChange={(v) =>
                            setState({ ...state, P: v })
                        }
                        suffix="COP"
                    />

                    <InputField
                        label="Tasa i"
                        value={state.i}
                        onChange={(v) =>
                            setState({ ...state, i: v })
                        }
                        hint="Decimal: 0.17 = 17%"
                    />

                    <InputField
                        label="Tiempo n"
                        value={state.n}
                        onChange={(v) =>
                            setState({ ...state, n: v })
                        }
                        hint="Años"
                    />
                </div>
            }

            actions={
                <button
                    className="btn-primary"
                    onClick={calcular}
                >
                    Generar Diagrama
                </button>
            }

            results={
                error ? (
                    <div className="text-danger">
                        {error}
                    </div>
                ) : result ? (
                    <div className="space-y-8">

                        {/* DIAGRAMA */}

                        <div className="bg-bg-secondary border border-bg-border rounded-xl p-8 overflow-auto">

                            <div className="min-w-[700px]">

                                {/* TEXTO SUPERIOR */}
                                <div className="flex justify-center mb-2 text-sm font-semibold">
                                    n = {state.n}
                                </div>

                                {/* LINEA */}
                                <div className="flex items-center">

                                    {/* P */}
                                    <div className="flex flex-col items-center w-32">

                                        <div className="text-3xl">
                                            ↓
                                        </div>

                                        <div className="font-bold">
                                            P
                                        </div>

                                        <div className="text-xs text-text-muted">
                                            {fmtCOP(state.P)}
                                        </div>
                                    </div>

                                    {/* LINEA CENTRAL */}
                                    <div className="flex-1 relative">

                                        <div className="border-t-4 border-text w-full"></div>

                                        <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 text-sm font-semibold">
                                            i = {fmtRate(state.i)}
                                        </div>
                                    </div>

                                    {/* S */}
                                    <div className="flex flex-col items-center w-32">

                                        <div className="text-3xl">
                                            ↑
                                        </div>

                                        <div className="font-bold">
                                            S
                                        </div>

                                        <div className="text-xs text-success">
                                            {fmtCOP(result.resultado)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RESULTADOS */}

                        <div className="space-y-3">

                            <ResultValue
                                label="Valor Presente (P)"
                                value={fmtCOP(state.P)}
                            />

                            <ResultValue
                                label="Tasa (i)"
                                value={fmtRate(state.i)}
                            />

                            <ResultValue
                                label="Tiempo (n)"
                                value={state.n}
                            />

                            <ResultValue
                                label="Monto Futuro (S)"
                                value={fmtCOP(result.resultado)}
                                highlight
                            />
                        </div>
                    </div>
                ) : null
            }
        />
    );
};

export default DiagramaFlujoCaja;