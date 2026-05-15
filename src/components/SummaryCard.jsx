export default function SummaryCard({ label, value, subtext, variant = 'default' }) {
  const variants = {
    default: 'text-foreground',
    success: 'text-success',
    danger: 'text-danger',
    info: 'text-primary',
  }

  return (
    <div className="rounded-lg border border-border bg-input p-4 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono ${variants[variant]}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-muted-foreground">
          {subtext}
        </div>
      )}
    </div>
  )
}
