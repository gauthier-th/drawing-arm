import { io, Socket } from 'socket.io-client'

export enum ServoStatus {
  IDLING = 'IDLING',
  DRAWING = 'DRAWING',
  ERROR = 'ERROR'
}
export type SystemInfos = {
  width: number,
  height: number
}
export type TracePosition = {
  x: number,
  y: number
}

export default class SocketManager extends EventTarget {

  private loading: boolean = true
  private socket: Socket
  private status: ServoStatus = ServoStatus.ERROR
  private systemInfos: SystemInfos | null = null
  private tracePosition: TracePosition | null = null

  constructor() {
    super()
    this.socket = io()
    this.socket.on('connect', this.handle.bind(this))
  }

  isLoading() {
    return this.loading
  }
  getStatus() {
    return this.status
  }
  getSystemInfos() {
    return this.systemInfos
  }
  getTracePosition() {
    return this.tracePosition
  }

  askSystemInfos() {
    this.socket.emit('getSystemInfos')
  }
  askTracePosition() {
    this.socket.emit('getTracePosition')
  }

  private handle() {
    this.socket.emit('getStatus')
    this.socket.on('updateStatus', (status: any) => {
      this.status = ServoStatus[status as keyof typeof ServoStatus]
      this.loading = false
      this.sendEvent('updateStatus', this.status)
    })
  }

  private sendEvent(eventName: string, data?: any) {
    const event = new SocketManagerEvent(eventName)
    if (data !== undefined)
      event.data = data
    this.dispatchEvent(event)
  }

}

export class SocketManagerEvent extends Event {
  data: any
}