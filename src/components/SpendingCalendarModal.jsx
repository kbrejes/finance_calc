import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Trash2, Plus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import * as DialogPrimitive from "@radix-ui/react-dialog"

export default function SpendingCalendarModal({ open, onOpenChange, item, onUpdateDates }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [nameInput, setNameInput] = useState('')
  const [costInput, setCostInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [drafts, setDrafts] = useState({}) // { [date]: { name, cost } }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handleDayClick = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    
    // 1. If clicking the same date, do nothing (preserves current typing)
    if (dateStr === selectedDate) return

    // 2. Save current draft before switching (if not editing an existing entry)
    if (selectedDate && !editingId) {
      setDrafts(prev => ({
        ...prev,
        [selectedDate]: { name: nameInput, cost: costInput }
      }))
    }

    // 3. Switch to new date
    setSelectedDate(dateStr)
    setEditingId(null)

    // 4. Load draft for the new date if it exists
    const draft = drafts[dateStr]
    if (draft) {
      setNameInput(draft.name)
      setCostInput(draft.cost)
    } else {
      setNameInput('')
      const defaultPrice = (item?.pricePerUnit || 0) * (item?.units || 1)
      setCostInput(defaultPrice > 0 ? defaultPrice.toString() : '')
    }
  }

  const handleSaveEntry = () => {
    if (!selectedDate || !costInput) return
    
    const newEntry = { 
      id: editingId || Date.now(),
      date: selectedDate, 
      name: nameInput.trim() || item.className,
      cost: parseFloat(costInput) 
    }
    
    let updated
    if (editingId) {
      updated = item.purchaseDates.map(p => p.id === editingId ? newEntry : p)
    } else {
      updated = [...(item.purchaseDates || []), newEntry]
    }
    
    onUpdateDates(updated)
    setEditingId(null)
    
    // Clear draft for this date after saving
    const newDrafts = { ...drafts }
    delete newDrafts[selectedDate]
    setDrafts(newDrafts)

    setNameInput('')
    const defaultPrice = (item?.pricePerUnit || 0) * (item?.units || 1)
    setCostInput(defaultPrice > 0 ? defaultPrice.toString() : '')
  }

  const handleEditEntry = (entry) => {
    setEditingId(entry.id)
    setNameInput(entry.name || '')
    setCostInput(entry.cost.toString())
  }

  const handleRemoveEntry = (id) => {
    const updated = item.purchaseDates.filter(p => p.id !== id)
    onUpdateDates(updated)
    if (editingId === id) {
      setEditingId(null)
      setNameInput('')
      setCostInput('')
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
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

  const dayEntries = selectedDate 
    ? (item.purchaseDates || []).filter(p => (typeof p === 'string' ? p : p.date) === selectedDate)
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 border-border/40 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90">{item?.className || 'Loading...'}</DialogTitle>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">
            {item?.category || 'Category'} • {item?.isEssential ? 'Essential' : 'Optional'}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between px-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold text-foreground/80 tracking-wide">{monthName}</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="h-7 flex items-center justify-center text-[9px] font-black text-muted-foreground/30">
                {day}
              </div>
            ))}
            {rows.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const dateStr = day ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : ''
                const entries = day ? (item?.purchaseDates || []).filter(p => (typeof p === 'string' ? p : p.date) === dateStr) : []
                const isMarked = entries.length > 0
                const dayTotal = entries.reduce((sum, e) => sum + (typeof e === 'string' ? (item.pricePerUnit * item.units) : (e.cost || 0)), 0)
                const isCurrentlySelected = selectedDate === dateStr
                
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                checkDate.setHours(0, 0, 0, 0)
                const isFuture = day && checkDate > today
                const isToday = day && checkDate.getTime() === today.getTime()
                
                return (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => day && !isFuture && handleDayClick(day)}
                    disabled={!day || isFuture}
                    className={`relative h-10 w-10 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                      !day
                        ? 'bg-transparent border-transparent'
                        : isFuture
                        ? 'text-muted-foreground/20 cursor-not-allowed'
                        : isMarked
                        ? 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#0F172A] text-white shadow-sm border border-slate-600/50'
                        : isCurrentlySelected
                        ? 'border-2 border-primary bg-primary/10 text-foreground'
                        : isToday
                        ? 'border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] bg-muted/50 text-foreground'
                        : 'border border-border/40 text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground'
                    }`}
                  >
                    <span className={isMarked ? 'text-[10px] font-bold leading-none' : 'text-xs font-bold'}>{day}</span>
                    {isMarked && (
                      <span className="text-[7px] font-medium leading-none mt-0.5 opacity-80">
                        ฿{dayTotal >= 1000 ? (dayTotal / 1000).toFixed(dayTotal % 1000 === 0 ? 0 : 1) + 'k' : dayTotal}
                      </span>
                    )}
                    {isMarked && entries.length > 1 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground shadow-sm">
                        {entries.length}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Entries List & Input */}
          {selectedDate && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2 border-t border-border/20">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">
                  Entries — {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </h4>
              </div>

              {/* List of existing entries for the day */}
              <div className="space-y-2">
                {dayEntries.map((rawEntry, idx) => {
                  // Normalize legacy string entries to object format
                  const entry = typeof rawEntry === 'string' 
                    ? { id: `legacy-${idx}`, date: rawEntry, name: item.className, cost: (item.pricePerUnit * item.units) }
                    : rawEntry;

                  return (
                    <div key={entry.id || idx} className="group flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30 hover:border-border/60 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground/80">{entry.name || item.className}</span>
                        <span className="text-[10px] font-medium text-muted-foreground/70">฿{(entry.cost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditEntry(entry)}
                          className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="p-1.5 text-muted-foreground/40 hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add/Edit Form */}
              <div className="p-4 rounded-xl bg-muted/10 border border-dashed border-border/50 space-y-3">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold">
                  {editingId ? 'Edit Entry' : 'New Entry'}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Entry name (e.g. Lunch)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-8 text-xs bg-background/50 border-border/30"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-bold">฿</span>
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={costInput}
                        onChange={(e) => setCostInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEntry()}
                        className="pl-6 h-8 text-xs bg-background/50 border-border/30"
                      />
                    </div>
                    <button
                      onClick={handleSaveEntry}
                      className="px-3 h-8 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shadow-sm transition-transform active:scale-95"
                    >
                      {editingId ? 'Update' : 'Add'}
                    </button>
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setNameInput('')
                          setCostInput('')
                        }}
                        className="px-2 h-8 rounded-lg bg-muted text-muted-foreground font-bold text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
