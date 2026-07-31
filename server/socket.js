const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const { createChatMessage } = require('./controllers/chatController')

const onlineUsers = new Map()

let io = null

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Not authorized'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user) return next(new Error('Not authorized'))

      socket.userId = String(user._id)
      next()
    } catch {
      next(new Error('Not authorized'))
    }
  })

  io.on('connection', (socket) => {
    const { userId } = socket
    socket.join(`user:${userId}`)
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1)
    io.emit('presence:update', { userId, online: true })

    socket.on('chat:send', async ({ recipientId, text }, callback) => {
      try {
        const message = await createChatMessage(userId, recipientId, text)
        io.to(`user:${recipientId}`).emit('chat:message', message)
        if (callback) callback({ ok: true, message })
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message })
      }
    })

    socket.on('chat:typing', ({ recipientId }) => {
      if (!recipientId) return
      io.to(`user:${recipientId}`).emit('chat:typing', { from: userId })
    })

    socket.on('chat:stopTyping', ({ recipientId }) => {
      if (!recipientId) return
      io.to(`user:${recipientId}`).emit('chat:stopTyping', { from: userId })
    })

    socket.on('presence:check', (targetUserId, callback) => {
      callback?.({ online: onlineUsers.has(targetUserId) })
    })

    socket.on('disconnect', () => {
      const remaining = (onlineUsers.get(userId) || 1) - 1
      if (remaining <= 0) {
        onlineUsers.delete(userId)
        io.emit('presence:update', { userId, online: false })
      } else {
        onlineUsers.set(userId, remaining)
      }
    })
  })

  return io
}

const notifyRead = (readerId, otherUserId) => {
  io?.to(`user:${otherUserId}`).emit('chat:read', { by: readerId })
}

module.exports = { initSocket, notifyRead }
