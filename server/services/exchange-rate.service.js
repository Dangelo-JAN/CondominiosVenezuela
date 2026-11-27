import fetch from 'node-fetch'
import { Decimal } from 'decimal.js'

/**
 * Servicio de Tasa de Cambio
 * Obtiene la tasa oficial del BCV o usa fallback manual
 */
class ExchangeRateService {
    constructor() {
        this.cache = null
        this.cacheTimestamp = null
        this.CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas
    }

    /**
     * Obtiene la tasa de cambio actual (VES por USD)
     * @returns {Promise<Decimal>} Tasa de cambio
     */
    async getRate() {
        // Verificar cache
        if (this.cache && this.cacheTimestamp && 
            (Date.now() - this.cacheTimestamp) < this.CACHE_TTL_MS) {
            return this.cache
        }

        const provider = process.env.EXCHANGE_RATE_PROVIDER || 'bcv'
        
        try {
            let rate
            switch (provider) {
                case 'bcv':
                    rate = await this.fetchBCVRate()
                    break
                case 'parallel':
                    rate = await this.fetchParallelRate()
                    break
                case 'manual':
                default:
                    rate = new Decimal(process.env.MANUAL_EXCHANGE_RATE_VES || '36.0')
                    break
            }

            // Validar que la tasa sea razonable (entre 10 y 100 VES/USD)
            if (rate.lt(10) || rate.gt(100)) {
                console.warn(`[ExchangeRate] Tasa fuera de rango: ${rate}, usando fallback manual`)
                rate = new Decimal(process.env.MANUAL_EXCHANGE_RATE_VES || '36.0')
            }

            this.cache = rate
            this.cacheTimestamp = Date.now()
            console.log(`[ExchangeRate] Tasa obtenida (${provider}): ${rate} VES/USD`)
            return rate

        } catch (error) {
            console.error(`[ExchangeRate] Error obteniendo tasa:`, error.message)
            // Fallback a tasa manual
            const fallbackRate = new Decimal(process.env.MANUAL_EXCHANGE_RATE_VES || '36.0')
            this.cache = fallbackRate
            this.cacheTimestamp = Date.now()
            return fallbackRate
        }
    }

    /**
     * Obtiene tasa del BCV (Banco Central de Venezuela)
     */
    async fetchBCVRate() {
        const bcvUrl = process.env.BCV_API_URL || 'https://www.bcv.org.ve'
        const apiKey = process.env.BCV_API_KEY
        
        // Si no hay API key, usar scraping o fallback
        if (!apiKey) {
            console.warn('[ExchangeRate] BCV_API_KEY no configurado, usando fallback')
            throw new Error('BCV API key not configured')
        }

        try {
            const response = await fetch(`${bcvUrl}/api/tasa`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 5000
            })

            if (!response.ok) {
                throw new Error(`BCV API error: ${response.status}`)
            }

            const data = await response.json()
            // Asumir que la API retorna { tasa: 36.5 } o similar
            const rate = new Decimal(data.tasa || data.rate || data.value)
            return rate
        } catch (error) {
            console.error('[ExchangeRate] BCV fetch failed:', error.message)
            throw error
        }
    }

    /**
     * Obtasa de mercado paralelo (fallback)
     */
    async fetchParallelRate() {
        // Implementar según proveedor disponible (dolarapi, exchangemonitor, etc.)
        // Por ahora usar fallback manual
        throw new Error('Parallel rate provider not implemented')
    }

    /**
     * Invalida el cache forzando nueva consulta
     */
    invalidateCache() {
        this.cache = null
        this.cacheTimestamp = null
    }
}

// Singleton
export const exchangeRateService = new ExchangeRateService()

/**
 * Helper para obtener tasa de cambio (para uso directo en controladores)
 */
export async function getExchangeRate() {
    return exchangeRateService.getRate()
}

export default exchangeRateService