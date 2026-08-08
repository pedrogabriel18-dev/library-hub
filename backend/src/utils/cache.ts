/**
 * Cache em memória com TTL (Time-To-Live) por entrada.
 *
 * ⚠️  ESCOPO: Esta implementação é adequada para deploy single-container
 * (um único processo Node.js), que é o caso do LibraryHub.
 * Em cenários com múltiplas réplicas (horizontal scaling), substitua por
 * uma solução centralizada como Redis ou Memcached.
 *
 * Melhorias implementadas:
 *  - Limpeza automática de entradas expiradas a cada 5 minutos para
 *    evitar crescimento ilimitado de memória em execuções longas.
 *  - Contadores de hit/miss para diagnóstico de performance.
 */

type CacheEntry<T> = {
  data: T
  expiresAt: number
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private hits = 0
  private misses = 0
  private cleanupTimer: ReturnType<typeof setInterval>

  constructor(cleanupIntervalMs = 5 * 60 * 1000) {
    // Limpeza periódica de entradas expiradas
    this.cleanupTimer = setInterval(() => this.purgeExpired(), cleanupIntervalMs)
    // Não bloqueia o encerramento do processo
    if (this.cleanupTimer.unref) this.cleanupTimer.unref()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return null
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }
    this.hits++
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  /** Remove todas as entradas expiradas da memória. */
  purgeExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /** Retorna métricas de uso para diagnóstico. */
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%'
        : 'n/a',
    }
  }

  /** Cancela o timer de limpeza periódica (útil em testes). */
  dispose(): void {
    clearInterval(this.cleanupTimer)
  }
}

export const statsCache = new MemoryCache()
export const tokenBlacklistCache = new MemoryCache()

export function blacklistToken(token: string, ttlMs: number): void {
  tokenBlacklistCache.set(token, true, ttlMs)
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklistCache.get<boolean>(token) === true
}
