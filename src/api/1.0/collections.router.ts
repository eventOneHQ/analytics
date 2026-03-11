import express, { Request, Response } from 'express'
import { Collection } from '../../models/Collection'
import { readKeyAuth } from '../../lib/middleware/auth'

/**
 * @category v1ApiRouter
 */
export const routerCollections = express.Router({ mergeParams: true })

routerCollections.get('/', readKeyAuth, async (req: Request, res: Response, next) => {
  try {
    const projectId = req.params['projectId']

    const collections = await Collection.find({ projectId }).lean()

    return res.status(200).json(collections)
  } catch (err) {
    return next(err)
  }
})

routerCollections.get('/:collectionName/properties', readKeyAuth, async (req: Request, res: Response, next) => {
  try {
    const projectId = req.params['projectId']
    const collectionName = req.params['collectionName']

    const collection = await Collection.findOne({ projectId, name: collectionName }).lean()

    if (!collection) {
      const createError = (await import('http-errors')).default
      return next(createError(404, 'Collection not found.'))
    }

    return res.status(200).json({
      name: collection.name,
      properties: collection.properties
    })
  } catch (err) {
    return next(err)
  }
})
