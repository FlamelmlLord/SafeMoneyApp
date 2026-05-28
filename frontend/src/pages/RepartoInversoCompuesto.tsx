import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface Parte {
	nombre: string;
	factores: string[];
}

export const RepartoInversoCompuesto = () => {

	const [monto, setMonto] = useState('30000000');

	// nombres dinámicos de factores
	const [nombresFactores, setNombresFactores] = useState([
		'Edad',
		'Estatura',
	]);

	const [partes, setPartes] = useState<Parte[]>([
		{
			nombre: 'Familiar A',
			factores: ['20', '180'],
		},
		{
			nombre: 'Familiar B',
			factores: ['40', '160'],
		},
	]);

	const [result, setResult] = useState<any | null>(null);

	const [error, setError] = useState<string | null>(null);

	// actualizar nombre factor
	const updateNombreFactor = (
		index: number,
		value: string
	) => {

		const nuevos = [...nombresFactores];

		nuevos[index] = value;

		setNombresFactores(nuevos);
	};

	// actualizar persona
	const updateParte = (
		index: number,
		key: keyof Parte,
		value: any
	) => {

		const nuevas = [...partes];

		nuevas[index] = {
			...nuevas[index],
			[key]: value,
		};

		setPartes(nuevas);
	};

	// actualizar factor
	const updateFactor = (
		parteIndex: number,
		factorIndex: number,
		value: string
	) => {

		const nuevas = [...partes];

		nuevas[parteIndex].factores[factorIndex] = value;

		setPartes(nuevas);
	};

	// agregar persona
	const agregarParte = () => {

		setPartes([
			...partes,
			{
				nombre: '',
				factores: nombresFactores.map(() => '1'),
			},
		]);
	};

	// eliminar persona
	const eliminarParte = (index: number) => {

		setPartes(
			partes.filter((_, i) => i !== index)
		);
	};

	// agregar factor
	const agregarFactor = () => {

		setNombresFactores([
			...nombresFactores,
			`Factor ${nombresFactores.length + 1}`,
		]);

		setPartes(
			partes.map((p) => ({
				...p,
				factores: [...p.factores, '1'],
			}))
		);
	};

	// eliminar factor
	const eliminarFactor = (factorIndex: number) => {

		setNombresFactores(
			nombresFactores.filter(
				(_, i) => i !== factorIndex
			)
		);

		setPartes(
			partes.map((p) => ({
				...p,
				factores: p.factores.filter(
					(_, i) => i !== factorIndex
				),
			}))
		);
	};

	const calcular = async () => {

		setError(null);

		setResult(null);

		try {

			const data = await apiPost<any>(
				'/reparto/inverso-compuesto',
				{
					monto,
					partes,
					nombresFactores,
				}
			);

			setResult(data);

		} catch (e: any) {

			setError(e.message);
		}
	};

	return (
		<Calculator
			title="Reparto Proporcional Inverso Compuesto"
			category="Repartos"
			description="Distribuye un monto inversamente proporcional usando múltiples factores."
			formula={
				'factor_i = \\dfrac{1}{f_1 \\times f_2 \\times ... \\times f_n}'
			}
			inputs={
				<div className="space-y-5">

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

					{/* FACTORES */}
					<div className="space-y-2">

						<div className="flex items-center justify-between">
							<label className="label">
								Factores
							</label>

							<button
								className="btn-outline text-xs"
								onClick={agregarFactor}
							>
								+ Agregar factor
							</button>
						</div>

						{nombresFactores.map((f, i) => (
							<div
								key={i}
								className="flex gap-2"
							>

								<input
									className="input"
									value={f}
									onChange={(e) =>
										updateNombreFactor(
											i,
											e.target.value
										)
									}
								/>

								<button
									className="btn-ghost"
									onClick={() =>
										eliminarFactor(i)
									}
								>
									✕
								</button>

							</div>
						))}
					</div>

					{/* PERSONAS */}
					<div className="space-y-3">

						<div className="flex items-center justify-between">

							<label className="label">
								Participantes
							</label>

							<button
								className="btn-outline text-xs"
								onClick={agregarParte}
							>
								+ Agregar participante
							</button>

						</div>

						{partes.map((p, i) => (

							<div
								key={i}
								className="border border-bg-border rounded-lg p-3 space-y-3"
							>

								<div className="flex gap-2">

									<input
										className="input"
										placeholder="Nombre"
										value={p.nombre}
										onChange={(e) =>
											updateParte(
												i,
												'nombre',
												e.target.value
											)
										}
									/>

									<button
										className="btn-ghost"
										onClick={() =>
											eliminarParte(i)
										}
									>
										✕
									</button>

								</div>

								<div className="grid grid-cols-2 gap-2">

									{nombresFactores.map(
										(factor, factorIndex) => (

											<div key={factorIndex}>

												<label className="label">
													{factor}
												</label>

												<input
													className="input"
													value={
														p.factores[
															factorIndex
														]
													}
													onChange={(e) =>
														updateFactor(
															i,
															factorIndex,
															e.target.value
														)
													}
												/>

											</div>
										)
									)}

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

									{nombresFactores.map((f, i) => (
										<th key={i}>
											{f}
										</th>
									))}

									<th>Producto</th>
									<th>Factor Inverso</th>
									<th>%</th>
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

											{p.factores.map(
												(f: any, j: number) => (
													<td key={j}>
														{f}
													</td>
												)
											)}

											<td>
												{Number(
													p.producto
												).toFixed(4)}
											</td>

											<td>
												{Number(
													p.factorInverso
												).toFixed(8)}
											</td>

											<td>
												{Number(
													p.porcentaje
												).toFixed(2)}
												%
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

							{' '}

							{fmtCOP(
								result.verificacion
							)}

							{' '}

							{result.cuadra ? '✓' : '⚠️'}

						</div>

					</div>

				) : null
			}
		/>
	);
};

export default RepartoInversoCompuesto;