import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'

const MyMembers = () => {
  const [view, setView] = useState('mine')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const { showToast } = useToast()

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const endpoint = view === 'mine' ? '/trainer/members' : '/trainer/members/available'
      const { data } = await api.get(endpoint, { params: { search, page, limit: 8 } })
      setRows(data.data)
      setPages(data.pages)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load members', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 350)
    return () => clearTimeout(timer)
  }, [view, search, page])

  const handleAssign = async (row) => {
    setBusyId(row._id)
    try {
      await api.put(`/trainer/members/${row._id}/assign`)
      showToast(`${row.name} assigned to you`, 'success')
      fetchMembers()
    } catch (error) {
      showToast(error.response?.data?.message || 'Assign failed', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleUnassign = async (row) => {
    setBusyId(row._id)
    try {
      await api.put(`/trainer/members/${row._id}/unassign`)
      showToast(`${row.name} removed from your list`, 'success')
      fetchMembers()
    } catch (error) {
      showToast(error.response?.data?.message || 'Unassign failed', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === 'active' ? 'bg-accent-yellow/15 text-accent-yellow' : 'bg-white/10 text-gray-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) =>
        view === 'mine' ? (
          <button
            type="button"
            disabled={busyId === row._id}
            onClick={() => handleUnassign(row)}
            className="font-medium text-accent-red hover:underline disabled:opacity-50"
          >
            Unassign
          </button>
        ) : (
          <button
            type="button"
            disabled={busyId === row._id}
            onClick={() => handleAssign(row)}
            className="font-medium text-accent-yellow hover:underline disabled:opacity-50"
          >
            Assign to me
          </button>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Members</h2>
        <p className="mt-1 text-sm text-gray-400">Members assigned to your coaching.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setView('mine')
            setPage(1)
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            view === 'mine' ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          My Members
        </button>
        <button
          type="button"
          onClick={() => {
            setView('available')
            setPage(1)
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            view === 'available' ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          Available Members
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        page={page}
        pages={pages}
        onPageChange={setPage}
        emptyMessage={view === 'mine' ? 'No members assigned yet' : 'No unassigned members available'}
      />
    </div>
  )
}

export default MyMembers
