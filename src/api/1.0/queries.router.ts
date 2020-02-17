import express, { Request, Response } from 'express'
import createError from 'http-errors'
import { analyzeCount } from '../../service/analysis'

/**
 * @category v1ApiRouter
 */
export const routerQuery = express.Router({ mergeParams: true })

const findAccessKey = (req: Request) => {
  return req.headers['authorization'] || req.query['api_key']
}

routerQuery.post('/count', async (req: Request, res: Response, next) => {
  try {
    const projectId = req.params['projectId']
    const accessKey = findAccessKey(req)

    const results = await analyzeCount(accessKey, projectId, req.body)

    return res.status(201).json(results)
  } catch (err) {
    return next(err)
  }
})
