import { useState, useEffect } from 'react'
import { Plus, Trash2, ShieldCheck, Wallet, Globe, Instagram, Youtube, Send, Mail, FileText } from 'lucide-react'
import * as api from '../lib/api'
import { formatNum } from '../lib/financeUtils'
import { Input } from '../components/ui/input'

const CATEGORY_ICONS = {
  vitals: ShieldCheck,
  financial: Wallet,
  digital: Globe,
  physical: FileText
}

export default function AssetsTab() {
  const [assets, setAssets] = useState({
    physical: [
      { name: 'Honda PCX 2017', min: 20000, max: 30000 },
      { name: 'Marshall Kilburn III', min: 8000, max: 10500 },
      { name: 'Pioneer FLX 4', min: 5000, max: 7500 },
      { name: 'Longboard', min: 1500, max: 3500 }
    ],
    financial: [
      { name: 'Cash', value: 5723, currency: 'THB' },
      { name: 'USDT', value: 189.5, currency: 'USDT' },
      { name: 'Stocks', value: 0, currency: 'USD' }
    ],
    vitals: [
      { name: 'Passport', exp: '2030-01-01' },
      { name: 'Driver License', exp: '2028-05-15' },
      { name: 'DTV Visa', exp: '2025-11-10' }
    ],
    digital: [
      { name: 'YouTube', sub: 0, posts: 0, icon: Youtube },
      { name: 'Telegram', sub: 0, posts: 0, icon: Send },
      { name: 'Instagram', sub: 0, posts: 0, icon: Instagram },
      { name: 'Email List', sub: 0, posts: 0, icon: Mail },
      { name: 'EWK Website', sub: 0, posts: 0, icon: Globe }
    ]
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.fetchAssets()
        // Only override if the server actually has meaningful data
        if (data && (data.physical?.length > 0 || data.financial?.length > 0)) {
          setAssets(data)
        } else {
          // If server is empty, sync our defaults TO the server once
          api.saveAssets(assets)
        }
      } catch (e) {
        console.error('Failed to load assets', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (newAssets) => {
    setAssets(newAssets)
    try {
      await api.saveAssets(newAssets)
    } catch (e) {
      console.error('Failed to save assets', e)
    }
  }

  const updateSection = (section, index, field, value) => {
    const newData = { 
      ...assets,
      [section]: assets[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }
    handleSave(newData)
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Vault...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Financial & Vitals (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Assets */}
        <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Liquid Capital</h3>
          </div>
          <div className="space-y-3">
            {assets.financial.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/20">
                <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateSection('financial', i, 'value', parseFloat(e.target.value) || 0)}
                    className="w-24 bg-transparent text-right text-sm font-black text-foreground focus:outline-none hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground/40">{item.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Documents */}
        <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Vital Documents</h3>
          </div>
          <div className="space-y-3">
            {assets.vitals.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/20">
                <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                <input
                  type="date"
                  value={item.exp}
                  onChange={(e) => updateSection('vitals', i, 'exp', e.target.value)}
                  className="bg-transparent text-right text-[11px] font-bold text-primary focus:outline-none cursor-pointer hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Physical Assets (Middle) */}
      <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Physical Inventory</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.physical.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/5 border border-border/20 space-y-3">
              <div className="text-[10px] font-black text-foreground/70 uppercase tracking-tight">{item.name}</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground/50 font-bold uppercase">Min ฿</span>
                  <input
                    type="number"
                    value={item.min}
                    onChange={(e) => updateSection('physical', i, 'min', parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-right text-xs font-black text-foreground/80 focus:outline-none hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground/50 font-bold uppercase">Max ฿</span>
                  <input
                    type="number"
                    value={item.max}
                    onChange={(e) => updateSection('physical', i, 'max', parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-right text-xs font-black text-foreground/80 focus:outline-none hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Equity / KPIs (Bottom Row) */}
      <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Digital Equity & KPIs</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {assets.digital.map((item, i) => {
            const Icon = item.icon || Globe
            return (
              <div key={i} className="p-4 rounded-xl bg-muted/5 border border-border/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-[10px] font-black text-foreground/70 uppercase">{item.name}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Subscribers</div>
                    <input
                      type="number"
                      value={item.sub}
                      onChange={(e) => updateSection('digital', i, 'sub', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-black text-primary focus:outline-none hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Uploads/Posts</div>
                    <input
                      type="number"
                      value={item.posts}
                      onChange={(e) => updateSection('digital', i, 'posts', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-black text-foreground/80 focus:outline-none hover:bg-primary/5 focus:bg-primary/10 px-1 rounded transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
