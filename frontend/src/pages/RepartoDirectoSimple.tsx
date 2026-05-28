import { useMemo, useState } from 'react';
import { Calculator } from '../components/Calculator';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';

type Metodo = 'proporciones' | 'reduccion' | 'alicuotas';

interface ParteInput {
	nombre: string;
	valor: string;
}

interface ParteResultado {
	nombre: string;
	indice: string;
	fraccion: string;
	porcentaje: string;
	parte: string;
	explicacion: string;
}

interface ResultadoReparto {
	monto: string;
	sumaIndices: string;
	factorConstante: string;
	partes: ParteResultado[];
	verificacion: string;
	cuadra: boolean;
}

export const RepartoDirectoSimple = () => {
	const [metodo, setMetodo] = useState<Metodo>('proporciones');

	const [monto, setMonto] = useState('1000000');

	const [partes, setPartes] = useState<ParteInput[]>([
		{ nombre: 'A', valor: '3' },
		{ nombre: 'B', valor: '2' },
		{ nombre: 'C', valor: '5' },
	]);

	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<ResultadoReparto | null>(null);
	const [error, setError] = useState<string | null>(null);

	/*
	|--------------------------------------------------------------------------
	| Validaciones Frontend
	|--------------------------------------------------------------------------
	*/

	const validation = useMemo(() => {
		if (!monto || Number(monto) <= 0) {
			return 'El monto debe ser mayor a cero';
		}

		if (partes.length === 0) {
			return 'Debe agregar al menos una parte';
		}

		for (const p of partes) {
			if (!p.nombre.trim()) {
				return 'Todos los participantes deben tener nombre';
			}

			const value = Number(p.valor);

			if (isNaN(value) || value <= 0) {
				return 'Todos los índices deben ser mayores a cero';
			}
		}

		return null;
	}, [monto, partes]);

	/*
	|--------------------------------------------------------------------------
	| Calcular
	|--------------------------------------------------------------------------
	*/

	const calcular = async () => {
		setError(null);
		setResult(null);

		if (validation) {
			setError(validation);
			return;
		}

		try {
			setLoading(true);

			const payload = {
				monto,
				metodo,
				partes: partes.map((p) => ({
					nombre: p.nombre,
					peso: p.valor,
				})),
			};

			const data = await apiPost<ResultadoReparto>(
				'/reparto/directo-simple',
				payload
			);

			setResult(data);
		} catch (e: any) {
			setError(e.message || 'Error calculando reparto');
		} finally {
			setLoading(false);
		}
	};

	/*
	|--------------------------------------------------------------------------
	| Helpers
	|--------------------------------------------------------------------------
	*/

	const updateParte = (
		index: number,
		key: keyof ParteInput,
		value: string
	) => {
		const copy = [...partes];
		copy[index] = {
			...copy[index],
			[key]: value,
		};

		setPartes(copy);
	};

	const addParte = () => {
		setPartes([
			...partes,
			{
				nombre: '',
				valor: '1',
			},
		]);
	};

	const removeParte = (index: number) => {
		setPartes(partes.filter((_, i) => i !== index));
	};

	/*
	|--------------------------------------------------------------------------
	| Explicación pedagógica
	|--------------------------------------------------------------------------
	*/

	const metodoDescripcion = useMemo(() => {
		switch (metodo) {
			case 'proporciones':
				return {
					title: 'Método de Proporciones',
					description:
						'Resuelve el reparto utilizando razones y proporciones equivalentes.',
					formula: String.raw`
\frac{\text{Indice}_i}{\sum \text{Indices}}
=
\frac{\text{Parte}_i}{\text{Monto Total}}
`,
				};

			case 'reduccion':
				return {
					title: 'Reducción a la Unidad',
					description:
						'Primero se calcula cuánto vale una unidad y luego se multiplica por cada índice.',
					formula: String.raw`
\text{Valor Unidad}
=
\frac{\text{Monto}}{\sum \text{Indices}}
`,
				};

			case 'alicuotas':
				return {
					title: 'Partes Alícuotas',
					description:
						'El reparto se realiza usando un factor constante proporcional.',
					formula: String.raw`
Fc = \frac{\text{Monto}}{\sum \text{Indices}}
`,
				};
		}
	}, [metodo]);

	return (
		<Calculator
			title="Reparto Proporcional Directo Simple"
			category="Repartos"
			description={metodoDescripcion.description}
			formula={metodoDescripcion.formula}
			inputs={
				<div className="space-y-6">

					{/* MÉTODOS */}
					<div>
						<label className="label mb-2 block">
							Método de resolución
						</label>

						<div className="inline-flex rounded-xl border border-bg-border p-1 bg-bg-secondary">
							{[
								{
									id: 'proporciones',
									label: 'Proporciones',
								},
								{
									id: 'reduccion',
									label: 'Reducción a la unidad',
								},
								{
									id: 'alicuotas',
									label: 'Partes alícuotas',
								},
							].map((m) => (
								<button
									key={m.id}
									onClick={() =>
										setMetodo(m.id as Metodo)
									}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
									${
										metodo === m.id
											? 'bg-accent text-bg shadow'
											: 'text-text-muted hover:text-text'
									}`}
								>
									{m.label}
								</button>
							))}
						</div>
					</div>

					{/* MONTO */}
					<div>
						<label className="label">
							Monto total a repartir
						</label>

						<input
							className="input"
							value={monto}
							onChange={(e) => setMonto(e.target.value)}
							placeholder="1000000"
						/>
					</div>

					{/* PARTES */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="label">
								Participantes e índices
							</label>

							<button
								className="btn-outline text-xs"
								onClick={addParte}
							>
								+ Agregar parte
							</button>
						</div>

						{partes.map((p, i) => (
							<div
								key={i}
								className="grid grid-cols-[1fr_180px_40px] gap-2"
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
									className="input"
									value={p.valor}
									onChange={(e) =>
										updateParte(
											i,
											'valor',
											e.target.value
										)
									}
									placeholder="Índice proporcional"
								/>

								<button
									className="btn-ghost"
									onClick={() => removeParte(i)}
								>
									✕
								</button>
							</div>
						))}
					</div>

					{/* ERROR */}
					{error && (
						<div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
							{error}
						</div>
					)}
				</div>
			}
			actions={
				<div className="flex gap-3">
					<button
						className="btn-primary"
						onClick={calcular}
						disabled={loading}
					>
						{loading ? 'Calculando...' : 'Calcular'}
					</button>

					<ScenarioIO
						moduleId="reparto-directo-simple"
						state={{
							metodo,
							monto,
							partes,
						}}
						onImport={(s: any) => {
							setMetodo(s.metodo);
							setMonto(s.monto);
							setPartes(s.partes || []);
						}}
					/>
				</div>
			}
			results={
				result ? (
					<div className="space-y-6">

						{/* RESUMEN */}
						<div className="grid grid-cols-3 gap-4">

							<div className="card p-4">
								<div className="text-xs text-text-muted">
									Monto total
								</div>

								<div className="text-xl font-bold">
									{fmtCOP(result.monto)}
								</div>
							</div>

							<div className="card p-4">
								<div className="text-xs text-text-muted">
									Suma índices
								</div>

								<div className="text-xl font-bold">
									{result.sumaIndices}
								</div>
							</div>

							<div className="card p-4">
								<div className="text-xs text-text-muted">
									Factor constante
								</div>

								<div className="text-xl font-bold">
									{Number(
										result.factorConstante
									).toFixed(4)}
								</div>
							</div>
						</div>

						{/* TABLA */}
						<div className="overflow-auto">
							<table className="table-fin">

								<thead>
									<tr>
										<th>Nombre</th>
										<th>Índice</th>
										<th>Fracción</th>
										<th>%</th>
										<th>Explicación</th>
										<th>Parte</th>
									</tr>
								</thead>

								<tbody>
									{result.partes.map((p, i) => (
										<tr key={i}>
											<td>{p.nombre}</td>

											<td>{p.indice}</td>

											<td className="text-text-muted">
												{p.fraccion}
											</td>

											<td className="text-text-muted">
												{p.porcentaje}
											</td>

											<td className="text-xs text-text-muted">
												{p.explicacion}
											</td>

											<td className="font-semibold text-success">
												{fmtCOP(p.parte)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* VERIFICACIÓN */}
						<div
							className={`rounded-lg px-4 py-3 text-sm ${
								result.cuadra
									? 'bg-success/10 text-success border border-success/20'
									: 'bg-warning/10 text-warning border border-warning/20'
							}`}
						>
							{result.cuadra
								? `✓ Verificación correcta: ${fmtCOP(
										result.verificacion
								  )}`
								: '⚠️ La suma no coincide exactamente'}
						</div>

						{/* EXPLICACIÓN PASO A PASO */}
						<div className="card p-5 space-y-4">

							<h3 className="text-lg font-semibold">
								Procedimiento
							</h3>

							<div className="space-y-2 text-sm">

								<div>
									<b>Paso 1:</b> Sumar índices
								</div>

								<div className="text-text-muted">
									Σ índices ={' '}
									{partes
										.map((p) => p.valor)
										.join(' + ')}{' '}
									= {result.sumaIndices}
								</div>

								<div>
									<b>Paso 2:</b>{' '}
									{metodo === 'proporciones'
										? 'Aplicar proporciones'
										: metodo === 'reduccion'
										? 'Reducir a la unidad'
										: 'Calcular factor constante'}
								</div>

								<div className="text-text-muted">
									Fc = {result.monto} /{' '}
									{result.sumaIndices}
								</div>

								<div className="text-text-muted">
									Fc = {result.factorConstante}
								</div>

								<div>
									<b>Paso 3:</b> Calcular cada parte
								</div>

								<div className="space-y-1">
									{result.partes.map((p, i) => (
										<div
											key={i}
											className="text-text-muted"
										>
											{p.nombre} = {p.indice} ×{' '}
											{result.factorConstante} ={' '}
											{fmtCOP(p.parte)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				) : null
			}
		/>
	);
};

export default RepartoDirectoSimple;