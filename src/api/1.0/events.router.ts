import express, { Request, Response } from 'express'
import createError from 'http-errors'

import { recordEvent } from '../../service/events'

/**
 * @category v1ApiRouter
 */
export const routerEvents = express.Router({ mergeParams: true })

const findAccessKey = (req: Request) => {
  return req.headers['authorization'] || req.query['api_key']
}

routerEvents.post(
  '/:collectionName',
  async (req: Request, res: Response, next) => {
    try {
      const projectId = req.params['projectId']
      const accessKey = findAccessKey(req)
      const collectionName = req.params['collectionName']
      const data = req.body

      const responsse = await recordEvent(
        {
          projectId,
          collectionName,
          data,
          method: 'post'
        },
        accessKey
      )

      return res.status(201).json(responsse)
    } catch (err) {
      return next(err)
    }
  }
)

routerEvents.get(
  '/:collectionName',
  async (req: Request, res: Response, next) => {
    try {
      const projectId = req.params['projectId']
      const accessKey = findAccessKey(req)
      const collectionName = req.params['collectionName']
      const redirect = req.query['redirect']
      const dataBase64 = req.query['data']

      let data
      try {
        const dataBuff = Buffer.from(dataBase64, 'base64')
        const dataUrlEncoded = dataBuff.toString('ascii')
        const dataText = decodeURIComponent(dataUrlEncoded)

        data = JSON.parse(dataText)
      } catch (err) {
        return next(createError(400, 'Failed to parse data.'))
      }

      const responsse = await recordEvent(
        {
          projectId,
          collectionName,
          data,
          method: 'get',
          redirect
        },
        accessKey
      )

      if (redirect) {
        return res.redirect(302, redirect)
      }

      return res.status(201).json(responsse)
    } catch (err) {
      return next(err)
    }
  }
)
