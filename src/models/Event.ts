import { Schema, model, Model, Document, Types } from 'mongoose'
import { config } from '../config/config'

export interface IEventMetadata {
  projectId: Types.ObjectId
  collectionName: string
  method: 'post' | 'get' | 'beacon'
}

export interface IEvent {
  timestamp: Date
  metadata: IEventMetadata
  data?: any
}

export interface IEventModel extends IEvent, Document {}

const EventSchema: Schema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date()
    },
    metadata: {
      projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      collectionName: {
        type: String,
        required: true
      },
      method: {
        type: String,
        default: 'post',
        enum: ['post', 'get', 'beacon']
      }
    },
    data: {
      type: Schema.Types.Mixed
    }
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'seconds'
    },
    expireAfterSeconds: config.eventTtlDays * 24 * 60 * 60,
    autoCreate: true
  }
)

/**
 * @category Model
 */
export const Event: Model<IEventModel> = model<IEventModel>(
  'Event',
  EventSchema
)
