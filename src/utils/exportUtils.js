// Excel/CSV Export Utility — no external library needed

// Convert array of objects to CSV string
function toCSV(headers, rows) {
  const headerRow = headers.map(h => `"${h.label}"`).join(',')
  const dataRows = rows.map(row =>
    headers.map(h => {
      const val = row[h.key] ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}

// Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel Hindi support
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Export Functions ──────────────────────────────────────────────────────────

export function exportParties(parties) {
  const headers = [
    { key: 'name', label: 'Party Name' },
    { key: 'type', label: 'Type' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'balance', label: 'Balance (₹)' },
    { key: 'balanceType', label: 'Balance Type' },
    { key: 'gstin', label: 'GSTIN' },
    { key: 'lastTxn', label: 'Last Transaction' },
  ]
  const csv = toCSV(headers, parties)
  downloadCSV(csv, `HisaabPro-Parties-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportTransactions(transactions, parties) {
  const getPartyName = id => parties.find(p => p.id === id)?.name || id
  const rows = transactions.map(t => ({
    date: t.date,
    partyName: getPartyName(t.partyId),
    type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    billNo: t.billNo || '',
    note: t.note || '',
    createdBy: t.createdBy || '',
  }))
  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'partyName', label: 'Party Name' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'balanceAfter', label: 'Balance After (₹)' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'note', label: 'Note' },
    { key: 'createdBy', label: 'Created By' },
  ]
  const csv = toCSV(headers, rows)
  downloadCSV(csv, `HisaabPro-Transactions-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportInvoices(invoices, parties) {
  const getPartyName = id => parties.find(p => p.id === id)?.name || id
  const rows = invoices.map(inv => ({
    invoiceNo: inv.invoiceNo,
    date: inv.date,
    dueDate: inv.dueDate,
    partyName: getPartyName(inv.partyId),
    subtotal: inv.subtotal,
    discount: inv.discount,
    gst: inv.taxAmount,
    totalAmount: inv.totalAmount,
    status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
  }))
  const headers = [
    { key: 'invoiceNo', label: 'Invoice No' },
    { key: 'date', label: 'Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'partyName', label: 'Customer' },
    { key: 'subtotal', label: 'Subtotal (₹)' },
    { key: 'discount', label: 'Discount (₹)' },
    { key: 'gst', label: 'GST (₹)' },
    { key: 'totalAmount', label: 'Total (₹)' },
    { key: 'status', label: 'Status' },
  ]
  const csv = toCSV(headers, rows)
  downloadCSV(csv, `HisaabPro-Invoices-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportInventory(products) {
  const rows = products.map(p => ({
    name: p.name,
    category: p.category,
    unit: p.unit,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
    stock: p.stock,
    stockValue: p.stock * p.purchasePrice,
    margin: p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) + '%' : '0%',
    lowStockAlert: p.lowStockAlert,
    status: p.stock <= p.lowStockAlert ? 'LOW STOCK' : 'OK',
  }))
  const headers = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'purchasePrice', label: 'Purchase Price (₹)' },
    { key: 'sellingPrice', label: 'Selling Price (₹)' },
    { key: 'stock', label: 'Current Stock' },
    { key: 'stockValue', label: 'Stock Value (₹)' },
    { key: 'margin', label: 'Margin %' },
    { key: 'lowStockAlert', label: 'Reorder Level' },
    { key: 'status', label: 'Status' },
  ]
  const csv = toCSV(headers, rows)
  downloadCSV(csv, `HisaabPro-Inventory-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportOutstandingReport(parties, transactions) {
  const outstanding = parties
    .filter(p => p.balance > 0)
    .map(p => {
      const partyTxns = transactions.filter(t => t.partyId === p.id)
      const lastTxn = partyTxns.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      const daysSince = lastTxn ? Math.floor((new Date() - new Date(lastTxn.date)) / (1000 * 60 * 60 * 24)) : 0
      return {
        name: p.name,
        type: p.type,
        city: p.city,
        phone: p.phone,
        balance: p.balance,
        balanceType: p.balanceType === 'to_receive' ? 'To Receive' : 'To Pay',
        lastTxnDate: p.lastTxn,
        daysSinceLastTxn: daysSince,
      }
    })
    .sort((a, b) => b.balance - a.balance)

  const headers = [
    { key: 'name', label: 'Party Name' },
    { key: 'type', label: 'Type' },
    { key: 'city', label: 'City' },
    { key: 'phone', label: 'Phone' },
    { key: 'balance', label: 'Outstanding (₹)' },
    { key: 'balanceType', label: 'Balance Type' },
    { key: 'lastTxnDate', label: 'Last Transaction' },
    { key: 'daysSinceLastTxn', label: 'Days Since Last Txn' },
  ]
  const csv = toCSV(headers, outstanding)
  downloadCSV(csv, `HisaabPro-Outstanding-${new Date().toISOString().split('T')[0]}.csv`)
}
