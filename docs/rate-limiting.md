# Rate Limiting System

This project implements a comprehensive rate limiting system to handle API quotas efficiently.

## Overview

The rate limiting system uses a **token bucket algorithm** to control the rate of API requests, preventing rate limit errors (429 responses) from external APIs.

## Features

- ✅ Token bucket algorithm for smooth rate limiting
- ✅ Per-endpoint rate limiting
- ✅ Automatic request queuing
- ✅ Request timeout handling
- ✅ In-memory caching to reduce API calls
- ✅ Retry-After headers for rate limit responses

## Configuration

### Dune API Rate Limiter

**Limit:** 5 requests per second

```typescript
import { duneRateLimiter } from "@/lib/rate-limiter";

// Execute a function with rate limiting
const result = await duneRateLimiter.execute(async () => {
  return await duneClient.getActivity(address, options);
}, "dune-activity"); // Optional key for per-endpoint limiting
```

### 0x API Rate Limiter

**Limit:** 10 requests per second (more lenient for price/quote requests)

```typescript
import { zeroXRateLimiter } from "@/lib/rate-limiter";

const result = await zeroXRateLimiter.execute(async () => {
  return await fetch(url, { headers });
}, "zerox-prices");
```

## API Routes with Rate Limiting

All Dune API routes now implement:

1. **Rate limiting** - Requests are queued and executed within the 5 req/sec limit
2. **In-memory caching** - Responses are cached to reduce API calls
3. **Cache headers** - Proper HTTP cache headers for CDN/browser caching
4. **Error handling** - Graceful handling of rate limit errors

### Implemented Routes

| Route               | Cache Duration | Rate Limiter     |
| ------------------- | -------------- | ---------------- |
| `/api/activity`     | 30 seconds     | Dune (5 req/sec) |
| `/api/balance`      | 10 seconds     | Dune (5 req/sec) |
| `/api/transactions` | 10 seconds     | Dune (5 req/sec) |
| `/api/token-info`   | 5 minutes      | Dune (5 req/sec) |
| `/api/prices`       | 30 seconds     | 0x (10 req/sec)  |
| `/api/swap/quote`   | No cache       | 0x (10 req/sec)  |

## Usage Examples

### Basic Usage

```typescript
import { duneRateLimiter } from "@/lib/rate-limiter";

// Simple execution
await duneRateLimiter.execute(async () => {
  return await someApiCall();
});
```

### With Different Keys

Use different keys for different endpoints to allow parallel requests:

```typescript
// These can run in parallel up to the rate limit
await Promise.all([
  duneRateLimiter.execute(async () => getActivity(), "activity"),
  duneRateLimiter.execute(async () => getBalance(), "balance"),
  duneRateLimiter.execute(async () => getTransactions(), "transactions"),
]);
```

### Manual Token Acquisition

```typescript
// Acquire a token before making a request
await duneRateLimiter.acquire("my-endpoint");
// Make your API call
const result = await myApiCall();
```

### Check Rate Limiter Status

```typescript
const status = duneRateLimiter.getStatus("my-endpoint");
console.log({
  availableTokens: status.availableTokens,
  queueLength: status.queueLength,
  waitTime: status.waitTime,
});
```

## Caching Strategy

Each API route implements a multi-layer caching strategy:

### 1. In-Memory Cache (Server-Side)

```typescript
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30_000; // 30 seconds

// Check cache first
const cached = cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return NextResponse.json(cached.data, { headers });
}
```

### 2. HTTP Cache Headers (CDN/Browser)

```typescript
headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
headers.set("CDN-Cache-Control", "public, s-maxage=30");
headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=30");
```

### 3. ETag Support (Conditional Requests)

Some routes support ETags for efficient cache validation:

```typescript
const etag = generateETag(data);
headers.set("ETag", etag);

// Client sends If-None-Match header
if (ifNoneMatch === etag) {
  return new NextResponse(null, { status: 304 });
}
```

## Cache Status Headers

All responses include an `X-Cache-Status` header:

- `HIT` - Served from in-memory cache
- `MISS` - Fresh data from API
- `DEDUP` - Deduplicated request (piggy-backed on existing request)

## Error Handling

### Rate Limit Errors (429)

When a rate limit is hit, the response includes:

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

Headers:

- `Retry-After: 60` - Retry after 60 seconds
- `Cache-Control: no-cache` - Don't cache error responses

### Request Timeout

If a request waits in the queue for more than 30 seconds:

```javascript
Error: Request timeout: Rate limit wait exceeded 30 seconds
```

## Best Practices

### 1. Use Appropriate Cache Durations

- **Static data** (token info): 5+ minutes
- **Semi-static data** (balances, prices): 10-30 seconds
- **Dynamic data** (swap quotes): No cache

### 2. Implement Request Deduplication

For high-traffic endpoints, deduplicate concurrent identical requests:

```typescript
const pendingRequests = new Map<string, Promise<Data>>();

if (pendingRequests.has(cacheKey)) {
  return await pendingRequests.get(cacheKey)!;
}
```

### 3. Cache Key Design

Use comprehensive cache keys that include all parameters:

```typescript
const cacheKey = `${endpoint}:${address}:${chainIds}:${limit}:${offset}`;
```

### 4. Cleanup Old Cache Entries

Implement simple LRU cleanup to prevent memory leaks:

```typescript
if (cache.size > 100) {
  const oldestEntry = Array.from(cache.entries()).sort(
    ([, a], [, b]) => a.timestamp - b.timestamp
  )[0];
  cache.delete(oldestEntry[0]);
}
```

## Custom Rate Limiter

Create a custom rate limiter for other APIs:

```typescript
import RateLimiter from "@/lib/rate-limiter";

export const myApiRateLimiter = new RateLimiter({
  maxTokens: 10, // Burst capacity
  refillRate: 10 / 1000, // 10 requests per second
  refillInterval: 1000, // 1 second
});
```

## Monitoring

Monitor rate limiter performance in development:

```typescript
// Check current status
const status = duneRateLimiter.getStatus();
console.log("Rate Limiter Status:", status);

// Reset if needed (testing only)
duneRateLimiter.reset();
```

## Environment Variables

No additional environment variables needed. The rate limiters are configured based on known API limits:

- Dune API: 5 req/sec (free tier)
- 0x API: 10 req/sec (default)

## Troubleshooting

### Still Getting 429 Errors?

1. **Check cache duration** - Increase cache time to reduce API calls
2. **Verify rate limit** - Some APIs have different limits per tier
3. **Check concurrent requests** - Ensure you're using proper request keys
4. **Monitor queue length** - Use `getStatus()` to check queue buildup

### High Memory Usage?

1. **Reduce cache size** - Lower the max cache entries limit
2. **Decrease cache duration** - Clean up old entries faster
3. **Implement better LRU** - Use a proper LRU library for large caches

### Slow Response Times?

1. **Check queue length** - Long queues indicate rate limit pressure
2. **Optimize cache hit rate** - Increase cache duration if appropriate
3. **Add request deduplication** - Prevent duplicate in-flight requests

## Future Improvements

- [ ] Redis-based distributed rate limiting (for multi-instance deployments)
- [ ] Persistent cache using Redis or similar
- [ ] Dynamic rate limit adjustment based on API response headers
- [ ] Rate limit metrics and monitoring dashboard
- [ ] Automatic retry with exponential backoff
