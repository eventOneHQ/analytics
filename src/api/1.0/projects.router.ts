import express, { Request, Response, NextFunction, Router } from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject
} from '../../service/projects'
import { routerEvents } from './events.router'
import { requireRootAuth } from '../..//lib/middleware/auth'

/**
 * @category v1ApiRouter
 */
export const routerPojects: Router = express.Router()

routerPojects.use('/:projectId/events', routerEvents)

routerPojects.post(
  '/',
  requireRootAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await createProject({ name: req.body.name })

      return res.status(201).json(project)
    } catch (err) {
      return next(err)
    }
  }
)

routerPojects.get(
  '/',
  requireRootAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await getProjects()
      return res.status(200).json(projects)
    } catch (err) {
      return next(err)
    }
  }
)

routerPojects.get(
  '/:projectId',
  requireRootAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await getProject(req.params.projectId)
      return res.status(200).json(project)
    } catch (err) {
      return next(err)
    }
  }
)

routerPojects.post(
  '/:projectId',
  requireRootAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await updateProject(req.params.projectId, req.body)
      return res.status(200).json(project)
    } catch (err) {
      return next(err)
    }
  }
)
