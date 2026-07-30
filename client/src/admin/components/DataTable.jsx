import { motion } from 'framer-motion'

const DataTable = ({
  columns,
  rows,
  loading,
  search,
  onSearchChange,
  filters,
  page,
  pages,
  onPageChange,
  onEdit,
  onDelete,
  emptyMessage = 'No records found',
}) => {
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/60 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red sm:max-w-xs"
        />
        {filters}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              {hasActions && <th className="px-3 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-3 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-3 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <motion.tr
                  key={row._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 text-gray-300 transition-colors hover:bg-white/5"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-3 py-3">
                      <div className="flex gap-3">
                        {onEdit && (
                          <button type="button" onClick={() => onEdit(row)} className="font-medium text-accent-yellow hover:underline">
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button type="button" onClick={() => onDelete(row)} className="font-medium text-accent-red hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-white disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
