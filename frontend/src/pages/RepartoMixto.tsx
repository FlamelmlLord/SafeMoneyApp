import { Calculator } from '../components/Calculator';

export const RepartoMixto = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Reparto Proporcional Mixto"
      category="Repartos"
      description="Distribuye según criterios tanto directos como inversos"
      inputs={<div className="text-text-muted text-sm italic">En desarrollo</div>}
      results={<div className="text-danger">{error}</div>}
    />
  );
};
