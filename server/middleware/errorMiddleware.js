const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Route not found - ${req.originalUrl}`))
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
