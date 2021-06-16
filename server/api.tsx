import { Server, Socket } from 'socket.io'
import type { Server as HttpServer } from 'http'
import ServoController from './servo-controller'

const servoController = new ServoController()
const clientList: Socket[] = []

export function init(server: HttpServer) {
  const io = new Server(server)
  io.on('connection', handle)
  servoController.init()
}

function handle(client: Socket) {
  clientList.push(client)
  client.on('getStatus', () => {
    client.emit('updateStatus', servoController.getStatus().toString())
  })
  client.on('disconnect', () => {
    clientList.splice(clientList.findIndex(c => c.id === client.id), 1)
  })
}

servoController.on('updateStatus', (status) => {
  for (let client of clientList) {
    client.emit('updateStatus', status.toString())
  }
})