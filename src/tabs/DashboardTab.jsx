import { useState, useEffect, useMemo } from 'react'
import * as api from '../lib/api'
import { formatNum, calculateDashboardStats } from '../lib/financeUtils'
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
  const [assets, setAssets] = useState({ financial: [] })
  const [mlPredictions, setMlPredictions] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentData, spendingData, assetData, mlData] = await Promise.all([
          api.fetchStudents(),
          api.fetchSpending(),
          api.fetchAssets(),
          api.fetchMLSpendingPredictions()
        ])
        setStudents(studentData || [])
        setSpending(spendingData || [])
        if (assetData) setAssets(assetData)
        if (mlData) setMlPredictions(mlData)
      } catch (e) {
        console.error("Error loading dashboard data", e)
      } finally {
        setIsLoading(false)
      }
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
    return calculateDashboardStats({
      students,
      spending,
      assets,
      currentMonth,
      currentYear,
      daysInMonth,
      mlPredictions
    })
  }, [students, spending, assets, currentMonth, currentYear, daysInMonth, mlPredictions])

  const chartData = {
    labels: stats.isCurrentMonth && stats.futureLabels?.length > 0
      ? [...daysArray.map(d => `${d}`), ...stats.futureLabels]
      : daysArray.map(d => `${d}`),
    datasets: [
      {
        label: 'Income',
        data: stats.cumulativeIncome,
        borderColor: '#34D399', // Brighter Emerald (emerald-400)
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 3, // Thicker
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
      {
        label: 'Spending',
        data: stats.cumulativeSpending,
        borderColor: '#FB7185', // Brighter Rose (rose-400)
        backgroundColor: 'rgba(251, 113, 133, 0.1)',
        borderWidth: 3, // Thicker
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
    ],
  }

  if (stats.isCurrentMonth && stats.projectedSpending) {
    chartData.datasets.push({
      label: 'Projected Spend (ML)',
      data: stats.projectedSpending,
      borderColor: 'rgba(251, 113, 133, 0.4)', // Faded Rose
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 0,
      fill: false,
    });
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
          <div className="p-3 rounded-2xl bg-card border border-border/40 shadow-sm min-w-[140px]">
            <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-1">Liquid Capital</div>
            <div className="text-xl font-black text-emerald-500">
              ฿{formatNum(stats.totalLiquidCapital)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border/40 shadow-sm min-w-[140px]">
            <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Student Income</div>
            <div className="text-xl font-black text-primary">
              ฿{formatNum(stats.balance)}
            </div>
          </div>
          <div className="hidden lg:block ml-4">
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
                    <div key={`e-${idx}`} className="flex items-center gap-1 text-[7px] leading-tight px-1 py-0.5 rounded-md bg-emerald-500 text-white font-black" title={`${e.name}: ฿${e.amount}`}>
                      <ArrowUpCircle className="h-1.5 w-1.5 shrink-0" />
                      <span className="whitespace-nowrap">{e.name} ฿{formatNum(e.amount)}</span>
                    </div>
                  ))}
                  {dayData.spendings.map((s, idx) => (
                    <div key={`s-${idx}`} className="flex items-center gap-1 text-[7px] leading-tight px-1 py-0.5 rounded-md bg-rose-500 text-white font-black" title={`${s.name}: ฿${s.amount}`}>
                      <ArrowDownCircle className="h-1.5 w-1.5 shrink-0" />
                      <span className="whitespace-nowrap">{s.name} ฿{formatNum(s.amount)}</span>
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
