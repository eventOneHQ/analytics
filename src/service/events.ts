import { Event, IEvent, IEventModel } from '../models/Event'
import { canWrite } from './projects'

/**
 * 
 * @param params Event parameters.
 * @param accessKey Access key to use to create the event.
 * 
 * @category EventService
 */
export const recordEvent = async (params: IEvent, accessKey: string) => {
  await canWrite(params.projectId, accessKey)

  const event: IEventModel = new Event(params)

  await event.save()

  return {
    created: true
  }
}
