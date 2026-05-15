import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import SpendingModal from '../components/SpendingModal'
import SpendingItem from '../components/SpendingItem'
import SpendingCalendarModal from '../components/SpendingCalendarModal'
import * as api from '../lib/api'
import { getCalculatedSpendingMetrics } from '../lib/financeUtils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

export default function SpendingTab() {
  const [spending, setSpending] = useState([])
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('next-payment')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedSpendingItem, setSelectedSpendingItem] = useState(null)
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    // Load from API
    const loadSpending = async () => {
      const data = await api.fetchSpending()
      setSpending(data || [])
      
      const assetData = await api.fetchAssets()
      if (assetData && assetData.financial) {
        setAccounts(assetData.financial)
      }
    }
    loadSpending()
  }, [])

  const handleAddSpending = async (formData) => {
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        category: formData.category,
        className: formData.className.trim(),
        instanceName: formData.className.trim(),
        isEssential: formData.essential === 'true',
        account: formData.account,
      }
      const result = await api.updateSpending(editingItem.id, updatedItem)
      if (result) {
        setSpending(spending.map(item => item.id === editingItem.id ? result : item))
      }
      setEditingItem(null)
    } else {
      const newItem = {
        category: formData.category,
        className: formData.className.trim(),
        instanceName: formData.className.trim(),
        isEssential: formData.essential === 'true',
        account: formData.account,
        pricePerUnit: 0,
        units: 1,
        purchaseDates: [],
      }
      const result = await api.addSpending(newItem)
      if (result) {
        setSpending([...spending, result])
      }
    }
  }

  const handleEditSpending = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDeleteSpending = async (id) => {
    const success = await api.deleteSpending(id)
    if (success) {
      setSpending(spending.filter(item => item.id !== id))
    }
  }

  const handleOpenCalendar = (item) => {
    setSelectedSpendingItem(item)
    setCalendarOpen(true)
  }

  const handleUpdatePurchaseDates = async (dates) => {
    if (!selectedSpendingItem) return
    
    // Deduction logic
    const oldDates = selectedSpendingItem.purchaseDates || []
    const accountName = selectedSpendingItem.account || 'none'
    
    if (accountName !== 'none') {
      const oldTotal = oldDates.reduce((sum, d) => sum + (typeof d === 'string' ? 0 : (d.cost || 0)), 0)
      const newTotal = dates.reduce((sum, d) => sum + (typeof d === 'string' ? 0 : (d.cost || 0)), 0)
      const diff = newTotal - oldTotal
      
      if (diff !== 0) {
        const assetData = await api.fetchAssets()
        if (assetData && assetData.financial) {
          const updatedFinancial = assetData.financial.map(acc => 
            acc.name === accountName ? { ...acc, value: (acc.value || 0) - diff } : acc
          )
          await api.saveAssets({ ...assetData, financial: updatedFinancial })
          setAccounts(updatedFinancial)
        }
      }
    }

    const result = await api.updateSpendingPurchaseDates(selectedSpendingItem.id, dates)
    if (result) {
      const updatedItem = { ...selectedSpendingItem, purchaseDates: dates }
      const updated = spending.map(item =>
        item.id === selectedSpendingItem.id ? updatedItem : item
      )
      setSpending(updated)
      setSelectedSpendingItem(updatedItem)
    }
  }

  const categories = ['All', ...new Set(spending.map(s => s.category))]
  let filtered = filter === 'All' 
    ? spending 
    : spending.filter(item => item.category === filter)

  // Sort
  switch (sort) {
    case 'name':
      filtered = filtered.sort((a, b) => a.className.localeCompare(b.className))
      break
    case 'price-asc':
      filtered = filtered.sort((a, b) => (a.pricePerUnit * a.units) - (b.pricePerUnit * b.units))
      break
    case 'price-desc':
      filtered = filtered.sort((a, b) => (b.pricePerUnit * b.units) - (a.pricePerUnit * a.units))
      break
    case 'category':
      filtered = filtered.sort((a, b) => a.category.localeCompare(b.category))
      break
    case 'next-payment':
      filtered = filtered.sort((a, b) => {
        const metricsA = getCalculatedSpendingMetrics(a)
        const metricsB = getCalculatedSpendingMetrics(b)
        const daysA = metricsA.daysUntilNext === null ? 9999 : metricsA.daysUntilNext
        const daysB = metricsB.daysUntilNext === null ? 9999 : metricsB.daysUntilNext
        return daysA - daysB
      })
      break
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Expenses</h3>
        <Button size="icon" variant="default" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px] pr-4">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next-payment">Next Payment</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-asc">Price ↑</SelectItem>
            <SelectItem value="price-desc">Price ↓</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-input p-8 text-center text-muted-foreground">
          <p>No spending items yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <SpendingItem
              key={item.id}
              item={item}
              onOpenCalendar={handleOpenCalendar}
              onEdit={handleEditSpending}
              onDelete={handleDeleteSpending}
            />
          ))}
        </div>
      )}

      <SpendingModal 
        open={modalOpen} 
        onOpenChange={(val) => {
          setModalOpen(val)
          if (!val) setEditingItem(null)
        }} 
        onSubmit={handleAddSpending}
        initialData={editingItem}
        accounts={accounts}
        formatNum={formatNum}
      />

      {selectedSpendingItem && (
        <SpendingCalendarModal
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          item={selectedSpendingItem}
          onUpdateDates={handleUpdatePurchaseDates}
        />
      )}
    </div>
  )
}
