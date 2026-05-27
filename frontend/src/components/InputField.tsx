interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  suffix?: string;
}

export const InputField = ({ label, value, onChange, hint, placeholder, type = 'text', suffix }: Props) => (
  <div>
    <label className="label">{label}</label>
    <div className="relative">
      <input
        type={type}
        className={`input ${suffix ? 'pr-12' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle text-sm font-mono">
          {suffix}
        </span>
      )}
    </div>
    {hint && <div className="text-xs text-text-subtle mt-1">{hint}</div>}
  </div>
);

export const SelectField = ({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) => (
  <div>
    <label className="label">{label}</label>
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {hint && <div className="text-xs text-text-subtle mt-1">{hint}</div>}
  </div>
);

export const ResultValue = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`flex items-baseline justify-between py-2 ${highlight ? 'border-l-2 border-accent pl-3' : ''}`}>
    <span className="text-text-muted text-sm">{label}</span>
    <span className={`font-mono ${highlight ? 'text-accent text-lg font-semibold' : 'text-text'}`}>{value}</span>
  </div>
);
