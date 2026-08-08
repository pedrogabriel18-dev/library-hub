import { FormEvent, useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
import api from '../../../services/api'
import styles from './CategoryManager.module.css'

interface Category {
  id: string
  name: string
  _count?: { books: number }
}

interface CategoryManagerProps {
  onBack: () => void
  onCategoriesChange: () => void
}

export function CategoryManager({ onBack, onCategoriesChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!categoryName.trim()) return
    setLoading(true)
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, { name: categoryName })
        alert('Categoria atualizada com sucesso!')
      } else {
        await api.post('/admin/categories', { name: categoryName })
        alert('Categoria criada com sucesso!')
      }
      setCategoryName('')
      setEditingId(null)
      await fetchCategories()
      onCategoriesChange()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar categoria.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(cat: Category) {
    setCategoryName(cat.name)
    setEditingId(cat.id)
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return
    try {
      await api.delete(`/admin/categories/${id}`)
      alert('Categoria excluída com sucesso!')
      await fetchCategories()
      onCategoriesChange()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir categoria. Certifique-se de que não há livros vinculados a ela.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={onBack}
          className={styles.backBtn}
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className={styles.title}>Gerenciar Categorias</h2>
          <p className={styles.subtitle}>Crie, renomeie ou remova as categorias do acervo</p>
        </div>
      </div>

      <div className={styles.contentLayout}>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.formTitle}>
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <div className={styles.formGroup}>
            <label>Nome da Categoria</label>
            <input
              type="text"
              placeholder="Ex: Física Quântica"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setCategoryName(''); setEditingId(null) }}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Lista */}
        <div>
          <h3 className={styles.listSectionTitle}>Categorias Cadastradas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Livros</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td>{cat._count?.books || 0}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(cat)}
                        className={styles.editBtn}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className={styles.deleteBtn}
                        title="Excluir"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
