/**
 * Rate Limiter for API requests
 * 
 * This implements a token bucket algorithm to rate limit API requests.
 * Supports both per-endpoint and global rate limiting.
 */

interface RateLimiterConfig {
    maxTokens: number // Maximum number of tokens in the bucket
    refillRate: number // Tokens added per millisecond
    refillInterval?: number // How often to refill (in ms), defaults to continuous
}

interface TokenBucket {
    tokens: number
    lastRefill: number
}

class RateLimiter {
    private buckets: Map<string, TokenBucket> = new Map()
    private config: RateLimiterConfig
    private queue: Array<{
        key: string
        resolve: () => void
        reject: (error: Error) => void
        timestamp: number
    }> = []
    private processing = false

    constructor(config: RateLimiterConfig) {
        this.config = {
            refillInterval: 1000, // Default 1 second
            ...config,
        }
    }

    /**
     * Get or create a token bucket for a given key
     */
    private getBucket(key: string): TokenBucket {
        let bucket = this.buckets.get(key)
        
        if (!bucket) {
            bucket = {
                tokens: this.config.maxTokens,
                lastRefill: Date.now(),
            }
            this.buckets.set(key, bucket)
        }

        return bucket
    }

    /**
     * Refill tokens based on time elapsed
     */
    private refillTokens(bucket: TokenBucket): void {
        const now = Date.now()
        const timePassed = now - bucket.lastRefill
        const tokensToAdd = timePassed * this.config.refillRate
        
        bucket.tokens = Math.min(this.config.maxTokens, bucket.tokens + tokensToAdd)
        bucket.lastRefill = now
    }

    /**
     * Attempt to consume a token
     */
    private tryConsume(key: string): boolean {
        const bucket = this.getBucket(key)
        this.refillTokens(bucket)

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1
            return true
        }

        return false
    }

    /**
     * Calculate wait time until next token is available
     */
    private getWaitTime(key: string): number {
        const bucket = this.getBucket(key)
        this.refillTokens(bucket)

        if (bucket.tokens >= 1) {
            return 0
        }

        const tokensNeeded = 1 - bucket.tokens
        const waitTime = tokensNeeded / this.config.refillRate
        
        return Math.ceil(waitTime)
    }

    /**
     * Process the queue of waiting requests
     */
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return
        }

        this.processing = true

        while (this.queue.length > 0) {
            const item = this.queue[0]
            
            if (!item) break

            // Check if request has timed out (30 seconds)
            if (Date.now() - item.timestamp > 30000) {
                this.queue.shift()
                item.reject(new Error("Request timeout: Rate limit wait exceeded 30 seconds"))
                continue
            }

            if (this.tryConsume(item.key)) {
                this.queue.shift()
                item.resolve()
            } else {
                // Wait for next available token
                const waitTime = this.getWaitTime(item.key)
                await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 100)))
            }
        }

        this.processing = false
    }

    /**
     * Acquire a token for making a request
     * Returns a promise that resolves when a token is available
     */
    async acquire(key: string = "default"): Promise<void> {
        // Try immediate consumption
        if (this.tryConsume(key)) {
            return Promise.resolve()
        }

        // Add to queue and wait
        return new Promise((resolve, reject) => {
            this.queue.push({
                key,
                resolve,
                reject,
                timestamp: Date.now(),
            })
            
            // Start processing the queue
            void this.processQueue()
        })
    }

    /**
     * Execute a function with rate limiting
     */
    async execute<T>(fn: () => Promise<T>, key: string = "default"): Promise<T> {
        await this.acquire(key)
        return fn()
    }

    /**
     * Get current status of rate limiter
     */
    getStatus(key: string = "default"): {
        availableTokens: number
        queueLength: number
        waitTime: number
    } {
        const bucket = this.getBucket(key)
        this.refillTokens(bucket)
        
        return {
            availableTokens: bucket.tokens,
            queueLength: this.queue.filter(item => item.key === key).length,
            waitTime: this.getWaitTime(key),
        }
    }

    /**
     * Reset the rate limiter (useful for testing)
     */
    reset(key?: string): void {
        if (key) {
            this.buckets.delete(key)
            this.queue = this.queue.filter(item => item.key !== key)
        } else {
            this.buckets.clear()
            this.queue = []
        }
    }
}

/**
 * Create a Dune API rate limiter
 * Dune API limit: 5 requests per second
 */
export const duneRateLimiter = new RateLimiter({
    maxTokens: 5, // Allow burst of 5 requests
    refillRate: 5 / 1000, // 5 tokens per second = 0.005 tokens per millisecond
    refillInterval: 1000,
})

/**
 * Create a 0x API rate limiter
 * More lenient for price/quote requests
 */
export const zeroXRateLimiter = new RateLimiter({
    maxTokens: 10, // Allow burst of 10 requests
    refillRate: 10 / 1000, // 10 tokens per second
    refillInterval: 1000,
})

export default RateLimiter

