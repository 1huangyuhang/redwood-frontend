import express from 'express';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  downloadSupportTicketAttachment,
  patchSupportTicket,
  deleteSupportTicket,
} from '../controllers/supportTicketController';

/** 用户端提交工单（含附件），无需管理端 JWT */
export const supportTicketPublicRouter = express.Router();
supportTicketPublicRouter.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('attachment'),
  createSupportTicket
);

export const supportTicketManagementRouter = express.Router();
supportTicketManagementRouter.get('/', getAllSupportTickets);
supportTicketManagementRouter.get(
  '/:id/attachment',
  downloadSupportTicketAttachment
);
supportTicketManagementRouter.get('/:id', getSupportTicketById);
supportTicketManagementRouter.patch('/:id', patchSupportTicket);
supportTicketManagementRouter.delete('/:id', deleteSupportTicket);
