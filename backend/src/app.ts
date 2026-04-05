import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './createApp';

const { app, httpServer, io } = createApp();

export { app, httpServer, io };
export default app;

if (process.env['NODE_ENV'] !== 'test') {
  const PORT = Number(process.env['PORT']) || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
