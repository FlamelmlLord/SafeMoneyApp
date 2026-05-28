import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface Parte {
	nombre: string;
	factores: string[];
}

export const RepartoDirectoCompuesto = () => {
	const [monto, setMonto] = useState('1000000');

	const [factoresNombres, setFactoresNombres] = useState([
		'Factor A',
		'Factor B',
	]);

	const [partes, setPartes] = useState<Parte[]>([
		{
			nombre: 'Persona 1',
			factores: ['2', '5'],
		},
		{
			nombre: 'Persona 2',
			factores: ['4', '3'],
		},
	]);

	const [result, setResult] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);

	const agregarFactor = () => {
		setFactoresNombres([...factoresNombres, `Factor ${String.fromCharCode(65 + factoresNombres.length)}`]);

		setPartes(
			partes.map((p) => ({
				...p,
				factores: [...p.factores, '1'],
			}))
		);
	};

	const eliminarFactor = (idx: number) => {
		setFactoresNombres(factoresNombres.filter((_, i) => i !== idx));

		setPartes(
			partes.map((p) => ({
				...p,
				factores: p.factores.filter((_, i) => i !== idx),
			}))
		);
	};

	const agregarParte = () => {
		setPartes([
			...partes,
			{
				nombre: '',
				factores: factoresNombres.map(() => '1'),
			},
		]);
	};

	const updateFactorNombre = (idx: number, value: string) => {
		const arr = [...factoresNombres];
		arr[idx] = value;
		setFactoresNombres(arr);
	};

	const updateParte = (
		parteIdx: number,
		key: 'nombre',
		value: string
	) => {
		const arr = [...partes];
		arr[parteIdx] = {
			...arr[parteIdx],
			[key]: value,
		};
		setPartes(arr);
	};

	const updateFactorValor = (
		parteIdx: number,
		factorIdx: number,
		value: string
	) => {
		const arr = [...partes];

		arr[parteIdx].factores[factorIdx] = value;

		setPartes(arr);
	};

	const calcular = async () => {
		setError(null);

		try {
			const data = await apiPost<any>(
				'/reparto/directo-compuesto',
				{
					monto,
					factores: factoresNombres,
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
			title="Reparto Proporcional Directo Compuesto"
			category="Repartos"
			description="Distribuye un monto proporcionalmente usando múltiples factores."

			formula={`Indice = FactorA × FactorB × ...
Parte = Monto × (Indice / ΣIndices)`}

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

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="label">
								Factores
							</label>

							<button
								className="btn-outline text-xs"
								onClick={agregarFactor}
							>
								+ Agregar Factor
							</button>
						</div>

						{factoresNombres.map((f, idx) => (
							<div
								key={idx}
								className="flex gap-2"
							>
								<input
									className="input"
									value={f}
									onChange={(e) =>
										updateFactorNombre(
											idx,
											e.target.value
										)
									}
								/>

								<button
									className="btn-ghost px-2"
									onClick={() =>
										eliminarFactor(idx)
									}
								>
									✕
								</button>
							</div>
						))}
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
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
								className="border border-bg-border rounded-lg p-3 space-y-3"
							>
								<input
									className="input"
									placeholder="Nombre"
									value={p.nombre}
									onChange={(e) =>
										updateParte(
											idx,
											'nombre',
											e.target.value
										)
									}
								/>

								<div className="grid grid-cols-2 gap-2">
									{factoresNombres.map(
										(f, factorIdx) => (
											<div key={factorIdx}>
												<label className="label text-xs">
													{f}
												</label>

												<input
													className="input"
													value={
														p.factores[
															factorIdx
														]
													}
													onChange={(e) =>
														updateFactorValor(
															idx,
															factorIdx,
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
									<th>Índice</th>
									<th>%</th>
									<th>Parte</th>
								</tr>
							</thead>

							<tbody>
								{result.partes.map(
									(p: any, i: number) => (
										<tr key={i}>
											<td>{p.nombre}</td>

											<td>
												{Number(
													p.indice
												).toFixed(4)}
											</td>

											<td>
												{Number(
													p.porcentaje
												).toFixed(2)}
												%
											</td>

											<td className="text-success font-semibold">
												{fmtCOP(p.parte)}
											</td>
										</tr>
									)
								)}
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

export default RepartoDirectoCompuesto;