import mongoose from 'mongoose'
import { debug as debugLog } from 'debug'
import { config } from './config'

const debug = debugLog('analytics:db')

/**
 * @category Config
 */
export const configureMongoDB = async () => {
  const mongo = await mongoose.connect(config.dbUrl)
  const db = mongo.connection.db

  if (db) {
    debug(`MongoDB opened: ${db.databaseName}`)
  }

  mongoose.connection.on('disconnected', (err: any) => {
    if (err) {
      debug(err)
    }
    debug('MongoDB disconnected!')
  })

  mongoose.connection.once('open', () => {
    if (db) {
      debug(`MongoDB opened: ${db.databaseName}`)
    }
  })
  mongoose.connection.once('close', () => {
    debug('MongoDB closed.')
  })
  mongoose.connection.on('error', (err: any) => {
    debug(err)
    mongoose.disconnect()
  })
  mongoose.connection.on('connected', () => {
    debug('MongoDB connected!')
  })
  mongoose.connection.on('reconnected', () => {
    debug('MongoDB reconnected!')
  })
}
