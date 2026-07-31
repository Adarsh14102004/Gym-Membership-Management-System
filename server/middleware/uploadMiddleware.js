const fs = require('fs')
const path = require('path')
const multer = require('multer')

const uploadDir = path.join(__dirname, '..', 'uploads', 'progress')
fs.mkdirSync(uploadDir, { recursive: true })

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.user._id}-${Date.now()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG or WEBP images are allowed'))
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('progressImage')

const uploadProgressImage = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400)
      return next(new Error(err.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 5MB' : err.message))
    }
    next()
  })
}

module.exports = { uploadProgressImage }
