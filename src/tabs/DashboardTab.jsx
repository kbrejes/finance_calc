import { useState, useEffect } from 'react'
import SummaryCard from '../components/SummaryCard'
import RecommendationCard from '../components/RecommendationCard'
import * as api from '../lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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

  // Date Helpers
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Calculate Daily Cumulative Data
  const getDailyData = () => {
    const dailyIncome = new Array(daysInMonth).fill(0)
    const dailySpending = new Array(daysInMonth).fill(0)

    // Process Students (Income)
    students.forEach(student => {
      student.attendanceDates?.forEach(dateEntry => {
        const d = new Date(typeof dateEntry === 'string' ? dateEntry : dateEntry.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          dailyIncome[d.getDate() - 1] += student.price
        }
      })
    })

    // Process Spending
    spending.forEach(item => {
      item.purchaseDates?.forEach(dateEntry => {
        const d = new Date(typeof dateEntry === 'string' ? dateEntry : dateEntry.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const cost = typeof dateEntry === 'string' ? (item.pricePerUnit * item.units) : (dateEntry.cost || (item.pricePerUnit * item.units))
          dailySpending[d.getDate() - 1] += cost
        }
      })
    })

    // Create Cumulative
    const cumulativeIncome = []
    const cumulativeSpending = []
    let incSum = 0
    let spendSum = 0

    for (let i = 0; i < daysInMonth; i++) {
      incSum += dailyIncome[i]
      spendSum += dailySpending[i]
      cumulativeIncome.push(incSum)
      cumulativeSpending.push(spendSum)
    }

    return { cumulativeIncome, cumulativeSpending }
  }

  const { cumulativeIncome, cumulativeSpending } = getDailyData()
  const monthlySpending = cumulativeSpending[daysInMonth - 1] || 0
  const expectedIncome = cumulativeIncome[daysInMonth - 1] || 0
  const balance = expectedIncome - monthlySpending
  const activeStudents = students.length
  const expenseItems = spending.length

  // Chart Data
  const chartData = {
    labels: daysArray.map(d => `${d}`),
    datasets: [
      {
        fill: true,
        label: 'Cumulative Income',
        data: cumulativeIncome,
        borderColor: '#334155', // Heavy Steel
        backgroundColor: 'rgba(51, 65, 85, 0.05)',
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        fill: true,
        label: 'Cumulative Spending',
        data: cumulativeSpending,
        borderColor: '#F43F5E', // Rose
        backgroundColor: 'rgba(244, 63, 94, 0.03)',
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#A3A3A3',
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0A0A0A',
        titleColor: '#FFFFFF',
        bodyColor: '#A3A3A3',
        borderColor: '#262626',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: ฿${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#1A1A1A' },
        ticks: { 
          color: '#737373',
          callback: (value) => `฿${value.toLocaleString()}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: '#737373',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Expected Income"
          value={`฿${expectedIncome.toLocaleString()}`}
          subtext="Month-to-date"
          variant="muted"
        />
        <SummaryCard
          label="Monthly Spending"
          value={`฿${monthlySpending.toLocaleString()}`}
          subtext={`${expenseItems} items tracked`}
          variant="muted"
        />
        <SummaryCard
          label="Net Balance"
          value={`฿${balance.toLocaleString()}`}
          subtext={balance >= 0 ? 'Current Surplus' : 'Current Deficit'}
          variant="muted"
        />
        <SummaryCard
          label="Active Students"
          value={activeStudents}
          subtext="Tracking attendance"
          variant="muted"
        />
      </div>

      {/* Recommendation Card */}
      <RecommendationCard
        balance={balance}
        students={students}
        spendingItems={spending}
      />

      {/* Chart Section */}
      <div className="rounded-lg bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Cash Flow Timeline</h3>
          <p className="text-xs text-muted-foreground">Cumulative income vs spending for current month</p>
        </div>
        <div className="h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Data Management Section */}
      <div className="rounded-lg bg-card/50 border border-dashed border-border/60 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground/80 mb-1">Off-site Data Safety</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
            While we have automated server-side snapshots, we recommend downloading a manual backup occasionally to keep your data safe on your personal computer.
          </p>
        </div>
        <button 
          onClick={() => {
            const data = { spending, students }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
        >
          Download Snapshot
        </button>
      </div>
    </div>
  )
}
