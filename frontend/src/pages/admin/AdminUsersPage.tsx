import { useState } from 'react'
import { Edit2, Key, Trash2, UserCheck, UserX } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/services/UserService'
import { User } from '@/types'
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles'
import { UserFilterBar } from '@/features/users/components/UserFilterBar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import styles from './AdminUsersPage.module.css'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [turmaFilter, setTurmaFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const { users, isLoading, error, refetch, toggleActive, deleteUser } = useUsers({ search, limit: 1000 })

  // State Modais
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'reset'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formLogin, setFormLogin] = useState('')
  const [formRole, setFormRole] = useState<'STUDENT' | 'LIBRARIAN' | 'ADVISOR' | 'DEVELOPER'>('STUDENT')
  const [formPassword, setFormPassword] = useState('')
  const [formTurma, setFormTurma] = useState('')

  const openCreateModal = () => {
    setModalMode('create')
    setFormName('')
    setFormLogin('')
    setFormRole('STUDENT')
    setFormPassword('')
    setFormTurma('')
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (u: User) => {
    setModalMode('edit')
    setFormName(u.name)
    setFormLogin(u.login)
    setFormRole(u.role)
    setFormTurma(u.turma || '')
    setSelectedUser(u)
    setIsModalOpen(true)
  }

  const openResetModal = (u: User) => {
    setModalMode('reset')
    setFormPassword('')
    setSelectedUser(u)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const curso = formRole === 'STUDENT' && formTurma.toLowerCase().includes('técnico')
        ? 'Ensino Médio Técnico'
        : formRole === 'STUDENT' && formTurma
          ? 'Ensino Médio Regular'
          : undefined

      if (modalMode === 'create') {
        await UserService.createUser({
          name: formName,
          login: formLogin,
          role: formRole,
          password: formPassword || undefined,
          turma: formRole === 'STUDENT' ? formTurma : undefined,
          curso,
        })
      } else if (modalMode === 'edit' && selectedUser) {
        await UserService.updateUser(selectedUser.id, {
          name: formName,
          login: formLogin,
          role: formRole,
          turma: formRole === 'STUDENT' ? formTurma : undefined,
          curso,
        })
      } else if (modalMode === 'reset' && selectedUser) {
        await UserService.resetUserPassword(selectedUser.id, formPassword || undefined)
      }
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar usuário.')
    }
  }

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchTurma = turmaFilter === 'all' || u.turma === turmaFilter
    return matchRole && matchTurma
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gerenciamento de Usuários</h1>
        <p>Cadastre, edite permissões, altere senhas e ative ou desative contas de acesso.</p>
      </div>

      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        turmaFilter={turmaFilter}
        onTurmaChange={setTurmaFilter}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        onOpenCreateModal={openCreateModal}
      />

      {error && <div className={styles.errorAlert}>{error}</div>}

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome / Usuário</th>
                <th>Função</th>
                <th>Turma / Curso</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userInfoCell}>
                      <strong>{u.name}</strong>
                      <span>@{u.login}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.roleBadge} style={{ background: ROLE_COLORS[u.role] }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>{u.turma ? `${u.turma} (${u.curso || 'Ensino Médio'})` : '-'}</td>
                  <td>
                    <span className={u.isActive !== false ? styles.activeBadge : styles.inactiveBadge}>
                      {u.isActive !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actionsGroup}>
                      <button className={styles.actionIconBtn} onClick={() => openEditModal(u)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.actionIconBtn} onClick={() => openResetModal(u)} title="Redefinir Senha">
                        <Key size={16} />
                      </button>
                      <button
                        className={styles.actionIconBtn}
                        onClick={() => toggleActive(u.id, u.isActive !== false)}
                        title={u.isActive !== false ? 'Desativar' : 'Ativar'}
                      >
                        {u.isActive !== false ? <UserX size={16} color="var(--color-red-500)" /> : <UserCheck size={16} color="var(--color-green-500)" />}
                      </button>
                      {currentUser?.id !== u.id && (
                        <button className={styles.actionIconBtn} onClick={() => deleteUser(u.id)} title="Excluir">
                          <Trash2 size={16} color="var(--color-red-500)" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Unificado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Cadastrar Novo Usuário'
            : modalMode === 'edit'
            ? 'Editar Usuário'
            : 'Redefinir Senha'
        }
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {modalMode !== 'reset' ? (
            <>
              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Login / Matrícula</label>
                <input type="text" required value={formLogin} onChange={e => setFormLogin(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Função / Permissão</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value as any)}>
                  <option value="STUDENT">Aluno</option>
                  <option value="LIBRARIAN">Bibliotecária</option>
                  <option value="ADVISOR">Orientador</option>
                  <option value="DEVELOPER">Desenvolvedor</option>
                </select>
              </div>
              {formRole === 'STUDENT' && (
                <div className={styles.formGroup}>
                  <label>Turma</label>
                  <select value={formTurma} onChange={e => setFormTurma(e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="1ª Regular">1ª Regular</option>
                    <option value="1ª Técnico">1ª Técnico</option>
                    <option value="2ª Regular">2ª Regular</option>
                    <option value="2ª Técnico">2ª Técnico</option>
                    <option value="3ª Regular">3ª Regular</option>
                    <option value="3ª Técnico">3ª Técnico</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className={styles.formGroup}>
              <label>Nova Senha para {selectedUser?.name}</label>
              <input
                type="password"
                placeholder="Deixe em branco para usar a senha padrão"
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
              />
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn}>
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
