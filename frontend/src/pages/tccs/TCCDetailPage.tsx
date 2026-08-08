import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BookOpen, User, Calendar, Eye, GraduationCap, Copy, Check, Hash, FileText } from 'lucide-react'
import { TccService } from '@/services/TccService'
import { useToast } from '@/contexts/ToastContext'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { TCC } from '@/types'
import styles from './TCCDetailPage.module.css'

export default function TCCDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [tcc, setTCC] = useState<(TCC & { related?: TCC[] }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [imgSrc, setImgSrc] = useState('')

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    TccService.getTccBySlug(slug)
      .then(data => {
        setTCC(data)
        setImgSrc(data.coverImage || '')
      })
      .catch(() => {
        toast.error('TCC não encontrado.')
        navigate('/tccs')
      })
      .finally(() => setIsLoading(false))
  }, [slug, navigate, toast])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link do TCC copiado para a área de transferência!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImageError = () => {
    if (tcc) {
      const fallback = `/covers/tcc-${tcc.slug}.svg`
      if (imgSrc !== fallback) {
        setImgSrc(fallback)
      }
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando trabalho acadêmico...</p>
      </div>
    )
  }

  if (!tcc) return null

  // Parse keywords JSON
  let keywordsList: string[] = []
  if (tcc.keywords) {
    try {
      keywordsList = JSON.parse(tcc.keywords)
    } catch {
      keywordsList = tcc.keywords.split(',').map(s => s.trim()).filter(Boolean)
    }
  }

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Trabalhos de Conclusão', to: '/tccs' },
          { label: tcc.title },
        ]}
      />

      <div className={styles.mainLayout}>
        {/* Lado Esquerdo - Miniatura/Capa e Botões rápidos */}
        <div className={styles.sidebar}>
          <div className={styles.coverContainer}>
            {imgSrc ? (
              <img src={imgSrc} alt={tcc.title} className={styles.coverImage} onError={handleImageError} />
            ) : (
              <div className={styles.coverFallback}>
                <FileText size={64} />
                <span>TCC</span>
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <a
              href={tcc.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.readBtn}
            >
              <BookOpen size={16} />
              Ler TCC completo
            </a>

            <button
              onClick={handleCopyLink}
              className={styles.copyBtn}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Lado Direito - Informações do TCC */}
        <div className={styles.detailsContent}>
          <div className={styles.headerInfo}>
            <div className={styles.badges}>
              {tcc.category && (
                <span className={styles.categoryBadge}>{tcc.category.name}</span>
              )}
              {tcc.course && (
                <span className={styles.courseBadge}>{tcc.course}</span>
              )}
            </div>

            <h1 className={styles.title}>{tcc.title}</h1>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <User size={16} />
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Autor(es)</span>
                  <span className={styles.metaValue}>{tcc.author?.name}</span>
                </div>
              </div>

              {tcc.advisorUser && (
                <div className={styles.metaItem}>
                  <GraduationCap size={16} />
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Orientador</span>
                    <span className={styles.metaValue}>{tcc.advisorUser.name}</span>
                  </div>
                </div>
              )}

              <div className={styles.metaItem}>
                <Calendar size={16} />
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Ano</span>
                  <span className={styles.metaValue}>{tcc.year}</span>
                </div>
              </div>

              <div className={styles.metaItem}>
                <Eye size={16} />
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Visualizações</span>
                  <span className={styles.metaValue}>{tcc.viewCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <section className={styles.section}>
            <h2>Resumo</h2>
            <div className={styles.abstract}>
              <p>{tcc.abstract || 'Este trabalho não possui resumo disponível.'}</p>
            </div>
          </section>

          {/* Palavras-chave */}
          {keywordsList.length > 0 && (
            <section className={styles.section}>
              <h2>Palavras-chave</h2>
              <div className={styles.keywordsGrid}>
                {keywordsList.map((word, idx) => (
                  <span key={idx} className={styles.keywordTag}>
                    <Hash size={12} /> {word}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Trabalhos Relacionados */}
      {tcc.related && tcc.related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2>TCCs Relacionados</h2>
          <div className={styles.relatedGrid}>
            {tcc.related.map(rel => {
              const relThumb = rel.coverImage || ''
              return (
                <Link key={rel.id} to={`/tccs/${rel.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedThumbContainer}>
                    {relThumb ? (
                      <img src={relThumb} alt={rel.title} className={styles.relatedThumb} />
                    ) : (
                      <div className={styles.relatedThumbFallback}>
                        <FileText size={20} />
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3 className={styles.relatedTitle}>{rel.title}</h3>
                    <span className={styles.relatedAuthor}>{rel.author?.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
