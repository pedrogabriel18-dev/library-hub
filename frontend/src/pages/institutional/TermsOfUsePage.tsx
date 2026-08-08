import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './InstitutionalPage.module.css'

export default function TermsOfUsePage() {
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
        Termos de Uso
      </h1>
      <p className={styles.lastUpdated}>
        Última atualização: 09 de julho de 2026
      </p>

      <div className={styles.content}>
        <section>
          <h2>
            1. Aceite dos Termos e Finalidade
          </h2>
          <p>
            Ao utilizar a plataforma <strong>LibraryHub</strong>, o usuário declara estar ciente e de acordo com as regras estabelecidas neste documento. A plataforma possui finalidade exclusivamente <strong>pedagógica, acadêmica e educacional</strong>, destinando-se a apoiar a comunidade escolar, estudantes, professores e pesquisadores.
          </p>
        </section>

        <section>
          <h2>
            2. Uso Permitido do Acervo
          </h2>
          <p>
            O usuário compromete-se a utilizar as obras literárias e os Trabalhos de Conclusão de Curso (TCCs) apenas para leitura pessoal, pesquisas acadêmicas e atividades didáticas. É expressamente proibido:
          </p>
          <ul>
            <li>Modificar, vender, comercializar ou distribuir de forma lucrativa qualquer arquivo disponível na plataforma;</li>
            <li>Remover ou alterar informações de autoria e direitos autorais contidas nos documentos;</li>
            <li>Utilizar métodos automatizados (robôs ou scrapers) para extrair dados ou arquivos em massa do sistema.</li>
          </ul>
        </section>

        <section>
          <h2>
            3. Envio de Resenhas e Moderação de Conteúdo
          </h2>
          <p>
            A plataforma permite aos estudantes escrever comentários e avaliações sobre os livros lidos. Estas resenhas devem obedecer aos princípios do respeito e da ética educacional:
          </p>
          <ul>
            <li>É vedada a submissão de textos com termos ofensivos, linguagem inapropriada, spam, propaganda ou ataques pessoais;</li>
            <li>Todas as resenhas submetidas passam por moderação de bibliotecários e administradores antes de serem exibidas no feed público;</li>
            <li>Resenhas impróprias serão rejeitadas ou permanentemente excluídas por moderadores autorizados.</li>
          </ul>
        </section>

        <section>
          <h2>
            4. Responsabilidade pelas Credenciais de Acesso
          </h2>
          <p>
            O acesso do usuário é realizado por meio de login seguro e senha criptografada. O usuário é o único responsável pela guarda de suas credenciais de acesso, devendo:
          </p>
          <ul>
            <li>Não compartilhar suas credenciais com terceiros;</li>
            <li>Informar imediatamente os administradores caso suspeite de acesso indevido;</li>
            <li>Escolher senhas seguras e trocá-las periodicamente por meio do perfil de usuário.</li>
          </ul>
        </section>

        <section>
          <h2>
            5. Links de Terceiros e Visualização
          </h2>
          <p>
            O acervo de livros e TCCs utiliza links de hospedagem externa em serviços de nuvem. O usuário entende que, ao clicar nestes links para visualizar os documentos, o navegador poderá abrir uma nova guia fora do sistema principal, estando sujeito aos termos e condições dessas plataformas.
          </p>
        </section>

        <section>
          <h2>
            6. Consequências do Uso Inadequado
          </h2>
          <p>
            A violação das diretrizes de conduta ou técnicas dispostas nestes termos poderá acarretar medidas corretivas, tais como suspensão temporária ou bloqueio definitivo do acesso à conta pela equipe administrativa do LibraryHub.
          </p>
        </section>
      </div>
    </div>
  )
}
