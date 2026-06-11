import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, AlertTriangle, ChevronRight, ArrowUpRight, Bell, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import NotificationsScreen from '../components/NotificationsScreen'

const fmt  = n => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`
const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

const CHART_DATA = [
  { day: 'Mon', received: 12000, paid: 8000 },
  { day: 'Tue', received: 18000, paid: 12000 },
  { day: 'Wed', received: 8000,  paid: 5000  },
  { day: 'Thu', received: 22000, paid: 15000 },
  { day: 'Fri', received: 15000, paid: 9000  },
  { day: 'Sat', received: 28000, paid: 18000 },
  { day: 'Sun', received: 5000,  paid: 3000  },
]

export default function Dashboard({ onNavigate }) {
  const { business, currentUser, parties, transactions, products, stats, language, invoices } = useApp()
  const hi = language === 'hi'
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAskAI, setShowAskAI] = useState(false)

  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear  = today.getFullYear()

  // Business metrics (not software metrics)
  const salesThisMonth = transactions.filter(t => { const d = new Date(t.date); return t.type === 'sale' && d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s,t) => s+t.amount, 0)
  const collectionsThisMonth = transactions.filter(t => { const d = new Date(t.date); return t.type === 'receipt' && d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s,t) => s+t.amount, 0)
  const netCashFlow = collectionsThisMonth - transactions.filter(t => { const d = new Date(t.date); return t.type === 'payment' && d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s,t) => s+t.amount, 0)

  // Recovery rate
  const totalReceivable = stats.totalReceivable
  const recoveryRate = (totalReceivable + collectionsThisMonth) > 0 ? Math.round((collectionsThisMonth / (totalReceivable + collectionsThisMonth)) * 100) : 0

  // Safe invoices
  const safeInvoices = invoices || []
  const overdueInvoices = safeInvoices.filter(i => i.status !== 'paid' && new Date(i.dueDate) < today)
  const overdueAmt = overdueInvoices.reduce((s,i) => s+i.totalAmount, 0)

  // Top defaulters
  const topDefaulters = parties
    .filter(p => p.balance > 0 && p.balanceType === 'to_receive')
    .map(p => {
      const lastPmt = transactions.filter(t => t.partyId === p.id && (t.type === 'receipt')).sort((a,b) => new Date(b.date)-new Date(a.date))[0]
      const daysAgo = lastPmt ? Math.floor((today - new Date(lastPmt.date)) / (1000*60*60*24)) : null
      return { ...p, daysAgo }
    })
    .sort((a,b) => b.balance - a.balance)
    .slice(0, 3)

  // Action items
  const actionItems = []
  if (stats.lowStockCount > 0) actionItems.push({ icon: '📦', text: `${stats.lowStockCount} items low on stock`, screen: 'inventory', color: 'var(--amber)' })
  if (overdueInvoices.length > 0) actionItems.push({ icon: '⚠️', text: `${fmtFull(overdueAmt)} overdue`, screen: 'invoices', color: 'var(--red)' })
  if (topDefaulters.length > 0) actionItems.push({ icon: '💰', text: `${fmtFull(stats.totalReceivable)} pending collection`, screen: 'reminders', color: 'var(--indigo)' })

  // Smart insights
  const insights = []
  products.filter(p => p.stock <= p.lowStockAlert).forEach(p => insights.push(`📦 ${p.name} stock running low (${p.stock} left)`))
  topDefaulters.filter(p => p.daysAgo !== null && p.daysAgo > 7).forEach(p => insights.push(`⏳ ${p.name} has not paid for ${p.daysAgo} days`))
  const lastWeekCollections = transactions.filter(t => { const d = new Date(t.date); return t.type === 'receipt' && (today - d) < 7*24*60*60*1000 }).reduce((s,t)=>s+t.amount,0)
  const prevWeekCollections = transactions.filter(t => { const d = new Date(t.date); const diff = (today - d) / (1000*60*60*24); return t.type === 'receipt' && diff >= 7 && diff < 14 }).reduce((s,t)=>s+t.amount,0)
  if (prevWeekCollections > 0 && lastWeekCollections < prevWeekCollections * 0.8) insights.push(`📉 Collections dropped ${Math.round((1 - lastWeekCollections/prevWeekCollections)*100)}% this week`)

  // Inventory coverage
  products.forEach(p => {
    const monthlySales = transactions.filter(t => { const d = new Date(t.date); return t.type === 'sale' && d.getMonth() === thisMonth }).length
    if (monthlySales > 0 && p.stock > 0) {
      const coverage = Math.round(p.stock / (monthlySales / 30))
      if (coverage < 10) insights.push(`📦 ${p.name} may run out in ~${coverage} days`)
    }
  })

  const hour = today.getHours()
  const greeting = hour < 12 ? (hi ? 'शुभ प्रभात' : 'Good Morning') : hour < 17 ? (hi ? 'नमस्कार' : 'Good Afternoon') : (hi ? 'शुभ संध्या' : 'Good Evening')

  const notifCount = Math.max(0, overdueInvoices.length + stats.lowStockCount - (JSON.parse(localStorage.getItem('bizkhata_dismissed_notifs')||'[]')).length)

  const AI_SUGGESTIONS = [
    'Which customers should I follow up today?',
    'Which products are low stock?',
    'Show my unpaid invoices',
    'What is my recovery rate this month?',
  ]

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Hero Header ─────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 70%, #1D6EBF 100%)', padding: '28px 20px 24px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(249,115,22,0.15)' }} />

        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 3 }}>{greeting} 🙏</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>{currentUser?.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 1 }}>{business?.name}</p>
          </div>
          <button onClick={() => setShowNotifications(true)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, position: 'relative' }}>
            <Bell size={16} />
            {notifCount > 0 && <span style={{ background: 'var(--red)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{notifCount}</span>}
          </button>
        </div>

        {/* Cash Position — BIG NUMBERS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <TrendingUp size={13} color="#4ADE80" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{hi ? 'पाना है' : 'To Receive'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#4ADE80' }}>{fmt(stats.totalReceivable)}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 }}>{fmtFull(stats.totalReceivable)}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <TrendingDown size={13} color="#F87171" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{hi ? 'देना है' : 'To Pay'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#F87171' }}>{fmt(stats.totalPayable)}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 }}>{fmtFull(stats.totalPayable)}</div>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{hi ? 'इस महीने नेट कैश फ्लो' : 'Net Cash Flow This Month'}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: netCashFlow >= 0 ? '#4ADE80' : '#F87171' }}>
            {netCashFlow >= 0 ? '+' : ''}{fmt(netCashFlow)}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Action Required ────────────────────── */}
        {actionItems.length > 0 && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 16, padding: '14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Zap size={16} color="var(--saffron)" fill="var(--saffron)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--saffron)' }}>
                {hi ? 'आज का काम' : 'Action Required'}
              </span>
            </div>
            {actionItems.map((item, i) => (
              <div key={i} onClick={() => onNavigate(item.screen)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < actionItems.length - 1 ? '1px solid #FED7AA' : 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: item.color }}>{item.text}</span>
                <ChevronRight size={14} color={item.color} />
              </div>
            ))}
          </div>
        )}

        {/* ── Business Metrics (not software metrics) ─ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: hi ? 'बकाया' : 'Outstanding', value: fmt(stats.totalReceivable), sub: `${parties.filter(p=>p.balance>0&&p.balanceType==='to_receive').length} customers`, color: 'var(--green)', bg: 'var(--green-light)', screen: 'reminders' },
            { label: hi ? 'बिक्री' : 'Sales Month', value: fmt(salesThisMonth), sub: hi ? 'इस महीने' : 'this month', color: 'var(--indigo)', bg: 'var(--indigo-light)', screen: 'reports' },
            { label: hi ? 'वसूली' : 'Collections', value: fmt(collectionsThisMonth), sub: `${recoveryRate}% rate`, color: 'var(--saffron)', bg: 'var(--saffron-light)', screen: 'recovery' },
          ].map((s, i) => (
            <div key={i} className="card stat-card" onClick={() => onNavigate(s.screen)} style={{ padding: '12px 10px', cursor: 'pointer', background: s.bg, border: 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.color, opacity: 0.7 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Recovery Widget ───────────────────── */}
        <div className="card" style={{ padding: '16px', marginBottom: 16, background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>
              💰 {hi ? 'कलेक्शन' : 'Collections'}
            </h3>
            <button onClick={() => onNavigate('recovery')} style={{ background: 'var(--green)', border: 'none', borderRadius: 8, padding: '5px 12px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { l: hi ? 'बकाया' : 'Pending',   v: fmtFull(stats.totalReceivable), c: 'var(--amber)' },
              { l: hi ? 'वसूल हुआ' : 'Recovered', v: fmt(collectionsThisMonth), c: 'var(--green)' },
              { l: hi ? 'वसूली दर' : 'Rate',       v: `${recoveryRate}%`, c: 'var(--indigo)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top Defaulters ────────────────────── */}
        {topDefaulters.length > 0 && (
          <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                🎯 {hi ? 'टॉप बकायेदार' : 'Top Defaulters'}
              </h3>
              <button onClick={() => onNavigate('reminders')} style={{ background: 'none', border: 'none', color: 'var(--saffron)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Remind All →
              </button>
            </div>
            {topDefaulters.map((p, i) => (
              <div key={p.id} onClick={() => onNavigate('party-detail', p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: '1px solid var(--border-light)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--red)', fontSize: 16, flexShrink: 0 }}>
                  {p.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: p.daysAgo !== null && p.daysAgo > 7 ? 'var(--red)' : 'var(--text-muted)' }}>
                    {p.daysAgo !== null ? `${p.daysAgo} days since last payment` : 'No payment yet'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>{fmtFull(p.balance)}</div>
                  {overdueInvoices.some(inv => inv.partyId === p.id) && (
                    <span style={{ fontSize: 10, background: 'var(--red-light)', color: 'var(--red)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>OVERDUE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 7-Day Chart ───────────────────────── */}
        <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {hi ? 'इस हफ्ते' : 'This Week'}
            </h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} /> Received</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }} /> Paid</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={CHART_DATA} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2} /><stop offset="95%" stopColor="#059669" stopOpacity={0} /></linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} /><stop offset="95%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={v => fmtFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }} />
              <Area type="monotone" dataKey="received" stroke="#059669" strokeWidth={2} fill="url(#gR)" />
              <Area type="monotone" dataKey="paid" stroke="#DC2626" strokeWidth={2} fill="url(#gP)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Smart Insights ────────────────────── */}
        {insights.length > 0 && (
          <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                💡 {hi ? 'इनसाइट्स' : 'Insights'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart alerts</span>
            </div>
            {insights.slice(0, 4).map((insight, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: i < Math.min(insights.length,4)-1 ? '1px solid var(--border-light)' : 'none', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {insight}
              </div>
            ))}
          </div>
        )}

        {/* ── Ask HisaabPro AI ──────────────────── */}
        <div className="card" style={{ padding: '16px', marginBottom: 16, background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', border: '1px solid #DDD6FE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#5B21B6' }}>Ask HisaabPro</div>
              <div style={{ fontSize: 11, color: '#7C3AED', opacity: 0.8 }}>AI Business Assistant</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AI_SUGGESTIONS.map((q, i) => (
              <button key={i} onClick={() => {
                const aiBtn = document.querySelector('[data-ai-open]')
                if (aiBtn) aiBtn.click()
              }} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #DDD6FE', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#5B21B6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>→</span> {q}
              </button>
            ))}
          </div>
        </div>

      </div>

      {showNotifications && <NotificationsScreen onClose={() => setShowNotifications(false)} onNavigate={onNavigate} />}
    </div>
  )
}
