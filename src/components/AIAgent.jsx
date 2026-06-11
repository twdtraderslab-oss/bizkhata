import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Send, X, Sparkles } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

async function getAIResponse(userMessage, businessContext) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are HisaabPro AI — an expert business recovery assistant for Indian MSME owners and wholesale traders.

LIVE BUSINESS DATA:
${JSON.stringify(businessContext, null, 2)}

YOUR CAPABILITIES:
- Analyze outstanding payments and recovery opportunities
- Identify high-risk customers and payment delays
- Provide stock and inventory insights
- Calculate profit, cash flow, recovery rates
- Suggest which customers to follow up today
- Give actionable business advice

RULES:
- Answer in same language as user (Hindi or English or Hinglish)
- Be SPECIFIC — use actual names, amounts, numbers from the data
- Keep answers SHORT — max 4-5 lines
- Use ₹ for amounts in Indian format
- Be direct and actionable — tell them WHAT TO DO
- If no data available for a query, say so honestly
- For greetings: briefly introduce yourself and list what you can help with`,
        messages: [{ role: 'user', content: userMessage }]
      })
    })
    const data = await response.json()
    return data.content?.[0]?.text || generateLocalResponse(userMessage, businessContext)
  } catch (error) {
    return generateLocalResponse(userMessage, businessContext)
  }
}

function generateLocalResponse(msg, ctx) {
  const lower = msg.toLowerCase()
  const { parties, transactions, products, invoices, stats, business } = ctx

  if (lower.includes('follow up') || lower.includes('contact') || lower.includes('call')) {
    const urgent = parties.filter(p => p.balanceType === 'to_receive' && p.balance > 0)
      .map(p => {
        const pmts = transactions.filter(t => t.partyId === p.id && t.type === 'receipt')
        const last = pmts.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
        const days = last ? Math.floor((new Date()-new Date(last.date))/(1000*60*60*24)) : 999
        return { ...p, days }
      }).sort((a,b) => b.days - a.days).slice(0, 3)
    if (urgent.length === 0) return "✅ Great news! No outstanding follow-ups needed today."
    return `🎯 Follow up today:\n${urgent.map(p => `• ${p.name} — ${fmtFull(p.balance)} (${p.days === 999 ? 'never paid' : p.days + ' days ago'})`).join('\n')}`
  }

  if (lower.includes('low stock') || lower.includes('stock khatam') || lower.includes('reorder')) {
    const low = products.filter(p => p.stock <= p.lowStockAlert)
    if (low.length === 0) return "✅ All products are well-stocked. No reorder needed."
    return `⚠️ Low stock alert:\n${low.map(p => `• ${p.name}: ${p.stock} ${p.unit}s left (min: ${p.lowStockAlert})`).join('\n')}\n\nOrder soon to avoid stockout.`
  }

  if (lower.includes('unpaid') || lower.includes('invoice') || lower.includes('pending')) {
    const unpaid = (invoices||[]).filter(i => i.status !== 'paid')
    const amt = unpaid.reduce((s,i) => s+i.totalAmount, 0)
    if (unpaid.length === 0) return "✅ All invoices are paid! Excellent collection record."
    return `📋 ${unpaid.length} unpaid invoices totaling ${fmtFull(amt)}\n${unpaid.slice(0,3).map(i => { const p = parties.find(pt=>pt.id===i.partyId); return `• ${i.invoiceNo} — ${p?.name} — ${fmtFull(i.totalAmount)} (due: ${i.dueDate})` }).join('\n')}`
  }

  if (lower.includes('recovery rate') || lower.includes('collection rate') || lower.includes('rate')) {
    const thisMonth = new Date().getMonth()
    const receipts = transactions.filter(t => { const d = new Date(t.date); return t.type === 'receipt' && d.getMonth() === thisMonth }).reduce((s,t)=>s+t.amount, 0)
    const rate = stats.totalReceivable > 0 ? Math.round((receipts/(stats.totalReceivable+receipts))*100) : 0
    return `📊 Recovery Rate This Month: ${rate}%\n• Collected: ${fmtFull(receipts)}\n• Still Pending: ${fmtFull(stats.totalReceivable)}\n\n${rate < 50 ? '⚠️ Below 50% — send bulk reminders today!' : rate < 70 ? '🟡 Moderate — follow up with top 3 defaulters' : '✅ Excellent recovery rate!'}`
  }

  if (lower.includes('profit') || lower.includes('munafa') || lower.includes('loss') || lower.includes('p&l')) {
    const sales = transactions.filter(t => t.type === 'sale').reduce((s,t)=>s+t.amount, 0)
    const purchases = transactions.filter(t => t.type === 'purchase').reduce((s,t)=>s+t.amount, 0)
    const profit = sales - purchases
    const margin = sales > 0 ? Math.round((profit/sales)*100) : 0
    return `📈 P&L Summary:\n• Total Sales: ${fmtFull(sales)}\n• Total Purchases: ${fmtFull(purchases)}\n• Gross Profit: ${fmtFull(profit)}\n• Margin: ${margin}%\n\n${margin < 15 ? '⚠️ Low margin — review pricing' : margin > 30 ? '✅ Excellent margins!' : '🟡 Moderate margins'}`
  }

  if (lower.includes('total') && (lower.includes('receiv') || lower.includes('outstanding') || lower.includes('paana') || lower.includes('milna'))) {
    const top = parties.filter(p=>p.balance>0&&p.balanceType==='to_receive').sort((a,b)=>b.balance-a.balance).slice(0,3)
    return `💰 Total Outstanding: ${fmtFull(stats.totalReceivable)}\n\nTop 3:\n${top.map(p=>`• ${p.name}: ${fmtFull(p.balance)}`).join('\n')}`
  }

  if (lower.includes('summary') || lower.includes('overview') || lower.includes('report') || lower.includes('batao')) {
    const sales = transactions.filter(t=>t.type==='sale').reduce((s,t)=>s+t.amount,0)
    return `📊 ${business?.name} Summary:\n• To Receive: ${fmtFull(stats.totalReceivable)}\n• To Pay: ${fmtFull(stats.totalPayable)}\n• Total Sales: ${fmtFull(sales)}\n• Low Stock: ${stats.lowStockCount} items\n• Customers: ${stats.totalCustomers}`
  }

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('help')) {
    return `Namaste! 🙏 Main HisaabPro AI hun — aapka Recovery Assistant!\n\nMain help kar sakta hun:\n📊 Business summary\n💰 Outstanding analysis\n🎯 Follow-up recommendations\n📦 Low stock alerts\n📈 Profit & recovery rates\n\nKuch bhi puchein!`
  }

  return `Samajh gaya! Aap puch sakte hain:\n• "Aaj kise follow up karein?"\n• "Kitna outstanding hai?"\n• "Kaun se products low stock hain?"\n• "Is mahine recovery rate kya hai?"\n• "Profit summary do"\n\nMain aapke real data se jawab dunga! 🚀`
}

export default function AIAgent() {
  const { stats, parties, transactions, products, invoices, business, language } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Namaste! 🙏 Main HisaabPro AI hun!\n\nAapke ${business?.name || 'business'} ke baare mein kuch bhi puchein — recovery, outstanding, profit, stock!\n\nNeeche diye buttons se shuru karein ya khud kuch puchein.`, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Listen for event from Dashboard quick questions
  useEffect(() => {
    const handler = (e) => {
      setIsOpen(true)
      setTimeout(() => sendMessage(e.detail.question), 300)
    }
    window.addEventListener('hisaabpro-ai-open', handler)
    return () => window.removeEventListener('hisaabpro-ai-open', handler)
  }, [messages])

  const businessContext = {
    businessName: business?.name,
    ownerName: business?.ownerName,
    gstin: business?.gstin,
    stats,
    parties: parties.map(p => ({ id: p.id, name: p.name, balance: p.balance, type: p.type, balanceType: p.balanceType, city: p.city, phone: p.phone, lastTxn: p.lastTxn })),
    recentTransactions: transactions.slice(0, 20).map(t => ({ type: t.type, amount: t.amount, date: t.date, partyId: t.partyId, note: t.note })),
    products: products.map(p => ({ name: p.name, stock: p.stock, lowStockAlert: p.lowStockAlert, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice || 0, unit: p.unit })),
    invoices: (invoices||[]).map(i => ({ invoiceNo: i.invoiceNo, status: i.status, totalAmount: i.totalAmount, dueDate: i.dueDate, partyId: i.partyId })),
    summary: {
      totalReceivable: stats.totalReceivable,
      totalPayable: stats.totalPayable,
      totalCustomers: stats.totalCustomers,
      lowStockItems: stats.lowStockCount,
      unpaidInvoices: (invoices||[]).filter(i => i.status !== 'paid').length,
      overdueInvoices: (invoices||[]).filter(i => i.status !== 'paid' && new Date(i.dueDate) < new Date()).length,
    }
  }

  const QUICK = [
    { label: '🎯 Who to follow up?', q: 'Which customers should I follow up today?' },
    { label: '📦 Low stock?', q: 'Which products are low on stock?' },
    { label: '💰 Outstanding?', q: 'What is my total outstanding and top debtors?' },
    { label: '📈 Recovery rate?', q: 'What is my recovery rate this month?' },
    { label: '📊 P&L summary', q: 'Give me a profit and loss summary' },
    { label: '⚠️ Overdue invoices', q: 'Show my overdue invoices' },
  ]

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: msg, time }])
    setLoading(true)
    const reply = await getAIResponse(msg, businessContext)
    setMessages(prev => [...prev, { role: 'assistant', text: reply, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(false)
  }

  const formatText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p.split('\n').map((line, j) => <React.Fragment key={j}>{line}{j < p.split('\n').length - 1 && <br/>}</React.Fragment>))
  }

  return (
    <>
      {!isOpen && (
        <button data-ai-open="true" onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: 100, left: 12, borderRadius: 20, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', boxShadow: '0 4px 20px rgba(124,58,237,0.45)', zIndex: 90, fontSize: 12, fontWeight: 700 }}>
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', bottom: 72, right: 0, left: 0, maxWidth: 480, margin: '0 auto', height: '78vh', background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', zIndex: 150, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 16 }}>HisaabPro AI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} /> Recovery Assistant · Live Data
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={14} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, var(--saffron), #FF8C42)' : 'var(--bg)', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>
                  {formatText(msg.text)}
                  <div style={{ fontSize: 10, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="white" />
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', animation: `bounce 1s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - show only initially */}
          {messages.length <= 2 && (
            <div style={{ padding: '8px 12px 0', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
              {QUICK.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.q)} style={{ padding: '6px 11px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: '1.5px solid #7C3AED', background: 'white', color: '#7C3AED' }}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px 14px', display: 'flex', gap: 8, borderTop: '1px solid var(--border-light)', marginTop: 8, flexShrink: 0 }}>
            <input className="input-field" placeholder="Ask anything about your business..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()} style={{ flex: 1, fontSize: 13 }} disabled={loading} />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: input.trim() ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'var(--bg)', color: input.trim() ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
        </div>
      )}
    </>
  )
}
