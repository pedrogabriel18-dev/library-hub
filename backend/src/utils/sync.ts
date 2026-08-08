import fs from 'fs'
import path from 'path'
import { prisma } from './prisma'
import { resolveAppPath } from './paths'
export { generateSlug } from './slug'  // Re-export para compatibilidade
import { generateSlug } from './slug'
import { normalizeDocUrl } from '../schemas/tcc.schema'
import { generateAndSaveTccCover } from '../controllers/admin/tccs.controller'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateSvgCover(title: string, author: string, category: string, year: string): string {
  const cat = category.toLowerCase()
  let colorStart = '#6a11cb'
  let colorEnd = '#2575fc'

  if (cat.includes('romance')) {
    colorStart = '#ff758c'
    colorEnd = '#ff7eb3'
  } else if (cat.includes('brasileira') || cat.includes('internacional') || cat.includes('literatura')) {
    colorStart = '#30cfd0'
    colorEnd = '#330867'
  } else if (cat.includes('história') || cat.includes('historia')) {
    colorStart = '#f83600'
    colorEnd = '#f9d423'
  } else if (cat.includes('filosofia')) {
    colorStart = '#a18cd1'
    colorEnd = '#fbc2eb'
  } else if (cat.includes('ciência') || cat.includes('ciencias') || cat.includes('astronomia') || cat.includes('biologia') || cat.includes('física') || cat.includes('fisica')) {
    colorStart = '#4fadfe'
    colorEnd = '#00f2fe'
  } else if (cat.includes('tecnologia') || cat.includes('programação') || cat.includes('programacao')) {
    colorStart = '#0f2027'
    colorEnd = '#2c5364'
  } else if (cat.includes('educação') || cat.includes('educacao') || cat.includes('desenvolvimento') || cat.includes('administração') || cat.includes('administracao')) {
    colorStart = '#11998e'
    colorEnd = '#38ef7d'
  }

  const words = title.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= 16) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  let titleSvgLines = ''
  const startY = lines.length === 1 ? 50 : lines.length === 2 ? 30 : 10
  lines.forEach((line, idx) => {
    const yOffset = startY + idx * 36
    titleSvgLines += `<text x="0" y="${yOffset}" font-family="'Inter', sans-serif" font-size="24" font-weight="800" fill="#ffffff" filter="url(#shadow)">${escapeHtml(line)}</text>\n`
  })

  const categoryWidth = Math.min(240, category.length * 7 + 16)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colorStart};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colorEnd};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <rect width="300" height="450" fill="url(#grad)" rx="12" />
  <rect x="15" y="15" width="270" height="420" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" rx="8" />
  
  <g transform="translate(30, 40)">
    <rect x="0" y="0" width="${categoryWidth}" height="22" fill="rgba(255,255,255,0.25)" rx="11" />
    <text x="${categoryWidth / 2}" y="15" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">${escapeHtml(category.toUpperCase())}</text>
  </g>
  
  <g transform="translate(30, 110)">
    ${titleSvgLines}
  </g>
  
  <g transform="translate(30, 360)">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="rgba(255,255,255,0.95)" filter="url(#shadow)">${escapeHtml(author)}</text>
    <line x1="0" y1="12" x2="80" y2="12" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    <text x="0" y="32" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="rgba(255,255,255,0.6)" letter-spacing="1">${year ? 'ED. ' + year : 'OBRA CLÁSSICA'}</text>
  </g>
</svg>`
}

export async function syncDataFromJSON() {
  console.log('[sync] Iniciando sincronizacao de dados a partir dos arquivos JSON...')

  try {
    // 1. Sincronizar Livros
    const booksPath = resolveAppPath('public/data/books.json')
    const catalogPath = resolveAppPath('public/data/books-catalog.json')
    let catalog: any[] = []
    if (fs.existsSync(catalogPath)) {
      try {
        catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
      } catch (err) {
        console.error('[sync] Erro ao ler catalogo mestre:', err)
      }
    }

    if (fs.existsSync(booksPath)) {
      const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf-8'))
      for (const book of booksData) {
        // Categoria
        const categorySlug = generateSlug(book.categoria)
        const category = await prisma.category.upsert({
          where: { slug: categorySlug },
          update: { name: book.categoria },
          create: { name: book.categoria, slug: categorySlug },
        })

        // Autor
        const authorName = book.autor
        let author = await prisma.author.findFirst({
          where: { name: authorName },
        })
        if (!author) {
          author = await prisma.author.create({
            data: { name: authorName },
          })
        }

        const bookSlug = generateSlug(book.titulo)

        // Gerar capa personalizada caso seja placeholder ou esteja vazia
        let coverPath = book.capa
        if (!coverPath || coverPath.includes('placeholder')) {
          const coversDir = resolveAppPath('public/covers')
          if (!fs.existsSync(coversDir)) {
            fs.mkdirSync(coversDir, { recursive: true })
          }

          const svgName = `${bookSlug}.svg`
          const svgPath = path.join(coversDir, svgName)

          const svgContent = generateSvgCover(
            book.titulo,
            book.autor || 'Autor Desconhecido',
            book.categoria || 'Geral',
            book.ano ? String(book.ano) : ''
          )

          fs.writeFileSync(svgPath, svgContent, 'utf-8')
          coverPath = `/covers/${svgName}`
          book.capa = coverPath
        }

        // Buscar sinopse no catalogo caso nao tenha no books.json
        const catalogItem = catalog.find((item: any) => generateSlug(item.titulo) === bookSlug)
        const bookSynopsis = book.sinopse || book.descricao || catalogItem?.descricao || null

        // Remover conflito de slug único se houver registro com ID diferente
        const existingBook = await prisma.book.findUnique({
          where: { slug: bookSlug },
        })
        if (existingBook && existingBook.id !== book.id) {
          console.log(`[sync] Removendo livro duplicado por slug: ${bookSlug} (${existingBook.id} != ${book.id})`)
          await prisma.book.delete({ where: { id: existingBook.id } })
        }

        // Livro
        const dbBook = await prisma.book.upsert({
          where: { id: book.id },
          update: {
            title: book.titulo,
            slug: bookSlug,
            synopsis: bookSynopsis,
            coverImage: coverPath,
            filePath: book.url,
            publishedYear: book.ano ? parseInt(book.ano) : null,
            categoryId: category.id,
            isPublished: true,
          },
          create: {
            id: book.id,
            title: book.titulo,
            slug: bookSlug,
            synopsis: bookSynopsis,
            coverImage: coverPath,
            filePath: book.url,
            publishedYear: book.ano ? parseInt(book.ano) : null,
            categoryId: category.id,
            isPublished: true,
          },
        })

        // Relação Autor-Livro
        await prisma.bookAuthor.upsert({
          where: {
            bookId_authorId: {
              bookId: dbBook.id,
              authorId: author.id,
            },
          },
          update: {},
          create: {
            bookId: dbBook.id,
            authorId: author.id,
          },
        })
      }
      
      // Salva de volta no books.json para manter sincronizado com as novas capas
      fs.writeFileSync(booksPath, JSON.stringify(booksData, null, 2), 'utf-8')
      console.log(`[sync] ${booksData.length} livros sincronizados.`)
    }

    // 2. Sincronizar TCCs
    const tccsPath = resolveAppPath('public/data/tccs.json')
    if (fs.existsSync(tccsPath)) {
      const tccsData = JSON.parse(fs.readFileSync(tccsPath, 'utf-8'))
      for (const tcc of tccsData) {
        // Categoria do TCC: usa o campo do JSON, com fallback para 'Tecnologia' (#9)
        const rawCategory = tcc.categoria || 'Tecnologia'
        const categorySlug = generateSlug(rawCategory)
        const category = await prisma.category.upsert({
          where: { slug: categorySlug },
          update: { name: rawCategory },
          create: { name: rawCategory, slug: categorySlug },
        })

        // Autores (unidos como string para o modelo único de Author no TCC)
        const authorName = Array.isArray(tcc.autores) ? tcc.autores.join(' e ') : tcc.autor || 'Autor Desconhecido'
        let author = await prisma.author.findFirst({
          where: { name: authorName },
        })
        if (!author) {
          author = await prisma.author.create({
            data: { name: authorName },
          })
        }

        // Orientador (Advisor)
        let advisorId: string | null = null
        if (tcc.orientador) {
          const advisorUser = await prisma.user.findFirst({
            where: {
              name: { contains: tcc.orientador },
              role: 'ADVISOR',
            },
          })
          if (advisorUser) {
            let profile = await prisma.advisorProfile.findUnique({
              where: { userId: advisorUser.id },
            })
            if (!profile) {
              profile = await prisma.advisorProfile.create({
                data: { userId: advisorUser.id, name: advisorUser.name },
              })
            }
            advisorId = profile.id
          }
        }

        const tccSlug = generateSlug(tcc.titulo)

        // Remover conflito de slug único se houver registro com ID diferente
        const existingTcc = await prisma.tCC.findUnique({
          where: { slug: tccSlug },
        })
        if (existingTcc && existingTcc.id !== tcc.id) {
          console.log(`[sync] Removendo TCC duplicado por slug: ${tccSlug} (${existingTcc.id} != ${tcc.id})`)
          await prisma.tCC.delete({ where: { id: existingTcc.id } })
        }

        const tccAbstract = tcc.resumo || tcc.abstract || tcc.descricao || null
        const normalizedUrl = normalizeDocUrl(tcc.url)
        const tccKeywords = tcc.keywords
          ? (Array.isArray(tcc.keywords) ? JSON.stringify(tcc.keywords) : String(tcc.keywords))
          : null

        let finalCoverImage = tcc.capa || tcc.coverImage || null
        if (!finalCoverImage || finalCoverImage.includes('drive.google.com') || finalCoverImage.includes('docs.google.com')) {
          try {
            finalCoverImage = await generateAndSaveTccCover(
              tcc.titulo,
              author.name,
              tcc.orientador || undefined,
              tcc.ano ? parseInt(tcc.ano) : 2026,
              tcc.curso || undefined,
              tccSlug
            )
          } catch (err) {
            console.error(`[sync] Erro ao gerar capa automática para TCC ${tccSlug}:`, err)
            finalCoverImage = `/covers/tcc-${tccSlug}.svg`
          }
        }

        // TCC
        await prisma.tCC.upsert({
          where: { id: tcc.id },
          update: {
            title: tcc.titulo,
            slug: tccSlug,
            abstract: tccAbstract,
            filePath: normalizedUrl,
            year: tcc.ano ? parseInt(tcc.ano) : 2026,
            course: tcc.curso || null,
            coverImage: finalCoverImage,
            keywords: tccKeywords,
            authorId: author.id,
            categoryId: category.id,
            advisorId,
            isPublished: true,
          },
          create: {
            id: tcc.id,
            title: tcc.titulo,
            slug: tccSlug,
            abstract: tccAbstract,
            filePath: normalizedUrl,
            year: tcc.ano ? parseInt(tcc.ano) : 2026,
            course: tcc.curso || null,
            coverImage: finalCoverImage,
            keywords: tccKeywords,
            authorId: author.id,
            categoryId: category.id,
            advisorId,
            isPublished: true,
          },
        })
      }
      console.log(`[sync] ${tccsData.length} TCCs sincronizados.`)
    }

    console.log('[sync] Sincronizacao de dados concluida com sucesso.')
  } catch (error) {
    console.error('[sync] Erro ao sincronizar dados dos JSONs:', error)
  }
}
