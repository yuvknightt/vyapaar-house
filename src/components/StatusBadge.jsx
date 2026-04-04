const STATUS_MAP = {
  CONFIRMED: { label: 'Sweekar', hindi: 'स्वीकार', className: 'badge-confirmed' },
  PENDING:   { label: 'Prateeksha', hindi: 'प्रतीक्षा', className: 'badge-pending' },
  FAILED:    { label: 'Akrit', hindi: 'अकृत', className: 'badge-failed' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`badge ${s.className}`} title={s.hindi}>
      {s.label}
    </span>
  );
}
