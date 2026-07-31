const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')

const streamPdf = (res, { title, columns, rows, filename }) => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`)

  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: columns.length > 5 ? 'landscape' : 'portrait' })
  doc.pipe(res)

  doc.fontSize(18).fillColor('#111111').text(title, { align: 'center' })
  doc.moveDown(0.3)
  doc.fontSize(9).fillColor('#555555').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
  doc.moveDown(1.2)

  const startX = doc.page.margins.left
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const colWidth = usableWidth / columns.length
  let y = doc.y

  doc.fontSize(9).fillColor('#000000')
  columns.forEach((col, i) => {
    doc.text(col.label, startX + i * colWidth, y, { width: colWidth - 4, ellipsis: true })
  })
  y += 16
  doc
    .moveTo(startX, y - 3)
    .lineTo(startX + usableWidth, y - 3)
    .strokeColor('#cccccc')
    .stroke()

  rows.forEach((row) => {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage()
      y = doc.page.margins.top
    }
    columns.forEach((col, i) => {
      const value = col.render ? col.render(row) : row[col.key]
      doc
        .fontSize(8)
        .fillColor('#222222')
        .text(value === null || value === undefined ? '—' : String(value), startX + i * colWidth, y, {
          width: colWidth - 4,
          ellipsis: true,
        })
    })
    y += 16
  })

  if (rows.length === 0) {
    doc.fontSize(9).fillColor('#888888').text('No records found for the selected filters.', startX, y)
  }

  doc.end()
}

const streamExcel = async (res, { title, columns, rows, filename }) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title.slice(0, 31))

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: Math.max(c.label.length + 6, 16) }))
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }

  rows.forEach((row) => {
    const values = {}
    columns.forEach((c) => {
      values[c.key] = c.render ? c.render(row) : row[c.key]
    })
    sheet.addRow(values)
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`)

  await workbook.xlsx.write(res)
  res.end()
}

module.exports = { streamPdf, streamExcel }
