import { useEffect, useRef, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../../components/Loader.jsx'

const Chat = () => {
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const { user } = useAuth()
  const { showToast } = useToast()
  const bottomRef = useRef(null)

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data } = await api.get('/trainer/members', { params: { limit: 50 } })
        setMembers(data.data)
        if (data.data.length > 0) setSelected(data.data[0])
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load members', 'error')
      } finally {
        setLoadingMembers(false)
      }
    }
    loadMembers()
  }, [])

  const fetchMessages = async (memberId) => {
    setLoadingMessages(true)
    try {
      const { data } = await api.get(`/chat/${memberId}`)
      setMessages(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load messages', 'error')
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (selected) fetchMessages(selected._id)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected) return
    setSending(true)
    try {
      const { data } = await api.post(`/chat/${selected._id}`, { text })
      setMessages((prev) => [...prev, data])
      setText('')
    } catch (error) {
      showToast(error.response?.data?.message || 'Send failed', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loadingMembers) return <Loader />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Chat</h2>
        <p className="mt-1 text-sm text-gray-400">Message your assigned members directly.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-surface/60 md:grid-cols-[240px_1fr]">
        <div className="max-h-[28rem] overflow-y-auto border-b border-white/10 p-3 md:max-h-[32rem] md:border-b-0 md:border-r">
          {members.length === 0 && <p className="p-3 text-sm text-gray-500">No members assigned yet.</p>}
          {members.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setSelected(m)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected?._id === m._id ? 'bg-accent-red text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex h-[28rem] flex-col md:h-[32rem]">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Select a member to start chatting</div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {loadingMessages ? (
                  <Loader />
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No messages yet. Say hello!</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender === user._id || m.sender?._id === user._id
                    return (
                      <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                            mine ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-200'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="rounded-xl bg-accent-red px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
