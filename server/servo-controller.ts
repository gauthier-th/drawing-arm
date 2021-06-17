import { EventEmitter } from 'stream'
import { Gpio } from 'pigpio'


export enum ServoStatus {
  IDLING = 'IDLING',
  DRAWING = 'DRAWING',
  ERROR = 'ERROR'
}
export type SystemInfos = {
  width: number,
  height: number,
  l1: number,
  l2: number
}
export type TracePosition = {
  x: number,
  y: number,
  writing?: boolean
}


const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

export default class ServoController extends EventEmitter {

  private status: ServoStatus = ServoStatus.IDLING
  private servo1: Gpio
  private servo2: Gpio
  private servo3: Gpio
  private systemInfos: SystemInfos
  private tracePosition: TracePosition
  private lastPulse1: number = 1500;
  private lastPulse2: number = 1500;

  init() {
    (() => {
      try {
        this.systemInfos = {
          width: 500,
          height: 0,
          l1: parseInt(process.env.L1 || '140'),
          l2: parseInt(process.env.L2 || '140')
        }
        this.servo1 = new Gpio(18, { mode: Gpio.OUTPUT })
        this.servo2 = new Gpio(23, { mode: Gpio.OUTPUT })
        this.servo3 = new Gpio(27, { mode: Gpio.OUTPUT })
        this.servo1.servoWrite(1500)
        this.servo2.servoWrite(1500)
        this.servo3.servoWrite(angleToPulse1(0))
        this.setWriting(false)
        this.test()
      }
      catch {}
    })()
  }

  private setStatus(status: ServoStatus) {
    this.status = status
    this.emit('updateTracePosition', status.toString())
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
    console.log('Servo start in 5s')
    await wait(5000)
    this.setWriting(true)

    await this.drawLine({ x: 200, y: 0 }, { x: 250, y: 0 })
    await wait(5000)

    await this.drawLine({ x: 250, y: 0 }, { x: 250, y: 50 })
    await wait(5000)

    await this.drawLine({ x: 250, y: 50 }, { x: 200, y: 50 })
    await wait(5000)

    await this.drawLine({ x: 200, y: 50 }, { x: 200, y: 0 })

    this.test()
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
    const pulse1 = angleToPulse1(t1)
    const pulse2 = angleToPulse1(t2)
    console.log('Pos : ', x, y)
    console.log('->', t1, pulse1, this.lastPulse1)
    console.log('->', t2, pulse2, this.lastPulse2)
    // this.servo1.servoWrite(pulse1)
    // this.servo2.servoWrite(pulse2)
    await Promise.all([
      this.goToAngle(this.lastPulse1, pulse1, (i: number) => this.servo1.servoWrite(i)),
      this.goToAngle(this.lastPulse2, pulse2, (i: number) => this.servo2.servoWrite(i))
    ])
    this.lastPulse1 = pulse1
    this.lastPulse2 = pulse2
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

  private async setWriting(enabled: boolean) {
    this.servo3.servoWrite(angleToPulse1(enabled ? 90 : 0))
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


function angleToPulse1(angle: number) {
  if (angle <= 0)
    return 600
  else if (angle <= 90)
    return Math.round(angle * ((1450-600)/(90-0)) + (600-(1450-600)/(90-0)*0))
  else if (angle <= 180)
    return Math.round(angle * ((2300-1450)/(180-90)) + (1450-(2300-1450)/(180-90)*90))
  else
    return 2300
}