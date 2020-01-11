import { Event, IEvent, IEventModel } from '../models/Event'
import { canWrite } from './projects'
import { ICollectionModel, Collection } from '../models/Collection'
import flatten from 'flat'
import createEror = require('http-errors')

/**
 *
 * @param params Event parameters.
 * @param accessKey Access key to use to create the event.
 *
 * @category EventService
 */
export const recordEvent = async (params: IEvent, accessKey: string) => {
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

  params.collectionId = collection._id
  collection.eventCount += 1

  // flatten the event body
  const flatData = flatten(params.data)

  // create a list of new props and their types
  const newProps = {}
  for (const i in flatData) {
    newProps[i] = typeof flatData[i]
  }

  // combine existing properties and new properties
  collection.properties = { ...collection.properties, ...newProps }

  if (Object.keys(collection.properties).length > 1000) {
    throw createEror(
      400,
      'Too many properties. You may only have 1000 unique properties.'
    )
  }

  // creaaate the event itself
  const event: IEventModel = new Event(params)

  // save the collection and event
  await collection.save()
  await event.save()

  return {
    created: true
  }
}
