import http from 'http'
import express from 'express'
import path from 'path'
import * as api from './api'

const app = express()
const server  = http.createServer(app);

app.use(express.static(path.join(__dirname, '../build')))
api.init(server)

server.listen(process.env.PORT || 3001, () => {
  console.log('> Server listening on port ' + (process.env.PORT || 3001))
})