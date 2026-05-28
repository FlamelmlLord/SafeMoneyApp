import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore, type DayBase } from '../store';

const modulos = [
  {
    categoria: 'Fundamentos', items: [
      { path: '/razones-proporciones', label: 'Razones y Proporciones' },
    ]
  },
  {
    categoria: 'Repartos', items: [
      { path: '/reparto-directo-simple', label: 'Directo Simple' },
      { path: '/reparto-inverso-simple', label: 'Inverso Simple' },
      { path: '/reparto-directo-compuesto', label: 'Directo Compuesto' },
      { path: '/reparto-inverso-compuesto', label: 'Inverso Compuesto' },
      { path: '/reparto-mixto', label: 'Reparto Mixto' },
    ]
  },
  {
    categoria: 'Interés Simple', items: [
      { path: '/interes-simple', label: 'Cálculos Básicos' },
      { path: '/interes-simple-metodos', label: 'Métodos (Bancario, Comercial, etc)' },
      { path: '/diagramas-flujo-caja', label: 'Diagramas de Flujo de Caja' },
    ]
  },
  {
    categoria: 'Descuento Simple', items: [
      { path: '/descuento-simple', label: 'Comercial' },
      { path: '/descuento-racional', label: 'Racional (Matemático)' },
    ]
  },
  {
    categoria: 'Interés Compuesto', items: [
      { path: '/interes-compuesto', label: 'Interes Compuesto' },      
    ]
  },
  {
    categoria: 'Tasas', items: [      
      { path: '/equivalencia-tasas', label: 'Equivalencia de Tasas' },
      { path: '/tasa-anticipada-vencida', label: 'Equivalencia de Tasas Anticipadas' },
      { path: '/tasa-efectiva', label: 'Tasas Efectivas' },            
    ]
  },
  {
    categoria: 'Ecuaciones de Valor', items: [
      { path: '/ecuaciones-valor', label: 'Equivalencia en Fechas Focales' },
    ]
  },
  {
    categoria: 'Series Uniformes', items: [      
      { path: '/anualidades', label: 'Anualidades' },
      { path: '/perpetuidades', label: 'Perpetuidad' },      
    ]
  },
  {
    categoria: 'Amortización', items: [
      { path: '/amortizacion', label: 'Tablas de Amortización' },      
    ]
  },
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
                          `block px-3 py-1.5 text-sm rounded-md transition-colors ${isActive
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
