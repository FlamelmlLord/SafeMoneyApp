import { Link } from 'react-router-dom';
import { useAppStore } from '../store';

const modules = [
  { path: '/razones-proporciones', label: 'Razones y Proporciones', cat: 'Fundamentos', desc: 'Relaciones y proporciones entre magnitudes.' },
  { path: '/interes-simple', label: 'Interés Simple', cat: 'Fundamentos', desc: 'I = P·i·n. Despejes de F, P, i, n.' },
  { path: '/descuento-simple', label: 'Descuento Simple', cat: 'Fundamentos', desc: 'Comercial y racional, conversión d↔i.' },
  { path: '/interes-compuesto', label: 'Interés Compuesto', cat: 'Compuesto', desc: 'F = P(1+i)ⁿ con comparativa visual.' },
  { path: '/tasa-nominal-periodica', label: 'Nominal ↔ Periódica', cat: 'Tasas', desc: 'i = J/m, J = i·m.' },
  { path: '/tasa-efectiva', label: 'Tasa Efectiva Anual', cat: 'Tasas', desc: 'EA = (1+i)^m − 1.' },
  { path: '/equivalencia-tasas', label: 'Equivalencia universal', cat: 'Tasas', desc: 'Convertidor entre cualquier par de tasas.' },
  { path: '/tasa-anticipada-vencida', label: 'Anticipada ↔ Vencida', cat: 'Tasas', desc: 'i_a = i/(1+i).' },
  { path: '/capitalizacion', label: 'Capitalización', cat: 'Series', desc: 'Ahorro para meta futura con depósitos.' },
  { path: '/anualidades-vencidas', label: 'Anualidades Vencidas', cat: 'Series', desc: 'P y F de series ordinarias.' },
  { path: '/anualidades-anticipadas', label: 'Anualidades Anticipadas', cat: 'Series', desc: 'Pagos al inicio de cada período.' },
  { path: '/anualidades-diferidas', label: 'Anualidades Diferidas', cat: 'Series', desc: 'Con período de gracia k.' },
  { path: '/perpetuidades', label: 'Perpetuidades', cat: 'Series', desc: 'VP∞ = A/i.' },
  { path: '/amortizacion', label: 'Tablas de Amortización', cat: 'Amortización', desc: 'Francés, alemán, americano y colombiano.' },
  { path: '/abonos-extra-tiempo', label: 'Abonos Extra (tiempo)', cat: 'Amortización', desc: 'Reducir plazo manteniendo cuota.' },
  { path: '/abonos-extra-cuota', label: 'Abonos Extra (cuota)', cat: 'Amortización', desc: 'Reducir cuota manteniendo plazo.' },
  { path: '/ecuaciones-valor', label: 'Ecuaciones de Valor', cat: 'Avanzados', desc: 'Solver de X en línea de tiempo.' },
];

export const Home = () => {
  const dayBase = useAppStore((s) => s.dayBase);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-3">
        <span className="badge">App académica · Universidad</span>
        <h1 className="text-4xl font-bold tracking-tight">Ingeniería Económica</h1>
        <p className="text-text-muted max-w-3xl leading-relaxed">
          Aplicación web didáctica e interactiva para los conceptos del curso. Cada módulo incluye
          fórmula explicada, calculadora con paso a paso, diagramas y exportación CSV/JSON. Backend en
          PHP 8.2 con BCMath (precisión decimal arbitraria) y frontend en React + TypeScript.
        </p>
        <p className="text-xs text-text-subtle">
          Preferencia activa: <span className="text-accent font-mono">{dayBase} días</span> ({dayBase === 360 ? 'comercial' : 'civil'})
        </p>
      </header>

      <section className="card border-accent/30 bg-accent-subtle/30">
        <h2 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-3">
          Integrantes del grupo
        </h2>
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-baseline justify-between gap-4">
            <span className="text-text">Carlos Guerrero</span>
            <span className="font-mono text-text-muted">20261678028</span>
          </li>
          <li className="flex items-baseline justify-between gap-4">
            <span className="text-text">Cristian Triana</span>
            <span className="font-mono text-text-muted">20262678003</span>
          </li>
          <li className="flex items-baseline justify-between gap-4">
            <span className="text-text">Nicolás Caicedo</span>
            <span className="font-mono text-text-muted">20261678010</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-text-muted">Módulos disponibles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className="card hover:border-accent transition-colors group"
            >
              <span className="text-xs text-text-subtle">{m.cat}</span>
              <h3 className="text-base font-semibold text-text mt-1 group-hover:text-accent transition-colors">
                {m.label}
              </h3>
              <p className="text-sm text-text-muted mt-1">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
