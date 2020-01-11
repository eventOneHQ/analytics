import express, { Request, Response } from 'express'
import { routerPojects } from './projects.router'
import pkg from '../../../package.json'

/**
 * @category v1ApiRouter
 */
export const routerAPIv1 = express.Router()

routerAPIv1.get('/', (req: Request, res: Response, next) => {
  return res.status(200).json({
    name: pkg.name,
    version: pkg.version
  })
})

routerAPIv1.use('/projects', routerPojects)
