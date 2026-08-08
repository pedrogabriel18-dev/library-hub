import { Search, Plus } from 'lucide-react'
import styles from '../../../pages/admin/AdminUsersPage.module.css'

export interface UserFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  turmaFilter: string
  onTurmaChange: (value: string) => void
  roleFilter: string
  onRoleChange: (value: string) => void
  onOpenCreateModal: () => void
}

export function UserFilterBar({
  search,
  onSearchChange,
  turmaFilter,
  onTurmaChange,
  roleFilter,
  onRoleChange,
  onOpenCreateModal,
}: UserFilterBarProps) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.searchBox}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou matricula..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.filtersGroup}>
        <select value={roleFilter} onChange={e => onRoleChange(e.target.value)} className={styles.selectFilter}>
          <option value="all">Todas as funções</option>
          <option value="STUDENT">Alunos</option>
          <option value="LIBRARIAN">Bibliotecárias</option>
          <option value="ADVISOR">Orientadores</option>
          <option value="DEVELOPER">Desenvolvedores</option>
        </select>

        <select value={turmaFilter} onChange={e => onTurmaChange(e.target.value)} className={styles.selectFilter}>
          <option value="all">Todas as turmas</option>
          <option value="1ª Regular">1ª Regular</option>
          <option value="1ª Técnico">1ª Técnico</option>
          <option value="2ª Regular">2ª Regular</option>
          <option value="2ª Técnico">2ª Técnico</option>
          <option value="3ª Regular">3ª Regular</option>
          <option value="3ª Técnico">3ª Técnico</option>
        </select>

        <button className={styles.createBtn} onClick={onOpenCreateModal}>
          <Plus size={18} /> Novo Usuário
        </button>
      </div>
    </div>
  )
}
