import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore, type DayBase } from '../store';

const modulos = [
  { categoria: 'Fundamentos', items: [
    { path: '/reparto-proporcional', label: 'Reparto Proporcional' },
    { path: '/interes-simple', label: 'Interés Simple' },
    { path: '/descuento-simple', label: 'Descuento Simple' },
  ]},
  { categoria: 'Interés compuesto y tasas', items: [
    { path: '/interes-compuesto', label: 'Interés Compuesto' },
    { path: '/tasa-nominal-periodica', label: 'Nominal ↔ Periódica' },
    { path: '/tasa-efectiva', label: 'Tasa Efectiva Anual' },
    { path: '/equivalencia-tasas', label: 'Equivalencia de Tasas' },
    { path: '/tasa-anticipada-vencida', label: 'Anticipada ↔ Vencida' },
  ]},
  { categoria: 'Series uniformes', items: [
    { path: '/capitalizacion', label: 'Capitalización' },
    { path: '/anualidades-vencidas', label: 'Anualidades Vencidas' },
    { path: '/anualidades-anticipadas', label: 'Anualidades Anticipadas' },
    { path: '/anualidades-diferidas', label: 'Anualidades Diferidas' },
    { path: '/perpetuidades', label: 'Perpetuidades' },
  ]},
  { categoria: 'Amortización y avanzados', items: [
    { path: '/amortizacion', label: 'Tablas de Amortización' },
    { path: '/abonos-extra-tiempo', label: 'Abonos Extra (reducir tiempo)' },
    { path: '/abonos-extra-cuota', label: 'Abonos Extra (reducir cuota)' },
    { path: '/ecuaciones-valor', label: 'Ecuaciones de Valor' },
  ]},
];

export const Layout = () => {
  const dayBase = useAppStore((s) => s.dayBase);
  const setDayBase = useAppStore((s) => s.setDayBase);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-bg-border bg-bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-text">IE</span>
            <span className="text-sm text-text-muted hidden sm:inline">Ingeniería Económica</span>
          </NavLink>

          <div className="flex items-center gap-3">
            <label className="text-xs text-text-muted hidden md:inline">Tipo de año:</label>
            <div className="inline-flex rounded-lg border border-bg-border p-0.5">
              {([360, 365] as DayBase[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setDayBase(b)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    dayBase === b ? 'bg-accent text-bg' : 'text-text-muted hover:text-text'
                  }`}
                  aria-pressed={dayBase === b}
                >
                  {b} días
                </button>
              ))}
            </div>
            <span className="text-xs text-text-subtle hidden lg:inline">
              ({dayBase === 360 ? 'comercial' : 'civil'})
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-bg-border py-6 pr-4">
          <nav className="space-y-6 sticky top-20">
            {modulos.map((cat) => (
              <div key={cat.categoria}>
                <h3 className="text-xs uppercase tracking-wider text-text-subtle font-semibold mb-2 px-3">
                  {cat.categoria}
                </h3>
                <ul className="space-y-0.5">
                  {cat.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isActive
                              ? 'bg-accent-subtle text-accent'
                              : 'text-text-muted hover:text-text hover:bg-bg-elevated'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-bg-border py-4 text-center text-xs text-text-subtle">
        Calculado con {dayBase === 360 ? 'año comercial (360 días)' : 'año civil (365 días)'}. Precisión BCMath
        decimal arbitraria.
      </footer>
    </div>
  );
};
