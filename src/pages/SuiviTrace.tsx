import React, { useContext, useEffect, useRef, useState } from 'react'
import { Typography } from 'antd'
import { Context } from '../GlobalContext'
import type { SystemInfos, TracePosition } from '../SocketManager'
import '../styles/SuiviTrace.css'

const { Title } = Typography

export default function SuiviTrace() {
  const { socketManager } = useContext(Context)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [systemInfos, setSystemInfos] = useState<SystemInfos | null>(socketManager.getSystemInfos())
  const [tracePosition, setTracePosition] = useState<TracePosition | null>(socketManager.getTracePosition())
  const [backdrop, setBackdrop] = useState<HTMLImageElement | null>(null)

  const setCanvasSize = (canvas: HTMLCanvasElement, systemInfos: SystemInfos) => {
    if (canvas.width !== canvas.parentElement?.clientWidth) {
      canvas.height = document.body.clientHeight - 200
      canvas.width = Math.abs(systemInfos.right - systemInfos.left) * canvas.height / Math.abs(systemInfos.bottom - systemInfos.top)
    }
  }
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      if (systemInfos)
        setCanvasSize(canvas, systemInfos)
      const ctx = canvas.getContext('2d')
      if (ctx && systemInfos && tracePosition) {
        drawCanvas(ctx, systemInfos, tracePosition, backdrop)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, systemInfos, tracePosition])
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setBackdrop(img)
    };
    img.src = '/img/servo-zones.png';

    const onSystemInfos = (e: any) => {
      setSystemInfos(e.data)
    }
    const onTracePosition = (e: any) => {
      setTracePosition(e.data)
    }
    socketManager.askSystemInfos()
    socketManager.askTracePosition()
    socketManager.addEventListener('updateSystemInfos', onSystemInfos)
    socketManager.addEventListener('updateTracePosition', onTracePosition)
    return () => {
      socketManager.removeEventListener('updateSystemInfos', onSystemInfos)
      socketManager.removeEventListener('updateTracePosition', onTracePosition)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>
    <Title>Suivi du tracé</Title>
    <p>Cette page vous permet de voir en temps réel la position du traceur.</p>
    <div className="canvas-suivi-trace-container">
      {systemInfos && tracePosition && <canvas className="canvas-suivi-trace" ref={canvasRef} />}
      {(!systemInfos || !tracePosition) && <>
        Le traceur n'est pas en activité.
      </>}
    </div>
  </>
}

function drawCanvas(ctx: CanvasRenderingContext2D, systemInfos: SystemInfos, tracePosition: TracePosition, img: HTMLImageElement | null) {
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
  if (img)
    ctx.drawImage(img, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
  ctx.beginPath()
  const x = (tracePosition.x - systemInfos.left) * ctx.canvas.clientWidth / (systemInfos.right - systemInfos.left)
  const y = (tracePosition.y - systemInfos.top) * ctx.canvas.clientHeight / (systemInfos.bottom - systemInfos.top)
  ctx.arc(x, y, 2, 0, 2 * Math.PI, false)
  ctx.fillStyle = 'red'
  ctx.fill()
}