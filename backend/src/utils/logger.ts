import winston from 'winston'
import path from 'path'
import fs from 'fs'
import { resolveAppPath } from './paths'

// Cria diretório de logs se não existir
const logsDir = resolveAppPath('logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

/**
 * Helper para anonimizar endereços IP em conformidade com a LGPD.
 * Mascara o último octeto de IPv4 ou o último bloco de IPv6.
 */
export function anonymizeIp(ip?: string): string {
  if (!ip) return '0.0.0.0'
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`
    }
  }
  
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':')
    if (parts.length > 1) {
      parts[parts.length - 1] = '0'
      return parts.join(':')
    }
  }
  
  return ip
}

// Configuração do formato customizado do Winston
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Anonimiza IP se presente nos metadados
    if (typeof meta.ipAddress === 'string') {
      meta.ipAddress = anonymizeIp(meta.ipAddress)
    }
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
    return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${stack || ''} ${metaStr}`.trim()
  })
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  ]
})

// ── Sistema de Alertas de Intrusão Simples (Prevenção contra Brute Force/Scanning) ──

type IntrusionTracker = {
  failures: number
  lastAttempt: number
}

const intrusionTracker = new Map<string, IntrusionTracker>()
const FAILED_ATTEMPTS_LIMIT = 5
const TRACKER_WINDOW_MS = 10 * 60 * 1000 // 10 minutos

/**
 * Registra e rastreia falhas de acesso de um IP. Se o IP exceder o limite,
 * dispara um alerta de segurança de alta prioridade.
 */
export function trackAccessFailure(ip?: string, action: 'LOGIN' | 'AUTHORIZATION' = 'LOGIN'): void {
  const now = Date.now()
  const anon = anonymizeIp(ip)
  const key = `${anon}_${action}`
  
  let tracker = intrusionTracker.get(key)
  if (!tracker || now - tracker.lastAttempt > TRACKER_WINDOW_MS) {
    tracker = { failures: 0, lastAttempt: now }
  }
  
  tracker.failures++
  tracker.lastAttempt = now
  intrusionTracker.set(key, tracker)
  
  if (tracker.failures >= FAILED_ATTEMPTS_LIMIT) {
    logger.warn(`🚨 [ALERTA DE SEGURANÇA] Possível escaneamento ou ataque de força bruta detectado!`, {
      ipAddress: ip,
      action: `${action}_FAILURES_EXCEEDED`,
      failuresCount: tracker.failures,
      windowMinutes: TRACKER_WINDOW_MS / 60000
    })
  } else {
    logger.info(`Falha de segurança detectada (${tracker.failures}/${FAILED_ATTEMPTS_LIMIT}) para IP: ${anon}`)
  }
}
