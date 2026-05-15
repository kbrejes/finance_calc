import { Trash2, Pencil } from 'lucide-react'
import { Button } from './ui/button'
import {
  Home,
  ShoppingBag,
  Truck,
  Zap,
  User,
  MoreHorizontal,
} from 'lucide-react'
import { getCalculatedSpendingMetrics, formatNum } from '../lib/financeUtils'

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
  onEdit,
  onDelete,
}) {
  const Icon = CATEGORY_ICONS[item.category] || MoreHorizontal
  
  // Calculate metrics using shared utility
  const metrics = getCalculatedSpendingMetrics(item);
  const { hasData, calcMonthlyCost, daysUntilNext } = metrics;

  // Prediction text
  let predictionText = '';
  if (hasData && daysUntilNext !== null) {
    predictionText = daysUntilNext < 0 
      ? `Overdue by ${Math.abs(daysUntilNext)}d` 
      : `Next in ${daysUntilNext}d`;
  }

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
        <div className="font-medium text-foreground">
          {item.className}
          <span className="text-muted-foreground font-normal text-sm">
            , ฿{formatNum(calcMonthlyCost)}
            {hasData && <span className="ml-1 text-[8px] opacity-50 font-bold" title="Calculated from history">●</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {predictionText ? (
            <span className="text-[10px] text-muted-foreground">
              {predictionText}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground opacity-50 italic">
              No prediction yet
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(item)}
          title="Edit Item"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onDelete(item.id)}
          title="Delete Item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
