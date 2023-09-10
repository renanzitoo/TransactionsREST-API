import { server } from './app'
import { env } from './env'

server
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Listening on port ' + env.PORT)
  })

