import { useState, useEffect, useMemo } from 'react'
import * as api from '../lib/api'
import { formatNum } from '../lib/financeUtils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Activity, 
  Download,
  Maximize2,
  Minimize2,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'
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
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

export default function DashboardTab() {
  const [spending, setSpending] = useState([])
  const [students, setStudents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isZoomed, setIsZoomed] = useState(false)

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

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Daily data calculation
  const stats = useMemo(() => {
    const dailyIncome = new Array(daysInMonth).fill(0)
    const dailySpending = new Array(daysInMonth).fill(0)
    const dailyItems = new Array(daysInMonth).fill(null).map(() => ({ earnings: [], spendings: [] }))

    students.forEach(student => {
      student.payments?.forEach(payment => {
        const d = new Date(payment.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const day = d.getDate() - 1
          dailyIncome[day] += payment.amount || 0
          dailyItems[day].earnings.push({ name: student.name, amount: payment.amount })
        }
      })
    })

    spending.forEach(item => {
      item.purchaseDates?.forEach(dateEntry => {
        const d = new Date(typeof dateEntry === 'string' ? dateEntry : dateEntry.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const day = d.getDate() - 1
          const cost = typeof dateEntry === 'string' ? (item.pricePerUnit * item.units) : (dateEntry.cost || (item.pricePerUnit * item.units))
          dailySpending[day] += cost || 0
          dailyItems[day].spendings.push({ name: item.name, amount: cost })
        }
      })
    })

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

    // Calculate LIFETIME balance (Total Payments + Adjustments - Total Spending)
    const totalLifetimeIncome = students.reduce((acc, s) => {
      const pTotal = (s.payments || []).reduce((pAcc, p) => pAcc + p.amount, 0)
      const aTotal = (s.adjustments || []).reduce((aAcc, a) => aAcc + a.amount, 0)
      return acc + pTotal + aTotal
    }, 0)
    
    const totalLifetimeSpending = spending.reduce((acc, s) => acc + (s.purchaseDates || []).reduce((dAcc, d) => {
      const cost = typeof d === 'string' ? (s.pricePerUnit * s.units) : (d.cost || (s.pricePerUnit * s.units))
      return dAcc + (cost || 0)
    }, 0), 0)

    return { 
      cumulativeIncome, 
      cumulativeSpending, 
      dailyIncome, 
      dailySpending,
      dailyItems,
      totalIncome: incSum,
      totalSpending: spendSum,
      balance: totalLifetimeIncome - totalLifetimeSpending
    }
  }, [students, spending, currentMonth, currentYear, daysInMonth])

  const chartData = {
    labels: daysArray.map(d => `${d}`),
    datasets: [
      {
        label: 'Income',
        data: stats.cumulativeIncome,
        borderColor: '#10B981', 
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
      {
        label: 'Spending',
        data: stats.cumulativeSpending,
        borderColor: '#F43F5E', 
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
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
      y: { beginAtZero: true, grid: { color: '#1A1A1A' }, ticks: { color: '#737373', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#737373', font: { size: 10 } } }
    }
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header with Balance and Month Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Total Net Liquidity</div>
            <div className={`text-xl font-black ${stats.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ฿{formatNum(stats.balance)}
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-foreground/90 uppercase tracking-tight">{monthName} {currentYear}</h1>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Financial Terminal v2.1</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border/40 rounded-xl p-1 shadow-sm">
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1))} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-muted rounded-lg text-[10px] font-black uppercase text-foreground/80 transition-all">Today</button>
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1))} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => {
            const data = { spending, students }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `finance_backup_${currentYear}_${currentMonth+1}.json`
            a.click()
          }} className="p-3 rounded-xl bg-card border border-border/40 hover:bg-muted transition-all shadow-sm">
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* NEW: Calendar Top Section */}
      <div className="rounded-2xl bg-card border border-border/40 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Cash Flow Matrix</h3>
            <p className="text-[10px] font-bold text-muted-foreground/40">ITEMIZED DAILY LEDGER</p>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[9px] font-black text-muted-foreground/30 uppercase text-center pb-2">{day}</div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-muted/5 opacity-20" />
          ))}
          
          {daysArray.map(day => {
            const dayData = stats.dailyItems[day - 1]
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
            
            return (
              <div key={day} className={`min-h-[100px] rounded-xl border p-2 transition-all relative flex flex-col gap-1 overflow-hidden group ${isToday ? 'border-primary/50 bg-primary/5' : 'border-border/20 bg-muted/5 hover:border-border/60'}`}>
                <span className={`text-[10px] font-black shrink-0 ${isToday ? 'text-primary' : 'text-muted-foreground/40'}`}>{day}</span>
                
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                  {dayData.earnings.map((e, idx) => (
                    <div key={`e-${idx}`} className="flex items-center gap-1 text-[8px] leading-tight px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500/80 font-black truncate" title={`${e.name}: ฿${e.amount}`}>
                      <ArrowUpCircle className="h-2 w-2 shrink-0" />
                      <span>{e.name}</span>
                    </div>
                  ))}
                  {dayData.spendings.map((s, idx) => (
                    <div key={`s-${idx}`} className="flex items-center gap-1 text-[8px] leading-tight px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500/80 font-black truncate" title={`${s.name}: ฿${s.amount}`}>
                      <ArrowDownCircle className="h-2 w-2 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Graph Card - Now Bottom */}
      <div className={`rounded-2xl bg-card border border-border/40 shadow-sm transition-all duration-500 ${isZoomed ? 'h-[500px]' : 'h-[350px]'}`}>
        <div className="p-6 border-b border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Net Accumulation</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40">CUMULATIVE TREND</p>
            </div>
          </div>
          <button onClick={() => setIsZoomed(!isZoomed)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground/40 transition-all">
            {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        <div className="p-6 h-[calc(100%-80px)]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
