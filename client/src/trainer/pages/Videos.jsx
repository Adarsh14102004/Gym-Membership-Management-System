import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

const emptyForm = { title: '', description: '', url: '', category: 'General' }

const Videos = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trainer/videos', { params: { search } })
      setRows(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load videos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchVideos, 350)
    return () => clearTimeout(timer)
  }, [search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ title: row.title, description: row.description || '', url: row.url, category: row.category })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/trainer/videos/${editing._id}`, form)
        showToast('Video updated', 'success')
      } else {
        await api.post('/trainer/videos', form)
        showToast('Video added', 'success')
      }
      setModalOpen(false)
      fetchVideos()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/trainer/videos/${deleteTarget._id}`)
      showToast('Video deleted', 'success')
      setDeleteTarget(null)
      fetchVideos()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    {
      key: 'url',
      label: 'Link',
      render: (row) => (
        <a href={row.url} target="_blank" rel="noreferrer" className="text-accent-yellow hover:underline">
          Open
        </a>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Exercise Videos</h2>
          <p className="mt-1 text-sm text-gray-400">Your library of exercise demonstration videos.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Add Video
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={1}
        pages={1}
        onPageChange={() => {}}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No videos yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Video' : 'Add Video'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Video title"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="url"
            type="url"
            value={form.url}
            onChange={handleChange}
            required
            placeholder="Video URL"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category (e.g. Strength)"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Description"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Video'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete video "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Videos
