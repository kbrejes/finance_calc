import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'

export default function SpendingCalendarModal({
  open,
  onOpenChange,
  itemName,
  purchaseDates,
  pricePerUnit,
  units,
  onUpdatePurchaseDates,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [markedDates, setMarkedDates] = useState(new Map())
  const [costInput, setCostInput] = useState('')
  const [selectedDateStr, setSelectedDateStr] = useState(null)

  useEffect(() => {
    if (purchaseDates) {
      const dateMap = new Map()
      purchaseDates.forEach(entry => {
        if (typeof entry === 'string') {
          dateMap.set(entry, pricePerUnit * units)
        } else if (entry.date) {
          dateMap.set(entry.date, entry.cost || pricePerUnit * units)
        }
      })
      setMarkedDates(dateMap)
    }
  }, [purchaseDates, open, pricePerUnit, units])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const toggleDate = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const newMarked = new Map(markedDates)
    if (newMarked.has(dateStr)) {
      newMarked.delete(dateStr)
      setSelectedDateStr(null)
      setCostInput('')
    } else {
      newMarked.set(dateStr, pricePerUnit * units)
      setSelectedDateStr(dateStr)
      setCostInput(String(pricePerUnit * units))
    }
    setMarkedDates(newMarked)
  }

  const handleCostChange = (e) => {
    const cost = e.target.value
    setCostInput(cost)
  }

  const saveCostForSelectedDate = () => {
    if (selectedDateStr && costInput) {
      const newMarked = new Map(markedDates)
      newMarked.set(selectedDateStr, parseFloat(costInput) || pricePerUnit * units)
      setMarkedDates(newMarked)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleSave = () => {
    saveCostForSelectedDate()
    const purchaseDatesArray = Array.from(markedDates.entries()).map(([date, cost]) => ({
      date,
      cost,
    }))
    onUpdatePurchaseDates(purchaseDatesArray)
    onOpenChange(false)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const rows = []
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7))
  }

  const purchaseCount = markedDates.size
  const totalCost = Array.from(markedDates.values()).reduce((sum, cost) => sum + cost, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Purchase History — {itemName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center font-semibold text-sm">{monthName}</div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Calendar - left side */}
            <div className="col-span-2">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 p-2 bg-input rounded-lg">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-1">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {rows.map((row, rowIdx) =>
                  row.map((day, colIdx) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    checkDate.setHours(0, 0, 0, 0)
                    const isFuture = day && checkDate > today
                    const dateStr = day ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : ''
                    const isMarked = day && markedDates.has(dateStr)
                    const isSelected = dateStr === selectedDateStr
                    
                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => {
                          if (day && !isFuture) {
                            const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                            const currentCost = markedDates.get(dateStr) || pricePerUnit * units
                            
                            // If not marked, add it first
                            if (!markedDates.has(dateStr)) {
                              const newMarked = new Map(markedDates)
                              newMarked.set(dateStr, currentCost)
                              setMarkedDates(newMarked)
                            }
                            // Always open edit mode
                            setSelectedDateStr(dateStr)
                            setCostInput(String(currentCost))
                          }
                        }}
                        disabled={!day || isFuture}
                        className={`
                          p-2 text-sm font-medium rounded transition-colors
                          ${!day ? 'text-muted-foreground cursor-default' : ''}
                          ${isFuture ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                          ${isMarked && !isFuture ? 'bg-cyan-500 text-black' : ''}
                          ${isSelected && !isFuture ? 'ring-2 ring-cyan-600' : ''}
                          ${!isFuture && !isMarked && day ? 'hover:bg-muted cursor-pointer' : ''}
                        `}
                      >
                        {day}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Cost Input - right side */}
            <div className="flex flex-col gap-3 p-3 bg-input rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground">Cost Entry</div>
              {selectedDateStr ? (
                <>
                  <div className="text-sm font-mono">{selectedDateStr}</div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Cost (฿)</label>
                    <input
                      type="number"
                      min="0"
                      value={costInput}
                      onChange={handleCostChange}
                      onBlur={saveCostForSelectedDate}
                      className="w-full px-2 py-1 rounded text-sm bg-background border border-border text-foreground"
                      placeholder="0"
                    />
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-8">
                  Click a date to edit cost
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-input rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Logs</div>
              <div className="text-xl font-bold text-cyan-400">{purchaseCount}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Default</div>
              <div className="text-lg font-mono">฿{(pricePerUnit * units).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-bold">฿{totalCost.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
