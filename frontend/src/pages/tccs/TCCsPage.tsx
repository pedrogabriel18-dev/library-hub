import { useEffect, useState, useCallback } from 'react'
import { Search, GraduationCap, X, Grid, List as ListIcon } from 'lucide-react'
import api from '../../services/api'
import { TCC } from '../../types'
import styles from './TCCsPage.module.css'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { TCCCard } from '../../components/common/TCCCard'

export default function TCCsPage() {
  const [tccs, setTCCs] = useState<TCC[]>([])
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [course, setCourse] = useState('')
  const [advisor, setAdvisor] = useState('')
  const [category, setCategory] = useState('')
  const [author, setAuthor] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // TCCCard in our new design system adapts to its container, so we don't necessarily 
  // need a strict grid vs list internal structural difference, just CSS layout difference.
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filterOptions, setFilterOptions] = useState<{
    years: number[]
    courses: string[]
    advisors: string[]
    categories: { name: string; slug: string }[]
    authors: string[]
  }>({
    years: [],
    courses: [],
    advisors: [],
    categories: [],
    authors: [],
  })

  // Carrega opções de filtro baseadas em todos os TCCs
  useEffect(() => {
    api.get('/tccs?limit=250')
      .then(({ data }) => {
        const list: TCC[] = data.data || []
        const uniqueYears = Array.from(new Set(list.map(t => t.year))).sort((a, b) => b - a)
        const uniqueCourses = Array.from(new Set(list.map(t => t.course).filter(Boolean))) as string[]
        const uniqueAdvisors = Array.from(new Set(list.map(t => t.advisorUser?.name).filter(Boolean))) as string[]
        
        const categoriesMap = new Map<string, string>()
        list.forEach(t => {
          if (t.category) categoriesMap.set(t.category.slug, t.category.name)
        })
        const uniqueCategories = Array.from(categoriesMap.entries()).map(([slug, name]) => ({ name, slug }))
        
        const uniqueAuthors = Array.from(new Set(list.map(t => t.author?.name).filter(Boolean))) as string[]

        setFilterOptions({
          years: uniqueYears,
          courses: uniqueCourses.sort(),
          advisors: uniqueAdvisors.sort(),
          categories: uniqueCategories.sort((a, b) => a.name.localeCompare(b.name)),
          authors: uniqueAuthors.sort(),
        })
      })
      .catch(err => console.error('Erro ao carregar filtros:', err))
  }, [])

  const fetchTCCs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (year) params.set('year', year)
      if (course) params.set('course', course)
      if (advisor) params.set('advisor', advisor)
      if (category) params.set('category', category)
      if (author) params.set('author', author)
      
      params.set('page', String(currentPage))
      params.set('limit', '12')

      const { data } = await api.get(`/tccs?${params}`)
      setTCCs(data.data || [])
      setTotalItems(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
      setTCCs([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }, [search, year, course, advisor, category, author, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, year, course, advisor, category, author])

  useEffect(() => {
    const timer = setTimeout(() => fetchTCCs(), 300)
    return () => clearTimeout(timer)
  }, [fetchTCCs])

  function clearAllFilters() {
    setSearch('')
    setYear('')
    setCourse('')
    setAdvisor('')
    setCategory('')
    setAuthor('')
  }

  const hasActiveFilters = search || year || course || advisor || category || author

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBadge}>
          <GraduationCap size={16} /> Produção Acadêmica
        </div>
        <h1 className={styles.headerTitle}>Trabalhos de Conclusão</h1>
        <p className={styles.headerSubtitle}>
          Repositório digital de TCCs e pesquisas acadêmicas.
        </p>
      </header>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por título, autor, orientador, palavras-chave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              autoComplete="off"
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')} aria-label="Limpar busca">
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
              title="Visualização em Grade"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.activeToggle : ''}`}
              title="Visualização em Lista"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className={styles.filterGrid}>
          <div className={styles.filterItem}>
            <label htmlFor="filter-year">Ano</label>
            <select id="filter-year" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Todos os anos</option>
              {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="filter-course">Curso</label>
            <select id="filter-course" value={course} onChange={e => setCourse(e.target.value)}>
              <option value="">Todos os cursos</option>
              {filterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="filter-advisor">Orientador</label>
            <select id="filter-advisor" value={advisor} onChange={e => setAdvisor(e.target.value)}>
              <option value="">Todos os orientadores</option>
              {filterOptions.advisors.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="filter-category">Categoria</label>
            <select id="filter-category" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Todas as categorias</option>
              {filterOptions.categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.filtersFooter}>
          <span className={styles.resultsCount}>
            {!isLoading && `${totalItems} resultado${totalItems !== 1 ? 's' : ''}`}
          </span>
          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearAllFilters}>
              <X size={12} /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : tccs.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhum TCC encontrado"
          description="Ajuste os filtros ou o termo de busca para encontrar o trabalho acadêmico desejado."
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      ) : (
        <>
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {tccs.map((tcc, i) => (
              <TCCCard key={tcc.id} tcc={tcc} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
