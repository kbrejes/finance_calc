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
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {item.category}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.isEssential ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
            {item.isEssential ? 'Essential' : 'Optional'}
          </span>
          {predictionText && (
            <span className="text-[10px] text-muted-foreground ml-1">
              • {predictionText}
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
          className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => onDelete(item.id)}
          title="Delete Item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
