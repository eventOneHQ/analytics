import express from 'express'
import { routerAPIv1 } from './1.0'

/**
 * @category Router
 */
export const routerApi = express.Router()

routerApi.use('/1.0', routerAPIv1)
