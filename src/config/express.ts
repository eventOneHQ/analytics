import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

/**
 * @param app Express app
 * @category Config
 */
export const configureExpress = (app: any) => {
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
}
