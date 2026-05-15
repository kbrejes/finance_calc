import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import SpendingTab from './tabs/SpendingTab'
import EarningsTab from './tabs/EarningsTab'
import DashboardTab from './tabs/DashboardTab'

export default function App() {
  const [activeTab, setActiveTab] = useState('spending')

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('activeTab')
      if (saved) setActiveTab(saved)
    } catch (e) {
      console.error('Failed to load tab state', e)
    }
  }, [])

  const handleTabChange = (val) => {
    setActiveTab(val)
    try {
      localStorage.setItem('activeTab', val)
    } catch (e) {
      console.error('Failed to save tab state', e)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="spending">
            <SpendingTab />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsTab />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
