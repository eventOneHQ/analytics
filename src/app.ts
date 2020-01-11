import express from 'express'

import { routerApi } from './api/index'
import { configureMongoDB } from './config/mongoose'
import { configureExpress } from './config/express'
import { errorMiddleware } from './lib/middleware/errors'

export const app = express()

// Express config
configureExpress(app)

// MongoDB config
configureMongoDB()

app.use('/', routerApi)

// Error middleware
errorMiddleware(app)
