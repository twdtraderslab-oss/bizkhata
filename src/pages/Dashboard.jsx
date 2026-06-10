import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, Package, Users, AlertTriangle, ArrowUpRight, Bell, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`
const fmtFull = (n) => `₹${n.toLocaleString('en-IN')}`

// Fake 7-day chart data
const CHART_DATA = [
  { day: 'Mon', received: 12000, paid: 8000 },
  { day: 'Tue', received: 18000, paid: 12000 },
  { day: 'Wed', received: 8000, paid: 5000 },
  { day: 'Thu', received: 22000, paid: 15000 },
  { day: 'Fri', received: 15000, paid: 9000 },
  { day: 'Sat', received: 28000, paid: 18000 },
  { day: 'Sun', received: 5000, paid: 3000 },
]

export default function Dashboard({ onNavigate }) {
  const { business, currentUser, parties, transactions, products, stats, language } = useApp()
  const hi = language === 'hi'

  const overdueParties = parties
    .filter(p => p.balanceType === 'to_receive' && p.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 4)

  const lowStockItems = products.filter(p => p.stock <= p.lowStockAlert)
  const recentTxns = transactions.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const greetingHi = hour < 12 ? 'Shubh Prabhat' : hour < 17 ? 'Namaskar' : 'Shubh Sandhya'

  return (
    <div style={{ padding: '0 0 24px' }}>

      {/* ── Hero Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo-mid) 70%, #3D47B0 100%)',
        padding: '28px 20px 32px', borderRadius: '0 0 28px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,107,26,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>
              {hi ? greetingHi : greeting} 🙏
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
              {currentUser?.name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>{business?.name}</p>
          </div>
          <button style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '10px 12px', cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          }}>
            <Bell size={16} /> <span style={{ background: 'var(--saffron)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>3</span>
          </button>
        </div>

        {/* ── Big Balance Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <TrendingUp size={14} color="#4ADE80" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{hi ? 'पाना है' : 'To Receive'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#4ADE80' }}>
              {fmt(stats.totalReceivable)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>
              {fmtFull(stats.totalReceivable)}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <TrendingDown size={14} color="#F87171" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{hi ? 'देना है' : 'To Pay'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#F87171' }}>
              {fmt(stats.totalPayable)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>
              {fmtFull(stats.totalPayable)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ── Quick Stats Row ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { icon: <Users size={18} color="var(--indigo)" />, value: stats.totalCustomers, label: hi ? 'ग्राहक' : 'Customers', bg: 'var(--indigo-light)' },
            { icon: <Package size={18} color="var(--saffron)" />, value: products.length, label: hi ? 'प्रोडक्ट' : 'Products', bg: 'var(--saffron-light)' },
            { icon: <AlertTriangle size={18} color="var(--amber)" />, value: stats.lowStockCount, label: hi ? 'कम स्टॉक' : 'Low Stock', bg: 'var(--amber-light)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── 7-Day Chart ───────────────────────────── */}
        <div className="card" style={{ padding: '18px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {hi ? 'इस सप्ताह' : 'This Week'}
            </h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} /> {hi ? 'मिला' : 'Received'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }} /> {hi ? 'दिया' : 'Paid'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={CHART_DATA} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip formatter={v => fmtFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }} />
              <Area type="monotone" dataKey="received" stroke="#16A34A" strokeWidth={2} fill="url(#gReceived)" />
              <Area type="monotone" dataKey="paid" stroke="#DC2626" strokeWidth={2} fill="url(#gPaid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Top Overdue ───────────────────────────── */}
        {overdueParties.length > 0 && (
          <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 12px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {hi ? 'बकाया बड़े खाते' : 'Top Outstanding'}
              </h3>
              <button onClick={() => onNavigate('parties')}
                style={{ background: 'none', border: 'none', color: 'var(--saffron)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                {hi ? 'सभी देखें' : 'See all'} <ArrowUpRight size={14} />
              </button>
            </div>
            {overdueParties.map((p, i) => (
              <div key={p.id} onClick={() => onNavigate('party-detail', p)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: i > 0 ? '1px solid var(--border-light)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: 'var(--indigo-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--indigo)', fontSize: 16,
                  }}>{p.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.city} · Last: {p.lastTxn}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>
                    {fmtFull(p.balance)}
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Low Stock Alert ───────────────────────── */}
        {lowStockItems.length > 0 && (
          <div className="card" style={{ marginBottom: 20, border: '1px solid var(--amber-light)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--amber-light)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="var(--amber)" />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--amber)' }}>
                {hi ? `${lowStockItems.length} आइटम कम स्टॉक में` : `${lowStockItems.length} items running low`}
              </span>
            </div>
            {lowStockItems.slice(0, 3).map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', padding: '11px 16px',
                borderTop: i > 0 ? '1px solid var(--border-light)' : 'none', fontSize: 14,
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</span>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>{p.stock} {p.unit}s left</span>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={() => onNavigate('inventory')} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                View Inventory →
              </button>
            </div>
          </div>
        )}

        {/* ── Recent Transactions ───────────────────── */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {hi ? 'हाल के लेन-देन' : 'Recent Transactions'}
            </h3>
          </div>
          {recentTxns.map((t, i) => {
            const party = parties.find(p => p.id === t.partyId)
            const isIncoming = t.type === 'sale' || t.type === 'receipt'
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < recentTxns.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isIncoming ? 'var(--green-light)' : 'var(--red-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isIncoming ? <TrendingUp size={16} color="var(--green)" /> : <TrendingDown size={16} color="var(--red)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {party?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.note || t.type} · {t.date}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  color: isIncoming ? 'var(--green)' : 'var(--red)',
                  whiteSpace: 'nowrap',
                }}>
                  {isIncoming ? '+' : '-'}{fmtFull(t.amount)}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
