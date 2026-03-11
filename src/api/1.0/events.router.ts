import express, { Request, Response } from 'express'
import createError from 'http-errors'

import { recordEvent } from '../../service/events'

/**
 * @category v1ApiRouter
 */
export const routerEvents = express.Router({ mergeParams: true })

const findAccessKey = (req: Request): string => {
  return (req.headers['authorization'] || req.query['api_key'] || '') as string
}

routerEvents.post(
  '/:collectionName',
  async (req: Request, res: Response, next) => {
    try {
      const projectId = req.params['projectId'] as string
      const accessKey = findAccessKey(req)
      const collectionName = req.params['collectionName'] as string
      const data = req.body

      const response = await recordEvent(
        {
          projectId,
          collectionName,
          data,
          method: 'post'
        },
        accessKey
      )

      return res.status(201).json(response)
    } catch (err) {
      return next(err)
    }
  }
)

routerEvents.get(
  '/:collectionName',
  async (req: Request, res: Response, next) => {
    try {
      const projectId = req.params['projectId'] as string
      const accessKey = findAccessKey(req)
      const collectionName = req.params['collectionName'] as string
      const redirect = req.query['redirect'] as string | undefined
      const dataBase64 = req.query['data'] as string | undefined

      let data: any = {}
      if (dataBase64) {
        try {
          const dataBuff = Buffer.from(dataBase64, 'base64')
          const dataUrlEncoded = dataBuff.toString('ascii')
          const dataText = decodeURIComponent(dataUrlEncoded)

          data = JSON.parse(dataText)
        } catch (err) {
          return next(createError(400, 'Failed to parse data.'))
        }
      }

      const response = await recordEvent(
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

      return res.status(201).json(response)
    } catch (err) {
      return next(err)
    }
  }
)
