import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  Home,
  ShoppingBag,
  Truck,
  Zap,
  User,
  MoreHorizontal,
} from 'lucide-react'

const CATEGORY_ICONS = {
  Housing: Home,
  Food: ShoppingBag,
  Transport: Truck,
  Subscriptions: Zap,
  Personal: User,
  Other: MoreHorizontal,
}

export default function SpendingItem({
  item,
  onOpenCalendar,
  onDelete,
}) {
  const Icon = CATEGORY_ICONS[item.category] || MoreHorizontal
  const costPerPurchase = item.pricePerUnit * item.units
  const purchaseCount = item.purchaseDates?.length || 0
  const totalCost = costPerPurchase * purchaseCount

  return (
    <div
      onClick={() => onOpenCalendar(item)}
      className="
        flex items-center gap-3 p-4 rounded-lg border border-border bg-input
        hover:bg-input/80 cursor-pointer transition-colors
      "
    >
      {/* Icon */}
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{item.className}</div>
        <div className="text-xs text-muted-foreground">
          {item.category} • {item.isEssential ? '✅ Essential' : '○ Optional'}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right">
        <div>
          <div className="text-xs text-muted-foreground">Logs</div>
          <div className="font-mono font-semibold text-cyan-400">{purchaseCount}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-mono font-bold">฿{totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-red-400 hover:bg-red-500/10"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(item.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
