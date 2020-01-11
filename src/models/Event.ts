import { Schema, model, Model, Document } from 'mongoose'

const { ObjectId, Mixed } = Schema.Types

export interface IEvent {
  collectionName: string
  collectionId?: string
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
    collectionId: {
      type: ObjectId,
      ref: 'Collection',
      required: true
    },
    projectId: {
      type: ObjectId,
      ref: 'Project',
      required: true
    },
    data: {
      type: Mixed
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
