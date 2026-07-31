import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../services/api.js'

const SUGGESTIONS = ["What's my BMI?", 'Am I working out today?', 'What should I eat?', "What's my membership status?"]

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending, open])

  const send = async (text) => {
    const value = (text ?? input).trim()
    if (!value || sending) return
    setMessages((prev) => [...prev, { role: 'user', content: value }])
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post('/ai/rule-chat', { message: value })
      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I'm having trouble right now. Please try again." }])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send()
  }

  return (
    <div className="fixed bottom-6 right-6 z-[80]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-accent-red to-accent-yellow/80 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🤖</div>
              <div>
                <p className="text-sm font-bold text-white">Fitness Assistant</p>
                <p className="text-[11px] text-white/80">Always here to help</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:border-accent-red hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === 'user' ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-2.5">
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

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border border-white/10 bg-base px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex-none rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-red to-accent-yellow text-2xl text-white shadow-lg shadow-accent-red/40"
        aria-label="Toggle fitness assistant"
      >
        {open ? '✕' : '🤖'}
      </motion.button>
    </div>
  )
}

export default FloatingChatbot
