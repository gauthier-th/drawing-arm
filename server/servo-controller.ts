import { EventEmitter } from 'stream'
import { Gpio } from 'pigpio'


export enum ServoStatus {
  IDLING = 'IDLING',
  DRAWING = 'DRAWING',
  ERROR = 'ERROR'
}
export type SystemInfos = {
  l1: number,
  l2: number,
  top: number,
  right: number,
  bottom: number,
  left: number
}
export type TracePosition = {
  x: number,
  y: number
}


const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

export default class ServoController extends EventEmitter {

  private readonly startPos1 = angleToPulse(90)
  private readonly startPos2 = angleToPulse(90)
  private status: ServoStatus = ServoStatus.IDLING
  private servo1: Gpio
  private servo2: Gpio
  private servo3: Gpio
  private systemInfos: SystemInfos
  private tracePosition: TracePosition
  private lastPulse1: number = this.startPos1
  private lastPulse2: number = this.startPos2
  private lastCoordinates: TracePosition | null = null

  init() {
    (() => {
      try {
        this.systemInfos = {
          l1: parseInt(process.env.L1 || '140'),
          l2: parseInt(process.env.L2 || '140'),
          top: parseInt(process.env.TOP || '-310'),
          right: parseInt(process.env.RIGHT || '310'),
          bottom: parseInt(process.env.BOTTOM || '150'),
          left: parseInt(process.env.LEFT || '-160')
        }
        this.servo1 = new Gpio(18, { mode: Gpio.OUTPUT })
        this.servo2 = new Gpio(23, { mode: Gpio.OUTPUT })
        this.servo3 = new Gpio(27, { mode: Gpio.OUTPUT })
        this.servo1.servoWrite(1500)
        this.servo2.servoWrite(1500)
        this.servo3.servoWrite(angleToPulse(0))
        this.setWriting(false)
        // this.test()
      }
      catch {}
    })()
  }

  private setStatus(status: ServoStatus) {
    this.status = status
    this.emit('updateStatus', status.toString())
  }
  getStatus(): ServoStatus {
    return this.status
  }
  getSystemInfos(): SystemInfos | null {
    if (this.systemInfos !== undefined)
      return this.systemInfos
    else
      return null
  }
  getPosition(): TracePosition | null {
    if (this.tracePosition !== undefined)
      return this.tracePosition
    else
      return null
  }
  private setTracePosition(tracePosition: TracePosition) {
    this.tracePosition = tracePosition
    this.emit('updateTracePosition', tracePosition)
  }

  private async test() {
    await wait(5000)
    // this.setWriting(true)

    await this.drawLine({ x: 200, y: 0 }, { x: 250, y: 0 })
    await wait(5000)

    await this.drawLine({ x: 250, y: 0 }, { x: 250, y: 50 })
    await wait(5000)

    await this.drawLine({ x: 250, y: 50 }, { x: 200, y: 50 })
    await wait(5000)

    await this.drawLine({ x: 200, y: 50 }, { x: 200, y: 0 })

    this.test()
  }

  public async drawShape(shape: TracePosition[]) {
    if (this.status !== ServoStatus.IDLING)
      return;
    this.setStatus(ServoStatus.DRAWING)
    await this.placeServo(shape[0].x, shape[0].y)
    this.setWriting(true)
    for (let i = 0; i < shape.length - 1; i++) {
      await this.drawLine(shape[i], shape[i + 1])
    }
    await this.drawLine(shape[shape.length - 1], shape[0])
    this.setWriting(false)
    await Promise.all([
      this.goToAngle(this.lastPulse1, angleToPulse(90), (i: number) => this.servo1.servoWrite(i)),
      this.goToAngle(this.lastPulse2, angleToPulse(90), (i: number) => this.servo2.servoWrite(i))
    ])
    this.lastPulse1 = angleToPulse(90)
    this.lastPulse2 = angleToPulse(90)
    this.lastCoordinates = null
    this.setStatus(ServoStatus.IDLING)
  }

  public async setCoordinates(position: TracePosition) {
    this.setStatus(ServoStatus.DRAWING)
    if (!this.lastCoordinates)
      await this.placeServo(position.x, position.y)
    else
      await this.drawLine(this.lastCoordinates, position)
    this.lastCoordinates = position
    this.setStatus(ServoStatus.IDLING)
  }

  private async drawLine(p1: TracePosition, p2: TracePosition, step: number = 1) {
    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    for (let i = 0; i <= Math.round(dist); i+=step) {
      const x = p1.x + i * (p2.x - p1.x) / (Math.round(dist) + 1)
      const y = p1.y + i * (p2.y - p1.y) / (Math.round(dist) + 1)
      await this.placeServo(x, y)
    }
    const lastX = p1.x + Math.round(dist) * (p2.x - p1.x) / (Math.round(dist) + 1)
    if (lastX < p2.x) {
      await this.placeServo(p2.x, p2.y)
    }
  }

  private async placeServo(x: number, y: number) {
    this.setTracePosition({ x, y })
    const t1 = getTheta1(x, y, this.systemInfos.l1, this.systemInfos.l2)
    const t2 = getTheta2(x, y, this.systemInfos.l1, this.systemInfos.l2)
    const pulse1 = angleToPulse(t1)
    const pulse2 = angleToPulse(t2)
    // console.log('Pos : ', x, y)
    // console.log('->', t1, pulse1, this.lastPulse1)
    // console.log('->', t2, pulse2, this.lastPulse2)
    await Promise.all([
      this.goToAngle(this.lastPulse1, pulse1, (i: number) => this.servo1.servoWrite(i)),
      this.goToAngle(this.lastPulse2, pulse2, (i: number) => this.servo2.servoWrite(i))
    ])
    this.lastPulse1 = pulse1
    this.lastPulse2 = pulse2
    this.lastCoordinates = null
  }

  private async goToAngle(pulseStart: number, pulseEnd: number, func: any) {
    if (pulseStart < pulseEnd) {
      for (let i: number = pulseStart; i < pulseEnd; i+=5) {
        func(i)
        await wait(50)
      }
    }
    else {
      for (let i: number = pulseStart; i >= pulseEnd; i-=5) {
        func(i)
        await wait(50)
      }
    }
  }

  public async setWriting(enabled: boolean) {
    this.servo3.servoWrite(angleToPulse(enabled ? 90 : 0))
  }

}

function getTheta1(x: number, y: number, l1: number, l2: number) {
  const angleRad = Math.acos((x*x + y*y + l1*l1 - l2*l2) / (2*l1*Math.sqrt(x*x + y*y))) + Math.atan(y/x)
  return 90 + ((angleRad * 180) / Math.PI)
}
function getTheta2(x: number, y: number, l1: number, l2: number) {
  const angleRad = Math.acos((l1*l1 + l2*l2 - x*x - y*y) / (2*l1*l2))
  return 180 - angleRad * 180 / Math.PI
}


function angleToPulse(angle: number) {
  if (angle <= 0)
    return 600
  else if (angle <= 90)
    return Math.round(angle * ((1450-600)/(90-0)) + (600-(1450-600)/(90-0)*0))
  else if (angle <= 180)
    return Math.round(angle * ((2300-1450)/(180-90)) + (1450-(2300-1450)/(180-90)*90))
  else
    return 2300
}


export const shapes: { [key: string]: TracePosition[] } = {
  square: [
    { x: 200, y: 0 },
    { x: 250, y: 0 },
    { x: 250, y: 50 },
    { x: 200, y: 50 }
  ],
  triangle: [
    { x: 200, y: 0 },
    { x: 225, y: 50 },
    { x: 250, y: 0 }
  ],
  losange: [
    { x: 225, y: 50 },
    { x: 250, y: 0 },
    { x: 225, y: -50 },
    { x: 200, y: 0 }
  ],
  star: [
    { x: 230, y: 57 },
    { x: 237, y: 34 },
    { x: 260, y: 34 },
    { x: 241, y: 23 },
    { x: 250, y: 0 },
    { x: 230, y: 17 },
    { x: 210, y: 0 },
    { x: 219, y: 23 },
    { x: 200, y: 34 },
    { x: 223, y: 34 }
  ]
}