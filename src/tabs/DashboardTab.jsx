import { useState, useEffect } from 'react'
import SummaryCard from '../components/SummaryCard'
import RecommendationCard from '../components/RecommendationCard'
import * as api from '../lib/api'

export default function DashboardTab() {
  const [spending, setSpending] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const [spendingData, studentsData] = await Promise.all([
        api.fetchSpending(),
        api.fetchStudents(),
      ])
      setSpending(spendingData || [])
      setStudents(studentsData || [])
    }
    loadData()
  }, [])

  // Calculate metrics
  const calculateMonthlySpending = () => {
    return spending.reduce((sum, item) => {
      const costPerPurchase = item.pricePerUnit * item.units
      const purchaseCount = item.purchaseDates?.length || 0
      return sum + (costPerPurchase * purchaseCount)
    }, 0)
  }

  const calculateExpectedIncome = () => {
    return students.reduce((sum, student) => {
      return sum + (student.price * (student.attendanceDates?.length || 0))
    }, 0)
  }

  const monthlySpending = calculateMonthlySpending()
  const expectedIncome = calculateExpectedIncome()
  const balance = expectedIncome - monthlySpending
  const activeStudents = students.length
  const expenseItems = spending.length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Expected Income"
          value={`฿${expectedIncome.toLocaleString()}`}
          subtext="Based on attendance"
          variant="success"
        />
        <SummaryCard
          label="Monthly Spending"
          value={`฿${monthlySpending.toLocaleString()}`}
          subtext={`${expenseItems} items tracked`}
          variant="danger"
        />
        <SummaryCard
          label="Net Balance"
          value={`฿${balance.toLocaleString()}`}
          subtext={balance >= 0 ? 'Surplus' : 'Deficit'}
          variant={balance >= 0 ? 'success' : 'danger'}
        />
        <SummaryCard
          label="Active Students"
          value={activeStudents}
          subtext={`${expenseItems} expense items`}
          variant="info"
        />
      </div>

      {/* Recommendation Card */}
      <RecommendationCard
        balance={balance}
        students={students}
        spendingItems={spending}
      />

      {/* Placeholder for Chart */}
      <div className="rounded-lg border border-border bg-input p-6">
        <h3 className="text-lg font-semibold mb-4">Income vs Spending Projection</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Chart will go here (Chart.js integration coming next)</p>
        </div>
      </div>
    </div>
  )
}
