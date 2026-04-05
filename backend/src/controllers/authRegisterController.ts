import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { parseRegisterDto } from '../dto/register.dto';
import {
  registerUser,
  RegisterConflictError,
  RegisterReservedUsernameError,
} from '../services/registerService';
import { apiSuccess, apiFailure } from '../types/apiResponse';
import { zodFirstUserMessage } from '../utils/zodFirstMessage';

/**
 * POST /api/auth/register
 *
 * 成功 201：{ success: true, message, data: { token, user } }
 * 校验失败 400：{ success: false, message, data: null, details? }
 * 冲突 409：{ success: false, message, data: null }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto = parseRegisterDto(req.body);
    const { token, user } = await registerUser(dto);
    res.status(201).json(
      apiSuccess('注册成功', {
        token,
        user,
      })
    );
  } catch (err: unknown) {
    if (err instanceof RegisterReservedUsernameError) {
      res
        .status(400)
        .json(apiFailure(err.message, { code: 'RESERVED_USERNAME' }));
      return;
    }
    if (err instanceof RegisterConflictError) {
      res.status(409).json(apiFailure(err.message, { code: 'CONFLICT' }));
      return;
    }
    if (err instanceof ZodError) {
      res.status(400).json(
        apiFailure(zodFirstUserMessage(err), {
          code: 'VALIDATION_ERROR',
          details: err.flatten(),
        })
      );
      return;
    }
    const msg = err instanceof Error ? err.message : '注册失败';
    res.status(500).json(apiFailure(msg, { code: 'INTERNAL_ERROR' }));
  }
};
