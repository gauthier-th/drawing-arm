import { EventEmitter } from "stream"

export enum ServoStatus {
  IDLING = 'IDLING',
  DRAWING = 'DRAWING',
  ERROR = 'ERROR'
}

export default class ServoController extends EventEmitter {

  private status: ServoStatus = ServoStatus.IDLING;

  init() {

  }

  setStatus(status: ServoStatus) {
    this.status = status
    this.emit('updateStatus', status.toString())
  }
  getStatus(): ServoStatus {
    return this.status
  }

}