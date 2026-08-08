import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

async function main() {
  const userCount = await prisma.user.count()
  const bookCount = await prisma.book.count()
  const tccCount = await prisma.tCC.count()
  const categoryCount = await prisma.category.count()
  const reviewCount = await prisma.review.count()

  console.log('--- DATABASE STATS (dev.db) ---')
  console.log(`Usuários: ${userCount}`)
  console.log(`Livros: ${bookCount}`)
  console.log(`TCCs: ${tccCount}`)
  console.log(`Categorias: ${categoryCount}`)
  console.log(`Resenhas: ${reviewCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
