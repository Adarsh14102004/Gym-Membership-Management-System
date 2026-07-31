import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const statusStyles = {
  success: 'bg-accent-yellow/15 text-accent-yellow',
  failed: 'bg-accent-red/15 text-accent-red',
}

const downloadReceipt = (payment) => {
  const lines = [
    'GYM MEMBERSHIP - PAYMENT RECEIPT',
    '--------------------------------',
    `Transaction ID: ${payment.transactionId}`,
    `Date: ${new Date(payment.paymentDate).toLocaleString()}`,
    `Plan: ${payment.plan?.name} (${payment.plan?.duration})`,
    `Amount Paid: $${payment.amount}`,
    `Payment Method: ${payment.paymentMethod}`,
    `Status: ${payment.paymentStatus}`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${payment.transactionId}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

const PaymentHistory = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/payment')
        setPayments(data)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load payment history', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    { key: 'paymentDate', label: 'Date', render: (row) => new Date(row.paymentDate).toLocaleDateString() },
    { key: 'plan', label: 'Plan', render: (row) => row.plan?.name || '—' },
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'amount', label: 'Amount', render: (row) => `$${row.amount}` },
    { key: 'paymentMethod', label: 'Method' },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[row.paymentStatus]}`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Receipt',
      render: (row) => (
        <button type="button" onClick={() => downloadReceipt(row)} className="font-medium text-accent-yellow hover:underline">
          Download
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
          <p className="mt-1 text-sm text-gray-400">All your past membership payments.</p>
        </div>
        <Link
          to="/member/payment"
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Make a Payment
        </Link>
      </div>

      {!loading && payments.length === 0 ? (
        <EmptyState title="No payments yet" message="Your payment history will appear here after your first renewal." />
      ) : (
        <DataTable
          columns={columns}
          rows={payments.filter(
            (p) => p.transactionId.toLowerCase().includes(search.toLowerCase()) || p.plan?.name?.toLowerCase().includes(search.toLowerCase())
          )}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          page={1}
          pages={1}
          onPageChange={() => {}}
          emptyMessage="No payments yet"
        />
      )}
    </div>
  )
}

export default PaymentHistory
