/**
 * 与 concurrently 并行运行：等待 API / 前台 / 管理端可访问后尝试打开浏览器。
 * 设置环境变量 SKIP_OPEN=1 可跳过打开浏览器（适合 CI 或远程开发）。
 */
import waitOn from 'wait-on';
import open from 'open';

const resources = [
  'http-get://127.0.0.1:3000/health',
  'http-get://127.0.0.1:5180',
  'http-get://127.0.0.1:3100',
];

async function main() {
  try {
    await waitOn({
      resources,
      timeout: 120000,
      interval: 1000,
    });
  } catch {
    console.warn(
      '[dev] 120s 内未检测到全部服务，请查看终端日志；可手动打开 http://127.0.0.1:5180 与 http://127.0.0.1:3100'
    );
    return;
  }

  if (process.env.SKIP_OPEN === '1') {
    console.log('[dev] 已跳过打开浏览器 (SKIP_OPEN=1)');
    return;
  }

  try {
    await open('http://127.0.0.1:5180/');
    await open('http://127.0.0.1:3100/');
    console.log('[dev] 已尝试打开：官网 5180、管理端 3100');
  } catch (e) {
    console.warn('[dev] 自动打开浏览器失败，请手动访问上述地址。', e);
  }
}

main();
