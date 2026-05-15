import { useState } from 'react'
import { X, TrendingUp, Wallet, BookOpen, Clock, Activity, Plus, History, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

export default function StudentStatsModal({ open, onOpenChange, student, onUpdateAdjustments }) {
  const [adjAmount, setAdjAmount] = useState('')
  const [adjComment, setAdjComment] = useState('')

  if (!student) return null
  const metrics = getCalculatedStudentMetrics(student)

  const handleAddAdjustment = (e) => {
    e.preventDefault()
    const amount = parseFloat(adjAmount)
    if (isNaN(amount)) return
    
    const newAdjustment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount,
      comment: adjComment || 'Manual adjustment'
    }
    
    const updated = [...(student.adjustments || []), newAdjustment]
    onUpdateAdjustments(updated)
    setAdjAmount('')
    setAdjComment('')
  }

  const removeAdjustment = (id) => {
    const updated = (student.adjustments || []).filter(a => a.id !== id)
    onUpdateAdjustments(updated)
  }

  const statItems = [
    { label: 'Balance', value: `฿${formatNum(metrics.balance)}`, icon: Wallet },
    { label: 'Total Paid', value: `฿${formatNum(metrics.totalPaid)}`, icon: TrendingUp },
    { label: 'Delivered', value: `฿${formatNum(metrics.totalCost)}`, icon: BookOpen },
    { label: 'Adjustments', value: `฿${formatNum(metrics.totalAdjustments)}`, icon: History },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-50">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-8 pb-4 shrink-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90 uppercase">{student.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {statItems.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/5 border border-border/20 flex flex-col gap-2">
                <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{item.label}</div>
                <div className="text-sm font-black text-muted-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6 custom-scrollbar">
          {/* Adjustment Form */}
          <div className="space-y-3">
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Adjust Balance
            </div>
            <form onSubmit={handleAddAdjustment} className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Amount (e.g. -500)"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="flex-1 bg-muted/10 border border-border/20 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!adjAmount}
                  className="px-4 py-2 bg-muted/20 hover:bg-muted/40 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30"
                >
                  Apply
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Reason for adjustment..."
                value={adjComment}
                onChange={(e) => setAdjComment(e.target.value)}
                className="w-full bg-muted/10 border border-border/20 rounded-xl px-3 py-2 text-[10px] font-bold text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
              />
            </form>
          </div>

          {/* Adjustment History */}
          <div className="space-y-3">
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
              <History className="h-3 w-3" />
              Correction History
            </div>
            <div className="space-y-2">
              {!(student.adjustments || []).length ? (
                <div className="text-[10px] text-muted-foreground/30 font-bold italic py-4 text-center border border-dashed border-border/20 rounded-xl">
                  No adjustments recorded
                </div>
              ) : (
                [...(student.adjustments || [])].reverse().map((adj) => (
                  <div key={adj.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/10 group">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black ${adj.amount >= 0 ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                          {adj.amount >= 0 ? '+' : ''}฿{formatNum(adj.amount)}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground/20">{adj.date}</span>
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/40">{adj.comment}</div>
                    </div>
                    <button 
                      onClick={() => removeAdjustment(adj.id)}
                      className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
