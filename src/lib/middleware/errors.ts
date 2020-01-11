import { debug as debugLog } from 'debug'
import { config } from '../../config/config'
import { Request, Response } from 'express'

const debug = debugLog('analytics:error')

/**
 * @category Middleware
 */
export const errorMiddleware = (app: any) => {
  app.use((err, req: Request, res: Response, next) => {
    let code = err.status || err.statusCode || 500

    const error = {
      message: err.message ? err.message : 'Internal Server Error',
      error_code: err.name ? err.name : 'InternalError',
      stack:
        config.environment === 'development' && err.stack
          ? err.stack
          : undefined
    }

    if (error.error_code === 'CastError') {
      code = 400
      error.message = 'Bad request - invalid id'
    } else if (error.error_code === 'UnauthorizedError') {
      code = 401
    }

    debug(err)

    return res.status(code).json(error)
  })

  // catch not found
  app.use((req: Request, res: Response, next) => {
    return res.status(404).send({
      message: 'Resource not found.',
      error_code: 'NotFoundError'
    })
  })
}
