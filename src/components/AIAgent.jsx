import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Send, Bot, X, Minimize2, MessageCircle, Sparkles } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

// ── AI Response Generator (using Anthropic API) ───────────────────────────────
async function getAIResponse(userMessage, businessContext) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are HisaabPro AI — a smart business assistant for Indian wholesale traders and MSME owners. You help with business queries, analysis, and advice.

BUSINESS DATA:
${JSON.stringify(businessContext, null, 2)}

RULES:
- Answer in the same language as the user (Hindi or English)
- Keep answers SHORT and practical — max 3-4 lines
- Use ₹ for amounts, Indian number format
- Give specific insights from their actual data
- Be friendly and encouraging
- For greetings, introduce yourself briefly
- Never make up data — only use what's provided`,
        messages: [{ role: 'user', content: userMessage }]
      })
    })
    const data = await response.json()
    return data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again."
  } catch (error) {
    return generateLocalResponse(userMessage, businessContext)
  }
}

// Fallback local response if API fails
function generateLocalResponse(msg, ctx) {
  const lower = msg.toLowerCase()
  const { stats, parties, transactions, products } = ctx

  if (lower.includes('total') && (lower.includes('receivable') || lower.includes('milna') || lower.includes('paana'))) {
    return `Your total receivable is **${fmtFull(stats.totalReceivable)}** from ${stats.totalCustomers} customers. Top outstanding: ${parties.filter(p=>p.balance>0&&p.balanceType==='to_receive').sort((a,b)=>b.balance-a.balance).slice(0,2).map(p=>`${p.name} (${fmtFull(p.balance)})`).join(', ')}`
  }
  if (lower.includes('profit') || lower.includes('munafa')) {
    const sales = transactions.filter(t=>t.type==='sale').reduce((s,t)=>s+t.amount,0)
    const purchases = transactions.filter(t=>t.type==='purchase').reduce((s,t)=>s+t.amount,0)
    return `Gross Profit: **${fmtFull(sales-purchases)}**\nSales: ${fmtFull(sales)} | Purchases: ${fmtFull(purchases)}\nMargin: ${sales>0?Math.round(((sales-purchases)/sales)*100):0}%`
  }
  if (lower.includes('stock') || lower.includes('inventory')) {
    const low = products.filter(p=>p.stock<=p.lowStockAlert)
    return low.length > 0
      ? `⚠️ ${low.length} items need restocking: ${low.map(p=>`${p.name} (${p.stock} left)`).join(', ')}`
      : `✅ All ${products.length} products are well-stocked! Total stock value: ${fmtFull(products.reduce((s,p)=>s+p.stock*p.purchasePrice,0))}`
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('hii')) {
    return `Namaste! 🙏 Main HisaabPro AI hun — aapka business assistant!\n\nAap mujhse puch sakte hain:\n• Outstanding balance\n• Profit analysis\n• Stock status\n• Top customers\n• Business summary`
  }
  if (lower.includes('summary') || lower.includes('report')) {
    return `📊 Business Summary:\n• To Receive: **${fmtFull(stats.totalReceivable)}**\n• To Pay: **${fmtFull(stats.totalPayable)}**\n• Low Stock: ${stats.lowStockCount} items\n• Total Customers: ${stats.totalCustomers}`
  }
  return `I can help you with:\n• "What is my total receivable?"\n• "Show profit summary"\n• "Which items are low on stock?"\n• "Who are my top customers?"\n\nAsk me anything about your business! 🚀`
}

// ── Floating AI Button + Chat ─────────────────────────────────────────────────
export default function AIAgent() {
  const { stats, parties, transactions, products, invoices, business, language } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Namaste! 🙏 Main HisaabPro AI hun!\n\nAapke business ke baare mein kuch bhi puchein — outstanding, profit, stock ya koi bhi sawaal!`, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const businessContext = {
    businessName: business?.name,
    stats,
    parties: parties.slice(0, 10).map(p => ({ name: p.name, balance: p.balance, type: p.type, balanceType: p.balanceType })),
    recentTransactions: transactions.slice(0, 10),
    products: products.map(p => ({ name: p.name, stock: p.stock, lowStockAlert: p.lowStockAlert, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice })),
    invoicesSummary: { total: (invoices||[]).length, unpaid: (invoices||[]).filter(i=>i.status==='unpaid').length, totalValue: (invoices||[]).reduce((s,i)=>s+i.totalAmount,0) }
  }

  const QUICK_QUESTIONS = [
    { label: '📊 Business Summary', q: 'Give me a quick business summary' },
    { label: '💰 Outstanding', q: 'What is my total outstanding receivable?' },
    { label: '📦 Low Stock', q: 'Which items are low on stock?' },
    { label: '📈 Profit', q: 'What is my profit this month?' },
  ]

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }])
    setLoading(true)
    const response = await getAIResponse(userMsg, businessContext)
    setMessages(prev => [...prev, { role: 'assistant', text: response, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(false)
  }

  // Format text with **bold**
  const formatText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={{
          position: 'fixed', bottom: 100, left: 16, width: 52, height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', cursor: 'pointer',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(124,58,237,0.5)', zIndex: 90,
          animation: 'pulse 2s infinite',
        }}>
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 72, right: 0, left: 0, maxWidth: 480, margin: '0 auto',
          height: '75vh', background: 'white', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', zIndex: 150,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 16 }}>HisaabPro AI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} /> Online · Smart Business Assistant
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={14} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, var(--saffron), #FF8C42)' : 'var(--bg)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line',
                }}>
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

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div style={{ padding: '10px 14px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.q)} style={{
                  padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  border: '1.5px solid #7C3AED', background: 'white', color: '#7C3AED',
                }}>{q.label}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px 14px', display: 'flex', gap: 8, borderTop: '1px solid var(--border-light)', marginTop: 8 }}>
            <input
              className="input-field"
              placeholder="Ask anything about your business..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              style={{ flex: 1, fontSize: 14 }}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
              width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: input.trim() ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'var(--bg)',
              color: input.trim() ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              <Send size={18} />
            </button>
          </div>

          <style>{`
            @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          `}</style>
        </div>
      )}
    </>
  )
}
