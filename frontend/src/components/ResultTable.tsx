import type { FilaAmortizacion } from '../lib/api';
import { fmtCOP } from '../lib/format';

interface Props {
  filas: FilaAmortizacion[];
  showAbonoExtra?: boolean;
  title?: string;
}

export const ResultTable = ({ filas, showAbonoExtra = false, title }: Props) => {
  const downloadCsv = () => {
    const headers = showAbonoExtra
      ? ['Periodo', 'Cuota', 'Interés', 'Abono', 'Abono extra', 'Saldo']
      : ['Periodo', 'Cuota', 'Interés', 'Abono', 'Saldo'];
    const rows = filas.map((f) =>
      showAbonoExtra
        ? [f.periodo, f.cuota, f.interes, f.abono, f.abonoExtra ?? '0', f.saldo]
        : [f.periodo, f.cuota, f.interes, f.abono, f.saldo],
    );
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabla-${title?.toLowerCase().replace(/\s+/g, '-') ?? 'amortizacion'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {title && <h4 className="text-sm font-medium text-text-muted">{title}</h4>}
        <button onClick={downloadCsv} className="btn-outline text-xs px-3 py-1.5">
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto border border-bg-border rounded-lg">
        <table className="table-fin">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Cuota</th>
              <th>Interés</th>
              <th>Abono a capital</th>
              {showAbonoExtra && <th>Abono extra</th>}
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.periodo}>
                <td className="text-text-muted">{f.periodo}</td>
                <td>{fmtCOP(f.cuota)}</td>
                <td className="text-warning">{fmtCOP(f.interes)}</td>
                <td className="text-success">{fmtCOP(f.abono)}</td>
                {showAbonoExtra && (
                  <td className="text-accent">{f.abonoExtra && Number(f.abonoExtra) > 0 ? fmtCOP(f.abonoExtra) : '—'}</td>
                )}
                <td>{fmtCOP(f.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
