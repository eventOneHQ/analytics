import express, { Request, Response } from 'express'
import { runQuery } from '../../service/analysis'
import { readKeyAuth } from '../../lib/middleware/auth'
import { IQuery } from '../../interfaces/Query'

/**
 * @category v1ApiRouter
 */
export const routerQuery = express.Router({ mergeParams: true })

routerQuery.post('/run', readKeyAuth, async (req: Request, res: Response, next) => {
  try {
    const projectId = req.params['projectId'] as string
    const query: IQuery = req.body

    const results = await runQuery(projectId, query)

    return res.status(200).json(results)
  } catch (err) {
    return next(err)
  }
})

routerQuery.get('/run', readKeyAuth, async (req: Request, res: Response, next) => {
  try {
    const projectId = req.params['projectId'] as string
    let query: IQuery

    const queryParam = req.query['query'] as string
    if (queryParam) {
      try {
        query = JSON.parse(queryParam)
      } catch {
        const createError = (await import('http-errors')).default
        return next(createError(400, 'Failed to parse query parameter.'))
      }
    } else {
      query = req.query as any
    }

    const results = await runQuery(projectId, query)

    return res.status(200).json(results)
  } catch (err) {
    return next(err)
  }
})
