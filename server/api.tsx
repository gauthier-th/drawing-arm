import { Server, Socket } from 'socket.io'
import type { Server as HttpServer } from 'http'
import ServoController, { shapes, TracePosition } from './servo-controller'

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
  client.on('getSystemInfos', () => {
    client.emit('updateSystemInfos', servoController.getSystemInfos())
  })
  client.on('getTracePosition', () => {
    client.emit('updateTracePosition', servoController.getPosition())
  })
  client.on('traceShape', (shape: string) => {
    if (shape in shapes)
      servoController.drawShape(shapes[shape]);
  })
  client.on('setCoordinates', (coordinates: TracePosition) => {
    servoController.setCoordinates(coordinates)
  })
  client.on('setWriting', (writing: boolean) => {
    servoController.setWriting(writing)
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
servoController.on('updateTracePosition', (position) => {
  for (let client of clientList) {
    client.emit('updateTracePosition', position)
  }
})