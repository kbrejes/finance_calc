import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import SpendingTab from './tabs/SpendingTab'
import EarningsTab from './tabs/EarningsTab'
import DashboardTab from './tabs/DashboardTab'

export default function App() {
  const [activeTab, setActiveTab] = useState('spending')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
