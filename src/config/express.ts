import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

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

  app.use(cookieParser())
  // Use body parser so we can get info from POST and/or URL parameters
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  app.use(bodyParser.json())

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
