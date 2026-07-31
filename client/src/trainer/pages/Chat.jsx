import { useEffect, useRef, useState } from 'react'
import api from '../../services/api.js'
import { getSocket, disconnectSocket } from '../../services/socket.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../../components/Loader.jsx'

const TYPING_TIMEOUT = 2000

const Chat = () => {
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [onlineIds, setOnlineIds] = useState(new Set())
  const [typingFrom, setTypingFrom] = useState(null)

  const { user } = useAuth()
  const { showToast } = useToast()
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const selectedRef = useRef(null)
  selectedRef.current = selected

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

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return undefined

    const onMessage = (message) => {
      const from = String(message.sender?._id || message.sender)
      if (selectedRef.current && from === String(selectedRef.current._id)) {
        setMessages((prev) => [...prev, message])
        api.put(`/chat/${from}/read`).catch(() => {})
      }
    }
    const onTyping = ({ from }) => {
      if (selectedRef.current && String(from) === String(selectedRef.current._id)) setTypingFrom(from)
    }
    const onStopTyping = ({ from }) => {
      if (selectedRef.current && String(from) === String(selectedRef.current._id)) setTypingFrom(null)
    }
    const onRead = ({ by }) => {
      setMessages((prev) =>
        prev.map((m) => (String(m.sender?._id || m.sender) === String(user._id) && String(by) === String(selectedRef.current?._id) ? { ...m, read: true } : m))
      )
    }
    const onPresence = ({ userId, online }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev)
        if (online) next.add(userId)
        else next.delete(userId)
        return next
      })
    }

    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)
    socket.on('chat:stopTyping', onStopTyping)
    socket.on('chat:read', onRead)
    socket.on('presence:update', onPresence)

    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
      socket.off('chat:stopTyping', onStopTyping)
      socket.off('chat:read', onRead)
      socket.off('presence:update', onPresence)
    }
  }, [])

  useEffect(() => () => disconnectSocket(), [])

  const fetchMessages = async (memberId) => {
    setLoadingMessages(true)
    try {
      const { data } = await api.get(`/chat/${memberId}`)
      setMessages(data)
      api.put(`/chat/${memberId}/read`).catch(() => {})
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load messages', 'error')
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (selected) {
      setTypingFrom(null)
      fetchMessages(selected._id)
      getSocket()?.emit('presence:check', selected._id, (res) => {
        if (res?.online) setOnlineIds((prev) => new Set(prev).add(selected._id))
      })
    }
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingFrom])

  const handleTextChange = (e) => {
    setText(e.target.value)
    const socket = getSocket()
    if (!socket || !selected) return
    socket.emit('chat:typing', { recipientId: selected._id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('chat:stopTyping', { recipientId: selected._id }), TYPING_TIMEOUT)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || !selected || sending) return

    setSending(true)
    const socket = getSocket()
    clearTimeout(typingTimeoutRef.current)
    socket?.emit('chat:stopTyping', { recipientId: selected._id })

    socket?.emit('chat:send', { recipientId: selected._id, text: value }, (res) => {
      setSending(false)
      if (res?.ok) {
        setMessages((prev) => [...prev, res.message])
        setText('')
      } else {
        showToast(res?.error || 'Send failed', 'error')
      }
    })

    if (!socket) {
      try {
        const { data } = await api.post(`/chat/${selected._id}`, { text: value })
        setMessages((prev) => [...prev, data])
        setText('')
      } catch (error) {
        showToast(error.response?.data?.message || 'Send failed', 'error')
      } finally {
        setSending(false)
      }
    }
  }

  if (loadingMembers) return <Loader />

  const isSelectedOnline = selected && onlineIds.has(selected._id)
  const lastMineIndex = [...messages].map((m) => String(m.sender?._id || m.sender) === String(user._id)).lastIndexOf(true)

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
              className={`flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected?._id === m._id ? 'bg-accent-red text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`h-2 w-2 flex-none rounded-full ${onlineIds.has(m._id) ? 'bg-green-400' : 'bg-gray-500'}`} />
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex h-[28rem] flex-col md:h-[32rem]">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Select a member to start chatting</div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <span className="text-xs text-gray-500">{isSelectedOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {loadingMessages ? (
                  <Loader />
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No messages yet. Say hello!</p>
                ) : (
                  messages.map((m, i) => {
                    const mine = String(m.sender?._id || m.sender) === String(user._id)
                    return (
                      <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs">
                          <div
                            className={`rounded-2xl px-4 py-2 text-sm ${
                              mine ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-200'
                            }`}
                          >
                            {m.text}
                          </div>
                          {mine && i === lastMineIndex && (
                            <p className="mt-1 text-right text-[10px] text-gray-500">{m.read ? 'Read' : 'Sent'}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                {typingFrom && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs text-gray-400">typing...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-3">
                <input
                  value={text}
                  onChange={handleTextChange}
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
