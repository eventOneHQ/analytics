import { Schema, model, Model, Document } from 'mongoose'

const { ObjectId, Mixed } = Schema.Types

export interface ICollection {
  name: string
  projectId: string
  properties: { [key: string]: string }
  eventCount: number
}

export interface ICollectionModel extends ICollection, Document {}

const CollectionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    projectId: {
      type: ObjectId,
      ref: 'Project',
      required: true
    },
    properties: {
      type: Mixed,
      of: String,
      default: {}
    },
    eventCount: {
      type: Number,
      default: 0,
      required: true
    }
  },
  {
    timestamps: true
  }
)

/**
 * @category Model
 */
export const Collection: Model<ICollectionModel> = model<ICollectionModel>(
  'Collection',
  CollectionSchema
)
