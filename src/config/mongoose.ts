import mongoose from 'mongoose'
import { debug as debugLog } from 'debug'
import { config } from './config'

const debug = debugLog('analytics:db')

/**
 * @category Config
 */
export const configureMongoDB = async () => {
  const mongo = await mongoose.connect(config.dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  const db = mongo.connection.db

  debug(`MongoDB opened: ${db.databaseName}`)

  db.on('disconnected', (err: any) => {
    if (err) {
      debug(err)
    }
    debug('MongoDB disconnected!')
  })

  db.once('open', () => {
    debug(`MongoDB opened: ${db.databaseName}`)
  })
  db.once('close', () => {
    debug('MongoDB closed.')
  })
  db.on('error', (err: any) => {
    debug(err)
    mongo.disconnect()
  })
  db.on('connected', () => {
    debug('MongoDB connected!')
  })
  db.on('reconnected', () => {
    debug('MongoDB reconnected!')
  })
}
