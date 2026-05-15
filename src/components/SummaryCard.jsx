export default function SummaryCard({ label, value, subtext, variant = 'default' }) {
  const variants = {
    default: 'text-foreground',
    success: 'text-green-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
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
