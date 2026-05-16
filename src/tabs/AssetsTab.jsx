import { useState, useEffect } from 'react'
import { Plus, Trash2, ShieldCheck, Wallet, Globe, Instagram, Youtube, Send, Mail, FileText, ChevronDown } from 'lucide-react'
import * as api from '../lib/api'
import { formatNum } from '../lib/financeUtils'

const DIGITAL_ICONS = {
  YouTube: Youtube,
  Telegram: Send,
  Instagram: Instagram,
  'Email List': Mail,
  'EWK Website': Globe
}

export default function AssetsTab() {
  const [assets, setAssets] = useState({
    physical: [
      { name: 'Honda PCX 2017', value: '20000-30000' },
      { name: 'Marshall Kilburn III', value: '8000-10500' },
      { name: 'Pioneer FLX 4', value: '5000-7500' },
      { name: 'Longboard', value: '1500-3500' }
    ],
    financial: [
      { name: 'Cash', value: 5723, currency: 'THB' },
      { name: 'USDT', value: 189.5, currency: 'USDT' },
      { name: 'Stocks', value: 0, currency: 'USD' }
    ],
    vitals: [
      { name: 'Passport', exp: '2030-01-01', type: 'standard' },
      { name: 'Driver License', exp: '2028-05-15', type: 'standard' },
      { name: 'DTV Visa', exp: '2025-11-10', borderRun: '2025-05-10', cost: 10000, type: 'visa' }
    ],
    digital: [
      { name: 'YouTube', sub: 0, posts: 0 },
      { name: 'Telegram', sub: 0, posts: 0 },
      { name: 'Instagram', sub: 0, posts: 0 },
      { name: 'Email List', sub: 0, posts: 0 },
      { name: 'EWK Website', sub: 0, posts: 0 }
    ]
  })

  const [isLoading, setIsLoading] = useState(true)
  const [showDocs, setShowDocs] = useState(false)
  const [showPhysical, setShowPhysical] = useState(false)
  const [showDigital, setShowDigital] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.fetchAssets()
        if (data) {
          // Migration: Ensure all financial assets have IDs
          const migratedFinancial = (data.financial || []).map(item => ({
            ...item,
            id: item.id || `acc_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
          }))
          
          const migratedData = { ...data, financial: migratedFinancial }
          
          // If we actually added IDs, save it back once
          const hadMissingIds = (data.financial || []).some(item => !item.id)
          if (hadMissingIds) {
            await api.saveAssets(migratedData)
          }

          setAssets(prev => ({
            ...prev,
            ...migratedData
          }))
        }
      } catch (e) {
        console.error('Failed to load assets', e)
      } finally {
        setIsLoading(false)
      }
    }
    
    load()
    
    // Refresh when user switches back to this tab or window
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', load)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', load)
    }
  }, [])

  const handleSave = async (newAssets) => {
    setAssets(newAssets)
    try {
      await api.saveAssets(newAssets)
    } catch (e) {
      console.error('Failed to save assets', e)
    }
  }

  const addItem = (section) => {
    const defaults = {
      physical: { name: 'New Item', value: '0' },
      financial: { id: `acc_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`, name: 'New Account', value: 0, currency: 'THB' },
      vitals: { name: 'New Document', exp: new Date().toISOString().split('T')[0], type: 'standard' },
      digital: { name: 'New Channel', sub: 0, posts: 0 }
    }
    const newData = {
      ...assets,
      [section]: [...(assets[section] || []), defaults[section]]
    }
    handleSave(newData)
  }

  const removeItem = (section, index) => {
    const newData = {
      ...assets,
      [section]: (assets[section] || []).filter((_, i) => i !== index)
    }
    handleSave(newData)
  }

  const updateSection = (section, index, field, value) => {
    const newData = { 
      ...assets,
      [section]: (assets[section] || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }
    handleSave(newData)
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Vault...</div>

  // Summaries
  const financialList = assets.financial || []
  const totalFinancial = financialList.reduce((sum, item) => {
    const multiplier = item.currency === 'USDT' ? 36 : (item.currency === 'USD' ? 35 : 1)
    return sum + ((item.value || 0) * multiplier)
  }, 0)

  const physicalList = assets.physical || []
  let physicalMin = 0
  let physicalMax = 0
  physicalList.forEach(item => {
    const parts = (item.value || '0').split('-').map(p => parseInt(p.replace(/[^0-9]/g, '')) || 0)
    if (parts.length === 2) {
      physicalMin += parts[0]
      physicalMax += parts[1]
    } else {
      physicalMin += parts[0]
      physicalMax += parts[0]
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Window Controls */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setShowDocs(!showDocs)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${showDocs ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/5 border-border/20 text-muted-foreground hover:border-border/40 hover:text-foreground/80'}`}
        >
          <ShieldCheck className="h-4 w-4" />
          Documents
        </button>
        <button 
          onClick={() => setShowPhysical(!showPhysical)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${showPhysical ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/5 border-border/20 text-muted-foreground hover:border-border/40 hover:text-foreground/80'}`}
        >
          <FileText className="h-4 w-4" />
          Physical Inventory
        </button>
        <button 
          onClick={() => setShowDigital(!showDigital)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${showDigital ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/5 border-border/20 text-muted-foreground hover:border-border/40 hover:text-foreground/80'}`}
        >
          <Globe className="h-4 w-4" />
          Digital Equity
        </button>
      </div>

      {/* Financial & Documents */}
      <div className={`grid grid-cols-1 ${showDocs ? 'md:grid-cols-2' : ''} gap-6`}>
        {/* Financial Assets */}
        <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm relative group/section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Liquid Capital</h3>
                <div className="text-[10px] font-bold text-primary/60 mt-0.5">Total: ฿{formatNum(totalFinancial)}</div>
              </div>
            </div>
            <button onClick={() => addItem('financial')} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all opacity-0 group-hover/section:opacity-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {financialList.map((item, i) => (
              <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/20 hover:border-border/40 transition-all">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateSection('financial', i, 'name', e.target.value)}
                  className="bg-transparent text-xs font-bold text-muted-foreground focus:outline-none w-1/2"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateSection('financial', i, 'value', parseFloat(e.target.value) || 0)}
                    className="w-24 bg-transparent text-right text-sm font-black text-foreground focus:outline-none hover:bg-primary/5 px-1 rounded transition-colors"
                  />
                  <input
                    type="text"
                    value={item.currency}
                    onChange={(e) => updateSection('financial', i, 'currency', e.target.value)}
                    className="w-12 bg-transparent text-[10px] font-bold text-muted-foreground/40 focus:outline-none uppercase"
                  />
                  <button onClick={() => removeItem('financial', i)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/30 hover:text-danger transition-all ml-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        {showDocs && (
          <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm relative group/section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Documents</h3>
                <div className="text-[10px] font-bold text-muted-foreground/50 mt-0.5">Inventory: {assets.vitals?.length || 0} items</div>
              </div>
            </div>
            <button onClick={() => addItem('vitals')} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all opacity-0 group-hover/section:opacity-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {(assets.vitals || []).map((item, i) => {
              const isVisa = item.type === 'visa' || item.name?.toLowerCase().includes('visa')
              return (
                <div key={i} className="group p-4 rounded-xl border bg-muted/5 border-border/20 hover:border-border/40 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateSection('vitals', i, 'name', e.target.value)}
                        className="bg-transparent text-xs font-black uppercase text-foreground/80 focus:outline-none w-full"
                      />
                      <select 
                        value={item.type || 'standard'} 
                        onChange={(e) => updateSection('vitals', i, 'type', e.target.value)}
                        className="bg-muted/10 text-[9px] font-black uppercase text-muted-foreground/50 border-none focus:ring-0 cursor-pointer rounded px-1"
                      >
                        <option value="standard">Standard</option>
                        <option value="visa">Visa</option>
                      </select>
                    </div>
                    <button onClick={() => removeItem('vitals', i)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/30 hover:text-danger transition-all ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className={`grid gap-3 ${isVisa ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold">Expiration</div>
                      <input
                        type="date"
                        value={item.exp}
                        onChange={(e) => updateSection('vitals', i, 'exp', e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-primary focus:outline-none cursor-pointer hover:bg-white/5 px-1 rounded transition-colors w-full"
                      />
                    </div>
                    {isVisa && (
                      <div className="space-y-1">
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold">Border Run</div>
                        <input
                          type="date"
                          value={item.borderRun || ''}
                          onChange={(e) => updateSection('vitals', i, 'borderRun', e.target.value)}
                          className="bg-transparent text-[11px] font-bold text-muted-foreground/70 focus:outline-none cursor-pointer hover:bg-white/5 px-1 rounded transition-colors w-full"
                        />
                      </div>
                    )}
                  </div>

                  {isVisa && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/10">
                      <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold">Maintenance Cost</div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground/30">฿</span>
                        <input
                          type="number"
                          value={item.cost || 0}
                          onChange={(e) => updateSection('vitals', i, 'cost', parseInt(e.target.value) || 0)}
                          className="bg-transparent text-right text-[11px] font-black text-foreground/70 focus:outline-none w-16"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )}
      </div>

      {/* Physical Assets */}
      {showPhysical && (
        <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm relative group/section">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Physical Inventory</h3>
              <div className="text-[10px] font-bold text-muted-foreground/50 mt-0.5">Total Est: ฿{formatNum(physicalMin)} - ฿{formatNum(physicalMax)}</div>
            </div>
          </div>
          <button onClick={() => addItem('physical')} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all opacity-0 group-hover/section:opacity-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {physicalList.map((item, i) => (
            <div key={i} className="relative group p-4 rounded-xl bg-muted/5 border border-border/20 hover:border-border/40 transition-all space-y-3">
              <button onClick={() => removeItem('physical', i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/30 hover:text-danger transition-all">
                <Trash2 className="h-3 w-3" />
              </button>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateSection('physical', i, 'name', e.target.value)}
                className="text-[10px] font-black text-foreground/70 uppercase tracking-tight bg-transparent focus:outline-none w-full pr-6"
              />
              <div className="space-y-1">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Market Value (฿)</div>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateSection('physical', i, 'value', e.target.value)}
                  placeholder="e.g. 20000-30000"
                  className="w-full bg-transparent text-sm font-black text-foreground/80 focus:outline-none hover:bg-primary/5 px-1 rounded transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Digital Equity */}
      {showDigital && (
        <div className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm relative group/section">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Digital Equity & KPIs</h3>
          </div>
          <button onClick={() => addItem('digital')} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all opacity-0 group-hover/section:opacity-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(assets.digital || []).map((item, i) => {
            const Icon = DIGITAL_ICONS[item.name] || Globe
            return (
              <div key={i} className="relative group p-4 rounded-xl bg-muted/5 border border-border/20 hover:border-border/40 transition-all space-y-4">
                <button onClick={() => removeItem('digital', i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/30 hover:text-danger transition-all">
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateSection('digital', i, 'name', e.target.value)}
                    className="text-[10px] font-black text-foreground/70 uppercase bg-transparent focus:outline-none w-full pr-4"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Subscribers</div>
                    <input
                      type="number"
                      value={item.sub}
                      onChange={(e) => updateSection('digital', i, 'sub', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-black text-primary focus:outline-none hover:bg-primary/5 px-1 rounded transition-colors"
                    />
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Uploads/Posts</div>
                    <input
                      type="number"
                      value={item.posts}
                      onChange={(e) => updateSection('digital', i, 'posts', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-black text-foreground/80 focus:outline-none hover:bg-primary/5 px-1 rounded transition-colors"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}
    </div>
  )
}
