import fastify from 'fastify'
import cookie from  '@fastify/cookie'
import { transactionRoutes } from './routes/transactions'

export const server = fastify()

server.register(cookie)
server.register(transactionRoutes, {
  prefix: 'transactions',
})
