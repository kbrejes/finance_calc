import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export default function SpendingModal({ open, onOpenChange, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    category: 'Housing',
    essential: 'true',
    className: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'Housing',
        essential: initialData.isEssential ? 'true' : 'false',
        className: initialData.className || '',
      })
    } else {
      setFormData({
        category: 'Housing',
        essential: 'true',
        className: '',
      })
    }
  }, [initialData, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.className.trim()) {
      alert('Please enter a class name')
      return
    }
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Spending Item' : 'Add Spending Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Essential */}
              <div className="space-y-2">
                <Label htmlFor="essential" className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Necessity</Label>
                <Select value={formData.essential} onValueChange={(value) => handleChange('essential', value)}>
                  <SelectTrigger id="essential">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Essential</SelectItem>
                    <SelectItem value="false">Above Essential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class Name */}
            <div className="space-y-2">
              <Label htmlFor="className" className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., Yoghurt"
                value={formData.className}
                onChange={(e) => handleChange('className', e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
