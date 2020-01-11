import createError from 'http-errors'
import { Types } from 'mongoose'
import { randomBytes } from 'crypto'
import { IProject, Project } from '../models/Project'

/**
 * Generate a random key
 * @param size Size of the key
 */
const generateKey = (size: number = 192) => {
  return randomBytes(size / 2)
    .toString('hex')
    .toUpperCase()
}
/**
 * Create a project
 * @param params Project parameters
 *
 * @category ProjectService
 */
export const createProject = async (params: IProject) => {
  const project = new Project({
    ...params,
    writeKey: generateKey(192),
    readKey: generateKey(192),
    masterKey: generateKey(64)
  })

  await project.save()

  return project
}

/**
 * Check if a write key has permission to write to a project
 * @param projectId ID of the project to check permissions against
 * @param writeKey The write key to use
 * @category ProjectService
 */
export const canWrite = async (projectId: string, writeKey: string) => {
  if (!writeKey) {
    throw createError(401, 'The API Key is invalid.')
  }

  const isValidId = Types.ObjectId.isValid(projectId)

  if (!isValidId) {
    throw createError(404, 'Resource not found.')
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw createError(404, 'Resource not found.')
  }

  if (project.writeKey !== writeKey) {
    throw createError(401, 'The API Key is invalid.')
  }

  return true
}

/**
 * Check if a read key has permission to read a project
 * @param projectId ID of the project to check permissions against
 * @param key The read key to use
 * @category ProjectService
 */
export const canRead = async (projectId: string, key: string) => {
  if (!key) {
    throw createError(401, 'The API Key is invalid.')
  }

  const isValidId = Types.ObjectId.isValid(projectId)

  if (!isValidId) {
    throw createError(404, 'Resource not found.')
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw createError(404, 'Resource not found.')
  }

  if (project.readKey !== key || project.masterKey !== key) {
    throw createError(401, 'The API Key is invalid.')
  }

  return true
}

/**
 * Get a project
 * @param projectId ID of the project to get
 *
 * @category ProjectService
 */
export const getProject = async (projectId: string) => {
  if (!projectId) {
    throw createError(400, 'Project ID not specified.')
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw createError(404, 'Resource not found.')
  }

  return project
}

/**
 * Get all projects
 *
 * @category ProjectService
 */
export const getProjects = async () => {
  const projects = await Project.find()

  return projects
}

/**
 * Update a project
 * @param projectId ID of the project to update
 * @param project Project parameters
 *
 * @category ProjectService
 */
export const updateProject = async (projectId: string, project: IProject) => {
  if (!projectId) {
    throw createError(400, 'Project ID not specified.')
  }
  if (!project) {
    throw createError(400, 'Project body not specified.')
  }

  const newProject = await Project.findByIdAndUpdate(
    projectId,
    {
      name: project.name
    },
    { new: true }
  )

  if (!newProject) {
    throw createError(404, 'Resource not found.')
  }

  return newProject
}
