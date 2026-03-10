import { Event } from '../models/Event'
import { canWrite } from './projects'
import { ICollectionModel, Collection } from '../models/Collection'
import { flatten } from 'flat'
import createError from 'http-errors'
import { Types } from 'mongoose'

export interface IRecordEventParams {
  projectId: string
  collectionName: string
  data?: any
  method?: 'post' | 'get' | 'beacon'
  redirect?: string
  timestamp?: string
}

/**
 *
 * @param params Event parameters.
 * @param accessKey Access key to use to create the event.
 *
 * @category EventService
 */
export const recordEvent = async (params: IRecordEventParams, accessKey: string) => {
  await canWrite(params.projectId, accessKey)

  // find a collection
  let collection: ICollectionModel | null = await Collection.findOne({
    name: params.collectionName,
    projectId: params.projectId
  })

  // if there isn't an existing collection, create one
  if (!collection) {
    collection = new Collection({
      name: params.collectionName,
      projectId: params.projectId
    })
  }

  collection.eventCount += 1

  // flatten the event body
  const flatData = flatten(params.data || {}) as Record<string, unknown>

  // create a list of new props and their types
  const newProps: Record<string, string> = {}
  for (const i in flatData) {
    newProps[i] = typeof flatData[i]
  }

  // combine existing properties and new properties
  collection.properties = { ...collection.properties, ...newProps }

  if (Object.keys(collection.properties).length > 1000) {
    throw createError(
      400,
      'Too many properties. You may only have 1000 unique properties.'
    )
  }

  // Determine timestamp
  const timestamp = params.timestamp
    ? new Date(params.timestamp)
    : new Date()

  // create the event itself using time series schema
  const event = new Event({
    timestamp,
    metadata: {
      projectId: new Types.ObjectId(params.projectId),
      collectionName: params.collectionName,
      method: params.method || 'post'
    },
    data: params.data
  })

  // save the collection and event
  await collection.save()
  await event.save()

  return {
    created: true
  }
}
