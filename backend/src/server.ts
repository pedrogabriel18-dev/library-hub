import app from './app'
import { prisma } from './utils/prisma'
import { syncDataFromJSON } from './utils/sync'
import { cleanTempFiles, cleanOldLogs } from './utils/cleanup'
import { seedInitialEvents } from './utils/eventFeed'

const PORT = process.env.PORT || 3333

app.listen(PORT, async () => {
  // Importa dados dos JSONs para o banco na inicialização
  await syncDataFromJSON()

  // Semeia eventos iniciais de feed se a tabela estiver vazia
  await seedInitialEvents()

  // Limpeza de arquivos temporários expirados (#15)
  cleanTempFiles()

  // Remoção de logs com mais de 90 dias (#11)
  await cleanOldLogs()

  // Forçar conexão para que os pragmas SQLite sejam aplicados imediatamente
  // (aplicados pelo prisma.ts no primeiro $connect)
  await prisma.$connect()

  console.log(`\n🚀 LibraryHub — Backend`)
  console.log(`   Servidor rodando em http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}\n`)
})

export default app
