import type { ReactNode } from 'react';
import { Formula } from './Formula';

interface Props {
  title: string;
  category: string;
  description: ReactNode;
  formula?: string;
  inputs: ReactNode;
  results?: ReactNode;
  actions?: ReactNode;
  steps?: ReactNode;
  extra?: ReactNode;
}

export const Calculator = ({
  title,
  category,
  description,
  formula,
  inputs,
  results,
  actions,
  steps,
  extra,
}: Props) => (
  <div className="space-y-6 animate-fade-in">
    <header className="flex flex-col gap-2">
      <span className="badge w-fit">{category}</span>
      <h1 className="text-3xl font-semibold text-text">{title}</h1>
      <div className="text-text-muted text-sm leading-relaxed max-w-3xl">{description}</div>
    </header>

    {formula && (
      <div className="card flex justify-center py-8">
        <Formula tex={formula} block />
      </div>
    )}

    <div className="grid lg:grid-cols-[1fr,1.2fr] gap-6">
      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Entradas</h2>
        {inputs}
        {actions && <div className="flex gap-3 pt-2">{actions}</div>}
      </section>

      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Resultado</h2>
        {results ?? <div className="text-text-subtle text-sm italic">Ingresa los datos y presiona calcular.</div>}
        {steps}
      </section>
    </div>

    {extra}
  </div>
);
