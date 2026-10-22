import { createClient } from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()

// Cliente Redis singleton para Bull
export const redisClient = new createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
})

redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message)
})

redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully')
})

export async function connectRedis() {
    if (redisClient.status === 'wait') {
        await redisClient.connect()
    }
    return redisClient
}

export default redisClient