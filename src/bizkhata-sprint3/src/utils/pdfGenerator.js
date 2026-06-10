// Pure JS PDF/Print generator - no external library needed

export function generateInvoicePDF(invoice, party, business) {
  const items = invoice.items || []
  const itemRows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.qty} ${item.unit || ''}</td>
      <td style="text-align:right">₹${Number(item.rate).toLocaleString('en-IN')}</td>
      <td style="text-align:right">₹${Number(item.amount).toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  const statusColor = invoice.status === 'paid' ? '#16a34a' : invoice.status === 'partial' ? '#d97706' : '#dc2626'
  const statusLabel = invoice.status === 'paid' ? 'PAID' : invoice.status === 'partial' ? 'PARTIAL' : 'UNPAID'

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Invoice ${invoice.invoiceNo}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box }
  body { font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:white }
  .page { max-width:794px;margin:0 auto;padding:40px }
  .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px }
  .brand-name { font-size:26px;font-weight:900;color:#3730a3;letter-spacing:-0.5px }
  .brand-addr { font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5 }
  .invoice-title { font-size:32px;font-weight:900;color:#3730a3;text-align:right }
  .invoice-no { font-size:13px;color:#6b7280;text-align:right;margin-top:2px }
  .status-badge { display:inline-block;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:700;border:2px solid ${statusColor};color:${statusColor};margin-top:6px }
  .divider { height:3px;background:linear-gradient(90deg,#3730a3,#6366f1,transparent);border-radius:2px;margin-bottom:28px }
  .party-section { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px }
  .party-card { background:#f8f9ff;border-radius:12px;padding:16px;border:1px solid #e0e0f5 }
  .party-label { font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px }
  .party-name { font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px }
  .party-detail { font-size:12px;color:#6b7280;line-height:1.6 }
  table { width:100%;border-collapse:collapse;margin-bottom:20px }
  thead { background:#3730a3 }
  thead th { color:white;padding:11px 13px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px }
  tbody tr { border-bottom:1px solid #f0f0fa }
  tbody tr:nth-child(even) { background:#fafafa }
  tbody td { padding:11px 13px;font-size:13px;color:#374151 }
  .totals { display:flex;justify-content:flex-end;margin-bottom:28px }
  .totals-box { min-width:240px }
  .totals-row { display:flex;justify-content:space-between;padding:7px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f0f0fa }
  .totals-grand { background:#3730a3;padding:13px 16px;border-radius:10px;color:white;font-size:15px;font-weight:800;display:flex;justify-content:space-between;margin-top:6px }
  .footer { text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #f0f0fa }
  .footer-text { font-size:13px;color:#6b7280 }
  .footer-brand { font-size:11px;color:#c7c7e0;margin-top:4px }
  @media print { @page { margin:1cm } }
</style></head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">${business?.name || 'BizKhata'}</div>
      <div class="brand-addr">${business?.address || ''}<br>${business?.gstin ? 'GSTIN: ' + business.gstin : ''}</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-no">${invoice.invoiceNo}</div>
      <div style="text-align:right"><span class="status-badge">${statusLabel}</span></div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="party-section">
    <div class="party-card">
      <div class="party-label">Bill To</div>
      <div class="party-name">${party?.name || ''}</div>
      <div class="party-detail">${party?.city || ''}${party?.phone ? '<br>Ph: +91 ' + party.phone : ''}${party?.gstin ? '<br>GSTIN: ' + party.gstin : ''}</div>
    </div>
    <div class="party-card">
      <div class="party-label">Invoice Details</div>
      <div class="party-detail">
        <strong>Invoice No:</strong> ${invoice.invoiceNo}<br>
        <strong>Date:</strong> ${invoice.date}<br>
        <strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}
      </div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>Item Description</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Rate</th>
      <th style="text-align:right">Amount</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}</span></div>
      ${invoice.discount ? `<div class="totals-row"><span>Discount</span><span>-₹${Number(invoice.discount).toLocaleString('en-IN')}</span></div>` : ''}
      ${invoice.taxAmount ? `<div class="totals-row"><span>GST/Tax</span><span>₹${Number(invoice.taxAmount).toLocaleString('en-IN')}</span></div>` : ''}
      <div class="totals-grand"><span>Total Amount</span><span>₹${Number(invoice.totalAmount).toLocaleString('en-IN')}</span></div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-text">Thank you for your business! 🙏</div>
    <div class="footer-brand">Generated by BizKhata · Smart Business Ledger</div>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export function generateLedgerPDF(party, transactions, business) {
  const txns = transactions
    .filter(t => t.partyId === party.id)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const rows = txns.map(t => {
    const isDebit = t.type === 'sale' || t.type === 'purchase'
    return `<tr>
      <td>${t.date}</td>
      <td>${t.billNo || '-'}</td>
      <td>${t.note || '-'}</td>
      <td style="text-align:right;color:${isDebit ? '#dc2626' : '#16a34a'}">${isDebit ? '₹' + Number(t.amount).toLocaleString('en-IN') : '-'}</td>
      <td style="text-align:right;color:${!isDebit ? '#dc2626' : '#16a34a'}">${!isDebit ? '₹' + Number(t.amount).toLocaleString('en-IN') : '-'}</td>
      <td style="text-align:right;font-weight:600">₹${Number(t.balanceAfter || 0).toLocaleString('en-IN')}</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ledger - ${party.name}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box }
  body { font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:36px }
  h1 { font-size:26px;font-weight:900;color:#3730a3 }
  .sub { color:#6b7280;font-size:13px;margin-top:2px;margin-bottom:20px }
  .divider { height:3px;background:linear-gradient(90deg,#3730a3,#6366f1,transparent);border-radius:2px;margin-bottom:20px }
  .info-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px }
  .info-box { background:#f8f9ff;border-radius:10px;padding:14px;border:1px solid #e0e0f5 }
  .info-label { font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px }
  table { width:100%;border-collapse:collapse }
  thead { background:#3730a3 }
  thead th { color:white;padding:10px 12px;font-size:11px;font-weight:700;text-align:left }
  tbody tr { border-bottom:1px solid #f0f0fa }
  tbody tr:nth-child(even) { background:#fafafa }
  tbody td { padding:9px 12px;font-size:12px }
  .footer { margin-top:28px;text-align:center;color:#9ca3af;font-size:11px }
  @media print { @page { margin:1cm } }
</style></head>
<body>
<h1>${party.name}</h1>
<div class="sub">Account Statement · ${business?.name || 'BizKhata'} · ${new Date().toLocaleDateString('en-IN')}</div>
<div class="divider"></div>
<div class="info-grid">
  <div class="info-box">
    <div class="info-label">Outstanding Balance</div>
    <div style="font-size:18px;font-weight:800;color:${party.balanceType === 'to_receive' ? '#dc2626' : '#16a34a'}">
      ₹${Number(party.balance).toLocaleString('en-IN')}
    </div>
    <div style="font-size:12px;color:#6b7280;margin-top:2px">${party.balanceType === 'to_receive' ? 'To Receive' : 'To Pay'}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Party Details</div>
    <div style="font-size:14px;font-weight:700">+91 ${party.phone}</div>
    <div style="font-size:12px;color:#6b7280">${party.city || ''}</div>
  </div>
</div>
<table>
  <thead><tr><th>Date</th><th>Bill No.</th><th>Description</th><th style="text-align:right">Debit</th><th style="text-align:right">Credit</th><th style="text-align:right">Balance</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#9ca3af">No transactions yet</td></tr>'}</tbody>
</table>
<div class="footer">Generated by BizKhata · Smart Business Ledger</div>
<script>window.onload = () => window.print()</script>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export function exportToCSV(data, filename) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? ''
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename + '.csv'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function exportOutstandingCSV(parties, filename) {
  const data = parties
    .filter(p => p.balance > 0)
    .map(p => ({
      'Party Name': p.name,
      'Type': p.type,
      'City': p.city || '',
      'Phone': p.phone,
      'Balance': p.balance,
      'Status': p.balanceType === 'to_receive' ? 'To Receive' : 'To Pay',
      'Last Transaction': p.lastTxn || '',
    }))
  exportToCSV(data, filename)
}
