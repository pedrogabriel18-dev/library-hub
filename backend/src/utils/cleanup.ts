import fs from 'fs'
import path from 'path'
import { prisma } from './prisma'
import { resolveAppPath } from './paths'

/**
 * Remove arquivos temporários da pasta storage/temp/ com mais de 24 horas.
 * Deve ser chamado na inicialização do servidor. (#15)
 */
export function cleanTempFiles(): void {
  const tempDir = resolveAppPath('storage/temp')
  if (!fs.existsSync(tempDir)) return

  const files = fs.readdirSync(tempDir)
  const maxAge = 24 * 60 * 60 * 1000 // 24 horas em ms
  const now = Date.now()
  let cleaned = 0

  for (const file of files) {
    const filePath = path.join(tempDir, file)
    try {
      const stat = fs.statSync(filePath)
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filePath)
        cleaned++
      }
    } catch {
      // Ignora erros de arquivo individual
    }
  }

  if (cleaned > 0) {
    console.log(`[cleanup] ${cleaned} arquivo(s) temporário(s) expirado(s) removido(s).`)
  }
}

/**
 * Remove registros de log com mais de 90 dias da tabela logs.
 * Deve ser chamado na inicialização do servidor. (#11)
 */
export async function cleanOldLogs(): Promise<void> {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  try {
    const { count } = await prisma.log.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    if (count > 0) {
      console.log(`[cleanup] ${count} registro(s) de log com mais de 90 dias removido(s).`)
    }
  } catch (err) {
    console.error('[cleanup] Erro ao limpar logs antigos:', err)
  }
}
