// Lightweight NoSQL-injection guard for req.body / req.params / req.query.
//
// Hand-rolled instead of pulling in `express-mongo-sanitize`/`hpp`: both
// packages reassign `req.query` outright (`req.query = sanitized`), which
// throws on Express 5 — `req.query` is a getter-only accessor there. This
// middleware only ever mutates properties *on* the existing query/body/params
// objects, never the top-level reference, so it's safe on both Express 4 and 5.
//
// Strips any object key that starts with "$" or contains "." — the two
// characters MongoDB/Mongoose treat specially, and the classic NoSQL
// injection vector (e.g. `{ "email": { "$gt": "" } }`).
const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]'

const sanitizeInPlace = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(sanitizeInPlace)
    return obj
  }
  if (!isPlainObject(obj)) return obj

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
      continue
    }
    sanitizeInPlace(obj[key])
  }
  return obj
}

const sanitizeInput = (req, res, next) => {
  sanitizeInPlace(req.body)
  sanitizeInPlace(req.params)
  sanitizeInPlace(req.query)
  next()
}

module.exports = { sanitizeInput }
