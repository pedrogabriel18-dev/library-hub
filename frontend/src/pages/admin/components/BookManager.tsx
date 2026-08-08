import { FormEvent, useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import api from '../../../services/api'
import { Book } from '../../../types'
import { CategoryManager } from './CategoryManager'
import styles from './BookManager.module.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface BookManagerProps {
  onStatsRefresh: () => void
}

export function BookManager({ onStatsRefresh }: BookManagerProps) {
  const [view, setView] = useState<'list' | 'form' | 'categories'>('list')
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [bookSearch, setBookSearch] = useState('')
  const [isListLoading, setIsListLoading] = useState(false)

  // Form fields
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookYear, setBookYear] = useState('')
  const [bookCategory, setBookCategory] = useState('')
  const [bookCover, setBookCover] = useState('')
  const [bookUrl, setBookUrl] = useState('')
  const [bookDescription, setBookDescription] = useState('')
  const [bookMsg, setBookMsg] = useState('')
  const [bookError, setBookError] = useState('')
  const [bookLoading, setBookLoading] = useState(false)
  const [bookAutoImportLoading, setBookAutoImportLoading] = useState(false)

  const fetchBooks = useCallback(async () => {
    setIsListLoading(true)
    try {
      const { data } = await api.get('/books?limit=100')
      setBooks(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsListLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [fetchBooks, fetchCategories])

  function clearForm() {
    setBookTitle('')
    setBookAuthor('')
    setBookYear('')
    setBookCategory('')
    setBookCover('')
    setBookUrl('')
    setBookDescription('')
    setBookMsg('')
    setBookError('')
    setEditingBookId(null)
    setView('list')
  }

  function handleEditBook(book: Book) {
    setBookTitle(book.title)
    setBookAuthor(book.authors?.map(a => a.author.name).join(', ') || '')
    setBookYear(book.publishedYear ? String(book.publishedYear) : '')
    setBookCategory(book.category?.name || '')
    setBookCover(book.coverImage || '')
    setBookUrl(book.filePath)
    setBookDescription(book.synopsis || '')
    setEditingBookId(book.id)
    setView('form')
  }

  async function handleDeleteBook(id: string, title: string) {
    if (!window.confirm(`Tem certeza que deseja remover o livro "${title}"?`)) return
    try {
      await api.delete(`/admin/books/${id}`)
      fetchBooks()
      onStatsRefresh()
      alert('Livro removido com sucesso!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover o livro.')
    }
  }

  async function handleAutoImport() {
    if (!bookUrl) {
      setBookError('Por favor, informe a URL do PDF primeiro.')
      return
    }
    setBookError('')
    setBookMsg('')
    setBookAutoImportLoading(true)
    try {
      setBookMsg('Baixando PDF e extraindo metadados...')
      const res = await api.post('/admin/auto-import', { url: bookUrl, type: 'book' })
      const { tempFileId, metadata } = res.data.data

      setBookTitle(metadata.title || '')
      setBookAuthor(metadata.author || '')
      setBookCategory(metadata.category || '')
      setBookYear(metadata.publishedYear ? metadata.publishedYear.toString() : '')
      setBookDescription(metadata.description || '')

      setBookMsg('PDF baixado. Gerando capa...')
      const token = localStorage.getItem('token')
      const pdf = await pdfjsLib.getDocument({
        url: `/api/admin/temp-files/${tempFileId}`,
        httpHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      }).promise

      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport }).promise

      const base64Image = canvas.toDataURL('image/jpeg', 0.8)
      const saveRes = await api.post('/admin/save-cover', {
        tempFileId,
        base64Image,
        slug: metadata.title || 'livro',
        type: 'book',
      })

      setBookCover(saveRes.data.data.coverPath)
      setBookMsg('Informações importadas e capa gerada com sucesso!')
    } catch (err: any) {
      console.error(err)
      setBookError(err.response?.data?.message || err.message || 'Erro ao importar dados do PDF.')
    } finally {
      setBookAutoImportLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBookError('')
    setBookMsg('')
    setBookLoading(true)
    try {
      const payload = {
        title: bookTitle,
        author: bookAuthor,
        publishedYear: bookYear ? parseInt(bookYear) : null,
        category: bookCategory,
        coverImage: bookCover || undefined,
        url: bookUrl,
        description: bookDescription,
      }
      if (editingBookId) {
        await api.put(`/admin/books/${editingBookId}`, payload)
        setBookMsg('Livro atualizado com sucesso!')
      } else {
        await api.post('/admin/books', payload)
        setBookMsg('Livro cadastrado com sucesso!')
      }
      clearForm()
      fetchBooks()
      onStatsRefresh()
    } catch (err: any) {
      setBookError(err.response?.data?.message || 'Erro ao salvar o livro.')
    } finally {
      setBookLoading(false)
    }
  }

  // ── Renderização por view ──────────────────────────────────────────────────
  if (view === 'categories') {
    return (
      <CategoryManager
        onBack={() => setView('list')}
        onCategoriesChange={() => { fetchCategories(); fetchBooks() }}
      />
    )
  }

  if (view === 'form') {
    return (
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {editingBookId ? 'Editar Livro' : 'Cadastrar Novo Livro'}
          </h2>
          <p className={styles.formSubtitle}>
            {editingBookId ? 'Atualize as informações do livro no acervo' : 'Cadastre um livro no acervo informando a URL externa do documento'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* URL + Auto-import */}
          <div className={styles.formGroup}>
            <label>URL do Livro (Link)</label>
            <div className={styles.inputWithAction}>
              <input
                type="url"
                placeholder="https://link-do-pdf-ou-site-do-livro.com"
                value={bookUrl}
                onChange={e => setBookUrl(e.target.value)}
                required
                className={styles.formInput}
              />
              <button
                type="button"
                disabled={bookAutoImportLoading}
                onClick={handleAutoImport}
                className={styles.actionBtn}
              >
                {bookAutoImportLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Título */}
          <div className={styles.formGroup}>
            <label>Título</label>
            <input type="text" placeholder="Título do livro" value={bookTitle} onChange={e => setBookTitle(e.target.value)} required className={styles.formInput} />
          </div>

          {/* Autor */}
          <div className={styles.formGroup}>
            <label>Autor</label>
            <input type="text" placeholder="Nome do autor" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} required className={styles.formInput} />
          </div>

          {/* Ano + Categoria */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ano de Publicação</label>
              <input type="number" placeholder="Ex: 1899" value={bookYear} onChange={e => setBookYear(e.target.value)} className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label>Categoria</label>
              <input list="categories-list" type="text" placeholder="Ex: Romance, Ciências" value={bookCategory} onChange={e => setBookCategory(e.target.value)} required className={styles.formInput} />
              <datalist id="categories-list">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
          </div>

          {/* Capa */}
          <div className={styles.formGroup}>
            <label>URL da Capa (opcional)</label>
            <input type="text" placeholder="Ex: /assets/placeholders/..." value={bookCover} onChange={e => setBookCover(e.target.value)} className={styles.formInput} />
          </div>

          {/* Descrição */}
          <div className={styles.formGroup}>
            <label>Descrição / Sinopse</label>
            <textarea placeholder="Digite a sinopse ou descrição do livro..." value={bookDescription} onChange={e => setBookDescription(e.target.value)} rows={4} className={styles.formTextarea} />
          </div>

          {bookError && (
            <div className={styles.alertError}>
              <AlertCircle size={14} /> {bookError}
            </div>
          )}
          {bookMsg && (
            <div className={styles.alertSuccess}>
              <CheckCircle size={14} /> {bookMsg}
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" disabled={bookLoading} className={styles.submitBtn}>
              {bookLoading ? 'Salvando...' : (editingBookId ? 'Salvar Alterações' : 'Cadastrar Livro')}
            </button>
            <button type="button" onClick={clearForm} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  // view === 'list'
  const filteredBooks = books.filter(book => {
    const query = bookSearch.toLowerCase()
    return (
      book.title.toLowerCase().includes(query) ||
      book.category?.name.toLowerCase().includes(query) ||
      book.authors?.some(a => a.author.name.toLowerCase().includes(query))
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Catálogo de Livros</h2>
          <p className={styles.listSubtitle}>Gerencie e edite os livros cadastrados no acervo</p>
        </div>
        <div className={styles.listActions}>
          <button onClick={() => setView('categories')} className={styles.secondaryBtn}>
            Categorias
          </button>
          <button onClick={() => setView('form')} className={styles.primaryBtn}>
            + Cadastrar Livro
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input type="text" placeholder="Buscar por título, autor ou categoria..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} className={styles.searchInput} />
      </div>

      {isListLoading ? (
        <p className={styles.loadingText}>Carregando livros...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => {
                const authorStr = book.authors?.map(a => a.author.name).join(', ') || ''
                return (
                  <tr key={book.id}>
                    <td>
                      <img src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'} alt={book.title} className={styles.thumbImg} />
                    </td>
                    <td className={styles.titleCell}>{book.title}</td>
                    <td>{authorStr}</td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {book.category?.name}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEditBook(book)} className={styles.editBtn}>Editar</button>
                      <button onClick={() => handleDeleteBook(book.id, book.title)} className={styles.deleteBtn}>Remover</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
