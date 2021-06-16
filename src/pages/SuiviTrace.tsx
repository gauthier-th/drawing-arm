import React, { useContext, useEffect, useRef, useState } from 'react'
import { Typography } from 'antd'
import { Context } from '../GlobalContext'
import type { SystemInfos, TracePosition } from '../SocketManager'
import '../styles/SuiviTrace.css'

const { Title } = Typography

export default function SuiviTrace() {
  const { socketManager } = useContext(Context)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [systemInfos, setSystemInfos] = useState(socketManager.getSystemInfos())
  const [tracePosition, setTracePosition] = useState(socketManager.getTracePosition())

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx && systemInfos && tracePosition)
        drawCanvas(ctx, systemInfos, tracePosition)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, systemInfos, tracePosition])
  useEffect(() => {
    const systemInfos = (e: any) => {
      setSystemInfos(e.data)
    }
    const tracePosition = (e: any) => {
      setTracePosition(e.data)
    }
    socketManager.askSystemInfos()
    socketManager.askTracePosition()
    socketManager.addEventListener('updateSystemInfos', systemInfos)
    socketManager.addEventListener('updateTracePosition', tracePosition)
    return () => {
      socketManager.removeEventListener('updateSystemInfos', systemInfos)
      socketManager.removeEventListener('updateTracePosition', tracePosition)
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

function drawCanvas(ctx: CanvasRenderingContext2D, systemInfos: SystemInfos, tracePosition: TracePosition) {
  
}