// PDF Invoice Generator — uses browser's print feature (no external library needed)

export function generateInvoiceHTML(invoice, party, business) {
  const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`
  const statusColor = { unpaid: '#DC2626', partial: '#D97706', paid: '#16A34A' }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice ${invoice.invoiceNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #1A1F5E; }
  .business-name { font-size: 28px; font-weight: 800; color: #1A1F5E; margin-bottom: 6px; }
  .business-info { font-size: 13px; color: #6b7280; line-height: 1.6; }
  .invoice-title { text-align: right; }
  .invoice-label { font-size: 32px; font-weight: 800; color: #FF6B1A; letter-spacing: -1px; }
  .invoice-no { font-size: 16px; font-weight: 700; color: #1A1F5E; margin-top: 4px; }
  .status-badge { display: inline-block; padding: 4px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-top: 8px; background: ${statusColor[invoice.status]}20; color: ${statusColor[invoice.status]}; border: 1px solid ${statusColor[invoice.status]}40; }

  /* Info Grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .info-box { background: #f9fafb; border-radius: 12px; padding: 16px; border: 1px solid #e5e7eb; }
  .info-box-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .info-box-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .info-box-detail { font-size: 13px; color: #6b7280; line-height: 1.6; }

  /* Dates */
  .dates-row { display: flex; gap: 20px; margin-bottom: 28px; }
  .date-item { background: #f9fafb; border-radius: 10px; padding: 12px 18px; border: 1px solid #e5e7eb; }
  .date-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
  .date-value { font-size: 14px; font-weight: 700; color: #111827; }

  /* Items Table */
  .table-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
  thead tr { background: #1A1F5E; color: white; }
  thead th { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  thead th:last-child, thead th:nth-child(2), thead th:nth-child(3) { text-align: right; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  tbody tr:nth-child(even) { background: #fafafa; }
  tbody td { padding: 12px 14px; font-size: 13px; }
  tbody td:nth-child(2), tbody td:nth-child(3), tbody td:last-child { text-align: right; }
  .item-name { font-weight: 600; color: #111827; }
  .item-qty { font-weight: 700; color: #1A1F5E; }
  .item-rate { color: #6b7280; }
  .item-amount { font-weight: 700; color: #111827; }

  /* Totals */
  .totals-section { display: flex; justify-content: flex-end; margin-top: 0; }
  .totals-box { width: 280px; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
  .total-row { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
  .total-row:last-child { border-bottom: none; }
  .total-label { color: #6b7280; }
  .total-value { font-weight: 600; color: #111827; }
  .grand-total-row { display: flex; justify-content: space-between; padding: 14px 16px; background: #1A1F5E; }
  .grand-total-label { font-size: 14px; font-weight: 700; color: white; }
  .grand-total-value { font-size: 18px; font-weight: 800; color: #FF6B1A; }

  /* Amount in words */
  .amount-words { margin-top: 20px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px 16px; font-size: 13px; }
  .amount-words-label { font-weight: 700; color: #9a3412; font-size: 11px; text-transform: uppercase; margin-bottom: 3px; }
  .amount-words-text { color: #7c2d12; font-weight: 600; }

  /* Footer */
  .footer { margin-top: 32px; padding-top: 20px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-note { font-size: 12px; color: #9ca3af; max-width: 300px; line-height: 1.6; }
  .signature-box { text-align: center; }
  .signature-line { width: 160px; border-bottom: 2px solid #1A1F5E; margin-bottom: 6px; height: 40px; }
  .signature-label { font-size: 12px; color: #6b7280; font-weight: 600; }
  .signature-name { font-size: 13px; font-weight: 700; color: #1A1F5E; }

  /* GST Info */
  .gst-row { display: flex; gap: 16px; margin-bottom: 28px; }
  .gst-tag { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 12px; font-size: 12px; color: #1e40af; font-weight: 600; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Print Button -->
  <div class="no-print" style="text-align:right; margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #FF6B1A; color: white; border: none; padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; margin-right: 10px;">🖨️ Print / Save PDF</button>
    <button onclick="window.close()" style="background: #f3f4f6; color: #374151; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; cursor: pointer;">✕ Close</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="business-name">${business?.name || 'Your Business'}</div>
      <div class="business-info">
        ${business?.address || ''}<br/>
        📞 ${business?.phone || ''}<br/>
        ${business?.gstin ? `GSTIN: ${business.gstin}` : ''}
      </div>
    </div>
    <div class="invoice-title">
      <div class="invoice-label">INVOICE</div>
      <div class="invoice-no">${invoice.invoiceNo}</div>
      <div class="status-badge">${invoice.status.toUpperCase()}</div>
    </div>
  </div>

  <!-- GST Tags -->
  ${party?.gstin ? `<div class="gst-row"><span class="gst-tag">📋 GST Invoice</span><span class="gst-tag">Party GSTIN: ${party.gstin}</span></div>` : ''}

  <!-- Bill To & Dates -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-title">Bill To</div>
      <div class="info-box-name">${party?.name || '—'}</div>
      <div class="info-box-detail">
        ${party?.city || ''}<br/>
        📞 ${party?.phone || ''}<br/>
        ${party?.gstin ? `GSTIN: ${party.gstin}` : 'GSTIN: N/A'}
      </div>
    </div>
    <div class="info-box">
      <div class="info-box-title">Invoice Details</div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
        <div><span style="font-size:12px;color:#9ca3af;">Invoice No:</span><br/><strong>${invoice.invoiceNo}</strong></div>
        <div><span style="font-size:12px;color:#9ca3af;">Invoice Date:</span><br/><strong>${invoice.date}</strong></div>
        <div><span style="font-size:12px;color:#9ca3af;">Due Date:</span><br/><strong style="color:${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? '#DC2626' : '#111827'}">${invoice.dueDate}</strong></div>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <div class="table-title">Items / Products</div>
  <table>
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${(invoice.items || []).map((item, i) => `
      <tr>
        <td style="color:#9ca3af;font-size:12px;">${i + 1}</td>
        <td class="item-name">${item.name}</td>
        <td class="item-qty">${item.qty}</td>
        <td class="item-rate">${fmtFull(item.rate)}</td>
        <td class="item-amount">${fmtFull(item.amount)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-box">
      <div class="total-row"><span class="total-label">Subtotal</span><span class="total-value">${fmtFull(invoice.subtotal)}</span></div>
      ${invoice.discount > 0 ? `<div class="total-row"><span class="total-label">Discount</span><span class="total-value" style="color:#16A34A">-${fmtFull(invoice.discount)}</span></div>` : ''}
      <div class="total-row"><span class="total-label">GST (5%)</span><span class="total-value">${fmtFull(invoice.taxAmount)}</span></div>
      <div class="grand-total-row"><span class="grand-total-label">Total Amount</span><span class="grand-total-value">${fmtFull(invoice.totalAmount)}</span></div>
    </div>
  </div>

  <!-- Amount in Words -->
  <div class="amount-words">
    <div class="amount-words-label">Amount in Words</div>
    <div class="amount-words-text">${numberToWords(invoice.totalAmount)} Only</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      <strong>Terms & Conditions:</strong><br/>
      Payment due within 14 days of invoice date.<br/>
      Goods once sold will not be taken back.<br/>
      Subject to Surat jurisdiction.
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Authorised Signatory</div>
      <div class="signature-name">${business?.name || ''}</div>
    </div>
  </div>

  <div style="text-align:center; margin-top:24px; font-size:11px; color:#d1d5db;">
    Generated by HisaabPro — Smart Vyapar Ledger
  </div>

</div>
</body>
</html>`
}

// Number to words (Indian system)
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWords(-num)

  let words = ''
  if (Math.floor(num / 10000000) > 0) { words += numberToWords(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000 }
  if (Math.floor(num / 100000) > 0) { words += numberToWords(Math.floor(num / 100000)) + ' Lakh '; num %= 100000 }
  if (Math.floor(num / 1000) > 0) { words += numberToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000 }
  if (Math.floor(num / 100) > 0) { words += numberToWords(Math.floor(num / 100)) + ' Hundred '; num %= 100 }
  if (num > 0) {
    if (num < 20) words += ones[num]
    else words += tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '')
  }
  return words.trim()
}

export function printInvoice(invoice, party, business) {
  const html = generateInvoiceHTML(invoice, party, business)
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}
