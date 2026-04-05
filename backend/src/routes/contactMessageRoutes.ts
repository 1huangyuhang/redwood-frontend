import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../controllers/contactMessageController';

/** 官网访客提交留言，无需管理端 JWT */
export const contactMessagePublicRouter = express.Router();
contactMessagePublicRouter.post('/', createContactMessage);

export const contactMessageManagementRouter = express.Router();
contactMessageManagementRouter.get('/', getAllContactMessages);
contactMessageManagementRouter.patch('/:id/read', markContactMessageRead);
contactMessageManagementRouter.delete('/:id', deleteContactMessage);
