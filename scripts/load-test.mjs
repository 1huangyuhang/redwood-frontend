#!/usr/bin/env node
/**
 * 轻量压测：仅用于本地/预发，勿对生产执行。
 * 用法: node scripts/load-test.mjs [durationSeconds] [connections]
 * 环境变量: LOAD_TEST_ORIGIN (默认 http://127.0.0.1:3000), API_KEY (默认 default-api-key)
 */
import autocannon, { printResult } from 'autocannon';

const origin = process.env.LOAD_TEST_ORIGIN || 'http://127.0.0.1:3000';
const apiKey = process.env.API_KEY || 'default-api-key';
const duration = Math.max(1, parseInt(process.argv[2] || '5', 10) || 5);
const connections = Math.max(1, parseInt(process.argv[3] || '10', 10) || 10);

console.error(
  `[load-test] origin=${origin} duration=${duration}s connections=${connections} (仅本地/staging)`
);

const health = await autocannon({
  url: `${origin}/health`,
  connections,
  duration,
});

const products = await autocannon({
  url: `${origin}/api/products?page=1&pageSize=10`,
  connections,
  duration,
  headers: { 'x-api-key': apiKey },
});

console.log('\n--- GET /health ---');
console.log(printResult(health));
console.log('\n--- GET /api/products ---');
console.log(printResult(products));
