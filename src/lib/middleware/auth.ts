import { config } from '../../config'
import { Request, NextFunction, Response } from 'express'
import createHttpError from 'http-errors'

export const requireRootAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rootkey = req.headers['x-root-key']

  if (!rootkey || rootkey !== config.rootKey) {
    throw createHttpError(401, 'Invalid root key.')
  }

  return next()
}
