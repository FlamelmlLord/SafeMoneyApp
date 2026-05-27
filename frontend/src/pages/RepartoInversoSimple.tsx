import { Calculator } from '../components/Calculator';

export const RepartoInversoSimple = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Reparto Proporcional Inverso Simple"
      category="Repartos"
      description="Distribuye un monto inversamente proporcional a unos índices"
      inputs={<div className="text-text-muted text-sm italic">En desarrollo</div>}
      results={<div className="text-danger">{error}</div>}
    />
  );
};
