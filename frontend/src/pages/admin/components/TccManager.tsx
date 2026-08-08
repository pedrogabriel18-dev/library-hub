import { FormEvent, useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import api from '../../../services/api'
import styles from './BookManager.module.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface TccManagerProps {
  onStatsRefresh: () => void
}

export function TccManager({ onStatsRefresh }: TccManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [tccs, setTccs] = useState<any[]>([])
  const [tccSearch, setTccSearch] = useState('')
  const [isListLoading, setIsListLoading] = useState(false)

  // Form fields
  const [editingTccId, setEditingTccId] = useState<string | null>(null)
  const [tccTitle, setTccTitle] = useState('')
  const [tccAuthors, setTccAuthors] = useState('')
  const [tccAdvisor, setTccAdvisor] = useState('')
  const [tccYear, setTccYear] = useState('')
  const [tccUrl, setTccUrl] = useState('')
  const [tccCategory, setTccCategory] = useState('')
  const [tccCourse, setTccCourse] = useState('')
  const [tccCoverImage, setTccCoverImage] = useState('')
  const [tccKeywords, setTccKeywords] = useState('')
  const [tccDescription, setTccDescription] = useState('')
  
  const [tccMsg, setTccMsg] = useState('')
  const [tccError, setTccError] = useState('')
  const [tccLoading, setTccLoading] = useState(false)
  const [tccAutoImportLoading, setTccAutoImportLoading] = useState(false)

  const fetchTccs = useCallback(async () => {
    setIsListLoading(true)
    try {
      const { data } = await api.get('/tccs?limit=100')
      setTccs(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsListLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTccs()
  }, [fetchTccs])

  function clearForm() {
    setTccTitle('')
    setTccAuthors('')
    setTccAdvisor('')
    setTccYear('')
    setTccUrl('')
    setTccCategory('')
    setTccCourse('')
    setTccCoverImage('')
    setTccKeywords('')
    setTccDescription('')
    setTccMsg('')
    setTccError('')
    setEditingTccId(null)
    setShowForm(false)
  }

  function handleEditTcc(tcc: any) {
    setTccTitle(tcc.title)
    setTccAuthors(tcc.author?.name || '')
    setTccAdvisor(tcc.advisorUser?.name || '')
    setTccYear(tcc.year ? String(tcc.year) : '')
    setTccUrl(tcc.filePath)
    setTccCategory(tcc.category?.name || '')
    setTccCourse(tcc.course || '')
    setTccCoverImage(tcc.coverImage || '')
    
    let keys = ''
    if (tcc.keywords) {
      try {
        const parsed = JSON.parse(tcc.keywords)
        keys = Array.isArray(parsed) ? parsed.join(', ') : String(tcc.keywords)
      } catch {
        keys = String(tcc.keywords)
      }
    }
    setTccKeywords(keys)
    setTccDescription(tcc.abstract || '')
    
    setEditingTccId(tcc.id)
    setShowForm(true)
  }

  async function handleDeleteTcc(id: string, title: string) {
    if (!window.confirm(`Tem certeza que deseja remover o TCC "${title}"?`)) return
    try {
      await api.delete(`/admin/tccs/${id}`)
      fetchTccs()
      onStatsRefresh()
      alert('TCC removido com sucesso!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover o TCC.')
    }
  }

  async function handleAutoImport() {
    if (!tccUrl) {
      setTccError('Por favor, informe a URL do documento primeiro.')
      return
    }
    setTccError('')
    setTccMsg('')
    setTccAutoImportLoading(true)
    try {
      setTccMsg('Buscando documento e extraindo metadados...')
      const res = await api.post('/admin/auto-import', { url: tccUrl, type: 'tcc' })
      const { tempFileId, metadata } = res.data.data

      setTccTitle(metadata.title || '')
      setTccAuthors(Array.isArray(metadata.authors) ? metadata.authors.join(', ') : metadata.authors || '')
      setTccAdvisor(metadata.advisor || '')
      setTccYear(metadata.year ? metadata.year.toString() : new Date().getFullYear().toString())
      setTccCategory(metadata.category || 'Tecnologia')
      setTccCourse(metadata.course || '')
      setTccKeywords(Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords || '')
      setTccDescription(metadata.description || '')

      setTccMsg('Documento importado. Gerando capa...')
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
        slug: metadata.title || 'tcc',
        type: 'tcc',
      })

      setTccCoverImage(saveRes.data.data.coverPath)
      setTccMsg('Informações importadas e capa gerada com sucesso!')
    } catch (err: any) {
      console.error(err)
      setTccError(err.response?.data?.message || err.message || 'Erro ao importar dados do documento.')
    } finally {
      setTccAutoImportLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTccError('')
    setTccMsg('')
    setTccLoading(true)
    try {
      const payload = {
        title: tccTitle,
        authors: tccAuthors,
        advisor: tccAdvisor || undefined,
        year: tccYear ? parseInt(tccYear) : 2026,
        url: tccUrl,
        category: tccCategory || undefined,
        course: tccCourse || undefined,
        coverImage: tccCoverImage || undefined,
        keywords: tccKeywords || undefined,
        description: tccDescription,
      }
      if (editingTccId) {
        await api.put(`/admin/tccs/${editingTccId}`, payload)
        setTccMsg('TCC atualizado com sucesso!')
      } else {
        await api.post('/admin/tccs', payload)
        setTccMsg('TCC cadastrado com sucesso!')
      }
      clearForm()
      fetchTccs()
      onStatsRefresh()
    } catch (err: any) {
      setTccError(err.response?.data?.message || 'Erro ao salvar o TCC.')
    } finally {
      setTccLoading(false)
    }
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {editingTccId ? 'Editar TCC' : 'Cadastrar Novo TCC'}
          </h2>
          <p className={styles.formSubtitle}>
            {editingTccId ? 'Atualize as informações do TCC no acervo' : 'Cadastre um Trabalho de Conclusão de Curso informando a URL externa'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* URL + Auto-import */}
          <div className={styles.formGroup}>
            <label>URL do Trabalho (Link)</label>
            <div className={styles.inputWithAction}>
              <input type="url" placeholder="https://docs.google.com/document/d/ID/edit" value={tccUrl}
                onChange={e => setTccUrl(e.target.value)} required
                className={styles.formInput} />
              <button type="button" disabled={tccAutoImportLoading} onClick={handleAutoImport}
                className={styles.actionBtn}>
                {tccAutoImportLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Título */}
          <div className={styles.formGroup}>
            <label>Título do Trabalho</label>
            <input type="text" placeholder="Título do TCC" value={tccTitle} onChange={e => setTccTitle(e.target.value)} required
              className={styles.formInput} />
          </div>

          {/* Autores */}
          <div className={styles.formGroup}>
            <label>Autores</label>
            <input type="text" placeholder="Nome do(s) autor(es), separados por vírgula" value={tccAuthors}
              onChange={e => setTccAuthors(e.target.value)} required
              className={styles.formInput} />
          </div>

          {/* Ano + Orientador */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ano</label>
              <input type="number" placeholder="Ex: 2026" value={tccYear} onChange={e => setTccYear(e.target.value)} required
                className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label>Orientador</label>
              <input type="text" placeholder="Nome do professor orientador" value={tccAdvisor}
                onChange={e => setTccAdvisor(e.target.value)}
                className={styles.formInput} />
            </div>
          </div>

          {/* Categoria + Curso */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoria</label>
              <input type="text" placeholder="Ex: Tecnologia, Ciências" value={tccCategory} onChange={e => setTccCategory(e.target.value)}
                className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label>Curso</label>
              <input type="text" placeholder="Ex: Técnico em Informática" value={tccCourse} onChange={e => setTccCourse(e.target.value)}
                className={styles.formInput} />
            </div>
          </div>

          {/* Capa + Palavras-chave */}
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>URL da Capa / Miniatura (opcional)</label>
              {tccCoverImage && (tccCoverImage.startsWith('/covers/tcc-') || tccCoverImage.includes('.svg')) ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capa Gerada Automaticamente</span>
              ) : tccCoverImage ? (
                <button 
                  type="button" 
                  onClick={() => setTccCoverImage('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Restaurar capa automática
                </button>
              ) : null}
            </div>
            <input type="text" placeholder="Ex: /covers/meu-tcc.jpg" value={tccCoverImage} onChange={e => setTccCoverImage(e.target.value)}
              className={styles.formInput} />
          </div>

          <div className={styles.formGroup}>
            <label>Palavras-chave (separadas por vírgula)</label>
            <input type="text" placeholder="Ex: React, Web, IoT, Acessibilidade" value={tccKeywords} onChange={e => setTccKeywords(e.target.value)}
              className={styles.formInput} />
          </div>

          {/* Resumo */}
          <div className={styles.formGroup}>
            <label>Resumo / Abstract</label>
            <textarea placeholder="Digite o resumo ou abstract do TCC..." value={tccDescription}
              onChange={e => setTccDescription(e.target.value)} rows={4}
              className={styles.formTextarea} />
          </div>

          {tccError && (
            <div className={styles.alertError}>
              <AlertCircle size={14} /> {tccError}
            </div>
          )}
          {tccMsg && (
            <div className={styles.alertSuccess}>
              <CheckCircle size={14} /> {tccMsg}
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" disabled={tccLoading}
              className={styles.submitBtn}>
              {tccLoading ? 'Salvando...' : (editingTccId ? 'Salvar Alterações' : 'Cadastrar TCC')}
            </button>
            <button type="button" onClick={clearForm}
              className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Lista de TCCs ─────────────────────────────────────────────────────────
  const filteredTccs = tccs.filter(tcc => {
    const query = tccSearch.toLowerCase()
    return (
      tcc.title.toLowerCase().includes(query) ||
      tcc.author?.name.toLowerCase().includes(query) ||
      tcc.advisorUser?.name?.toLowerCase().includes(query)
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Trabalhos de Conclusão de Curso</h2>
          <p className={styles.listSubtitle}>Gerencie e edite os TCCs cadastrados no acervo</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className={styles.primaryBtn}>
          + Cadastrar TCC
        </button>
      </div>

      <div className={styles.searchBar}>
        <input type="text" placeholder="Buscar por título, autor, orientador..." value={tccSearch}
          onChange={e => setTccSearch(e.target.value)}
          className={styles.searchInput} />
      </div>

      {isListLoading ? (
        <p className={styles.loadingText}>Carregando TCCs...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Miniatura</th>
                <th>Título</th>
                <th>Autor(es)</th>
                <th>Orientador</th>
                <th>Ano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTccs.map(tcc => {
                const thumb = tcc.coverImage || ''
                return (
                  <tr key={tcc.id}>
                    <td>
                      {thumb ? (
                        <img src={thumb} alt="" className={styles.thumbImg} />
                      ) : (
                        <div className={styles.thumbImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <span style={{ fontSize: 8, fontWeight: 'bold' }}>TCC</span>
                        </div>
                      )}
                    </td>
                    <td className={styles.titleCell}>{tcc.title}</td>
                    <td>{tcc.author?.name}</td>
                    <td>{tcc.advisorUser?.name || 'Não informado'}</td>
                    <td>{tcc.year}</td>
                    <td>
                      <button onClick={() => handleEditTcc(tcc)} className={styles.editBtn}>Editar</button>
                      <button onClick={() => handleDeleteTcc(tcc.id, tcc.title)} className={styles.deleteBtn}>Remover</button>
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
