import { Calculator } from '../components/Calculator';

export const RepartoInversoCompuesto = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Reparto Proporcional Inverso Compuesto"
      description="Distribuye inversamente según múltiples criterios"
      inputs={[]}
      result={null}
      error={error}
      onCalculate={() => {}}
    />
  );
};
