import { Schema, model, Model, Document } from 'mongoose'

export interface IEvent {
  collectionName: string
  projectId: string
  data?: any
  method?: string
  redirect?: string
}

export interface IEventModel extends IEvent, Document {}

const EventSchema: Schema = new Schema(
  {
    collectionName: {
      type: String,
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    data: {
      type: Schema.Types.Mixed
    },
    method: {
      type: String,
      default: 'post',
      enum: ['post', 'get', 'beacon']
    },
    redirect: String
  },
  {
    timestamps: true
  }
)

/**
 * @category Model
 */
export const Event: Model<IEventModel> = model<IEventModel>(
  'Event',
  EventSchema
)
