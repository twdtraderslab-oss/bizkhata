import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, DollarSign, Target, Award, Zap, Copy, CheckCircle } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function RecoveryDashboard() {
  const { parties, invoices, transactions, business, language } = useApp()
  const hi = language === 'hi'

  const safeInvoices = invoices || []
  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()

  // Recovery stats
  const allOverdue = safeInvoices.filter(inv => inv.status !== 'paid' && new Date(inv.dueDate) < today)
  const overdueAmt = allOverdue.reduce((s, i) => s + i.totalAmount, 0)

  const monthlyReceipts = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'receipt' && d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  const recoveredThisMonth = monthlyReceipts.reduce((s, t) => s + t.amount, 0)

  const totalReceivable = parties.filter(p => p.balanceType === 'to_receive').reduce((s, p) => s + p.balance, 0)
  const recoveryRate = totalReceivable > 0 ? Math.min(100, Math.round((recoveredThisMonth / (totalReceivable + recoveredThisMonth)) * 100)) : 0

  const paidInvoices = safeInvoices.filter(i => i.status === 'paid').length
  const totalInvoices = safeInvoices.length
  const invoiceCollectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0

  // Top debtors
  const topDebtors = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive').sort((a, b) => b.balance - a.balance).slice(0, 5)

  // Monthly trend (last 6 months)
  const monthlyTrend = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    const m = d.getMonth(); const y = d.getFullYear()
    const amt = transactions.filter(t => { const td = new Date(t.date); return t.type === 'receipt' && td.getMonth() === m && td.getFullYear() === y }).reduce((s, t) => s + t.amount, 0)
    monthlyTrend.push({ label: d.toLocaleString('en-IN', { month: 'short' }), amt })
  }
  const maxTrend = Math.max(...monthlyTrend.map(m => m.amt), 1)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--recovery)', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {hi ? 'पेमेंट रिकवरी सेंटर' : 'Payment Recovery Center'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 16 }}>
          {hi ? 'AI Recovery Agent — आपका पैसा वापस लाएं' : 'AI Recovery Agent — Recover What You\'re Owed'}
        </p>

        {/* BIG RECOVERY NUMBER */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: '20px', border: '1px solid rgba(255,255,255,0.25)', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>{hi ? 'HisaabPro द्वारा वसूल हुआ' : 'Recovered via HisaabPro'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: 'white' }}>{fmtFull(recoveredThisMonth)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#4ADE80' }}>{recoveryRate}%</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Recovery Rate</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#FCD34D' }}>{invoiceCollectionRate}%</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Invoice Collection</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#F87171' }}>{fmtFull(overdueAmt).replace('₹', '₹').split(',').slice(0,2).join(',')}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Overdue</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Monthly Trend Bar Chart */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--indigo)' }}>
            📈 {hi ? '6 महीने का ट्रेंड' : '6-Month Collection Trend'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {monthlyTrend.map((m, i) => {
              const h = Math.max(8, Math.round((m.amt / maxTrend) * 85))
              const isCurrent = i === 5
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {m.amt > 0 && <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>{m.amt >= 100000 ? `₹${(m.amt/100000).toFixed(1)}L` : m.amt >= 1000 ? `₹${(m.amt/1000).toFixed(0)}K` : `₹${m.amt}`}</div>}
                  <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: isCurrent ? '#059669' : 'var(--green-light)', border: isCurrent ? 'none' : '1px solid #BBF7D0', transition: 'height 0.3s' }} />
                  <div style={{ fontSize: 10, color: isCurrent ? 'var(--green)' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400 }}>{m.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Risk Score Breakdown */}
        <div className="card" style={{ padding: 16, marginBottom: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
            🎯 Customer Risk Breakdown
          </h3>
          {(() => {
            const withRisk = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive').map(p => {
              const txns = transactions.filter(t => t.partyId === p.id)
              const payments = txns.filter(t => t.type === 'receipt')
              const lastPmt = payments.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
              const daysSince = lastPmt ? Math.floor((new Date()-new Date(lastPmt.date))/(1000*60*60*24)) : 999
              const risk = p.balance > 100000 || daysSince > 30 ? 'High' : p.balance > 30000 || daysSince > 14 ? 'Medium' : 'Low'
              return { ...p, risk }
            })
            const high   = withRisk.filter(p => p.risk === 'High')
            const medium = withRisk.filter(p => p.risk === 'Medium')
            const low    = withRisk.filter(p => p.risk === 'Low')
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'High Risk', count: high.length,   amt: high.reduce((s,p)=>s+p.balance,0),   color: 'var(--red)',   bg: 'var(--red-light)' },
                  { label: 'Medium',    count: medium.length, amt: medium.reduce((s,p)=>s+p.balance,0), color: 'var(--amber)', bg: 'var(--amber-light)' },
                  { label: 'Low Risk',  count: low.length,    amt: low.reduce((s,p)=>s+p.balance,0),    color: 'var(--green)', bg: 'var(--green-light)' },
                ].map((r, i) => (
                  <div key={i} style={{ background: r.bg, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: r.color }}>{r.count}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: r.color, opacity: 0.8 }}>{fmtFull(r.amt)}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Top Debtors */}
        {topDebtors.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--indigo)' }}>
                🎯 {hi ? 'रिकवरी अवसर' : 'Recovery Opportunities'}
              </h3>
            </div>
            {topDebtors.map((p, i) => {
              const pct = totalReceivable > 0 ? Math.round((p.balance / totalReceivable) * 100) : 0
              return (
                <div key={p.id} style={{ padding: '12px 16px', borderBottom: i < topDebtors.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--green)' }}>{i + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.city}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>{fmtFull(p.balance)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}% of total</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 99, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* UPI Collect Section */}
        <UPICollectSection business={business} parties={parties} invoices={safeInvoices} hi={hi} />
      </div>
    </div>
  )
}

// ── UPI Collect Request ───────────────────────────────────────────────────────
function UPICollectSection({ business, parties, invoices, hi }) {
  const [selectedInv, setSelectedInv] = useState(null)
  const [upiId, setUpiId] = useState(business?.upiId || '')
  const [copied, setCopied] = useState(false)
  const [showUPISetup, setShowUPISetup] = useState(false)

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid')

  const generateUPILink = (invoice, upi) => {
    if (!upi) return null
    const party = parties.find(p => p.id === invoice?.partyId)
    const amount = invoice?.totalAmount || 0
    const note = `HisaabPro-${invoice?.invoiceNo || 'Payment'}`
    return `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(business?.name || 'Merchant')}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  }

  const generateWhatsAppWithUPI = () => {
    if (!selectedInv || !upiId) return
    const party = parties.find(p => p.id === selectedInv.partyId)
    const upiLink = generateUPILink(selectedInv, upiId)
    const msg = `Dear ${party?.name},\n\n*Invoice: ${selectedInv.invoiceNo}*\nAmount Due: *₹${selectedInv.totalAmount.toLocaleString('en-IN')}*\n\n*Pay Now via UPI:*\n${upiId}\n\nOr click this link:\n${upiLink}\n\nAmount will be auto-confirmed once paid.\n\nThank you 🙏\n${business?.name}`
    if (party?.phone) window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const copyUPILink = () => {
    if (!selectedInv || !upiId) return
    const link = generateUPILink(selectedInv, upiId)
    navigator.clipboard?.writeText(link || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card" style={{ overflow: 'hidden', border: '2px solid var(--green-light)' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-light), #D1FAE5)', padding: '14px 16px', borderBottom: '1px solid var(--green-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💳</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--green)' }}>
              {hi ? 'UPI कलेक्ट रिक्वेस्ट' : 'UPI Collect Request'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {hi ? 'Invoice के साथ Pay Now link भेजें' : 'Send Pay Now link with every invoice'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* UPI ID Setup */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your UPI ID
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" style={{ flex: 1 }} placeholder="yourname@upi or 9876543210@paytm"
              value={upiId} onChange={e => { setUpiId(e.target.value); localStorage.setItem('hisaabpro_upi', e.target.value) }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            e.g. business@okicici, 9876543210@paytm, name@gpay
          </p>
        </div>

        {/* Select Invoice */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Invoice
          </label>
          <select className="input-field" value={selectedInv?.id || ''} onChange={e => setSelectedInv(unpaidInvoices.find(i => i.id === e.target.value) || null)}>
            <option value="">-- Choose unpaid invoice --</option>
            {unpaidInvoices.map(inv => {
              const party = parties.find(p => p.id === inv.partyId)
              return <option key={inv.id} value={inv.id}>{inv.invoiceNo} — {party?.name} — ₹{inv.totalAmount.toLocaleString('en-IN')}</option>
            })}
          </select>
        </div>

        {/* Action Buttons */}
        {selectedInv && upiId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Preview */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>UPI Link Preview</div>
              <div style={{ fontSize: 12, color: 'var(--indigo)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                upi://pay?pa={upiId}&am={selectedInv.totalAmount}&...
              </div>
            </div>

            <button onClick={generateWhatsAppWithUPI} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📱 Send WhatsApp + Pay Now Link
            </button>

            <button onClick={copyUPILink} style={{ width: '100%', padding: '12px', borderRadius: 14, border: '1.5px solid var(--green)', cursor: 'pointer', background: 'white', color: 'var(--green)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy UPI Link</>}
            </button>
          </div>
        )}

        {!upiId && (
          <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
            ⚠️ Enter your UPI ID above to generate payment links
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          ℹ️ Customer receives WhatsApp message with a "Pay Now" link that opens their UPI app directly (GPay, PhonePe, Paytm etc.) with the amount pre-filled.
        </div>
      </div>
    </div>
  )
}
