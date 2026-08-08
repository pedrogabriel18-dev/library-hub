import {
  BookOpen, Code2, Database, Server, Layers, Cpu,
  Award, Globe, CheckCircle2
} from 'lucide-react'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import styles from './AboutPage.module.css'

const DEMO_ACCOUNTS = [
  {
    role: 'Estudante',
    login: 'aluno.teste',
    badge: 'Aluno / Leitor',
    desc: 'Permite buscar livros, ler PDFs no leitor imersivo, favoritar obras e enviar resenhas.',
    color: 'var(--primary)',
  },
  {
    role: 'Bibliotecária',
    login: 'biblio.teste',
    badge: 'Bibliotecária',
    desc: 'Permite gerenciar livros, categorias, moderar resenhas e consultar estatísticas de leitura.',
    color: 'var(--accent)',
  },
  {
    role: 'Orientador',
    login: 'orientador.teste',
    badge: 'Professor Orientador',
    desc: 'Permite gerenciar TCCs acadêmicos, orientar pesquisas e moderar resenhas.',
    color: 'var(--warning-text)',
  },
  {
    role: 'Desenvolvedor',
    login: 'admin.teste',
    badge: 'Administrador / Admin',
    desc: 'Acesso total ao sistema, gestão de usuários, papéis RBAC e logs de auditoria.',
    color: 'var(--error-text)',
  },
]

const DIFFERENTIALS = [
  {
    title: 'Arquitetura Modular Desacoplada',
    desc: 'Separação estrita em camadas de serviços REST, custom hooks e módulos por domínio (features/).',
  },
  {
    title: 'Segurança & Controle de Acesso RBAC',
    desc: 'Proteção JWT, senhas com hash bcrypt (salt 10), Rate Limiting e prevenção contra XSS/SQL Injection.',
  },
  {
    title: 'Acessibilidade Nativa (WCAG AA)',
    desc: 'Suporte a Tema Claro, Escuro e Alto Contraste, anel de foco :focus-visible e navegação 100% por teclado.',
  },
  {
    title: 'PWA & Suporte Offline',
    desc: 'Web App Manifest, Service Worker com cache Stale-While-Revalidate e indicador de conectividade.',
  },
  {
    title: '52 Testes Automatizados no Vitest',
    desc: 'Suíte de testes de integração cobrindo fluxos de autenticação, segurança, autorização e acervo.',
  },
  {
    title: 'Privacidade & Conformidade LGPD',
    desc: 'Anonimização de IPs nos logs de sistema, banner de consentimento e políticas institucionais transparentes.',
  },
]

const TECH = [
  { icon: Code2,    label: 'React 18',        desc: 'SPA com Vite + Code Splitting', color: 'var(--primary)' },
  { icon: Layers,   label: 'TypeScript 5',    desc: 'Tipagem estática de ponta a ponta', color: 'var(--accent)' },
  { icon: Cpu,      label: 'Vanilla CSS Tokens', desc: 'Design System responsivo nativo', color: 'var(--text-primary)' },
  { icon: Server,   label: 'Node.js + Express', desc: 'API RESTful com middlewares', color: 'var(--success)' },
  { icon: Database, label: 'SQLite + Prisma', desc: 'ORM relacional e banco nativo', color: '#44a8b3' },
  { icon: BookOpen, label: 'PDF.js',          desc: 'Leitor imersivo de PDF', color: 'var(--primary)' },
  { icon: Award,    label: 'Docker & Compose', desc: 'Containerização em produção', color: '#2496ed' },
  { icon: Globe,    label: 'Licença MIT',     desc: 'Software Livre Open Source', color: 'var(--success)' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Sobre o Projeto' }]} />

      {/* Hero institucional */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <BookOpen size={14} />
            LibraryHub — Gestão de Acervo Educacional
          </div>
          <h1 className={styles.heroTitle}>
            Apresentação do Projeto & Portfólio
          </h1>
          <p className={styles.heroSubtitle}>
            Uma plataforma moderna, segura, acessível e resiliente desenvolvida para transformar a gestão de bibliotecas escolares e acervos acadêmicos.
          </p>
        </div>
      </section>

      {/* Contas de Demonstração */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Demonstração ao Vivo</div>
        <h2 className={styles.sectionTitle}>Perfis de Teste Prontos para Uso</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)', fontSize: 'var(--text-sm)' }}>
          Para testar e demonstrar as diferentes permissões do sistema, utilize a senha padronizada <strong style={{ color: 'var(--text-primary)' }}>Senha@123</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
          {DEMO_ACCOUNTS.map(acc => (
            <div
              key={acc.role}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'var(--weight-bold)', color: acc.color, fontSize: 'var(--text-base)' }}>{acc.role}</span>
                <span style={{ fontSize: 'var(--text-xs)', padding: 'var(--sp-1) var(--sp-2)', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                  {acc.badge}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <strong>Login:</strong> <code style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: 'var(--sp-1) var(--sp-2)', borderRadius: 'var(--radius-sm)' }}>{acc.login}</code>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {acc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais Técnicos */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Diferenciais de Engenharia</div>
        <h2 className={styles.sectionTitle}>Padrões Profissionais Implementados</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
          {DIFFERENTIALS.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-5)',
                display: 'flex',
                gap: 'var(--sp-4)',
                alignItems: 'flex-start',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <CheckCircle2 size={24} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', margin: '0 0 var(--sp-2) 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack de Tecnologias */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Tecnologias</div>
        <h2 className={styles.sectionTitle}>Matriz Tecnológica do Projeto</h2>
        <div className={styles.techGrid}>
          {TECH.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className={styles.techCard}>
              <div className={styles.techIcon} style={{ color }}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className={styles.techLabel}>{label}</p>
                <p className={styles.techDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
