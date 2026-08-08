# Política de Segurança — LibraryHub

A equipe de desenvolvimento do **LibraryHub** leva a segurança da informação e a proteção de dados acadêmicos a sério. Agradecemos o trabalho dos pesquisadores e colaboradores de segurança que nos ajudam a manter a plataforma segura.

## Versões Suportadas

Atualmente, fornecemos atualizações de segurança para as seguintes versões:

| Versão | Suportada          |
| ------ | ------------------ |
| 2.0.x  | :white_check_mark: |
| 1.x.x  | :x:                |

## Reportando uma Vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança no LibraryHub, por favor **NÃO** abra uma Issue pública no GitHub. Em vez disso, siga o procedimento de divulgação responsável abaixo:

1. **Envio do Relatório**: Envie os detalhes da vulnerabilidade em privado para a equipe de segurança do repositório através do e-mail `security@libraryhub.dev` (ou através da aba *Security Advisories* no GitHub).
2. **Conteúdo Recomendado**:
   - Descrição detalhada da falha detectada (ex.: SQL Injection, XSS, CSRF, Falha de Autenticação/Autorização).
   - Passos reproduzíveis ou Prova de Conceito (PoC).
   - Impacto potencial na privacidade ou integridade dos dados.
3. **Prazo de Resposta**: Nossa equipe responderá em até **48 horas úteis** confirmando o recebimento e o plano de ação.
4. **Resolução e Divulgação**: Trabalharemos para lançar um patch de correção o mais rápido possível antes de publicar o aviso de segurança.

## Boas Práticas de Segurança no Deploy

Ao implantar o LibraryHub em ambiente de produção:
- Configure um `JWT_SECRET` forte e aleatório (mínimo 64 caracteres).
- Execute o banco de dados e arquivos de mídia em volumes protegidos.
- Sempre utilize conexões criptografadas **HTTPS/TLS**.
- Mantenha as dependências atualizadas regularmente através do Dependabot.
