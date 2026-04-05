import path from 'path';
import dotenv from 'dotenv';

/** 始终从 backend 目录读取 .env，避免从仓库根目录启动时 cwd 不对导致 JWT_SECRET 未加载 */
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });
