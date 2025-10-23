# Redis Cache Improvements

## Overview
Added proper Redis caching with expiry times and improved job processing for the Summary service.

## Key Improvements

### 1. **Cache with Expiry Times**
- **Completed summaries**: 1 hour (3600 seconds) - Long cache since they don't change
- **Pending/Processing**: 1 minute (60 seconds) - Short cache for active jobs
- **Failed summaries**: 5 minutes (300 seconds) - Medium cache for error states

### 2. **Smart Cache Management**
```typescript
// Cache is set with different TTL based on status
const setCacheWithExpiry = async (key: string, data: any, status: string) => {
  let ttl: number;
  switch (status) {
    case 'completed': ttl = 3600; break;  // 1 hour
    case 'failed': ttl = 300; break;      // 5 minutes  
    default: ttl = 60; break;             // 1 minute
  }
  await redisClient.setex(key, ttl, JSON.stringify(data));
};
```

### 3. **Cache Clearing**
- Automatically clears cache when summaries are deleted
- Handles both summary and file-related cache keys
- Graceful error handling if Redis is unavailable

### 4. **Improved Error Handling**
- Redis failures don't break the application
- Falls back to database if cache is unavailable
- Logs cache operations for debugging

## Cache Keys Used

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `summary:{fileId}` | Summary status and content | Variable based on status |
| `summary_detail:{summaryId}` | Detailed summary info | 1 hour for completed |

## Benefits

1. **Better Performance**: Frequently accessed data is cached
2. **Reduced Database Load**: Less queries to MongoDB
3. **Automatic Cleanup**: Cache expires automatically
4. **Reliability**: Graceful fallback if Redis is down
5. **Memory Efficient**: Old cache entries are automatically removed

## Usage Examples

### Setting Cache
```typescript
// Cache pending status for 1 minute
await setCacheWithExpiry(`summary:${fileId}`, {
  status: 'pending',
  summaryId: summary._id.toString()
}, 'pending');

// Cache completed summary for 1 hour
await setCacheWithExpiry(`summary:${fileId}`, {
  status: 'completed',
  content: summaryContent,
  summaryId: summary._id.toString()
}, 'completed');
```

### Getting from Cache
```typescript
// Try cache first, fallback to database
const cachedSummary = await redisClient.get(`summary:${fileId}`);
if (cachedSummary) {
  return JSON.parse(cachedSummary);
}
// ... fallback to database
```

### Clearing Cache
```typescript
// Clear cache when deleting summary
await clearCache(fileId, summaryId);
```

## Configuration
Cache settings are defined in `src/utils/constants.ts`:

```typescript
export const CACHE_SETTINGS = {
  SUMMARY_COMPLETED_TTL: 3600, // 1 hour
  SUMMARY_PENDING_TTL: 60,     // 1 minute  
  SUMMARY_FAILED_TTL: 300,     // 5 minutes
  HISTORY_TTL: 1800            // 30 minutes
};
```