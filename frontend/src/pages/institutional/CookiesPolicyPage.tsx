import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './InstitutionalPage.module.css'

export default function CookiesPolicyPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate(-1)}
        className={styles.backBtn}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className={styles.title}>
        Política de Cookies
      </h1>
      <p className={styles.lastUpdated}>
        Última atualização: 09 de julho de 2026
      </p>

      <div className={styles.content}>
        <section>
          <h2>
            1. O que são Cookies?
          </h2>
          <p>
            Cookies são pequenos arquivos de texto criados no seu navegador pelo site visitado. Eles servem para guardar informações 
            temporárias de navegação, permitindo que a plataforma funcione de maneira adequada e lembre de suas escolhas.
          </p>
        </section>

        <section>
          <h2>
            2. Como utilizamos os Cookies?
          </h2>
          <p>
            No <strong>LibraryHub</strong>, utilizamos <strong>exclusivamente cookies estritamente necessários</strong>. Estes cookies são indispensáveis para o funcionamento, segurança e acessibilidade do sistema:
          </p>
          <ul>
            <li>
              <strong>Autenticação:</strong> Permite que o usuário permaneça conectado na plataforma com segurança após informar seu login e senha.
            </li>
            <li>
              <strong>Manutenção de Sessão:</strong> Garante que sua navegação permaneça íntegra entre as páginas do acervo escolar.
            </li>
            <li>
              <strong>Preferências de Tema:</strong> Registra se você prefere visualizar o site no Modo Claro ou no Modo Escuro.
            </li>
            <li>
              <strong>Configurações de Acessibilidade:</strong> Memoriza se o Modo de Alto Contraste está ativo ou inativo.
            </li>
            <li>
              <strong>Personalização de Perfil:</strong> Lembra as escolhas de avatar e personalização visual feitas na aba correspondente do seu Perfil.
            </li>
            <li>
              <strong>Preferências de Consentimento:</strong> Salva a informação de que você aceitou ou configurou a própria política de cookies do sistema.
            </li>
          </ul>
        </section>

        <section>
          <h2>
            3. Sem Cookies de Rastreamento, Marketing ou Publicidade
          </h2>
          <p>
            Por se tratar de uma plataforma de apoio educacional open source, o <strong>LibraryHub não utiliza</strong>:
          </p>
          <ul>
            <li>Cookies de marketing, publicidade ou remarketing;</li>
            <li>Cookies de terceiros para rastrear comportamento de consumo do usuário;</li>
            <li>Sistemas de anúncios ou ferramentas que vendam ou compartilhem seus padrões de navegação com finalidades comerciais.</li>
          </ul>
        </section>

        <section>
          <h2>
            4. Gerenciamento e Limpeza
          </h2>
          <p>
            Uma vez que todos os cookies utilizados são estritamente necessários para o funcionamento da sua conta escolar, a sua desativação direta nas configurações do navegador poderá inviabilizar recursos vitais (como o login e a personalização de leitura).
          </p>
          <p style={{ marginTop: 'var(--sp-2)' }}>
            Caso queira redefinir as preferências e visualizar novamente o banner de consentimento de cookies da plataforma, basta limpar os cookies e o cache local do seu navegador referentes a este site.
          </p>
        </section>
      </div>
    </div>
  )
}
