import { config } from '../../config'
import { Request, NextFunction, Response } from 'express'
import createHttpError from 'http-errors'
import { canRead, canWrite } from '../../service/projects'

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

const extractKey = (req: Request): string => {
  return (req.headers['authorization'] || req.query['api_key'] || '') as string
}

export const writeKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params['projectId'] as string
    const key = extractKey(req)
    await canWrite(projectId, key)
    return next()
  } catch (err) {
    return next(err)
  }
}

export const readKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params['projectId'] as string
    const key = extractKey(req)
    await canRead(projectId, key)
    return next()
  } catch (err) {
    return next(err)
  }
}
