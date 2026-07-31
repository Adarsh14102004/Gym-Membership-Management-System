const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { generatePdfReport, generateExcelReport } = require('../controllers/reportController')

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/pdf', generatePdfReport)
router.get('/excel', generateExcelReport)

module.exports = router
