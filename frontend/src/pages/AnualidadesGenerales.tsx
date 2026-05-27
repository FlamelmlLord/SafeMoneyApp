import { Calculator } from '../components/Calculator';

export const AnualidadesGenerales = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Series Uniformes - Anualidades Generales"
      description="Anualidades con períodos de capitalización diferente al período de pago"
      inputs={[]}
      result={null}
      error={error}
      onCalculate={() => {}}
    />
  );
};
