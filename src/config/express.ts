import cors from 'cors'
import logger from 'morgan'
import express from 'express'

import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

/**
 * @param app Express app
 * @category Config
 */
export const configureExpress = (app: any) => {
  const swaggerDocument = YAML.load('./openapi.yaml')

  app.use(logger('dev'))

  // Allow CORS
  app.use(cors())

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
