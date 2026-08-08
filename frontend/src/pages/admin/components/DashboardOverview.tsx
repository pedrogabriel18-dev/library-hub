import { Link } from 'react-router-dom'
import {
  Users, BookOpen, FileText, Download, BookMarked,
  TrendingUp, AlertCircle, CheckCircle, Award, type LucideIcon,
} from 'lucide-react'
import { DashboardStats, Book, TCC } from '../../../types'
import styles from './DashboardOverview.module.css'

// ── Ranking Livros ────────────────────────────────────────────────────────────
function BookRankSection({
  title, icon: Icon, books, metric, metricLabel,
}: {
  title: string
  icon: LucideIcon
  books: Book[]
  metric: keyof Book
  metricLabel: string
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Icon size={18} /> {title}
      </h2>
      <div className={styles.listContainer}>
        {books.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhum livro listado.</p>
        ) : (
          books.map((book, i) => (
            <div key={book.id} className={styles.listItem}>
              <span className={styles.listRank}>{i + 1}</span>
              <img
                src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'}
                alt={book.title}
                className={styles.listThumb}
              />
              <div className={styles.listInfo}>
                <p className={styles.listTitle}>{book.title}</p>
                <p className={styles.listMeta}>
                  {metric === 'avgRating'
                    ? `★ ${(book.avgRating || 0).toFixed(1)} / 5.0 (${book.ratingCount || 0} avaliações)`
                    : `${book[metric] as number} ${metricLabel}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

// ── Ranking TCCs ─────────────────────────────────────────────────────────────
function TccRankSection({ title, icon: Icon, tccs }: {
  title: string
  icon: LucideIcon
  tccs: TCC[]
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Icon size={18} /> {title}
      </h2>
      <div className={styles.listContainer}>
        {tccs.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhum TCC listado.</p>
        ) : (
          tccs.map((tcc, i) => (
            <div key={tcc.id} className={styles.listItem}>
              <span className={styles.listRank}>{i + 1}</span>
              <div className={styles.listThumbFallback}>
                <FileText size={16} />
              </div>
              <div className={styles.listInfo}>
                <p className={styles.listTitle}>{tcc.title}</p>
                <p className={styles.listMeta}>
                  {tcc.viewCount} acessos
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

// ── Componente Principal ─────────────────────────────────────────────────────
interface DashboardOverviewProps {
  stats: DashboardStats
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    { label: 'Usuários ativos', value: stats.totals.totalUsers, icon: Users, cssVar: 'var(--color-blue-500)' },
    { label: 'Livros publicados', value: stats.totals.totalBooks, icon: BookOpen, cssVar: 'var(--color-green-500)' },
    { label: 'TCCs publicados', value: stats.totals.totalTCCs, icon: FileText, cssVar: 'var(--color-purple-500)' },
    { label: 'Leituras hoje', value: stats.totals.readingsToday || 0, icon: TrendingUp, cssVar: 'var(--color-emerald-500)' },
    { label: 'Avaliações pendentes', value: stats.totals.pendingReviews, icon: BookMarked, cssVar: 'var(--color-red-500)', alert: stats.totals.pendingReviews > 0, link: '/admin/moderacao' },
    { label: 'Avaliações aprovadas', value: stats.totals.approvedReviews || 0, icon: CheckCircle, cssVar: 'var(--color-green-500)', link: '/admin/moderacao' },
    { label: 'Avaliações recusadas', value: stats.totals.rejectedReviews || 0, icon: AlertCircle, cssVar: 'var(--color-orange-500)', link: '/admin/moderacao' },
  ]

  return (
    <>
      {/* Cards de estatísticas */}
      <div className={styles.statsGrid}>
        {cards.map(card => {
          const Inner = (
            <div
              key={card.label}
              className={styles.statCard}
              style={{
                borderColor: card.alert ? card.cssVar : undefined
              }}
            >
              <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>
                  {card.label}
                </span>
                <div
                  className={styles.statCardIcon}
                  style={{
                    color: card.cssVar,
                    background: `color-mix(in srgb, ${card.cssVar} 15%, transparent)`
                  }}
                >
                  <card.icon size={18} />
                </div>
              </div>
              <span
                className={styles.statCardValue}
                style={{ color: card.alert ? card.cssVar : 'var(--text-primary)' }}
              >
                {card.value}
              </span>
              {card.alert && (
                <span
                  className={styles.statCardAlert}
                  style={{ color: card.cssVar }}
                >
                  Aguardando moderação &rarr;
                </span>
              )}
            </div>
          )
          return card.link ? <Link key={card.label} to={card.link} style={{ textDecoration: 'none' }}>{Inner}</Link> : Inner
        })}
      </div>

      {/* Rankings */}
      <div className={styles.rankingsGrid}>
        <BookRankSection title="Livros mais acessados" icon={TrendingUp} books={stats.mostAccessedBooks} metric="viewCount" metricLabel="acessos" />
        <TccRankSection title="TCCs mais acessados" icon={TrendingUp} tccs={stats.mostAccessedTccs || []} />
        <BookRankSection title="Livros mais baixados" icon={Download} books={stats.mostDownloadedBooks} metric="downloadCount" metricLabel="downloads" />
        <BookRankSection title="Livros mais bem avaliados" icon={Award} books={stats.highestRatedBooks || []} metric="avgRating" metricLabel="estrelas" />
      </div>

      {/* Últimos Adicionados */}
      <div className={styles.rankingsGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BookOpen size={18} /> Últimos Livros Adicionados
          </h2>
          <div className={styles.listContainer}>
            {stats.recentBooks && stats.recentBooks.length > 0 ? (
              stats.recentBooks.map((book: any) => (
                <div key={book.id} className={styles.listItem}>
                  <img
                    src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'}
                    alt={book.title}
                    className={styles.listThumb}
                  />
                  <div className={styles.listInfo}>
                    <p className={styles.listTitle}>{book.title}</p>
                    <p className={styles.listMeta}>
                      {book.category?.name || 'Geral'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhum livro adicionado.</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FileText size={18} /> Últimos TCCs Adicionados
          </h2>
          <div className={styles.listContainer}>
            {stats.recentTccs && stats.recentTccs.length > 0 ? (
              stats.recentTccs.map((tcc: any) => (
                <div key={tcc.id} className={styles.listItem}>
                  <div className={styles.listThumbFallback}>
                    <FileText size={16} />
                  </div>
                  <div className={styles.listInfo}>
                    <p className={styles.listTitle}>{tcc.title}</p>
                    <p className={styles.listMeta}>Ano: {tcc.year}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhum TCC adicionado.</p>
            )}
          </div>
        </section>
      </div>

      {/* Logs recentes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Atividade recente</h2>
        <div className={styles.listContainer}>
          {stats.recentLogs.slice(0, 10).map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logDot} />
              <p className={styles.logText}>
                {log.user?.name || 'Sistema'} &mdash; {log.description || log.action}
              </p>
              <span className={styles.logTime}>
                {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
