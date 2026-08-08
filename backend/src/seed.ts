import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function upsertUser(data: {
  login: string
  password: string
  name: string
  role: string
  mustChangePassword: boolean
  avatarId?: string
  turma?: string
  curso?: string
}) {
  const passwordHash = await bcrypt.hash(data.password, 10)

  return prisma.user.upsert({
    where: { login: data.login },
    update: {
      name: data.name,
      role: data.role,
      passwordHash,
      turma: data.turma,
      curso: data.curso,
      avatarId: data.avatarId,
    },
    create: {
      login: data.login,
      passwordHash,
      name: data.name,
      role: data.role,
      mustChangePassword: data.mustChangePassword,
      avatarId: data.avatarId,
      turma: data.turma,
      curso: data.curso,
    },
  })
}

async function main() {
  console.log('[seed] Inicializando dados padrao do LibraryHub...')

  // 1. Usuários Principais de Demonstração (Logins Padrão)
  await upsertUser({
    login: 'admin@libraryhub.dev',
    password: 'Admin@2026',
    name: 'Alex Morgan',
    role: 'DEVELOPER',
    mustChangePassword: false,
    avatarId: 'hacker-student-avatar-pixel-art',
    curso: 'Software Engineering',
  })

  await upsertUser({
    login: 'librarian@libraryhub.dev',
    password: 'Librarian@2026',
    name: 'Sarah Jenkins',
    role: 'LIBRARIAN',
    mustChangePassword: false,
    avatarId: 'school-librarian-avatar-pixel-art',
    curso: 'Library Science',
  })

  await upsertUser({
    login: 'teacher@libraryhub.dev',
    password: 'Teacher@2026',
    name: 'Prof. David Miller',
    role: 'ADVISOR',
    mustChangePassword: false,
    curso: 'Computer Science',
  })

  await upsertUser({
    login: 'student@libraryhub.dev',
    password: 'Student@2026',
    name: 'Jordan Lee',
    role: 'STUDENT',
    mustChangePassword: false,
    avatarId: 'cat-student-avatar-pixel-art',
    turma: 'Class 3A',
    curso: 'Computer Science',
  })

  // 1b. Usuários de Demonstração Rápidos (Atalhos com a Senha@123)
  await upsertUser({
    login: 'admin.teste',
    password: 'Senha@123',
    name: 'Administrador Demo',
    role: 'DEVELOPER',
    mustChangePassword: false,
    avatarId: 'hacker-student-avatar-pixel-art',
    curso: 'Engenharia de Software',
  })

  await upsertUser({
    login: 'biblio.teste',
    password: 'Senha@123',
    name: 'Bibliotecária Demo',
    role: 'LIBRARIAN',
    mustChangePassword: false,
    avatarId: 'school-librarian-avatar-pixel-art',
    curso: 'Biblioteconomia',
  })

  await upsertUser({
    login: 'orientador.teste',
    password: 'Senha@123',
    name: 'Orientador Demo',
    role: 'ADVISOR',
    mustChangePassword: false,
    curso: 'Ciência da Computação',
  })

  await upsertUser({
    login: 'aluno.teste',
    password: 'Senha@123',
    name: 'Aluno Demo',
    role: 'STUDENT',
    mustChangePassword: false,
    avatarId: 'cat-student-avatar-pixel-art',
    turma: 'Turma 3A',
    curso: 'Ciência da Computação',
  })

  // Limpa todos os alunos antigos do tipo STUDENT que não sejam os de demonstração
  await prisma.user.deleteMany({
    where: {
      role: 'STUDENT',
      login: { notIn: ['student@libraryhub.dev', 'aluno.teste'] }
    }
  })

  // Lista de Alunos Fictícios de Demonstração
  const demoStudents = [
    { name: 'Alex Johnson', login: 'alex.johnson@student', turma: 'Class 3A', curso: 'Computer Science' },
    { name: 'Emma Watson', login: 'emma.watson@student', turma: 'Class 3A', curso: 'Computer Science' },
    { name: 'Michael Brown', login: 'michael.brown@student', turma: 'Class 3B', curso: 'Engineering' },
    { name: 'Sophia Davis', login: 'sophia.davis@student', turma: 'Class 3B', curso: 'Engineering' },
    { name: 'Oliver Wilson', login: 'oliver.wilson@student', turma: 'Class 2A', curso: 'Literature' },
    { name: 'Lucas Taylor', login: 'lucas.taylor@student', turma: 'Class 2A', curso: 'Literature' },
    { name: 'Mia Anderson', login: 'mia.anderson@student', turma: 'Class 2B', curso: 'Business Administration' },
    { name: 'Ethan Thomas', login: 'ethan.thomas@student', turma: 'Class 2B', curso: 'Business Administration' },
    { name: 'Isabella Martinez', login: 'isabella.martinez@student', turma: 'Class 1A', curso: 'General Science' },
    { name: 'James White', login: 'james.white@student', turma: 'Class 1A', curso: 'General Science' },
  ]

  const defaultPasswordHash = await bcrypt.hash('Student@2026', 10)

  for (const student of demoStudents) {
    await prisma.user.upsert({
      where: { login: student.login },
      update: {
        name: student.name,
        turma: student.turma,
        curso: student.curso,
      },
      create: {
        login: student.login,
        name: student.name,
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        mustChangePassword: false,
        isActive: true,
        turma: student.turma,
        curso: student.curso,
        avatarId: 'cat-student-avatar-pixel-art',
      }
    })
  }

  // 2. Categorias
  const categories = [
    { name: 'Romance', slug: 'romance', iconPath: 'open-book-heart-icon.jpeg' },
    { name: 'Literatura Internacional', slug: 'literatura-internacional', iconPath: 'open-book-globe-icon.jpeg' },
    { name: 'Historia', slug: 'historia', iconPath: 'open-book-ancient-column-icon.jpeg' },
    { name: 'Filosofia', slug: 'filosofia', iconPath: 'open-book-thinker-silhouette-icon.jpeg' },
    { name: 'Ciencias', slug: 'ciencias', iconPath: 'open-book-atom-icon.jpeg' },
    { name: 'Tecnologia', slug: 'tecnologia', iconPath: 'open-book-microchip-icon.jpeg' },
    { name: 'Programacao', slug: 'programacao', iconPath: 'open-book-code-brackets-icon.jpeg' },
    { name: 'Educacao', slug: 'educacao', iconPath: 'open-book-graduation-cap-icon.jpeg' },
  ]

  const categoryIds: Record<string, string> = {}
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    })
    categoryIds[category.slug] = created.id
  }

  // 3. Autores
  const authors = ['Machado de Assis', 'Jose de Alencar', 'Monteiro Lobato', 'Sun Tzu', 'Alex Johnson', 'Prof. David Miller']
  const authorIds: Record<string, string> = {}
  for (const name of authors) {
    const existing = await prisma.author.findFirst({ where: { name } })
    const author = existing ?? await prisma.author.create({ data: { name } })
    authorIds[name] = author.id
  }

  // 4. Livros
  const books = [
    {
      id: 'book-001',
      title: 'O Alienista',
      slug: 'o-alienista',
      synopsis: 'Classico de Machado de Assis sobre ciencia, poder e loucura.',
      filePath: 'https://www.dominiopublico.gov.br/download/texto/ua00018a.pdf',
      publishedYear: 1882,
      pageCount: 120,
      categorySlug: 'romance',
      authorName: 'Machado de Assis',
    },
    {
      id: 'book-002',
      title: 'Narizinho Arrebitado',
      slug: 'narizinho-arrebitado',
      synopsis: 'Obra infantil de Monteiro Lobato.',
      filePath: 'https://www.dominiopublico.gov.br/download/texto/me001602.pdf',
      publishedYear: 1921,
      pageCount: 95,
      categorySlug: 'educacao',
      authorName: 'Monteiro Lobato',
    },
    {
      id: 'book-003',
      title: 'A Arte da Guerra',
      slug: 'a-arte-da-guerra',
      synopsis: 'Tratado classico sobre estrategia.',
      filePath: 'https://www.dominiopublico.gov.br/download/texto/bk000162.pdf',
      publishedYear: 500,
      pageCount: 160,
      categorySlug: 'filosofia',
      authorName: 'Sun Tzu',
    },
  ]

  for (const book of books) {
    const existing = await prisma.book.findUnique({ where: { id: book.id } })
    if (!existing) {
      const duplicateSlug = await prisma.book.findUnique({ where: { slug: book.slug } })
      if (duplicateSlug) {
        await prisma.book.delete({ where: { id: duplicateSlug.id } })
      }

      const created = await prisma.book.create({
        data: {
          id: book.id,
          title: book.title,
          slug: book.slug,
          synopsis: book.synopsis,
          filePath: book.filePath,
          publishedYear: book.publishedYear,
          pageCount: book.pageCount,
          isPublished: true,
          categoryId: categoryIds[book.categorySlug],
        },
      })

      await prisma.bookAuthor.create({
        data: { bookId: created.id, authorId: authorIds[book.authorName] },
      })
    }
  }

  // 5. TCC de Demonstração
  const tccSlug = 'artificial-intelligence-in-education'
  const existingTcc = await prisma.tCC.findFirst({ where: { slug: tccSlug } })

  if (!existingTcc) {
    await prisma.tCC.upsert({
      where: { id: 'tcc-001' },
      update: {
        title: 'Artificial Intelligence in Education',
        slug: tccSlug,
        abstract: 'An exploratory study on the impact of modern AI and machine learning tools in K-12 education.',
        filePath: 'https://repositorio.ufrn.br/bitstream/123456789/24647/1/TCC_AndreMagnoGomesDaSilva.pdf',
        year: 2026,
        course: 'Computer Science',
        isPublished: true,
        authorId: authorIds['Alex Johnson'],
        categoryId: categoryIds.tecnologia,
      },
      create: {
        id: 'tcc-001',
        title: 'Artificial Intelligence in Education',
        slug: tccSlug,
        abstract: 'An exploratory study on the impact of modern AI and machine learning tools in K-12 education.',
        filePath: 'https://repositorio.ufrn.br/bitstream/123456789/24647/1/TCC_AndreMagnoGomesDaSilva.pdf',
        year: 2026,
        course: 'Computer Science',
        isPublished: true,
        authorId: authorIds['Alex Johnson'],
        categoryId: categoryIds.tecnologia,
      },
    })
  }

  // 6. Progresso e Resenhas para estudante de testes
  const sUser = await prisma.user.findUnique({ where: { login: 'student@libraryhub.dev' } })
  if (sUser) {
    await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: sUser.id, bookId: 'book-001' } },
      update: { isFinished: true, currentPage: 120, totalPages: 120 },
      create: { userId: sUser.id, bookId: 'book-001', isFinished: true, currentPage: 120, totalPages: 120 }
    })

    await prisma.review.upsert({
      where: { userId_bookId: { userId: sUser.id, bookId: 'book-002' } },
      update: { status: 'APPROVED', rating: 5, comment: 'Excelente leitura! Altamente recomendado.' },
      create: { userId: sUser.id, bookId: 'book-002', status: 'APPROVED', rating: 5, comment: 'Excelente leitura! Altamente recomendado.' }
    })
  }

  console.log('[seed] Dados de demonstração do LibraryHub gerados com sucesso.')
}

main()
  .catch((error) => {
    console.error('[seed] Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
