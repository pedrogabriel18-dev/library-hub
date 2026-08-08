import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      filePath: true,
    }
  })
  console.log('BOOKS IN DATABASE:')
  console.log(JSON.stringify(books, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
