import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './InstitutionalPage.module.css'

export default function PrivacyPolicyPage() {
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
        Política de Privacidade
      </h1>
      <p className={styles.lastUpdated}>
        Última atualização: 09 de julho de 2026
      </p>

      <div className={styles.content}>
        <section>
          <h2>
            1. Introdução
          </h2>
          <p>
            Esta Política de Privacidade descreve como a plataforma <strong>LibraryHub</strong> realiza o tratamento de dados pessoais de seus usuários em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Nosso compromisso é garantir a transparência, privacidade e a segurança das informações tratadas no ambiente educacional.
          </p>
        </section>

        <section>
          <h2>
            2. Dados Coletados (Princípio da Necessidade)
          </h2>
          <p>
            A plataforma trata apenas as informações estritamente necessárias para o seu funcionamento básico, identificação de acessos e personalização da leitura. São coletados apenas:
          </p>
          <ul>
            <li><strong>Dados de Identificação:</strong> Nome completo, login institucional (usuário) e papel de acesso (aluno, bibliotecária, orientador ou desenvolvedor).</li>
            <li><strong>Dados de Vínculo Escolar:</strong> Curso e turma (quando aplicável).</li>
            <li><strong>Personalização do Perfil:</strong> Ilustração de avatar e cores do banner escolhidas pelo usuário.</li>
            <li><strong>Histórico e Atividades:</strong> Livros marcados como favoritos, progresso de leitura atual nos livros (página onde parou) e resenhas submetidas.</li>
            <li><strong>Estatísticas e Auditoria:</strong> Contadores de visualização de livros/TCCs e registros administrativos internos (logs) para segurança.</li>
          </ul>
        </section>

        <section>
          <h2>
            3. Dados NÃO Coletados
          </h2>
          <p>
            Para garantir a privacidade dos estudantes e funcionários, o sistema <strong>não armazena nem solicita</strong>:
          </p>
          <ul>
            <li>Documentos pessoais (como CPF, RG, etc.);</li>
            <li>Informações de contato pessoal externo (número de celular ou endereço residencial);</li>
            <li>Dados bancários, de pagamento ou informações comerciais;</li>
            <li>Geolocalização, biometria, informações de saúde ou qualquer outro dado pessoal sensível.</li>
          </ul>
        </section>

        <section>
          <h2>
            4. Finalidade do Tratamento
          </h2>
          <p>
            O tratamento de dados na plataforma possui bases exclusivamente <strong>educacionais e administrativas</strong>, sem qualquer finalidade comercial ou publicitária. Os dados são usados para:
          </p>
          <ul>
            <li>Autenticação de acesso com segurança e login individual;</li>
            <li>Funcionamento do leitor digital (marcando automaticamente a página onde o aluno parou a leitura);</li>
            <li>Envio de notificações de moderação sobre resenhas enviadas;</li>
            <li>Geração de dados estatísticos gerais para que a biblioteca da escola avalie o uso e demanda de livros e TCCs;</li>
            <li>Segurança da plataforma e registro de eventos de auditoria contra abusos técnicos.</li>
          </ul>
        </section>

        <section>
          <h2>
            5. Compartilhamento de Dados
          </h2>
          <p>
            Os dados salvos no sistema <strong>não são vendidos, alugados ou compartilhados com terceiros</strong>. O acesso às informações é restrito a funcionários autorizados da própria escola (Bibliotecária, Orientadores Pedagógicos e Desenvolvedores administradores) no estrito cumprimento de suas funções administrativas de suporte ao aluno.
          </p>
        </section>

        <section>
          <h2>
            6. Dados de Estudantes Menores de Idade
          </h2>
          <p>
            Dado que o acervo atende principalmente estudantes do Ensino Médio, o tratamento de seus dados ocorre no estrito contexto da prestação de serviços educacionais da instituição de ensino pública. O processamento é limitado ao indispensável para a viabilização das atividades pedagógicas, cumprimento do currículo escolar e fomento à leitura.
          </p>
        </section>

        <section>
          <h2>
            7. Links e Hospedagem Externa
          </h2>
          <p>
            Os arquivos de leitura de livros e TCCs são acessados por meio de links externos e permanecem armazenados em plataformas de armazenamento de arquivos em nuvem (como Google Drive ou Google Docs). Ao abrir esses documentos, o navegador redirecionará o usuário e este estará sujeito aos Termos e Políticas de Privacidade específicos dessas plataformas externas.
          </p>
        </section>

        <section>
          <h2>
            8. Segurança das Informações
          </h2>
          <p>
            Adotamos medidas organizacionais e técnicas para proteger suas informações pessoais:
          </p>
          <ul>
            <li>As senhas de acesso são armazenadas utilizando algoritmos de criptografia segura de via única (hash);</li>
            <li>A autenticação exige login e senha válidos;</li>
            <li>Há separação rigorosa de funções administrativas por níveis de acesso;</li>
            <li>A hospedagem e conexões com a API utilizam proteção de dados adequada.</li>
          </ul>
        </section>

        <section>
          <h2>
            9. Registros Administrativos (Logs)
          </h2>
          <p>
            Para garantir a integridade da plataforma e auditar ações administrativas, o sistema armazena logs administrativos confidenciais de determinados eventos (como login, logout, alteração de senhas, cadastro/exclusão de obras, moderação de resenhas e criação de contas de usuário). Estes registros são confidenciais e mantidos temporariamente apenas para suporte técnico e segurança.
          </p>
        </section>

        <section>
          <h2>
            10. Seus Direitos e Contato
          </h2>
          <p>
            Em conformidade com a LGPD, o titular de dados (ou seus responsáveis legais) tem o direito de solicitar informações sobre o tratamento, retificar dados incorretos ou solicitar a exclusão de sua conta. Para exercer esses direitos, o usuário pode entrar em contato diretamente com a equipe de administração do LibraryHub.
          </p>
        </section>
      </div>
    </div>
  )
}
