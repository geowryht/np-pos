const buckets = new Map();

function now() {
    return Date.now();
}

function getBucketKey({ key, windowMs }) {
    return `${key}:${windowMs}`;
}

export function rateLimit({ key, limit, windowMs }) {
    const bucketKey = getBucketKey({ key, windowMs });
    const currentTime = now();
    const existing = buckets.get(bucketKey);

    if (!existing || existing.resetAt <= currentTime) {
        const nextBucket = {
            count: 1,
            resetAt: currentTime + windowMs,
        };
        buckets.set(bucketKey, nextBucket);
        return {
            success: true,
            remaining: Math.max(limit - nextBucket.count, 0),
            resetAt: nextBucket.resetAt,
        };
    }

    existing.count += 1;

    return {
        success: existing.count <= limit,
        remaining: Math.max(limit - existing.count, 0),
        resetAt: existing.resetAt,
    };
}

