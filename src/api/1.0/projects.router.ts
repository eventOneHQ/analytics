import express, { Request, Response } from 'express'
import { createProject } from '../../service/projects'
import { routerEvents } from './events.router'

/**
 * @category v1ApiRouter
 */
export const routerPojects = express.Router()

routerPojects.use('/:projectId/events', routerEvents)

routerPojects.post('/', async (req: Request, res: Response, next) => {
  try {
    const project = await createProject({ name: req.body.name })

    return res.status(201).json(project)
  } catch (err) {
    return next(err)
  }
})
