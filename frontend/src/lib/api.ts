export interface Paso {
  expr: string;
  detalle?: string;
}

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiErr {
  ok: false;
  error: { code: string; message: string; field?: string };
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/v1${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new ApiError(json.error.message, json.error.code, json.error.field);
  }
  return json.data;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/v1${endpoint}`);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new ApiError(json.error.message, json.error.code, json.error.field);
  }
  return json.data;
}

export class ApiError extends Error {
  code: string;
  field?: string;
  constructor(message: string, code: string, field?: string) {
    super(message);
    this.code = code;
    this.field = field;
  }
}

export interface CalcResultadoSimple {
  resultado: string;
  pasos: Paso[];
}

export interface FilaAmortizacion {
  periodo: number;
  cuota: string;
  interes: string;
  abono: string;
  saldo: string;
  abonoExtra?: string;
}

export interface AmortizacionResult {
  sistema: string;
  cuota?: string;
  cuotaReal?: string;
  tasaReal?: string;
  nota?: string;
  tabla: FilaAmortizacion[];
  totales: { interes: string; capital: string; total: string };
}

export interface ExtraPaymentResult extends AmortizacionResult {
  estrategia: 'reducir-tiempo' | 'reducir-cuota';
  cuotaOriginal?: string;
  cuotaNueva?: string;
  comparacion?: {
    nOriginal?: number;
    nNuevo?: number;
    periodosAhorrados?: number;
    cuotaOriginal?: string;
    cuotaNueva?: string;
    ahorroPorCuota?: string;
  };
}
