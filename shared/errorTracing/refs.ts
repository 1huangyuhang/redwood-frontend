/** 生成短可追溯标记（客户端一次请求 / 服务端一次错误落盘各一条） */
export function generateTraceRef(prefix: string): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}
