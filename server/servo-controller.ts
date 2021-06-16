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
  y: number
}

let lastPulse1 = 1500;
let lastPulse2 = 1500;

const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

export default class ServoController extends EventEmitter {

  private status: ServoStatus = ServoStatus.IDLING
  private servo1: Gpio
  private servo2: Gpio
  private servo3: Gpio
  private systemInfos: SystemInfos
  private tracePosition: TracePosition

  init() {
    (() => {
      try {
        this.systemInfos = {
          width: 0,
          height: 0,
          l1: parseInt(process.env.L1 || '140'),
          l2: parseInt(process.env.L2 || '140')
        }
        this.servo1 = new Gpio(18, { mode: Gpio.OUTPUT })
        this.servo2 = new Gpio(23, { mode: Gpio.OUTPUT })
        // this.servo3 = new Gpio(27, { mode: Gpio.OUTPUT })
        this.servo1.servoWrite(1500)
        this.servo2.servoWrite(1500)
        // this.servo3.servoWrite(0)
        this.test()
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

  private async test() {
    console.log('Servo start in 5s')
    await wait(5000)

    await this.placeServo(200, 0)
    await wait(5000)

    await this.placeServo(250, 0)
    await wait(5000)

    await this.placeServo(250, 50)
    await wait(5000)

    await this.placeServo(200, 50)

    this.test()
  }

  private async placeServo(x: number, y: number) {
    this.tracePosition = {
      x, y
    }
    const t1 = getTheta1(x, y, this.systemInfos.l1, this.systemInfos.l2)
    const t2 = getTheta2(x, y, this.systemInfos.l1, this.systemInfos.l2)
    const pulse1 = angleToPulse1(t1)
    const pulse2 = angleToPulse1(t2)
    console.log('Pos : ', x, y)
    console.log('->', t1, pulse1, lastPulse1)
    console.log('->', t2, pulse2, lastPulse2)
    // this.servo1.servoWrite(pulse1)
    // this.servo2.servoWrite(pulse2)
    await Promise.all([
      this.goToAngle(lastPulse1, pulse1, (i: number) => this.servo1.servoWrite(i)),
      this.goToAngle(lastPulse2, pulse2, (i: number) => this.servo2.servoWrite(i))
    ])
    lastPulse1 = pulse1
    lastPulse2 = pulse2
    this.emit('updateTracePosition', { x, y })
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