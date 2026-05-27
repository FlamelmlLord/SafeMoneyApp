import { useState } from 'react';
import { Calculator } from '../components/Calculator';
import { ScenarioIO } from '../components/ScenarioIO';
import { apiPost } from '../lib/api';
import { fmtCOP } from '../lib/format';
import { RepartoProporcional } from './RepartoProporcional';

type Metodo = 'proporciones' | 'reduccion' | 'alicuotas';

export const RepartoDirectoSimple = () => {
	const [metodo, setMetodo] = useState<Metodo>('proporciones');
	const [monto, setMonto] = useState('1000000');
	const [partes, setPartes] = useState<{ nombre: string; valor: string }[]>([
		{ nombre: 'A', valor: '3' },
		{ nombre: 'B', valor: '2' },
		{ nombre: 'C', valor: '5' },
	]);
	const [result, setResult] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);

	const calcular = async () => {
		setError(null);
		setResult(null);
		try {
			if (metodo === 'proporciones') return; // delegado a RepartoProporcional

			const partesSimple = partes.map((p) => ({ nombre: p.nombre, peso: p.valor }));
			const data = await apiPost<any>('/reparto/simple', { monto, partes: partesSimple });
			setResult(data);
		} catch (e: any) {
			setError(e.message);
		}
	};

	const updateParte = (idx: number, key: 'nombre' | 'valor', value: string) => {
		const ns = [...partes];
		ns[idx] = { ...ns[idx], [key]: value } as any;
		setPartes(ns);
	};

	return (
		<>
			{metodo === 'proporciones' ? (
				<RepartoProporcional />
			) : (
				<Calculator
					title="Reparto Directo Simple"
					category="Repartos"
					description={
						metodo === 'reduccion'
							? 'Reducción a la unidad: convertir a fracciones unitarias y distribuir el monto.'
							: 'Partes alícuotas: distribuir según partes especificadas (valores proporcionales).'
					}
					formula={'parte_k = monto \cdot \dfrac{valor_k}{\sum valor_i}'}
					inputs={
						<div className="space-y-4">
							<div className="inline-flex rounded-lg border border-bg-border p-0.5">
								{([
									{ id: 'reduccion', label: 'Reducción a la unidad' },
									{ id: 'alicuotas', label: 'Partes Alícuotas' },
								] as const).map((m) => (
									<button
										key={m.id}
										onClick={() => setMetodo(m.id as Metodo)}
										className={`px-3 py-1 text-xs rounded-md font-medium ${metodo === m.id ? 'bg-accent text-bg' : 'text-text-muted'}`}
									>
										{m.label}
									</button>
								))}
							</div>

							<div>
								<label className="label">Monto a repartir (COP)</label>
								<input className="input" value={monto} onChange={(e) => setMonto(e.target.value)} />
							</div>

							<div className="space-y-2">
								<label className="label">Partes (nombre y valor)</label>
								{partes.map((p, i) => (
									<div key={i} className="flex gap-2">
										<input className="input" value={p.nombre} onChange={(e) => updateParte(i, 'nombre', e.target.value)} placeholder="Nombre" />
										<input className="input w-32" value={p.valor} onChange={(e) => updateParte(i, 'valor', e.target.value)} placeholder="Valor / unidades" />
										<button className="btn-ghost px-2" onClick={() => setPartes(partes.filter((_, idx) => idx !== i))}>✕</button>
									</div>
								))}
								<button className="btn-outline text-xs" onClick={() => setPartes([...partes, { nombre: '', valor: '1' }])}>+ Agregar parte</button>
							</div>
						</div>
					}
					actions={
						<>
							<button className="btn-primary" onClick={calcular}>Calcular</button>
							<ScenarioIO moduleId="reparto-directo-simple" state={{ metodo, monto, partes }} onImport={(s: any) => { setMetodo(s.metodo); setMonto(s.monto); setPartes(s.partes || []); }} />
						</>
					}
					results={
						error ? (
							<div className="text-danger">{error}</div>
						) : result ? (
							<div className="space-y-3">
								<table className="table-fin">
									<thead>
										<tr><th>Nombre</th><th>Fracción</th><th>Parte</th></tr>
									</thead>
									<tbody>
										{result.partes.map((p: any, i: number) => (
											<tr key={i}>
												<td>{p.nombre || `Parte ${i + 1}`}</td>
												<td className="text-text-muted">{Number(p.fraccion).toFixed(4)}</td>
												<td className="text-success font-semibold">{fmtCOP(p.parte)}</td>
											</tr>
										))}
									</tbody>
								</table>
								<div className="text-xs text-text-muted">Verificación: la suma da {fmtCOP(result.verificacion)} {result.cuadra ? '✓' : '⚠️'}</div>
							</div>
						) : null
					}
				/>
			)}
		</>
	);
};

export default RepartoDirectoSimple;
