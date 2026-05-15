import { AlertCircle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'

export default function RecommendationCard({ balance, students, spendingItems }) {
  // Logic to determine recommendation
  const getRecommendation = () => {
    if (!students.length) {
      return {
        type: 'warning',
        title: 'Add Students to Start',
        message: 'You haven\'t added any students yet. Start by adding your ESL students and their lesson prices.',
        icon: AlertCircle,
      }
    }

    if (!spendingItems.length) {
      return {
        type: 'info',
        title: 'Track Your Spending',
        message: 'Consider tracking your expenses to get better financial insights and recommendations.',
        icon: AlertCircle,
      }
    }

    if (balance > 0) {
      return {
        type: 'success',
        title: 'Healthy Balance! 🎉',
        message: `Your estimated monthly balance is ฿${balance.toLocaleString()}, which is great! Keep up the good work.`,
        icon: CheckCircle,
      }
    }

    if (balance > -2000) {
      return {
        type: 'warning',
        title: 'Monitor Your Spending',
        message: `Your balance is ฿${balance.toLocaleString()}. Consider reducing expenses or increasing lessons.`,
        icon: TrendingDown,
      }
    }

    return {
      type: 'danger',
      title: 'Action Needed',
      message: `Your estimated deficit is ฿${Math.abs(balance).toLocaleString()}. Review your expenses urgently.`,
      icon: AlertCircle,
    }
  }

  const rec = getRecommendation()
  const Icon = rec.icon

  const bgColors = {
    success: 'bg-success/10 border-success/30',
    warning: 'bg-warning/10 border-warning/30',
    danger: 'bg-danger/10 border-danger/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }

  const iconColors = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-blue-400',
  }

  return (
    <div className={`rounded-lg border ${bgColors[rec.type]} p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${iconColors[rec.type]} mt-0.5 flex-shrink-0`} />
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{rec.title}</h3>
          <p className="text-sm text-muted-foreground">{rec.message}</p>
        </div>
      </div>
    </div>
  )
}
