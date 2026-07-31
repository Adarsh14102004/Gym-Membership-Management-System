import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { getSocket, disconnectSocket } from '../../services/socket.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../../components/Loader.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const TYPING_TIMEOUT = 2000

const Chat = () => {
  const [trainer, setTrainer] = useState(null)
  const [loadingTrainer, setLoadingTrainer] = useState(true)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [online, setOnline] = useState(false)
  const [typing, setTyping] = useState(false)

  const { user } = useAuth()
  const { showToast } = useToast()
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/member/trainer')
        setTrainer(data)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load trainer', 'error')
      } finally {
        setLoadingTrainer(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!trainer) return undefined

    const loadMessages = async () => {
      setLoadingMessages(true)
      try {
        const { data } = await api.get(`/chat/${trainer._id}`)
        setMessages(data)
        api.put(`/chat/${trainer._id}/read`).catch(() => {})
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load messages', 'error')
      } finally {
        setLoadingMessages(false)
      }
    }
    loadMessages()

    const socket = getSocket()
    if (!socket) return undefined

    socket.emit('presence:check', trainer._id, (res) => setOnline(!!res?.online))

    const onMessage = (message) => {
      const from = message.sender?._id || message.sender
      if (String(from) !== String(trainer._id)) return
      setMessages((prev) => [...prev, message])
      api.put(`/chat/${trainer._id}/read`).catch(() => {})
    }
    const onTyping = ({ from }) => {
      if (String(from) === String(trainer._id)) setTyping(true)
    }
    const onStopTyping = ({ from }) => {
      if (String(from) === String(trainer._id)) setTyping(false)
    }
    const onRead = ({ by }) => {
      if (String(by) !== String(trainer._id)) return
      setMessages((prev) => prev.map((m) => (String(m.sender?._id || m.sender) === String(user._id) ? { ...m, read: true } : m)))
    }
    const onPresence = ({ userId, online: isOnline }) => {
      if (String(userId) === String(trainer._id)) setOnline(isOnline)
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
  }, [trainer])

  useEffect(() => () => disconnectSocket(), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleTextChange = (e) => {
    setText(e.target.value)
    const socket = getSocket()
    if (!socket || !trainer) return
    socket.emit('chat:typing', { recipientId: trainer._id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('chat:stopTyping', { recipientId: trainer._id }), TYPING_TIMEOUT)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || !trainer || sending) return

    setSending(true)
    const socket = getSocket()
    clearTimeout(typingTimeoutRef.current)
    socket?.emit('chat:stopTyping', { recipientId: trainer._id })

    socket?.emit('chat:send', { recipientId: trainer._id, text: value }, (res) => {
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
        const { data } = await api.post(`/chat/${trainer._id}`, { text: value })
        setMessages((prev) => [...prev, data])
        setText('')
      } catch (error) {
        showToast(error.response?.data?.message || 'Send failed', 'error')
      } finally {
        setSending(false)
      }
    }
  }

  if (loadingTrainer) return <Loader />

  if (!trainer) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat</h2>
          <p className="mt-1 text-sm text-gray-400">Message your trainer directly.</p>
        </div>
        <EmptyState title="No trainer assigned" message="You'll be able to chat here once a trainer is assigned to you." />
      </div>
    )
  }

  const lastMineIndex = [...messages].map((m) => String(m.sender?._id || m.sender) === String(user._id)).lastIndexOf(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Chat</h2>
        <p className="mt-1 text-sm text-gray-400">Message your trainer directly.</p>
      </div>

      <div className="flex h-[32rem] flex-col rounded-2xl border border-white/10 bg-surface/60">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/20 text-sm font-bold text-accent-red">
              {trainer.name?.[0]?.toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                online ? 'bg-green-400' : 'bg-gray-500'
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{trainer.name}</p>
            <p className="text-xs text-gray-500">{online ? 'Online' : 'Offline'}</p>
          </div>
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
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xs">
                    <div className={`rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-200'}`}>
                      {m.text}
                    </div>
                    {mine && i === lastMineIndex && (
                      <p className="mt-1 text-right text-[10px] text-gray-500">{m.read ? 'Read' : 'Sent'}</p>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-accent-yellow"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  />
                ))}
              </div>
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
      </div>
    </div>
  )
}

export default Chat
