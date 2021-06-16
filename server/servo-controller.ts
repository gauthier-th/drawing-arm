import { EventEmitter } from 'stream'
import { Gpio } from 'pigpio'


export enum ServoStatus {
  IDLING = 'IDLING',
  DRAWING = 'DRAWING',
  ERROR = 'ERROR'
}

let lastPulse1 = 1500;
let lastPulse2 = 1500;

const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

export default class ServoController extends EventEmitter {

  private status: ServoStatus = ServoStatus.IDLING
  private servo1: Gpio
  private servo2: Gpio
  private servo3: Gpio

  init() {
    (() => {
      try {
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

  private async test() {
    console.log('Servo start in 5s')
    await wait(5000)

    await this.placeServo(150, 0)
    await wait(2000)
  
    await this.placeServo(200, 0)
    await wait(2000)
  
    await this.placeServo(200, 50)
    await wait(2000)
  
    await this.placeServo(150, 50)
    await wait(2000)

    this.test()
  }

  private async placeServo(x: number, y: number) {
    const l1 = 140
    const l2 = 140
    const pulse1 = angleToPulse1(getTheta1(x, y, l1, l2))
    const pulse2 = angleToPulse1(getTheta2(x, y, l1, l2))
    console.log('Pos : ', x, y, getTheta1(x, y, l1, l2), getTheta2(x, y, l1, l2), ' , ', pulse1, pulse2)
    // this.servo1.servoWrite(pulse1)
    // this.servo2.servoWrite(pulse2)
    await Promise.all([
      goToAngle(lastPulse1, pulse1, (i: number) => this.servo1.servoWrite(i)),
      goToAngle(lastPulse2, pulse2, (i: number) => this.servo2.servoWrite(i))
    ])
    lastPulse1 = pulse1
    lastPulse2 = pulse2
  }

}

function getTheta1(x: number, y: number, l1: number, l2: number) {
  const angleRad = Math.acos((x*x + y*y + l1*l1 - l2*l2) / (2*l1*(x*x + y*y))) + Math.atan(y/x)
  return 90 + angleRad * 180 / Math.PI
}
function getTheta2(x: number, y: number, l1: number, l2: number) {
  const angleRad = Math.acos((l1*l1 + l2*l2 - x*x - y*y) / (2*l1*l2))
  return angleRad * 180 / Math.PI
}


function angleToPulse1(angle: number) {
  if (angle <= 0)
    return 600
  else if (angle > 0 && angle <= 90)
    return Math.round(angle * 1400 / 90 + 600)
  else if (angle < 180)
    return Math.round((angle - 90) * 940 / 90 + 1400)
  else
    return 2340
}


async function goToAngle(pulseStart: number, pulseEnd: number, func: any) {
  for (let i: number = pulseStart; i < pulseEnd; i+=25) {
    func(i)
    await wait(200)
  }
}