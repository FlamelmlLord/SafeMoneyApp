import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { InputField, ResultValue, SelectField } from '../components/InputField';
import { StepByStep } from '../components/StepByStep';
import { apiPost } from '../lib/api';
import { fmtCOP, fmtRate } from '../lib/format';

type Metodo = 'bancario' | 'comercial' | 'racional' | 'ideal';
type Var = 'F' | 'P' | 'I';

interface State {
	calcular: Var;
	metodo: Metodo;

	P: string;
	F: string;
	i: string;

	dias: string;

	// Para racional
	anio: string;

	// Para ideal
	mes: string;
}

const inicial: State = {
	calcular: 'I',
	metodo: 'bancario',

	P: '5000000',
	F: '',
	i: '0.20',

	dias: '30',

	anio: '2004',
	mes: '2',
};

export const InteresSimpleMetodos = () => {
	const [s, setS] = useState<State>(inicial);
	const [r, setR] = useState<any | null>(null);
	const [err, setErr] = useState<string | null>(null);

	const calcular = async () => {
		setErr(null);

		try {
			const body: any = {
				calcular: s.calcular,
				metodo: s.metodo,
				i: s.i,
			};

			if (s.calcular !== 'P') body.P = s.P;
			if (s.calcular !== 'F') body.F = s.F;

			// MÉTODO BANCARIO
			if (s.metodo === 'bancario') {
				body.dias = s.dias;
				body.baseDias = 360;
			}

			// MÉTODO COMERCIAL
			if (s.metodo === 'comercial') {
				body.dias = 30;
				body.baseDias = 360;
			}

			// MÉTODO RACIONAL
			if (s.metodo === 'racional') {
				body.dias = s.dias;
				body.anio = s.anio;
			}

			// MÉTODO IDEAL
			if (s.metodo === 'ideal') {
				body.mes = s.mes;
				body.anio = s.anio;
			}

			const data = await apiPost<any>('/interes-simple/metodos', body);

			setR(data);
		} catch (e: any) {
			setErr(e.message);
		}
	};

	const labelResultado =
		s.calcular === 'I'
			? 'Interés'
			: s.calcular === 'F'
			? 'Valor Futuro'
			: 'Valor Presente';

	const formatear = (v: string) => {
		return fmtCOP(v);
	};

	return (
		<Calculator
			title="Interés Simple - Métodos"
			category="Interés Simple"
			description="Calcula interés simple usando métodos Bancario, Comercial, Racional e Ideal."
			formula={'I = P \\cdot i \\cdot n'}
			inputs={
				<div className="space-y-4">
					<SelectField
						label="Método"
						value={s.metodo}
						onChange={(v) =>
							setS({ ...s, metodo: v as Metodo })
						}
						options={[
							{
								value: 'bancario',
								label: 'Bancario (360 días exactos)',
							},
							{
								value: 'comercial',
								label: 'Comercial (mes = 30 días)',
							},
							{
								value: 'racional',
								label: 'Racional (365 o 366)',
							},
							{
								value: 'ideal',
								label: 'Ideal (mes real)',
							},
						]}
					/>

					<SelectField
						label="¿Qué deseas calcular?"
						value={s.calcular}
						onChange={(v) =>
							setS({ ...s, calcular: v as Var })
						}
						options={[
							{
								value: 'I',
								label: 'Interés (I)',
							},
							{
								value: 'F',
								label: 'Valor Futuro (F)',
							},
							{
								value: 'P',
								label: 'Valor Presente (P)',
							},
						]}
					/>

					{s.calcular !== 'P' && (
						<InputField
							label="Capital (P)"
							value={s.P}
							onChange={(v) => setS({ ...s, P: v })}
							suffix="COP"
						/>
					)}

					{s.calcular !== 'F' && (
						<InputField
							label="Valor Futuro (F)"
							value={s.F}
							onChange={(v) => setS({ ...s, F: v })}
							suffix="COP"
						/>
					)}

					<InputField
						label="Tasa Nominal Anual"
						value={s.i}
						onChange={(v) => setS({ ...s, i: v })}
						hint="0.20 = 20%"
					/>

					{/* BANCARIO */}
					{s.metodo === 'bancario' && (
						<InputField
							label="Cantidad de días"
							value={s.dias}
							onChange={(v) =>
								setS({ ...s, dias: v })
							}
						/>
					)}

					{/* COMERCIAL */}
					{s.metodo === 'comercial' && (
						<div className="text-sm text-text-muted border border-bg-border rounded-lg p-3">
							El método comercial asume automáticamente:
							<br />
							• Mes = 30 días
							<br />
							• Año = 360 días
						</div>
					)}

					{/* RACIONAL */}
					{s.metodo === 'racional' && (
						<>
							<InputField
								label="Cantidad de días"
								value={s.dias}
								onChange={(v) =>
									setS({ ...s, dias: v })
								}
							/>

							<InputField
								label="Año"
								value={s.anio}
								onChange={(v) =>
									setS({ ...s, anio: v })
								}
								hint="Se usa para determinar si es bisiesto"
							/>
						</>
					)}

					{/* IDEAL */}
					{s.metodo === 'ideal' && (
						<>
							<SelectField
								label="Mes"
								value={s.mes}
								onChange={(v) =>
									setS({ ...s, mes: v })
								}
								options={[
									{ value: '1', label: 'Enero' },
									{ value: '2', label: 'Febrero' },
									{ value: '3', label: 'Marzo' },
									{ value: '4', label: 'Abril' },
									{ value: '5', label: 'Mayo' },
									{ value: '6', label: 'Junio' },
									{ value: '7', label: 'Julio' },
									{ value: '8', label: 'Agosto' },
									{ value: '9', label: 'Septiembre' },
									{ value: '10', label: 'Octubre' },
									{ value: '11', label: 'Noviembre' },
									{ value: '12', label: 'Diciembre' },
								]}
							/>

							<InputField
								label="Año"
								value={s.anio}
								onChange={(v) =>
									setS({ ...s, anio: v })
								}
								hint="Para detectar febrero bisiesto"
							/>
						</>
					)}
				</div>
			}
			actions={
				<button className="btn-primary" onClick={calcular}>
					Calcular
				</button>
			}
			results={
				err ? (
					<div className="text-danger">{err}</div>
				) : r ? (
					<div className="space-y-4">
						<ResultValue
							label={labelResultado}
							value={formatear(r.resultado)}
							highlight
						/>

						<ResultValue
							label="Tiempo utilizado"
							value={r.tiempo}
						/>

						<ResultValue
							label="Base de días"
							value={String(r.baseDias)}
						/>

						<StepByStep pasos={r.pasos} />
					</div>
				) : null
			}
		/>
	);
};

export default InteresSimpleMetodos;