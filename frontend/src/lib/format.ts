const copFmt = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numFmt = (decimals: number) =>
  new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const fmtCOP = (v: string | number): string => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  if (!isFinite(n)) return '—';
  return copFmt.format(n);
};

export const fmtNum = (v: string | number, decimals = 4): string => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  if (!isFinite(n)) return '—';
  return numFmt(decimals).format(n);
};

export const fmtRate = (v: string | number, decimals = 4): string => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  if (!isFinite(n)) return '—';
  return `${numFmt(decimals).format(n * 100)}%`;
};
