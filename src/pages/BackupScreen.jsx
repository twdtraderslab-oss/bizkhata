import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Download, Upload, Shield, CheckCircle, Clock, AlertTriangle, Cloud } from 'lucide-react'

export default function BackupScreen() {
  const { business, parties, transactions, products, invoices, stockMovements, language, currentUser } = useApp()
  const hi = language === 'hi'
  const [status, setStatus] = useState(null) // 'backing-up' | 'success' | 'restoring' | 'error'
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem('hisaabpro_last_backup') || null)

  const totalRecords = parties.length + transactions.length + products.length + (invoices?.length || 0)

  const handleBackup = () => {
    setStatus('backing-up')
    try {
      const backupData = {
        version: '5.0',
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.name || 'Owner',
        business,
        parties,
        transactions,
        products,
        invoices: invoices || [],
        stockMovements: stockMovements || [],
      }
      const json = JSON.stringify(backupData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HisaabPro-Backup-${business?.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      const now = new Date().toLocaleString('en-IN')
      setLastBackup(now)
      localStorage.setItem('hisaabpro_last_backup', now)
      setTimeout(() => setStatus('success'), 500)
    } catch (e) {
      setStatus('error')
    }
  }

  const handleRestore = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!window.confirm('This will replace ALL your current data. Are you sure?')) return

    setStatus('restoring')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.business || !data.parties) throw new Error('Invalid backup file')

        // Save to localStorage
        localStorage.setItem('hisaabpro_data_v2', JSON.stringify({
          business: data.business,
          parties: data.parties,
          transactions: data.transactions || [],
          products: data.products || [],
          invoices: data.invoices || [],
          stockMovements: data.stockMovements || [],
        }))

        setTimeout(() => {
          setStatus('success')
          setTimeout(() => window.location.reload(), 1500)
        }, 800)
      } catch (err) {
        setStatus('error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0369A1, #0284C7)', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {hi ? 'बैकअप और रिस्टोर' : 'Backup & Restore'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 16 }}>
          {hi ? 'अपना डेटा सुरक्षित रखें' : 'Keep your business data safe'}
        </p>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: hi ? 'पार्टियां' : 'Parties', value: parties.length },
            { label: hi ? 'लेन-देन' : 'Transactions', value: transactions.length },
            { label: hi ? 'प्रोडक्ट' : 'Products', value: products.length },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Status Message */}
        {status && (
          <div style={{
            padding: '14px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
            background: status === 'success' ? 'var(--green-light)' : status === 'error' ? 'var(--red-light)' : 'var(--amber-light)',
            border: `1px solid ${status === 'success' ? '#86EFAC' : status === 'error' ? '#FCA5A5' : '#FCD34D'}`,
          }}>
            {status === 'success' ? <CheckCircle size={20} color="var(--green)" /> : status === 'error' ? <AlertTriangle size={20} color="var(--red)" /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--amber)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />}
            <div style={{ fontSize: 14, fontWeight: 600, color: status === 'success' ? 'var(--green)' : status === 'error' ? 'var(--red)' : 'var(--amber)' }}>
              {status === 'success' ? (hi ? 'सफलतापूर्वक हो गया! ✅' : 'Done successfully! ✅')
                : status === 'error' ? (hi ? 'कुछ गलत हुआ। फिर कोशिश करें।' : 'Something went wrong. Try again.')
                : status === 'backing-up' ? (hi ? 'बैकअप हो रहा है...' : 'Creating backup...')
                : (hi ? 'रिस्टोर हो रहा है...' : 'Restoring data...')}
            </div>
          </div>
        )}

        {/* Last Backup Info */}
        {lastBackup && (
          <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #BBF7D0' }}>
            <Clock size={16} color="var(--green)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{hi ? 'आखिरी बैकअप' : 'Last Backup'}</div>
              <div style={{ fontSize: 12, color: 'var(--green)', opacity: 0.8 }}>{lastBackup}</div>
            </div>
          </div>
        )}

        {/* Download Backup */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={22} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                {hi ? 'बैकअप डाउनलोड करें' : 'Download Backup'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {hi ? `${totalRecords} रिकॉर्ड · JSON फाइल` : `${totalRecords} records · JSON file`}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
            {hi
              ? 'सभी पार्टियां, लेन-देन, इनवॉइस और स्टॉक डेटा एक फाइल में download होगा। इसे अपने phone या PC में save करें।'
              : 'All parties, transactions, invoices and stock data will be saved in one file. Save it on your phone or PC.'}
          </p>
          <button onClick={handleBackup} disabled={status === 'backing-up'}
            style={{ width: '100%', padding: '13px', borderRadius: 13, border: 'none', cursor: 'pointer', background: 'var(--green)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Download size={18} /> {hi ? 'बैकअप डाउनलोड करें' : 'Download Backup File'}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={22} color="var(--amber)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                {hi ? 'बैकअप से रिस्टोर करें' : 'Restore from Backup'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {hi ? 'पुराना डेटा वापस लाएं' : 'Bring back your old data'}
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
            ⚠️ {hi ? 'रिस्टोर करने से मौजूदा सभी डेटा replace हो जाएगा!' : 'Restoring will replace ALL existing data!'}
          </div>
          <label style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 13, background: 'var(--amber-light)', color: 'var(--amber)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--amber)' }}>
            <Upload size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            {hi ? 'बैकअप फाइल चुनें' : 'Select Backup File'}
            <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Cloud Backup — Premium */}
        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', border: '1px solid #BAE6FD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cloud size={22} color="#2563EB" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#1E40AF' }}>
                  {hi ? 'Auto Cloud Backup' : 'Auto Cloud Backup'}
                </span>
                <span className="premium-badge">👑 Premium</span>
              </div>
              <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>
                {hi ? 'हर रात automatic Google Drive backup' : 'Automatic backup to Google Drive every night'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#1D4ED8', marginBottom: 14, lineHeight: 1.6 }}>
            {hi ? 'Phone खो जाए या टूट जाए — data हमेशा cloud में safe। Multi-device sync भी।'
              : 'Even if phone is lost or broken — data is always safe in cloud. Multi-device sync included.'}
          </p>
          <button className="btn-premium" style={{ width: '100%' }}>
            👑 Upgrade to Premium — ₹299/month
          </button>
        </div>

        {/* Tips */}
        <div style={{ background: 'var(--indigo-light)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, color: 'var(--indigo)', fontSize: 14, marginBottom: 8 }}>
            💡 {hi ? 'बैकअप टिप्स' : 'Backup Tips'}
          </div>
          {[
            hi ? 'हर हफ्ते कम से कम एक बार backup लें' : 'Take backup at least once a week',
            hi ? 'Backup file को WhatsApp या email पर भेजें — extra safe' : 'Send backup file on WhatsApp or email for extra safety',
            hi ? 'नया phone लेने से पहले backup जरूर लें' : 'Always backup before getting a new phone',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--indigo)', marginBottom: 4, display: 'flex', gap: 6 }}>
              <span>•</span><span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
