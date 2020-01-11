import dotenv from 'dotenv'
import assert from 'assert'
dotenv.config()

const env = process.env

export interface IAppConfig {
  environment: string
  port: number
  dbUrl: string
  rootKey: string
}

export const config: IAppConfig = {
  environment: env.NODE_ENV || 'development',
  port: parseFloat(env.PORT || '3000'),
  dbUrl: env.MONGODB_URI || 'mongodb://localhost:27017/analytics',
  rootKey: env.ROOT_KEY || 'UNSET'
}

assert(
  config.rootKey !== 'UNSET',
  'Please set the ROOT_KEY environemnt variable'
)
