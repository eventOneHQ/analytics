import { Schema, model, Model, Document } from 'mongoose'

export interface IProject {
  name: string
  writeKey?: string
  readKey?: any
  masterKey?: string
}

export interface IProjectModel extends IProject, Document {}

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    writeKey: {
      type: String,
      required: true
    },
    readKey: {
      type: String,
      required: true
    },
    masterKey: {
      type: String,
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
export const Project: Model<IProjectModel> = model<IProjectModel>(
  'Project',
  ProjectSchema
)
