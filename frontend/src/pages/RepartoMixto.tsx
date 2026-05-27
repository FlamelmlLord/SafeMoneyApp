import { Calculator } from '../components/Calculator';

export const RepartoMixto = () => {
  const error = 'Feature en desarrollo - próxima actualización';

  return (
    <Calculator
      title="Reparto Proporcional Mixto"
      description="Distribuye según criterios tanto directos como inversos"
      inputs={[]}
      result={null}
      error={error}
      onCalculate={() => {}}
    />
  );
};
