import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import SpendingModal from '../components/SpendingModal'
import SpendingItem from '../components/SpendingItem'
import SpendingCalendarModal from '../components/SpendingCalendarModal'
import * as api from '../lib/api'

export default function SpendingTab() {
  const [spending, setSpending] = useState([])
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('name')
  const [modalOpen, setModalOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedSpendingItem, setSelectedSpendingItem] = useState(null)

  useEffect(() => {
    // Load from API
    const loadSpending = async () => {
      const data = await api.fetchSpending()
      setSpending(data || [])
    }
    loadSpending()
  }, [])

  const handleAddSpending = async (formData) => {
    const newItem = {
      category: formData.category,
      className: formData.className.trim(),
      instanceName: formData.className.trim(),
      isEssential: formData.essential === 'true',
      pricePerUnit: 0,
      units: 1,
      purchaseDates: [],
    }
    const result = await api.addSpending(newItem)
    if (result) {
      setSpending([...spending, result])
    }
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
    const result = await api.updateSpendingPurchaseDates(selectedSpendingItem.id, dates)
    if (result) {
      const updated = spending.map(item =>
        item.id === selectedSpendingItem.id
          ? { ...item, purchaseDates: dates }
          : item
      )
      setSpending(updated)
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
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 text-sm text-foreground"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md bg-input border border-border px-3 py-2 text-sm text-foreground"
        >
          <option value="name">Sort: Name</option>
          <option value="price-asc">Sort: Price ↑</option>
          <option value="price-desc">Sort: Price ↓</option>
          <option value="category">Sort: Category</option>
        </select>
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
              onDelete={handleDeleteSpending}
            />
          ))}
        </div>
      )}

      <SpendingModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={handleAddSpending} />

      {selectedSpendingItem && (
        <SpendingCalendarModal
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          itemName={selectedSpendingItem.className}
          purchaseDates={selectedSpendingItem.purchaseDates}
          pricePerUnit={selectedSpendingItem.pricePerUnit}
          units={selectedSpendingItem.units}
          onUpdatePurchaseDates={handleUpdatePurchaseDates}
        />
      )}
    </div>
  )
}
