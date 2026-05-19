const { Redis } = require('@upstash/redis');

let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && process.env.UPSTASH_REDIS_REST_URL !== 'placeholder') {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('Upstash Redis initialized for caching.');
} else {
  console.log('Redis credentials missing or placeholder. Caching disabled.');
}

module.exports = redis;
