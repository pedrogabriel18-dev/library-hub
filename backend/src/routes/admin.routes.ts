import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import * as statsCtrl from '../controllers/admin/stats.controller'
import * as adminBooksCtrl from '../controllers/admin/books.controller'
import * as adminCategoriesCtrl from '../controllers/admin/categories.controller'
import * as adminTCCsCtrl from '../controllers/admin/tccs.controller'
import * as importCtrl from '../controllers/admin/import.controller'
import * as filesCtrl from '../controllers/files.controller'
import { createBookSchema, updateBookSchema } from '../schemas/book.schema'
import { createTCCSchema, updateTCCSchema } from '../schemas/tcc.schema'
import { categorySchema } from '../schemas/category.schema'
import { resolveAppPath } from '../utils/paths'

const router = Router()

function uploadPdfTo(folder: 'books' | 'tccs') {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destination = resolveAppPath(`storage/${folder}`)
      fs.mkdirSync(destination, { recursive: true })
      cb(null, destination)
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase() || '.pdf'
      const baseName = path
        .basename(file.originalname, extension)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
      cb(null, `${baseName || 'arquivo'}-${Date.now()}${extension}`)
    },
  })

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        cb(new Error('Apenas arquivos PDF sao permitidos.'))
        return
      }
      cb(null, true)
    },
  }).single('file')
}

// Stats & Upload Streaming
router.get('/admin/stats', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), statsCtrl.getDashboardStats)
router.get('/books/:slug/file', authenticate, filesCtrl.streamBookFile)
router.get('/tccs/:slug/file', authenticate, filesCtrl.streamTCCFile)

// Auto-import & Temp Files
router.post('/admin/auto-import', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), importCtrl.autoImport)
router.post('/admin/save-cover', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), importCtrl.saveCover)
router.get('/admin/temp-files/:fileId', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), importCtrl.serveTempFile)

// Livros Admin
router.post('/admin/books', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), validate(createBookSchema), adminBooksCtrl.createBook)
router.put('/admin/books/:bookId', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), validate(updateBookSchema), adminBooksCtrl.updateBook)
router.delete('/admin/books/:bookId', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), adminBooksCtrl.deleteBook)

// Categorias Admin
router.get('/admin/categories', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), adminCategoriesCtrl.listCategories)
router.post('/admin/categories', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), validate(categorySchema), adminCategoriesCtrl.createCategory)
router.put('/admin/categories/:categoryId', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), validate(categorySchema), adminCategoriesCtrl.updateCategory)
router.delete('/admin/categories/:categoryId', authenticate, authorize('LIBRARIAN', 'DEVELOPER'), adminCategoriesCtrl.deleteCategory)

// TCCs Admin
router.post('/admin/tccs', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), uploadPdfTo('tccs'), validate(createTCCSchema), adminTCCsCtrl.createTCC)
router.put('/admin/tccs/:tccId', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), uploadPdfTo('tccs'), validate(updateTCCSchema), adminTCCsCtrl.updateTCC)
router.delete('/admin/tccs/:tccId', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), adminTCCsCtrl.deleteTCC)

export default router
