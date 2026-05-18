import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import SpendingTab from './tabs/SpendingTab'
import EarningsTab from './tabs/EarningsTab'
import DashboardTab from './tabs/DashboardTab'
import AssetsTab from './tabs/AssetsTab'
import { fetchSettings } from './lib/api'
import { updateGlobalSettings } from './lib/financeUtils'

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'spending')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Load on mount
  useEffect(() => {
    async function init() {
      try {
        const saved = localStorage.getItem('activeTab')
        if (saved) setActiveTab(saved)
      } catch (e) {
        console.error('Failed to load tab state', e)
      }

      const settings = await fetchSettings()
      updateGlobalSettings(settings)
      setSettingsLoaded(true)
    }
    init()
  }, [])

  const handleTabChange = (val) => {
    setActiveTab(val)
    try {
      localStorage.setItem('activeTab', val)
    } catch (e) {
      console.error('Failed to save tab state', e)
    }
  }

  if (!settingsLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground animate-pulse text-xs font-black uppercase tracking-widest">Loading Settings...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="spending">
            <SpendingTab />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsTab />
          </TabsContent>

          <TabsContent value="assets">
            <AssetsTab />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
