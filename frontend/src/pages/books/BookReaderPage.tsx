import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import api from '../../services/api'
import styles from './BookReaderPage.module.css'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default function BookReaderPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const initialPage = parseInt(searchParams.get('page') || '1')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookId, setBookId] = useState('')
  const [bookTitle, setBookTitle] = useState('')

  // Carrega metadados e caminho do PDF
  useEffect(() => {
    if (!slug) return
    api.get(`/books/${slug}`).then(({ data }) => {
      const book = data.data
      setBookId(book.id)
      setBookTitle(book.title)
      loadPdf(`/api/books/${slug}/file`)
    }).catch(() => setError('Livro não encontrado.'))
  }, [slug])

  async function loadPdf(url: string) {
    setIsLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const pdf = await pdfjsLib.getDocument({
        url,
        httpHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      }).promise

      pdfRef.current = pdf
      setTotalPages(pdf.numPages)
      setCurrentPage(prev => Math.min(prev, pdf.numPages))
      setIsLoading(false)
    } catch {
      setError('Não foi possível carregar o arquivo PDF.')
      setIsLoading(false)
    }
  }

  // Renderiza página
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return

    // Cancela renderização anterior
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }

    try {
      const page = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!

      canvas.width = viewport.width
      canvas.height = viewport.height

      renderTaskRef.current = page.render({ canvasContext: ctx, viewport })
      await renderTaskRef.current.promise
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Erro ao renderizar página:', err)
      }
    }
  }, [scale])

  useEffect(() => {
    if (!isLoading && pdfRef.current) {
      renderPage(currentPage)
    }
  }, [currentPage, scale, isLoading, renderPage])

  // Sincroniza a referência da página atual para evitar disparos frequentes de useEffect
  const currentPageRef = useRef(currentPage)
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Salva progresso automaticamente de forma otimizada
  useEffect(() => {
    if (!bookId || !totalPages) return

    // Salva periodicamente a cada 20 segundos usando o valor da referência
    saveTimerRef.current = setInterval(() => {
      api.post(`/books/${bookId}/progress`, {
        currentPage: currentPageRef.current,
        totalPages,
        isFinished: currentPageRef.current === totalPages,
      }).catch(() => {}) // falha silenciosa
    }, 20000)

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
      // Salva uma única vez ao sair da página usando o valor da referência
      api.post(`/books/${bookId}/progress`, {
        currentPage: currentPageRef.current,
        totalPages,
        isFinished: currentPageRef.current === totalPages,
      }).catch(() => {}) // falha silenciosa
    }
  }, [bookId, totalPages])

  function goTo(page: number) {
    const p = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(p)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentPage + 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(currentPage - 1)
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <Link to={`/livros/${slug}`} className={styles.backLink}>
          ← Voltar ao livro
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.reader} tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Topbar do leitor */}
      <header className={styles.topbar}>
        <Link to={`/livros/${slug}`} className={styles.backBtn}>
          <ChevronLeft size={18} />
          <span className={styles.bookTitle}>{bookTitle}</span>
        </Link>

        <div className={styles.controls}>
          {/* Zoom */}
          <button
            className={styles.iconBtn}
            onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
            title="Diminuir zoom"
          >
            <ZoomOut size={16} />
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
          <button
            className={styles.iconBtn}
            onClick={() => setScale(s => Math.min(3, s + 0.2))}
            title="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setScale(1.2)}
            title="Resetar zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Paginação */}
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ArrowLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            <input
              type="number"
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={e => goTo(parseInt(e.target.value) || 1)}
              className={styles.pageInput}
            />
            <span>/ {totalPages}</span>
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Canvas do PDF */}
      <main className={styles.viewport}>
        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Carregando PDF...</p>
          </div>
        )}
        <div className={styles.canvasWrapper} style={{ display: isLoading ? 'none' : 'flex' }}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      </main>

      {/* Navegação por clique nas bordas */}
      <button
        className={`${styles.sideNav} ${styles.sideNavLeft}`}
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        <ArrowLeft size={20} />
      </button>
      <button
        className={`${styles.sideNav} ${styles.sideNavRight}`}
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Próxima página"
      >
        <ArrowRight size={20} />
      </button>

      {/* Barra de progresso */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: totalPages > 0 ? `${(currentPage / totalPages) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}
