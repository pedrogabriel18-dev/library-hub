import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Star, ArrowRight, TrendingUp, Eye, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BookService } from '@/services/BookService'
import { TccService } from '@/services/TccService'
import { AnalyticsService, TrendingByTurmaResponse } from '@/services/AnalyticsService'
import { Book, TCC } from '@/types'
import { HeroSection } from '@/features/home/components/HeroSection'
import { QuickAccessGrid } from '@/features/home/components/QuickAccessGrid'
import { BookCard } from '@/components/common/BookCard'
import { TCCCard } from '@/components/common/TCCCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { user } = useAuth()
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([])
  const [trendingTccs, setTrendingTccs] = useState<TCC[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ books: 0, tccs: 0, downloads: 0 })

  const [selectedTurma, setSelectedTurma] = useState<string>(user?.turma || '3ª Técnico')
  const [turmaBooks, setTurmaBooks] = useState<Book[]>([])
  const [turmaTccs, setTurmaTccs] = useState<TCC[]>([])
  const [isTurmaLoading, setIsTurmaLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      BookService.listBooks({ limit: 4 }),
      BookService.listBooks({ limit: 4, sort: 'trending' }),
      TccService.listTccs({ limit: 4, sort: 'trending' }),
    ])
      .then(([booksRes, trendingBooksRes, trendingTccsRes]) => {
        setRecentBooks(booksRes.data || [])
        setTrendingBooks(trendingBooksRes.data || [])
        setTrendingTccs(trendingTccsRes.data || [])

        setStats({
          books: booksRes.pagination?.total || 0,
          tccs: trendingTccsRes.pagination?.total || 0,
          downloads: 0,
        })
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedTurma) return
    setIsTurmaLoading(true)
    AnalyticsService.getTrendingByTurma(selectedTurma)
      .then((res: TrendingByTurmaResponse) => {
        setTurmaBooks(res.books || [])
        setTurmaTccs(res.tccs || [])
      })
      .catch(() => {})
      .finally(() => setIsTurmaLoading(false))
  }, [selectedTurma])

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <HeroSection user={user} stats={stats} />

      {/* Acesso rápido */}
      <QuickAccessGrid />

      {/* Seção: Livros Em Alta */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={24} />
              Livros em Alta
            </h2>
            <p className={styles.sectionDesc}>As obras mais acessadas e lidas pelos estudantes</p>
          </div>
          <Link to="/livros" className={styles.seeAll}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : trendingBooks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum livro popular no momento"
            description="Explore o catálogo para ser o primeiro a ler novas obras."
          />
        ) : (
          <div className={styles.grid}>
            {trendingBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} showTrendBadge />
            ))}
          </div>
        )}
      </section>

      {/* Seção: TCCs em Destaque */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <Star size={24} />
              TCCs em Destaque
            </h2>
            <p className={styles.sectionDesc}>Trabalhos acadêmicos de destaque com maior número de leituras</p>
          </div>
          <Link to="/tccs" className={styles.seeAll}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : trendingTccs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum TCC popular no momento"
            description="Acesse a seção de Trabalhos de Conclusão para visualizar o acervo acadêmico."
          />
        ) : (
          <div className={styles.tccList}>
            {trendingTccs.map((tcc, i) => (
              <TCCCard key={tcc.id} tcc={tcc} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Seção: Destaques por Turma */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={24} />
              Destaques por Turma
            </h2>
            <p className={styles.sectionDesc}>Livros e TCCs mais acessados pelos alunos de cada série</p>
          </div>
          <div className={styles.turmaControls}>
            <span className={styles.turmaLabel}>Turma:</span>
            <select
              value={selectedTurma}
              onChange={e => setSelectedTurma(e.target.value)}
              className={styles.turmaSelect}
            >
              <option value="1ª Regular">1ª Regular</option>
              <option value="1ª Técnico">1ª Técnico</option>
              <option value="2ª Regular">2ª Regular</option>
              <option value="2ª Técnico">2ª Técnico</option>
              <option value="3ª Regular">3ª Regular</option>
              <option value="3ª Técnico">3ª Técnico</option>
            </select>
          </div>
        </div>

        {isTurmaLoading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className={styles.turmaGrid}>
            {/* Livros por turma */}
            <div className={styles.turmaColumn}>
              <h3 className={styles.turmaSubtitle}>Livros Mais Acessados</h3>
              {turmaBooks.length === 0 ? (
                <p className={styles.emptyTurma}>Nenhuma leitura registrada para esta turma.</p>
              ) : (
                <div className={styles.turmaBooksRow}>
                  {turmaBooks.slice(0, 5).map(book => (
                    <Link
                      key={book.id}
                      to={`/livros/${book.slug}`}
                      className={styles.turmaBookLink}
                    >
                      <div className={styles.turmaBookCover}>
                        <img src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'} alt={book.title} />
                      </div>
                      <span className={styles.turmaBookTitle} title={book.title}>{book.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* TCCs por turma */}
            <div className={styles.turmaColumn}>
              <h3 className={styles.turmaSubtitle}>TCCs Mais Consultados</h3>
              {turmaTccs.length === 0 ? (
                <p className={styles.emptyTurma}>Nenhuma consulta de TCC registrada para esta turma.</p>
              ) : (
                <div className={styles.turmaTccList}>
                  {turmaTccs.slice(0, 5).map(tcc => (
                    <Link
                      key={tcc.id}
                      to={`/tccs/${tcc.slug}`}
                      className={styles.turmaTccLink}
                    >
                      <span className={styles.turmaTccTitle} title={tcc.title}>{tcc.title}</span>
                      <div className={styles.turmaTccViews}>
                        <Eye size={14} /> {tcc.viewCount}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Seção: Adicionados Recentemente */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              Adicionados recentemente
            </h2>
            <p className={styles.sectionDesc}>As últimas publicações adicionadas à nossa biblioteca</p>
          </div>
          <Link to="/livros" className={styles.seeAll}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : recentBooks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum livro disponível no momento"
            description="O acervo está em processo de atualização."
          />
        ) : (
          <div className={styles.grid}>
            {recentBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
