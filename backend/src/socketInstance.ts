import type { Server } from 'socket.io';

let socketServer: Server | undefined;

export function setSocketServer(io: Server): void {
  socketServer = io;
}

/** 请求处理阶段调用；应用创建完成后已注入 */
export function getIo(): Server {
  if (!socketServer) {
    throw new Error('Socket.IO 尚未初始化（应在 createApp 之后使用）');
  }
  return socketServer;
}
