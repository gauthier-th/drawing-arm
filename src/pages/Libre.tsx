import React, { useContext, useRef } from 'react'
import { Typography } from 'antd'
import { Context } from '../GlobalContext'
import '../styles/Libre.css'

const { Title } = Typography

export default function Libre() {
  const { socketManager } = useContext(Context)
  const cooXRef = useRef<HTMLInputElement>(null)
  const cooYRef = useRef<HTMLInputElement>(null)
  const onCoordClick = () => {
    if (cooXRef.current && cooYRef.current)
      socketManager.setCoordinates({ x: parseInt(cooXRef.current.value, 10), y: parseInt(cooYRef.current.value, 10)})
  }
  const onWritingClick = (writing: boolean) => {
    socketManager.setWriting(writing)
  }
  return <>
    <Title>Tracé libre</Title>
    <p>Contrôle libre du traceur.</p>
    <br />
    <div className="choose-input-coords">
      <span>Aller aux coordonnées :</span>
      <input type="text" ref={cooXRef} placeholder="X" />
      <input type="text" ref={cooYRef} placeholder="Y" />
      <button onClick={onCoordClick}>Go !</button>
    </div>
    <br />
    <div className="set-writing">
      <span>Activer ou désactiver l'écriture :</span>
      <button onClick={() => onWritingClick(true)}>Activer</button>
      <button onClick={() => onWritingClick(false)}>Désactiver</button>
    </div>
  </>
}