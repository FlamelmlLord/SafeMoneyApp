import { Calculator } from '../components/Calculator';

export const RepartoInversoCompuesto = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Reparto Proporcional Inverso Compuesto"
      category="Repartos"
      description="Distribuye inversamente según múltiples criterios"
      inputs={<div className="text-text-muted text-sm italic">En desarrollo</div>}
      results={<div className="text-danger">{error}</div>}
    />
  );
};
