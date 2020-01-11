import dotenv from 'dotenv'
dotenv.config()

const env = process.env

export interface IAppConfig {
  environment: string
  port: number
  dbUrl: string
}

export const config: IAppConfig = {
  environment: env.NODE_ENV || 'development',
  port: parseFloat(env.PORT || '3000'),
  dbUrl: env.MONGODB_URI || 'mongodb://localhost:27017/analytics'
}
