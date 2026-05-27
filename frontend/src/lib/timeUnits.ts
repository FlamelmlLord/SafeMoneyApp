export type TimeUnit =
  | 'diaria'
  | 'semanal'
  | 'quincenal'
  | 'mensual'
  | 'bimestral'
  | 'trimestral'
  | 'cuatrimestral'
  | 'semestral'
  | 'anual';

export const timeUnitLabels: Record<TimeUnit, string> = {
  diaria: 'Diaria',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  cuatrimestral: 'Cuatrimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

export const periodsPerYear = (unit: TimeUnit, dayBase: 360 | 365): number => {
  switch (unit) {
    case 'diaria':
      return dayBase;
    case 'semanal':
      return 52;
    case 'quincenal':
      return 24;
    case 'mensual':
      return 12;
    case 'bimestral':
      return 6;
    case 'trimestral':
      return 4;
    case 'cuatrimestral':
      return 3;
    case 'semestral':
      return 2;
    case 'anual':
      return 1;
  }
};
