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
  Minimize2
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

    students.forEach(student => {
      student.payments?.forEach(payment => {
        const d = new Date(payment.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          dailyIncome[d.getDate() - 1] += payment.amount || 0
        }
      })
    })

    spending.forEach(item => {
      item.purchaseDates?.forEach(dateEntry => {
        const d = new Date(typeof dateEntry === 'string' ? dateEntry : dateEntry.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const cost = typeof dateEntry === 'string' ? (item.pricePerUnit * item.units) : (dateEntry.cost || (item.pricePerUnit * item.units))
          dailySpending[d.getDate() - 1] += cost || 0
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

    // Calculate LIFETIME balance (Total Payments - Total Spending)
    const totalLifetimeIncome = students.reduce((acc, s) => acc + (s.payments || []).reduce((pAcc, p) => pAcc + p.amount, 0), 0)
    const totalLifetimeSpending = spending.reduce((acc, s) => acc + (s.purchaseDates || []).reduce((dAcc, d) => {
      const cost = typeof d === 'string' ? (s.pricePerUnit * s.units) : (d.cost || (s.pricePerUnit * s.units))
      return dAcc + (cost || 0)
    }, 0), 0)

    return { 
      cumulativeIncome, 
      cumulativeSpending, 
      dailyIncome, 
      dailySpending,
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
        borderColor: '#10B981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
      {
        label: 'Spending',
        data: stats.cumulativeSpending,
        borderColor: '#F43F5E', // Rose
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
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
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
        ticks: { color: '#737373', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#737373', font: { size: 10 } }
      }
    }
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header with Balance and Month Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Current Balance</div>
            <div className={`text-xl font-black ${stats.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ฿{formatNum(stats.balance)}
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-foreground/90 uppercase tracking-tight">{monthName} {currentYear}</h1>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Financial Terminal v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border/40 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1))}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 hover:bg-muted rounded-lg text-[10px] font-black uppercase text-foreground/80 transition-all"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1))}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => {
              const data = { spending, students }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `finance_backup_${currentYear}_${currentMonth+1}.json`
              a.click()
            }}
            className="p-3 rounded-xl bg-card border border-border/40 hover:bg-muted transition-all shadow-sm"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className={`rounded-2xl bg-card border border-border/40 shadow-sm transition-all duration-500 ${isZoomed ? 'h-[500px]' : 'h-[350px]'}`}>
        <div className="p-6 border-b border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Interactive Timeline</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40">SCROLL TO ZOOM • DRAG TO PAN</p>
            </div>
          </div>
          <button 
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground/40 transition-all"
          >
            {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        <div className="p-6 h-[calc(100%-80px)]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Bottom Grid: Calendar & Key Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/40 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Monthly Matrix</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[9px] font-black text-muted-foreground/30 uppercase text-center pb-2">{day}</div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-muted/5 opacity-20" />
            ))}
            
            {daysArray.map(day => {
              const income = stats.dailyIncome[day - 1]
              const spend = stats.dailySpending[day - 1]
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
              
              return (
                <div key={day} className={`h-16 rounded-xl border p-2 transition-all relative group cursor-pointer ${isToday ? 'border-primary/50 bg-primary/5' : 'border-border/20 bg-muted/5 hover:border-border/60 hover:bg-muted/10'}`}>
                  <span className={`text-[10px] font-black ${isToday ? 'text-primary' : 'text-muted-foreground/40'}`}>{day}</span>
                  
                  <div className="mt-1 space-y-1">
                    {income > 0 && (
                      <div className="h-1 w-full bg-emerald-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                      </div>
                    )}
                    {spend > 0 && (
                      <div className="h-1 w-full bg-rose-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip-like popup on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-card/95 flex flex-col items-center justify-center rounded-xl transition-opacity pointer-events-none border border-border/40 shadow-xl z-10">
                    <div className="text-[8px] font-black text-emerald-500">+ ฿{income.toLocaleString()}</div>
                    <div className="text-[8px] font-black text-rose-500">- ฿{spend.toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Key Events Placeholder */}
        <div className="rounded-2xl bg-card border border-border/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Key Events</h3>
            <button className="text-[9px] font-black text-primary uppercase tracking-tighter hover:underline">Add Event</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-border/60 opacity-50 grayscale">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div>
                <div className="text-[10px] font-black text-foreground/80 uppercase">Future Feature</div>
                <div className="text-[9px] font-bold text-muted-foreground/50">Drop custom markers here...</div>
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-muted-foreground/30 text-center py-10 leading-relaxed italic">
              "We'll soon allow you to pin rent days, flight dates, or big project deadlines directly to your matrix and timeline."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
