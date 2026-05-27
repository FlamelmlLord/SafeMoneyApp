import { Calculator } from '../components/Calculator';

export const AnualidadesGenerales = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Series Uniformes - Anualidades Generales"
      category="Series Uniformes"
      description="Anualidades con períodos de capitalización diferente al período de pago"
      inputs={<div className="text-text-muted text-sm italic">En desarrollo</div>}
      results={<div className="text-danger">{error}</div>}
    />
  );
};
