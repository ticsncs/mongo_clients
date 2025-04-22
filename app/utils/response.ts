import { Response } from 'express';
import { Request } from 'express';

export const successResponse = (res: Response, code: number,message: string, data: any = {}) => {
  return res.status(code).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res: Response, code: number,message: string, error: any = {}) => {
  return res.status(code).json({
    success: false,
    message,
    error
  });
}